function format(input, index) {
    const lines = [];
    if (index == 0) {
        lines.push('TrackingId,ReferenceId,EventTime,EventCity,EventProvince,Latitude,Longitude,StatusId,CourierId');
    }

    input = input.match(/".*?(?<!\\)"/g).map(cell => cell.trim().replaceAll(/^"|"$/g, ''));

    if (input[8].startsWith('PURO_D')) {
        lines.push([
            /* TrackingId      */ input[0],
            /* ReferenceId     */ input[1],
            /* EventTime       */ `${input[2]} ${input[3]}`,
            /* EventCity       */ input[4],
            /* EventProvince   */ input[5],
            /* Latitude        */ input[6],
            /* Longitude       */ input[7],
            /* StatusId        */ input[9],
            /* CourierId       */ 'NovaXpress 1'
        ].join(','));

        console.log(lines);
    } else {
        console.log(input[6]);
    }

    return lines;
}