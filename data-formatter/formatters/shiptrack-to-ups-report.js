function format(input, lineNumber) {
    console.log(input);
    const lines = [];

    if (lineNumber == 0) {
        lines.push('Building_Identifier,Route_Identifier,alt_barcode,conv_time_date,status,consignee_street_name,consignee_city,Prov,consignee_postal_code,Customer_Name,Sig_Confirm_Information_sign_or_location');
    }

    const quote = input => '"' + input.replaceAll(/"/g, '\\"') + '"';
    const cells = input.match(/".*?(?<!\\)"/g).map(cell => cell.trim().replaceAll(/^"|"$/g, ''));

    const signedBy = cells[29];
    const deliveryLocation = cells[60];
    const service = cells[3];
    const statusDescription = cells[27].toLowerCase();

    if (service === 'UPS_STD' || true) {
        let buildingIdentifier = 'HAL';
        let routeIdentifier = 'NXW';
        let barcode = cells[0] || '!!! MISSING INFORMATION !!!';
        let time = cells[46] || '!!! MISSING INFORMATION !!!';
        let status = `!!! MISSING INFORMATION !!! (Status Description: ${statusDescription || '[NONE]'})`;
        let streetName = cells[12] || '!!! MISSING INFORMATION !!!';
        let city = cells[14] || '!!! MISSING INFORMATION !!!';
        let province = cells[15] || '!!! MISSING INFORMATION !!!';
        let postalCode = cells[16] || '!!! MISSING INFORMATION !!!';
        let customerName = cells[11] || '!!! MISSING INFORMATION !!!';
        let confirmation = signedBy || deliveryLocation || '';

        if (statusDescription.includes('delivery')) {
            if (signedBy) {
                status = 'DWS';
            } else {
                status = 'DNS';
            }
        } else if (statusDescription.includes('closed')) {
            status = 'CLO';
        } else if (statusDescription.includes('bad address')) {
            status = 'INC';
        } else if (statusDescription.includes('reschedule')) {
            status = 'RES';
        } else if (statusDescription.includes('refused')) {
            status = 'REF';
        } else if (statusDescription.includes('return')) {
            status = 'RTU';
        } else if (statusDescription.includes('other')) {
            status = 'OFD';
        } else if (statusDescription.includes('no access')) {
            status = 'NAC';
        }

        lines.push([
            quote(buildingIdentifier),
            quote(routeIdentifier),
            quote(barcode),
            quote(time),
            quote(status),
            quote(streetName),
            quote(city),
            quote(province),
            quote(postalCode),
            quote(customerName),
            quote(confirmation)
        ].join(','));
    }

    return lines;
}