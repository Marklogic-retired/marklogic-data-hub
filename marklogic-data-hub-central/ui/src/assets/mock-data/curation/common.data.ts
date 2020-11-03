// Test data

const flows = [
    {
        name: 'FlowA',
        steps: [
            {
                name: 'stepA1',
                type: 'Load Data',
                format: 'JSON'
            },
            {
                name: 'stepA2',
                type: 'Mapping',
                format: 'JSON'
            }
        ]
    },
    {
        name: 'FlowB',
        steps: [
            {
                name: 'stepB1',
                type: 'Load Data',
                format: 'XML'
            },
            {
                name: 'stepB2',
                type: 'Mapping',
                format: 'XML'
            },
            {
                name: 'stepB3',
                type: 'Mastering',
                format: 'XML'
            },
        ]
    }
];

const flowsAdd = [
    {
        name: 'FlowStepNoExist',
        steps: [
            {
                stepNume: '1',
                stepName: 'testLoad456', // has step NOT IN loadData
                stepDefinitionType: 'Load Data',
                stepId: 'testLoad456-ingestion',
                format: 'xml'
            },
        ]
    },
    {
        name: 'FlowStepExist',
        steps: [
            {
                  stepNume: '2',
                  stepName: 'testLoadXML', // has step IN loadData
                  stepDefinitionType: 'Load Data',
                  stepId: 'testLoadXML-ingestion',
                  format: 'xml'
            },
        ]
    },
];

const loadData = {
  data: [
    {
      name: "testLoad",
      description: "description for JSON load",
      sourceFormat: "json",
      targetFormat: "json",
      outputURIReplacement: "",
      inputFilePath: "/json-test/data-sets/testLoad",
      lastUpdated: "2000-01-01T12:00:00.000000-00:00"
    },
    {
      name: "testLoadXML",
      description: "description for XML load",
      sourceFormat: "json",
      targetFormat: "xml",
      outputURIReplacement: "",
      inputFilePath: "/xml-test/data-sets/testLoad",
      lastUpdated: "2020-04-15T14:22:54.057519-07:00"
    },
    {
      name: "testLoad123",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    }
  ],
  deleteLoadArtifact: jest.fn(),
  createLoadArtifact: jest.fn(),
  canReadWrite: true,
  canReadOnly: false,

};

const jsonSourceDataMultipleSiblings = [
  { rowKey: 1, key: 'proteinId', val: '123EAC' },
  { rowKey: 2, key: 'proteinType', val: 'home' },
  {
    rowKey: 3, key: 'nutFreeName', children: [
      { rowKey: 4, key: 'FirstNamePreferred', val: 'John' },
      { rowKey: 5, key: 'LastName', val: 'Smith' , children: [
        { rowKey: 6, key: 'suffix', val: 'Sr.' }
      ]}
    ]
  },
  {
    rowKey: 7, key: 'nutFreeName', children: [
      { rowKey: 8, key: 'FirstNamePreferred', val: 'Eric'},
      { rowKey: 9, key: 'LastName', val: 'Johnson', children: [
        { rowKey: 10, key: 'suffix', val: 'Jr.'}
      ]}
      ]
  },
  { rowKey: 11, key: 'proteinCat', val: 'commercial' },
  {
    rowKey: 12, key: 'withNutsOrganism', children: [
    { rowKey: 13, key: 'OrganismName', val: 'Frog virus 3' },
    { rowKey: 14, key: 'OrganismType', val: 'scientific' }
  ]
  }
];

const xmlSourceDataMultipleSiblings = [
  {
    rowKey: 1, key: 'sampleProtein', children: [
      { rowKey: 2, key: 'proteinId', val: '123EAC' },
      { rowKey: 3, key: '@proteinType', val: 'home' },
      {
        rowKey: 4, key: 'nutFree:name', children: [
        { rowKey: 5, key: 'FirstNamePreferred', val: 'John' },
        { rowKey: 6, key: 'LastName', val: 'Smith' }
      ]
      },
      {
        rowKey: 7, key: 'nutFree:name', children: [
        { rowKey: 8, key: 'FirstNamePreferred', val: 'Eric' },
        { rowKey: 9, key: 'LastName', val: 'Johnson' }
      ]
      },
      { rowKey: 10, key: 'proteinCat', val: 'commercial' },
      {
        rowKey: 11, key: 'withNuts:Organism', children: [
        { rowKey: 12, key: 'OrganismName', val: 'Frog virus 3' },
        { rowKey: 13, key: 'OrganismType', val: 'scientific' }
      ]
      }
    ]
  }
];

const entityTypePropertiesMultipleSiblings = [
  { key: 1, name: 'propId', type: 'int' },
  { key: 2, name: 'propName', type: 'string' },
  { key: 3, name: 'propAttribute', type: 'string' },
  {
    key: 4, name: 'items', type: 'parent-ItemType [ ]', children: [
      { key: 5, name: 'items/itemTypes', type: 'string' },
      {
        key: 6, name: 'items/itemCategory', type: 'parent-catItem', children: [
          { key: 7, name: 'items/itemCategory/artCraft', type: 'string' },
          { key: 8, name: 'items/itemCategory/automobile', type: 'string' }
        ]
      },
      {
        key: 9, name: 'items/productCategory', type: 'parent-catProduct', children: [
          { key: 10, name: 'items/productCategory/speedometer', type: 'string' },
          { key: 11, name: 'items/productCategory/windscreen', type: 'string' }
        ]
      }]
  },
  { key: 12, name: 'gender', type: 'string' }
];

const xmlSourceData = [
  {
    rowKey: 1, key: 'sampleProtein', children: [
      { rowKey: 2, key: 'proteinId', val: '123EAC' },
      { rowKey: 3, key: '@proteinType', val: 'home' },
      {
        rowKey: 4, key: 'nutFree:name', children: [
        { rowKey: 5, key: 'FirstNamePreferred', val: 'John' },
        { rowKey: 6, key: 'LastName', val: 'Smith' }
      ]
      },
      { rowKey: 7, key: 'proteinCat', val: 'commercial' },
      { rowKey: 8, key: 'nutFree:proteinDog', val: 'retriever, , golden, labrador', array: true}
    ]
  }
];

const jsonSourceData = [
  { rowKey: 1, key: 'proteinId', val: '123EAC', datatype: 'string' },
  { rowKey: 2, key: 'proteinType', val: 'home', datatype: 'string' },
  {
    rowKey: 3, key: 'nutFreeName', children: [
      { rowKey: 4, key: 'FirstNamePreferred', val: 'John', datatype: 'string' },
      { rowKey: 5, key: 'LastName', val: 'Smith', datatype: 'string', children: [
        { rowKey: 6, key: 'suffix', val: 'Sr.', datatype: 'string' }
      ]}
    ]
  },
  { rowKey: 7, key: 'proteinCat', val: 'commercial', datatype: 'string' },
  { rowKey: 8, key: 'proteinDog', val: 'retriever, golden, labrador', array: true, datatype: 'string' },
  { rowKey: 9, key: 'emptyString', val: '', datatype: 'string' },
  { rowKey: 10, key: 'nullValue', val: 'null', datatype: 'null' },
  { rowKey: 11, key: 'numberValue', val: '321', datatype: 'number' },
  { rowKey: 12, key: 'booleanValue', val: 'true', datatype: 'boolean' },
  { rowKey: 13, key: 'whitespaceValue', val: ' ', datatype: 'string' },
  { rowKey: 14, key: 'emptyArrayValue', val: '[ ]', datatype: 'object' },
  { rowKey: 15, key: 'numberArray', val: '1, 2, 3', array: true, datatype: 'number' },
  { rowKey: 16, key: 'booleanArray', val: 'true, false, true', array: true, datatype: 'boolean' },
];

const entityTypeProperties = [
  { key: 1, name: 'propId', type: 'int' },
  { key: 2, name: 'propName', type: 'string' },
  { key: 3, name: 'propAttribute', type: 'string' },
  {
    key: 4, name: 'items', type: 'parent-ItemType [ ]', children: [
      { key: 5, name: 'items/itemTypes', type: 'string' },
      {
        key: 6, name: 'items/itemCategory', type: 'parent-catItem', children: [
          { key: 7, name: 'items/itemCategory/artCraft', type: 'string' },
          { key: 8, name: 'items/itemCategory/automobile', type: 'string' }
        ]
      }]
  },
  { key: 9, name: 'gender', type: 'string' }
];

const testJSONResponse = {
  properties: {
    propName: { output: '123EAC', sourcedFrom: 'proteinId' },
    propAttribute: { output: 'home', sourcedFrom: 'proteinType' },
  },
  targetEntityType: 'Person'
};

const truncatedJSONResponse = {
  properties: {
    propName: { output: 'extremelylongusername@marklogic.com', sourcedFrom: 'proteinId' },
    propAttribute: { output: ['s@ml.com', '', 't@ml.com', 'u@ml.com' , 'v@ml.com' , 'w@ml.com' , 'x@ml.com' , 'y@ml.com', 'z@ml.com'], sourcedFrom: 'proteinType' },
  },
  targetEntityType: 'Person'
};

const JSONSourceDataToTruncate = [
  { rowKey: 1, key: 'proteinId', val: 'extremelylongusername@marklogic.com' },
  { rowKey: 2, key: 'proteinType', val: 's@ml.com, , t@ml.com, u@ml.com, v@ml.com, w@ml.com, x@ml.com, y@ml.com, z@ml.com'}
];

const truncatedEntityProps = [
  { key: 1, name: 'propId', type: 'int' },
  { key: 2, name: 'propName', type: 'string [ ]' },
  { key: 3, name: 'propAttribute', type: 'string [ ]' }
];

const testJSONResponseWithFunctions = {
  properties: {
    propName: { output: '123EAC', sourcedFrom: 'proteinId' },
    propAttribute: { output: 'home-NEW', sourcedFrom: "concat(proteinType,'NEW')" },
  },
  targetEntityType: 'Person'
};

const errorJSONResponse = {
  properties: {
    propId: { errorMessage: 'Invalid lexical value: "123EACtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest"', sourcedFrom: 'proteinId' },
    propAttribute: { output: 'home', sourcedFrom: 'proteinType' },
  },
  targetEntityType: 'Person'
};

const mapFunctions = [
   { "functionName": "echo","category": "custom", "signature": "echo(input)" },
   { "functionName": "memoryLookup","category": "builtin", "signature": "memoryLookup(input,inputDictionary)" },
   { "functionName": "documentLookup","category": "builtin", "signature": "documentLookup(input,inputDictionaryPath)" },
   { "functionName": "parseDate","category": "builtin", "signature": "parseDate(value,pattern)" },
   { "functionName": "parseDateTime","category": "builtin", "signature": "parseDateTime(value,pattern)" },
   { "functionName": "add-function","category": "custom", "signature": "add-function(num1,num2)" },
   { "functionName": "unparsed-text","category": "xpath", "signature": "unparsed-text(xs:string)" },
   { "functionName": "month-from-dateTime","category": "xpath", "signature": "month-from-dateTime(xs:dateTime?)" },
   { "functionName": "seconds-from-dateTime", "category": "xpath", "signature": "seconds-from-dateTime(xs:dateTime?)" },
   { "functionName": "concat", "category": "xpath", "signature": "concat(xs:anyAtomicType?)" }
];

const mapProps = {
  sourceData: jsonSourceData,
  entityTypeProperties : entityTypeProperties,
  sourceURI: '/dummy/mapping/source/uri1.json',
  mapData: {
    name: 'testMap',
    description: 'Description of testMap',
    targetEntityType: 'Person',
    selectedSource: 'collection',
    sourceQuery: "cts.collectionQuery([''])",
    properties: {
      propId: {  sourcedFrom: 'id' },
      propName: {sourcedFrom: 'testNameInExp'},
      propAttribute: { sourcedFrom: 'placeholderAttribute' },
      items:{ sourcedFrom: "",
      properties:
        { itemTypes : {  sourcedFrom: "" }},
        targetEntityType: "#/definitions/ItemType"
        }
    }
  },
  tgtEntityReferences: {"items":"#/definitions/ItemType"},
  namespaces: {
    nutFree: 'http://namespaces/nutfree',
    withNuts: 'http://namespaces/withNuts'
  },
  mapName: 'testMap',
  getMappingArtifactByMapName: jest.fn(),
  updateMappingArtifact: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  mappingVisible:  false,
  setMappingVisible: jest.fn(),
  fetchSrcDocFromUri: jest.fn(),
  docUris: [ '/dummy/mapping/source/uri1.json', '/dummy/mapping/source/uri2.json', '/dummy/mapping/source/uri3.json'],
  disableURINavLeft: true,
  disableURINavRight: false,
  setDisableURINavLeft: jest.fn(),
  setDisableURINavRight: jest.fn(),
  sourceDatabaseName:'data-hub-STAGING',
  canReadWrite: true,
  canReadOnly: false,
  docNotFound: false,
  entityTypeTitle: 'Person',
  extractCollectionFromSrcQuery: jest.fn(),
  mapFunctions: mapFunctions
};

const newMap = {
  tabKey: '1',
  isNewStep: true,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  createMappingArtifact: jest.fn(),
  stepData: {},
  targetEntityType: '',
  sourceDatabase: '',
  canReadWrite: true,
  canReadOnly: false,
  currentTab: '1',
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn()
}

const editMap = {
  tabKey: '1',
  isNewStep: false,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  createLoadArtifact: jest.fn(),
  stepData: {
    name: 'testMap',
    description: 'Description of testMap',
    targetEntityType: 'Person',
    selectedSource: 'collection',
    sourceQuery: "cts.collectionQuery(['map-collection'])",
    properties: {
      id: {  sourcedFrom: 'id' },
      name: { sourcedFrom: 'name' }
    }
  },
  targetEntityType: '',
  sourceDatabase: '',
  canReadWrite: true,
  canReadOnly: false,
  currentTab: '1',
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn()
}

const advancedSettings = {
  activityType: 'mapping',
  canWrite: true,
  openAdvancedSettings: true,
  stepData: {
    name: 'testAdvancedSettings'
  },
  setOpenAdvancedSettings: jest.fn()
};

const dropDownWithSearch = {
  setDisplaySelectList: jest.fn(),
  setDisplayMenu: jest.fn(),
  displaySelectList: true,
  displayMenu: true,
  srcData: [ {key:'id', value:'id'}, {key:'name', value:'name'}]
};

const customData = [{
    "name": "customJSON",
    "stepDefinitionName": "custom-step",
    "additionalSettings": {
        "dummy": "value"
    },
    "dummy": "value",
    "stepDefinitionType": "custom",
    "sourceDatabase": "db1",
    "targetDatabase": "db2",
    "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
    "stepId": "customJSON-custom",
    "selectedSource": "query",
    "sourceQuery": "cts.collectionQuery(['loadCustomerJSON'])",
    "permissions": "role1,read,role2,update",
    "batchSize": 50,
    "collections": ["Customer", "mapCustomerJSON"],
    "lastUpdated": "2020-06-19T16:31:04.360975-07:00"
    },
    {
        "name": "customXML",
        "stepDefinitionName": "custom-mapping",
        "stepDefinitionType": "custom",
        "stepId": "customXML-custom",
        "selectedSource": "collection",
        "sourceQuery": "cts.collectionQuery(['loadCustomersXML'])",
        "lastUpdated": "2020-06-19T16:31:05.372697-07:00",
        "targetFormat": "XML"
    }
];

const namespacedXmlInstance = "<Document><content><es:envelope xmlns:es=\"http://marklogic.com/entity-services\"><es:instance><Person><fname xsi:type=\"xs:string\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\">Alexandra</fname></Person></es:instance></es:envelope></content></Document>";
const noNamespaceXmlInstance = "<Document><content><envelope xmlns:es=\"http://marklogic.com/entity-services\"><instance><Person><fname xsi:type=\"xs:string\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\">Alexandra</fname></Person></instance></envelope></content></Document>";

const viewCustom = {
  tabKey: '1',
  openStepSettings: true,
  setOpenStepSettings: () => {},
  createLoadArtifact: () => {},
  stepData: customData[0],
  canReadWrite: false,
  canReadOnly: false,
  currentTab: '1',
  setIsValid: () => {},
  resetTabs: () => {},
  setHasChanged: () => {}
}

const data = {
  data: {
    canRead: false,
    canWrite: true
  },
  flows: flows,
  flowsAdd: flowsAdd,
  loadData: loadData,
  mapProps: mapProps,
  newMap: newMap,
  editMap: editMap,
  advancedSettings: advancedSettings,
  dropDownWithSearch: dropDownWithSearch,
  xmlSourceData: xmlSourceData,
  testJSONResponse: testJSONResponse,
  errorJSONResponse: errorJSONResponse,
  testJSONResponseWithFunctions: testJSONResponseWithFunctions,
  xmlSourceDataMultipleSiblings: xmlSourceDataMultipleSiblings,
  entityTypePropertiesMultipleSiblings: entityTypePropertiesMultipleSiblings,
  jsonSourceDataMultipleSiblings: jsonSourceDataMultipleSiblings,
  truncatedJSONResponse: truncatedJSONResponse,
  JSONSourceDataToTruncate: JSONSourceDataToTruncate,
  truncatedEntityProps: truncatedEntityProps,
  customData: customData,
  viewCustom: viewCustom,
  namespacedXmlInstance: namespacedXmlInstance,
  noNamespaceXmlInstance: noNamespaceXmlInstance
};

export default data;
