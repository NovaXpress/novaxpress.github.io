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
        pieces[1],
        '',
        '',
        '',
        '',
        '',
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