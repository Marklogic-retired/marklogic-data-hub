export const COMMON_PROPERTY_TYPES = [
  {
    label: 'integer',
    value: 'integer'
  },
  {
    label: 'string',
    value: 'string'
  },
  {
    label: 'dateTime',
    value: 'dateTime'
  },
  {
    label: 'boolean',
    value: 'boolean'
  }
];

export const MORE_STRING_TYPES = {
  label: 'More string types',
  value: 'moreStringTypes',
  children: [
    {
      label: 'anyURI',
      value: 'anyURI'
    },
    {
      label: 'base64binary',
      value: 'base64binary'
    },
    {
      label: 'hexBinary',
      value: 'hexBinary'
    },
    {
      label: 'iri',
      value: 'iri'
    }
  ]
}

export const MORE_NUMBER_TYPES = {
  label: 'More number types',
  value: 'moreNumberTypes',
  children: [
    {
      label: 'byte',
      value: 'byte'
    },
    {
      label: 'decimal',
      value: 'decimal'
    },
    {
      label: 'double',
      value: 'double'
    },
    {
      label: 'float',
      value: 'float'
    },
    {
      label: 'int',
      value: 'int'
    },
    {
      label: 'long',
      value: 'long'
    },
    {
      label: 'negativeInteger',
      value: 'negativeInteger'
    },
    {
      label: 'nonNegativeInteger',
      value: 'nonNegativeInteger'
    },
    {
      label: 'nonPositiveInteger',
      value: 'nonPositiveInteger'
    },
    {
      label: 'positiveInteger',
      value: 'positiveInteger'
    },
    {
      label: 'short',
      value: 'short'
    },
    {
      label: 'unsignedByte',
      value: 'unsignedByte'
    },
    {
      label: 'unsignedInt',
      value: 'unsignedInt'
    },
    {
      label: 'unsignedLong',
      value: 'unsignedLong'
    },
    {
      label: 'unsignedShort',
      value: 'unsignedShort'
    }
  ]
}

export const MORE_DATE_TYPES = {
  label: 'More date types',
  value: 'moreDateTypes',
  children: [
    {
      label: 'date',
      value: 'date'
    },
    {
      label: 'dayTimeDuration',
      value: 'dayTimeDuration'
    },
    {
      label: 'duration',
      value: 'duration'
    },
    {
      label: 'gDat',
      value: 'gDat'
    },
    {
      label: 'gMonth',
      value: 'gMonth'
    },
    {
      label: 'gMonthDay',
      value: 'gMonthDay'
    },
    {
      label: 'gYear',
      value: 'gYear'
    },
    {
      label: 'gYearMonth',
      value: 'gYearMonth'
    },
    {
      label: 'time',
      value: 'time'
    },
    {
      label: 'yearMonthDuration',
      value: 'yearMonthDuration'
    }
  ]
}

export const DROPDOWN_PLACEHOLDER = (key) => { return { label: '---------------------', value: key, disabled: true }}
