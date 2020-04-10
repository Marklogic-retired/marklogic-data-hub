const validateMappingTableRow = (dataTable, rowValue1, rowValue2, rowValue3, rowValue4, colName) => {
    let rowKey = 1;
    dataTable.forEach(item => {
        let att: any = item.getAttribute('data-row-key') ? item.getAttribute('data-row-key') : '{}';
        let row = JSON.parse(att);
        let keyCol = '';
        if (['key', 'name'].includes(colName)) {
            if (row.hasOwnProperty('name') && row.hasOwnProperty('type')) {
                keyCol = row.name;
            } else {
                keyCol = row.key;
            }
        } else {
            if (row.hasOwnProperty('name') && row.hasOwnProperty('type')) {

                keyCol = row.type.startsWith('parent-') ? row.type.slice(row.type.indexOf('-') + 1) : row.type;
            } else {
                keyCol = row.val;
            }
        }
        if (rowKey === 1) {
            expect(keyCol).toBe(rowValue1);
        } else if (rowKey === 2) {
            expect(keyCol).toBe(rowValue2);
        } else if (rowKey === 3) {
            expect(keyCol).toBe(rowValue3);
        } else {
            expect(keyCol).toBe(rowValue4);
        }
        rowKey = rowKey + 1;
    });
}

export {
    validateMappingTableRow
}
