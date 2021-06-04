pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.7.570/build/pdf.worker.js';

const dailyDeliveryMatches = [
    /^20[0-9]{2}-[01][0-9]-[0-3][0-9]$/,
    /^[0-9]+$/,
    /^[$[0-9,]+$/,
    /^[0-9]+$/,
    /^[$[0-9,]+$/,
    /^[0-9]+$/,
    /^[$[0-9,]+$/,
    /^[$[0-9,]+$/,
    /^[$[0-9,]+$/
];

const weekReferenceMatches = [
    /^Week reference:$/,
    /^20[0-9]{2}-[0-9]{1,2}$/
];

const driverMatches = [
    /^Driver:$/,
    /^[A-Z][0-9]{6}.*$/
];

const invoiceMatches = [
    /^Invoice No:$/,
    /^20[0-9]{2}-[01][0-9]-[A-Z][0-9]{6}-[A-Z]+/
];

function attemptLineMatch(data, index, matches) {
    for (let i = 0; i < matches.length; i++) {
        if (!data[index + i].trim().match(matches[i])) {
            return false;
        }
    }
    return true;
}

FORMS.register('import', async formData => {
    const files = formData['pdf'];
    if (!Array.isArray(files)) files = [files];

    const invoices = await Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async event => {
            const buffer = event.target.result;
            const pdf = await pdfjsLib.getDocument(buffer).promise;

            let driver = null;
            let weekReference = null;
            let invoiceNumber = null;
            const promises = [];
            for (let i = 0; i < pdf.numPages; i++) {
                promises.push((async () => {
                    const rows = [];
                    const page = await pdf.getPage(i + 1);
                    const viewport = page.getViewport(1.0);
                    const viewWidth = viewport.viewBox[2];

                    const content = await page.getTextContent({ includeMarkedContent: true });
                    const lines = [];
                    for (const item of content.items) {
                        const x = item.transform[4];
                        const y = item.transform[5];
                        const order = y * viewWidth + (viewWidth - x);
                        lines.push({ text: item.str, order });
                    }

                    const textChain = lines.sort((a, b) => b.order - a.order).map(item => item.text);
                    for (let i = 0; i < textChain.length - dailyDeliveryMatches.length; i++) {
                        if (attemptLineMatch(textChain, i, dailyDeliveryMatches)) {
                            rows.push(textChain.slice(i, i + dailyDeliveryMatches.length));
                        } else if (!weekReference && attemptLineMatch(textChain, i, weekReferenceMatches)) {
                            weekReference = textChain[i + 1];
                        } else if (!driver && attemptLineMatch(textChain, i, driverMatches)) {
                            driver = textChain[i + 1];
                        } else if (!invoiceNumber && attemptLineMatch(textChain, i, invoiceMatches)) {
                            invoiceNumber = textChain[i + 1];
                        }
                    }
                    return rows;
                })());
            }
            const matchedData = await Promise.all(promises);
            const rows = matchedData.flat();

            const currency = data => parseFloat(data.replace('$', '').replace(',', '.'));

            const delivery = [];
            for (const row of rows) {
                delivery.push({
                    'date': new Date(row[0]),
                    'with-signature': {
                        'quantity': parseInt(row[3]),
                        'commission': currency(row[2])
                    },
                    'without-signature': {
                        'quantity': parseInt(row[3]),
                        'commission': currency(row[4])
                    },
                    'amount': currency(row[6]),
                    'additional-payout': currency(row[7]),
                    'grand-total': currency(row[8])
                });
            }

            const weekPieces = weekReference.split('-');
            const year = parseInt(weekPieces[0]);
            const week = parseInt(weekPieces[1]);

            resolve({
                'driver': driver,
                'invoice-number': invoiceNumber,
                'year': year,
                'week': week,
                'delivery': delivery
            });
        };
        reader.onerror = error => reject(error);
        reader.readAsArrayBuffer(file);
    })));

    const results = await Promise.all(invoices.map(invoice => {
        const database = firebase.firestore();
        const invoiceNumber = invoice['invoice-number'];
        delete invoice['invoice-number'];
        return database.collection('invoices').doc(invoiceNumber).set(invoice);
    }));

    setTimeout(() => {
        FORMS.display('import', `Successfully imported ${results.length} invoices.`, 'success');
    }, 0);
    return true;
});

function getDateOfISOWeek(w, y) {
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dayOfWeek = simple.getDay();
    const weekStart = simple;
    if (dayOfWeek <= 4) weekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else weekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return weekStart;
}

function getWeek(date) {
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    var year = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((date - year) / 86400000) + 1) / 7);
    return [date.getUTCFullYear(), week];
}

function getYearAndWeek(string) {
    const pieces = string.split('-');
    const year = parseInt(pieces[0]);
    const week = parseInt(pieces[1].substr(1));
    return [year, week];
}

FORMS.register('export', async formData => {
    const database = firebase.firestore();

    const [fromYear, fromWeek] = getYearAndWeek(formData['export-from']);
    const [toYear, toWeek] = getYearAndWeek(formData['export-to']);

    const query = await database.collection('invoices').where('week', '>=', fromWeek).where('week', '<=', toWeek).get();

    const rows = [];

    const header = [];
    header.push('Beneficiary', 'TrPr', 'RtN', 'RtY', 'Rtl');
    for (let i = fromWeek; i <= toWeek; i++) {
        header.push(`W${i} SgN`, `W${i} SgY`, `W${i} InvAmt`, `W${i} InvPr`);
    }
    header.push('Ttl SgN', 'TtlSgY', 'TtlIvPr', 'Ttl InvAmt', 'Gross Earnings');
    rows.push(header);

    const weekSpecificOffset = 5;
    const weekSpecificColumns = 4;

    query.forEach(invoiceDocument => {
        const invoice = invoiceDocument.data();
        if (invoice.year >= fromYear && invoice.year <= toYear) {
            const row = new Array(header.length).fill('Unknown');
            row[0] = invoice.driver;

            const weekOffset = invoice.week - fromWeek;
            row[weekSpecificOffset + weekOffset * weekSpecificColumns + 0] = invoice.delivery.reduce((total, day) => total + day['without-signature']['quantity'], 0);
            row[weekSpecificOffset + weekOffset * weekSpecificColumns + 1] = invoice.delivery.reduce((total, day) => total + day['with-signature']['quantity'], 0);
        }
    });

    if (rows.length === 1) {
        FORMS.display('export', 'No results to export. Try changing your date range.', 'error');
        return false;
    } else {

        FORMS.display('export', `Successfully exported ${query.size} invoices. Ready for download.`, 'success');
        return false;
    }
});

FORMS.load();