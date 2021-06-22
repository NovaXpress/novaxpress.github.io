async function readFileData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsBinaryString(file);
    });
}

function createLabeledRadioButton(label, name, value, required = true) {
    const radioButtonElement = document.createElement('input');
    radioButtonElement.type = 'radio';
    radioButtonElement.id = value;
    radioButtonElement.name = name;
    radioButtonElement.value = value;
    radioButtonElement.required = required;

    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', value);
    labelElement.innerText = label;

    return [radioButtonElement, labelElement];
}

const formatters = {};
const formattersElement = document.getElementById('formatters');
fetch('formatters/formatters.json').then(response => response.json()).then(async formattersJSON => {
    for (const formatterJSON of formattersJSON) {
        try {
            const source = await fetch(`formatters/${formatterJSON.file}`).then(response => response.text());
            const formatFunction = eval(`(() => {${source}; return format;})();`);
            if (!formatFunction) throw new Error('No valid format function declared');
            formattersElement.append(...createLabeledRadioButton(formatterJSON.name, 'formatter', formatterJSON.file));
            formatters[formatterJSON.file] = formatterJSON;
            formatters[formatterJSON.file].function = formatFunction;
        } catch (error) {
            console.log(`Failed to load formatter ${formatterJSON.file}: ${error.message}`);
            alert(`Failed to load "${formatterJSON.name}" formatter.`);
        }
    }
});

FORMS.getForm('formatter')['to-format'].onchange = () => {
    const downloadContainer = document.getElementById('download-container');
    while (downloadContainer.lastElementChild) downloadContainer.lastElementChild.remove();
};

FORMS.register('formatter', async data => {
    try {
        const file = data['to-format'];
        const fileData = await readFileData(file);

        const formatterFile = data['formatter'];
        const formatter = formatters[formatterFile];

        const formattedRows = [];

        let quoted = false;
        let lineCharacters = [];
        let lines = [];
        for (let i = 0; i < fileData.length; i++) {
            const character = fileData[i];
            if (character === '"') {
                if (i == 0 || fileData[i - 1] != '\\') {
                    quoted = !quoted;
                }
            }
            lineCharacters.push(character);
            if (character === '\n') {
                if (!quoted) {
                    lines.push(lineCharacters.join(''));
                    lineCharacters = [];
                }
            }
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line) {
                const output = formatter.function(line, i);
                if (output) {
                    if (Array.isArray(output)) {
                        formattedRows.push(...output);
                    } else {
                        formattedRows.push(output);
                    }
                }
            }
        }

        const outputFileName = file.name.replace(/\.[A-Za-z]+/, '-generated.' + formatter['output_extension']);

        const formattedData = formattedRows.join('\n');
        const downloadElement = document.createElement('a');
        downloadElement.href = `data:text/plain;charset=utf-8,${encodeURIComponent(formattedData)}`;
        downloadElement.download = outputFileName;
        downloadElement.innerText = 'Download';

        const downloadContainer = document.getElementById('download-container');
        while (downloadContainer.lastElementChild) downloadContainer.lastElementChild.remove();
        downloadContainer.appendChild(downloadElement);

        return true;
    } catch (error) {
        console.error(error);
        FORMS.display('formatter', 'Failed to perform reformat', 'error', true);
        FORMS.display('formatter', error.message, 'error', false);
        FORMS.display('formatter', 'Did you choose the correct formatter?', 'error', false);
        return false;
    }
});

FORMS.load();