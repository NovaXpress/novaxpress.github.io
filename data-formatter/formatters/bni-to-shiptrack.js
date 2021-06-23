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

    let fullAddress = pieces[1];

    const postalCode = fullAddress.substr(fullAddress.length - 7, 7);
    fullAddress = fullAddress.substr(0, fullAddress.length - 7);

    let addressPieces = fullAddress.split(',').map(piece => piece.trim());
    if (addressPieces.length < 2) {
        const addressSuffixes = ['crescent', 'court', 'path', 'loop', 'cres', 'place', 'street', 'avenue', 'drive', 'lane', 'road', 'crt', 'ave', 'st', 'rd', 'dr', 'ln']
            .sort((a, b) => b.length - a.length);
        for (const suffix of addressSuffixes) {
            addressPieces = fullAddress.split(new RegExp(`(?<= ${suffix})\.?`, 'i')).map(piece => piece.trim());
            if (addressPieces.length >= 2) break;
        }
    }
    if (addressPieces.length < 2) {
        const numberMatches = fullAddress.match(/[0-9]+/g);
        if (numberMatches && numberMatches.length > 1) {
            addressPieces = fullAddress.split(/(?=(?<=[0-9])[^0-9]*$)/).map(piece => piece.trim());
        }
    }

    const addressLine = addressPieces[0] || 'Unknown';
    const city = addressPieces[1] || 'Unknown';

    if (!addressPieces[1]) {
        console.log(addressPieces, fullAddress);
    }

    if (pieces.length != 2 || !pieces[0].startsWith('BNI')) return null;
    return [
        'BNIAGENT',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        addressLine,
        '',
        '',
        city,
        '',
        postalCode,
        '',
        pieces[0],
        '',
        `REF${pieces[0]}`,
        1,
        14,
        'l',
        '',
        'BNI_STD',
        '',
        ''
    ].map(item => `"${item}"`).join('|');
}