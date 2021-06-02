const displaySchemaPromise = fetch('schemas/display-schema.json').then(response => response.json());

function evaluateItemValue(data, itemSchema) {
    switch (itemSchema.type) {
        case 'column': return data[itemSchema.value];
        default: return itemSchema.value;
    }
}

function evaluateCondition(data, itemASchema, itemBSchema, condition) {
    const itemA = evaluateItemValue(data, itemASchema);
    const itemB = evaluateItemValue(data, itemBSchema);
    switch (condition) {
        case '==': return itemA == itemB;
        case '!=': return itemA != itemB;
        case '>=': return itemA >= itemB;
        case '<=': return itemA <= itemB;
        case '>': return itemA > itemB;
        case '<': return itemA < itemB;
        default: throw `Unrecognized condition "${condition}"`;
    }
}

function createColumn(element, recordData, columnSchema) {
    const labelElement = document.createElement('span');
    const valueElement = document.createElement('span');

    const value = recordData[columnSchema.column];
    labelElement.innerText = columnSchema.display;
    if (value === undefined) {
        valueElement.innerText = columnSchema.default;
    } else {
        valueElement.innerText = value;
    }

    element.appendChild(labelElement);
    element.appendChild(valueElement);
}

function getFormattedDate(date) {
    date = new Date(date.replaceAll(/(?<=-)0+(?=[1-9])/g, ''));
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

firebase.auth().onAuthStateChanged(async user => {
    if (user) {
        try {
            const database = firebase.firestore();
            const informationElement = document.getElementById('home-information');

            const userId = 45;
            const recordSnapshot = await database.collectionGroup('employees').where('id', '==', userId).get();
            if (recordSnapshot.empty) throw `No employee records of ID ${userId}`;

            const data = {};
            const promises = [];
            recordSnapshot.forEach(recordDocument => {
                promises.push(new Promise(async (resolve, reject) => {
                    const periodDocument = await recordDocument.ref.parent.parent.get();
                    const periodData = periodDocument.data();
                    const recordData = recordDocument.data();
                    const periodTabName = `${getFormattedDate(periodData.start)} to ${getFormattedDate(periodData.end)}`;
                    console.log(periodData, recordData);
                    resolve();
                }));
            });

            Promise.all(promises);
            console.log(data);

            // const employeeDocument = querySnapshot.docs[0];
            // const employeeData = employeeDocument.data();
            // const displaySchema = await displaySchemaPromise;

            // for (const columnSchema of displaySchema.columns) {
            //     if (columnSchema.condition) {
            //         const conditionSchema = displaySchema.conditions[columnSchema.condition];
            //         if (!evaluateCondition(employeeData, conditionSchema.a, conditionSchema.b, conditionSchema.condition)) {
            //             continue;
            //         }
            //     }

            //     createColumn(informationElement, employeeData, columnSchema);
            // }
        } catch (error) {
            console.log(error);
        }
    }
});