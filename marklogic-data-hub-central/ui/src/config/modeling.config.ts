export const COMMON_PROPERTY_TYPES = [
  {
    label: 'string',
    value: 'string'
  },
  {
    label: 'integer',
    value: 'integer'
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
      label: 'iri',
      value: 'iri'
    }
  ]
};

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
};

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
      label: 'gDay',
      value: 'gDay'
    },
    {
      label: 'gMonth',
      value: 'gMonth'
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
};

export const DROPDOWN_PLACEHOLDER = (key) => { return { label: '---------------------', value: key, disabled: true };};
