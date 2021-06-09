function format(input) {
    let UPS_MAN = input.split('|').map(cell => cell.replaceAll(/^"|"$/g, ''));
    return `"UPSAGENT"|""|""|""|""|""|""|""|"${UPS_MAN[11]}"|"${UPS_MAN[8]}"|""|""|"${UPS_MAN[6]}"|"${UPS_MAN[5]}"|"${UPS_MAN[12]}"|"${UPS_MAN[7]}"|"${UPS_MAN[0]}"|""|""|1|14|"l"|""|"UPS_STD"|""|""|""`;
}