//This file contains an object which stores source format options and its related properties. It can be used across the project.

const sourceFormatOptions = {
    json: { color: '#ffbf00' },
    xml: { color: '#5bd171' },
    csv: { color: '#531dab' },
    default: {color: '#44499C'}
}

const srcOptions = {
    'XML': 'xml',
    'JSON': 'json',
    'Delimited Text': 'csv',
    'BINARY': 'binary',
    'TEXT' : 'text'
  }
const tgtOptions = {
    'XML': 'xml',
    'JSON': 'json',
    'BINARY': 'binary',
    'TEXT' : 'text'
}

const fieldSeparatorOptions = {
    ',' : ',',
    '|' : '|',
    ';' : ';',
    'Tab': '\\t',
    'Other': 'Other'
}


export default sourceFormatOptions;
export {
    srcOptions,
    tgtOptions,
    fieldSeparatorOptions
}
