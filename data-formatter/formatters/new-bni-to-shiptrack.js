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
    return [
    /* 1 Shipper's Account Number (EDI client ID)                  */ 'BNIAGENT',
    /* 2 Shipper's Name                                            */ aabb(index),
    /* 3 Shipper's Address line 1                                  */ '',
    /* 4 Shipper's Address line 2                                  */ '',
    /* 5 Shipper's Address line 3                                  */ '',
    /* 6 Shipper's City                                            */ '',
    /* 7 Shipper's Province                                        */ '',
    /* 8 Shipper's Postal Code                                     */ '',
    /* 9 Consignee's Name                                          */ '',
    /* 10 Consignee's Address line 1                               */ pieces[1],
    /* 11 Consignee's Address line 2                               */ '',
    /* 12 Consignee's Address line 3                               */ '',
    /* 13 Consignee's City                                         */ 'Unknown',
    /* 14 Consignee's Province                                     */ '',
    /* 15 Consignee's Postal Code                                  */ pieces[2],
    /* 16 Country Code Abbreviation                                */ '',
    /* 17 Unique Barcode on Package                                */ pieces[0],
    /* 18 Shipper's Reference Number (Reference 1)                 */ '',
    /* 19 Consignee's Reference Number (Shipment Reference Number) */ `REF${pieces[0]}`,
    /* 20 Piece Number and/or Count for Shipment                   */ 1,
    /* 21 Piece Weight for Package                                 */ 14,
    /* 22 Unit of Measurement (Weight)                             */ 'l',
    /* 23 Special Instructions (Job comments)                      */ '',
    /* 24 Service Level (Service type code)                        */ 'BNI_STD',
    /* 25 Consignee's Phone Number                                 */ '',
    /* 26 Consignee's Email Address                                */ ''
    ].map(item => `"${item}"`).join('|');
}