function aabb(index) {
    let sequence = [0];
    while (index-- > 0) {
        const index = sequence.length - 1;
        if (sequence[index] + 1 < 26) {
            sequence[index]++;
        } else {
            sequence[index] = 0;
            sequence.push(0);
        }
    }
    return sequence.map(index => String.fromCharCode(65 + index)).join('');
}

function format(input, index) {
    const pieces = input.trim().split(',');

    let column = 0;
    const agent = pieces[column++] || '!!! MISSING INFORMATION !!!';
    const id = pieces[column++] || '!!! MISSING INFORMATION !!!';
    const name = pieces[column++] || aabb(index);
    const address1 = pieces[column++] || 'Unknown';
    const address2 = pieces[column++] || '';
    const postalCode = pieces[column++] || 'Unknown';
    const city = pieces[column++] || 'Unknown';
    const province = pieces[column++] || 'Unknown';
    const country = pieces[column++].substr(0, 2).toUpperCase() || '__';
    const serviceLabel = pieces[column++] || '!!! MISSING INFORMATION !!!';

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
    /* 17 Unique Barcode on Package                                */ id,
    /* 18 Shipper's Reference Number (Reference 1)                 */ '',
    /* 19 Consignee's Reference Number (Shipment Reference Number) */ `REF${id}`,
    /* 20 Piece Number and/or Count for Shipment                   */ 1,
    /* 21 Piece Weight for Package                                 */ 1,
    /* 22 Unit of Measurement (Weight)                             */ 'l',
    /* 23 Special Instructions (Job comments)                      */ '',
    /* 24 Service Level (Service type code)                        */ serviceLabel,
    /* 25 Consignee's Phone Number                                 */ '',
    /* 26 Consignee's Email Address                                */ ''
    ].map(item => `"${item}"`).join('|');
}