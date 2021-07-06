function format(input, index) {
    const lines = [];
    if (index == 0) {
        lines.push('TrackingId,ReferenceId,EventTime,EventCity,EventProvince,Latitude,Longitude,StatusId,CourierId');
    }

    input = input.match(/".*?(?<!\\)"/g).map(cell => cell.trim().replaceAll(/^"|"$/g, ''));

    let eventTime = new Date(`${input[2]} ${input[3]}`);
    const pad = value => value.toString().padStart(2, '0');
    eventTime = `${pad(eventTime.getUTCMonth() + 1)}/${pad(eventTime.getUTCDate())}/${eventTime.getUTCFullYear()} ${pad(eventTime.getUTCHours())}:${pad(eventTime.getUTCMinutes())}`;

    if (input[8].startsWith('PURO_D')) {
        lines.push([
            /* TrackingId      */ input[0],
            /* ReferenceId     */ input[1],
            /* EventTime       */ eventTime,
            /* EventCity       */ input[4],
            /* EventProvince   */ input[5],
            /* Latitude        */ input[6],
            /* Longitude       */ input[7],
            /* StatusId        */ input[9],
            /* CourierId       */ 'NovaXpress 1'
        ].join(','));
    }

    return lines;
}