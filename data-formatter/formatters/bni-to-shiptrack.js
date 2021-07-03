function getProvinceCode(province) {
    province = province.toLowerCase().replace(/[^a-z ]/g, '');
    return {
        "newfoundland and labrador": "NL",
        "prince edward island": "PE",
        "nova scotia": "NS",
        "ns": "NS",
        "new brunswick": "NB",
        "quebec": "QC",
        "ontario": "ON",
        "manitoba": "MB",
        "saskatchewan": "SK",
        "alberta": "AB",
        "british columbia": "BC",
        "northwest territories": "NT",
        "nunavut": "NU"
    }[province] || '??';
}

function format(input) {
    let pieces = [];
    let piece = [];
    let quoted = false;
    for (let i = 0; i < input.length; i++) {
        const character = input[i];
        if (character === '"') {
            if (i == 0 || input[i - 1] != '\\') {
                quoted = !quoted;
            }
        }
        if (i == input.length - 1 || (character === ',' && !quoted)) {
            let cell = piece.join('').trim();
            while (cell[0] === '"' && cell[cell.length - 1] === '"') {
                cell = cell.substr(1, cell.length - 2);
            }
            pieces.push(cell.trim().replace(/\s+/g, ' '));
            piece = [];
        } else {
            piece.push(character);
        }
    }

    if (pieces[0] === 'Reference ID') return null;

    const agent = 'BNIAGENT';
    const name = pieces[2];
    const address1 = pieces[3].replace('Trunk', 'Highway');
    const address2 = pieces[4];
    const city = pieces[5];
    const province = getProvinceCode(pieces[6]);
    const postalCode = pieces[8];
    const country = pieces[7].substr(0, 2).toUpperCase();
    const trackingId = pieces[1];
    const reference = pieces[0];
    const serviceLabel = 'BNI_STD';

    if (province === '??') {
        throw new Error('Unsupported pronvice: ' + pieces[6] + ' - ' + input);
    }

    if (country === '??') {
        throw new Error('Unsupported country: ' + pieces[7]);
    }

    return [
        /* 1 Shipper's Account Number (EDI client ID)                  */ agent,
        /* 2 Shipper's Name                                            */ '',
        /* 3 Shipper's Address line 1                                  */ '',
        /* 4 Shipper's Address line 2                                  */ '',
        /* 5 Shipper's Address line 3                                  */ '',
        /* 6 Shipper's City                                            */ '',
        /* 7 Shipper's Province                                        */ '',
        /* 8 Shipper's Postal Code                                     */ '',
        /* 9 Consignee's Name                                          */ name,
        /* 10 Consignee's Address line 1                               */ address1,
        /* 11 Consignee's Address line 2                               */ address2,
        /* 12 Consignee's Address line 3                               */ '',
        /* 13 Consignee's City                                         */ city,
        /* 14 Consignee's Province                                     */ province,
        /* 15 Consignee's Postal Code                                  */ postalCode,
        /* 16 Country Code Abbreviation                                */ country,
        /* 17 Unique Barcode on Package                                */ trackingId,
        /* 18 Shipper's Reference Number (Reference 1)                 */ reference,
        /* 19 Consignee's Reference Number (Shipment Reference Number) */ '',
        /* 20 Piece Number and/or Count for Shipment                   */ 1,
        /* 21 Piece Weight for Package                                 */ 1,
        /* 22 Unit of Measurement (Weight)                             */ 'l',
        /* 23 Special Instructions (Job comments)                      */ '',
        /* 24 Service Level (Service type code)                        */ serviceLabel,
        /* 25 Consignee's Phone Number                                 */ '',
        /* 26 Consignee's Email Address                                */ ''
    ].map(item => `"${item}"`).join('|');
}