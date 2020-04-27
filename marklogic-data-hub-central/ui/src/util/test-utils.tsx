const validateMappingTableRow = (dataTable, {...rowValue}, colName) => {
    let rowKey = 0;
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
        expect(keyCol).toBe(rowValue[rowKey])
        rowKey++;
    });
}

const onClosestTableRow:any = command => command.closest('tr');
const onClosestTableBody:any = command => command.closest('tbody');
const onClosestTable:any = command => command.closest('table');
const onClosestDiv:any = command => command.closest('div');

export {
    validateMappingTableRow,
    onClosestTableRow,
    onClosestTableBody,
    onClosestTable,
    onClosestDiv
}
