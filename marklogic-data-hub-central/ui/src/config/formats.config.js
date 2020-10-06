//This file contains an object which stores source format options and its related properties. It can be used across the project.

const sourceFormatOptions = {
    json: { label: 'JSON', color: '#ffbf00' },
    xml: { label: 'XML', color: '#5bd171' },
    csv: { label: 'CSV', color: '#531dab' },
    text: { label: 'TXT', color: '#1254f9'},
    binary : { label: 'BIN', color: '#444444'},
    default: {color: '#44499C'}
};

const srcOptions = {
    'XML': 'xml',
    'JSON': 'json',
    'Delimited Text': 'csv',
    'BINARY': 'binary',
    'TEXT' : 'text'
  };
const tgtOptions = {
    'XML': 'xml',
    'JSON': 'json',
    'BINARY': 'binary',
    'TEXT' : 'text'
};

const fieldSeparatorOptions = {
    ',' : ',',
    '|' : '|',
    ';' : ';',
    'Tab': '\\t',
    'Other': 'Other'
};


export default sourceFormatOptions;
export {
    srcOptions,
    tgtOptions,
    fieldSeparatorOptions
};
