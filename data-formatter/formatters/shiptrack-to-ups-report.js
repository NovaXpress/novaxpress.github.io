function format(input, lineNumber) {
    const lines = [];

    const hrmPostalCodes = ["B2T", "B3A", "B3B", "B3C", "B3D", "B3E", "B3F", "B3G", "B3H", "B3I", "B3J", "B3K", "B3L", "B3M", "B3N", "B3O", "B3P", "B3Q", "B3R", "B3S", "B3T", "B3U", "B3V", "B3W", "B3X", "B3Y", "B3Z", "B4A", "B4B", "B4C", "B4D", "B4E", "B4F", "B4G"];

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

        if (hrmPostalCodes.includes(postalCode.substring(0, 3))) {
            routeIdentifier = 'HRM';
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