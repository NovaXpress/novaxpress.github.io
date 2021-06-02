async function readFileData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsBinaryString(file);
    });
}

function createLabeledRadioButton(label, name, value, required = true) {
    const radioButtonElement = document.createElement('input');
    radioButtonElement.type = 'radio';
    radioButtonElement.id = value;
    radioButtonElement.name = name;
    radioButtonElement.value = value;
    radioButtonElement.required = required;

    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', value);
    labelElement.innerText = label;

    return [radioButtonElement, labelElement];
}

const formatters = {};
const formattersElement = document.getElementById('formatters');
fetch('formatters/formatters.json').then(response => response.json()).then(async formattersJSON => {
    for (const formatterJSON of formattersJSON) {
        try {
            const source = await fetch(`formatters/${formatterJSON.file}`).then(response => response.text());
            const formatFunction = eval(`(() => {${source}; return format;})();`);
            if (!formatFunction) throw new Error('No valid format function declared');
            formattersElement.append(...createLabeledRadioButton(formatterJSON.name, 'formatter', formatterJSON.file));
            formatters[formatterJSON.file] = formatterJSON;
            formatters[formatterJSON.file].function = formatFunction;
        } catch (error) {
            console.log(`Failed to load formatter ${formatterJSON.file}: ${error.message}`);
        }
    }
});

// const formattingToolsSource = fetch('formatters/formatters.json').then(response => response.text());

FORMS.getForm('formatter')['to-format'].onchange = () => {
    const downloadContainer = document.getElementById('download-container');
    while (downloadContainer.lastElementChild) downloadContainer.lastElementChild.remove();
};

FORMS.register('formatter', async data => {
    try {
        const fileData = await readFileData(data['to-format']);

        const formatterFile = data['formatter'];
        const formatter = formatters[formatterFile];

        const formattedRows = [];
        for (const input of fileData.split('\n')) {
            if (input) {
                const output = formatter.function(input);
                if (output) {
                    formattedRows.push(output);
                }
            }
        }

        const formattedData = formattedRows.join('\n');
        const downloadElement = document.createElement('a');
        downloadElement.href = `data:text/plain;charset=utf-8,${encodeURIComponent(formattedData)}`;
        downloadElement.download = 'formatted.csv';
        downloadElement.innerText = 'Download';

        const downloadContainer = document.getElementById('download-container');
        while (downloadContainer.lastElementChild) downloadContainer.lastElementChild.remove();
        downloadContainer.appendChild(downloadElement);

        return true;
    } catch (error) {
        console.error(error);
        FORMS.display('formatter', 'Failed to perform reformat', 'error', true);
        FORMS.display('formatter', error.message, 'error', false);
        return false;
    }
});

FORMS.load();