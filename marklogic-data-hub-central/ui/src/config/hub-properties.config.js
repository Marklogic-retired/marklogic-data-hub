// Maps constraint name to user-friendly facet label.
// Order of object properties determines order in sidebar.
const hubPropertiesConfig = [ 
  {
    facetName: "Collection",
    displayName: "Collection",
    tooltip: "A name defining a group of documents.",
    referenceType: 'collection',
    propertyPath: ' ',
    entityTypeId: ' '
  },
  /* {
    facetName: "createdOnRange",
    displayName: "Created On",
    tooltip: "The date when a document was harmonized."
  }, */
  {
    facetName: "createdInFlowRange",
    displayName: "Flow",
    tooltip: "A sequence of one or more steps that processes or enhances the data.",
    referenceType: 'field',
    propertyPath: 'createdInFlowRange',
    entityTypeId: ' '
  },
  {
    facetName: "createdByStep",
    displayName: "Step",
    tooltip: "Code that processes or enhances the data.",
    referenceType: 'field',
    propertyPath: 'createdByStep',
    entityTypeId: ' '
  },
  {
    facetName: "sourceName",
    displayName: "Source Name",
    tooltip: "The name of the source of the files.",
    referenceType: 'field',
    propertyPath: 'datahubSourceName',
    entityTypeId: ' '
  },
  {
    facetName: "sourceType",
    displayName: "Source Type",
    tooltip: "The type of source of the files.",
    referenceType: 'field',
    propertyPath: 'datahubSourceType',
    entityTypeId: ' '
  },
];

export default hubPropertiesConfig;