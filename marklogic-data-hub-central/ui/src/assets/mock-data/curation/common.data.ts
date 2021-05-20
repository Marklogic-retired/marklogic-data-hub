// Test data

const flows = [
  {
    name: "FlowA",
    steps: [
      {
        name: "stepA1",
        type: "Load Data",
        format: "JSON"
      },
      {
        name: "stepA2",
        type: "Mapping",
        format: "JSON"
      }
    ]
  },
  {
    name: "FlowB",
    steps: [
      {
        name: "stepB1",
        type: "Load Data",
        format: "XML"
      },
      {
        name: "stepB2",
        type: "Mapping",
        format: "XML"
      },
      {
        name: "stepB3",
        type: "Mastering",
        format: "XML"
      },
    ]
  }
];

const flowsAdd = [
  {
    name: "FlowStepNoExist",
    steps: [
      {
        stepNum: "1",
        stepName: "testLoad456", // has step NOT IN loadData
        stepDefinitionType: "Load Data",
        stepId: "testLoad456-ingestion",
        format: "xml"
      },
    ]
  },
  {
    name: "FlowStepExist",
    steps: [
      {
        stepNum: "1",
        stepName: "testLoadXML", // has step IN loadData
        stepDefinitionType: "Load Data",
        stepId: "testLoadXML-ingestion",
        format: "xml"
      },
      {
        stepNum: "2",
        stepName: "testLoad", // step exists in more than one flow
        stepDefinitionType: "Load Data",
        stepId: "testLoad-ingestion",
        format: "json"
      }
    ]
  },
  {
    name: "FlowStepMultExist",
    steps: [
      {
        stepNum: "1",
        stepName: "testLoad", // step exists in more than one flow
        stepDefinitionType: "Load Data",
        stepId: "testLoad-ingestion",
        format: "json",
      }
    ]
  }
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
      provenanceGranularityLevel: "coarse",
      batchSize: 35,
      permissions: "data-hub-operator,read,data-hub-operator,update",
      targetDatabase: "data-hub-STAGING",
      collections: ["testLoad"],
      additionalCollections: ["addedCollection"],
      headers: {
        "header": true
      },
      interceptors: {
        "interceptor": true
      },
      customHook: {
        "hook": true
      },
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

const jsonSourceDataMultipleSiblings = {
  "envelope": {
    "headers": {
      "sources": [
        {
          "name": "loadCustomersJSON"
        },
        {
          "datahubSourceName": "personSourceName",
          "datahubSourceType": "personSourceType"
        }
      ],
      "createdOn": "2021-02-26T14:09:05.061291-08:00",
      "createdBy": "hc-developer"
    },
    "triples": [],
    "instance": {
      "proteinId": "123EAC",
      "proteinType": "home",
      "nutFreeName": [
        {
          "FirstNamePreferred": "John",
          "LastName": {
            "#text": "Smith",
            "suffix": "Sr."
          }
        },
        {
          "FirstNamePreferred": "Eric",
          "LastName": {
            "#text": "Johnson",
            "suffix": "Jr."
          }
        }
      ],
      "proteinCat": "commercial",
      "withNutsOrganism": {
        "OrganismName": "Frog virus 3",
        "OrganismType": "scientific"
      },
      "proteinDog": "retriever, golden, labrador",
      "emptyString": "",
      "nullValue": null,
      "numberValue": 321,
      "booleanValue": true,
      "whitespaceValue": " ",
      "emptyArrayValue": [],
      "numberArray": [1, 2, 3],
      "booleanArray": [true, false, true]
    },
    "attachments": null
  }
};

const jsonSourceDataDefault = {
  "envelope": {
    "headers": {},
    "triples": [],
    "instance": {
      "proteinId": "123EAC",
      "proteinType": "home",
      "nutFreeName": [
        {
          "FirstNamePreferred": "John",
          "LastName": {
            "#text": "Smith",
            "suffix": "Sr."
          }
        }
      ],
      "proteinCat": "commercial",
      "proteinDog": ["retriever, golden, labrador"],
      "emptyString": "",
      "nullValue": null,
      "numberValue": 321,
      "booleanValue": true,
      "whitespaceValue": " ",
      "emptyArrayValue": [],
      "numberArray": [1, 2, 3],
      "booleanArray": [true, false, true]
    },
    "attachments": null
  }
};

const jsonSourceDataRelated = {
  "envelope": {
    "headers": {},
    "triples": [],
    "instance": {
      "proteinId": "123EAC",
      "proteinType": "home",
      "nutFreeName": [
        {
          "FirstNamePreferred": "John",
          "LastName": {
            "#text": "Smith",
            "suffix": "Sr."
          }
        }
      ],
      "proteinCat": "commercial",
      "proteinDog": ["retriever, golden, labrador"],
      "emptyString": "",
      "nullValue": null,
      "numberValue": 321,
      "booleanValue": true,
      "whitespaceValue": " ",
      "emptyArrayValue": [],
      "numberArray": [1, 2, 3],
      "booleanArray": [true, false, true],
      "BabyRegistry": [
        {
          "BabyRegistryId": "3039",
          "Arrival_Date": "2021-06-07"
        }
      ]
    },
    "attachments": null
  }
};

const xmlSourceDataMultipleSiblings = "<envelope><headers><sources xmlns=\"\"><name>loadPersonXML</name></sources><createdOn xmlns=\"\">2021-02-26T14:09:13.783548-08:00</createdOn><createdBy xmlns=\"\">hc-developer</createdBy></headers><triples/><instance xmlns=\"\"><sampleProtein proteinType=\"home\" xmlns:nutFree=\"http://uniprot.org/nutFree\" xmlns:withNuts=\"http://uniprot.org/withNuts\"><proteinId>123EAC</proteinId><nutFree:name><FirstNamePreferred>John</FirstName><LastName>Smith</LastName></nutFree:name><nutFree:name><FirstNamePreferred>Eric</FirstName><LastName>Johnson</LastName></nutFree:name><proteinCat><withNuts:Organism><OrganismName>Frog virus 3</OrganismName><OrganismType>scientific</OrganismType></withNuts:Organism></proteinCat></sampleProtein></instance><attachments/></envelope>";

const xmlSourceDataDefault = "<envelope><headers><sources xmlns=\"\"><name>loadPersonXML</name></sources><createdOn xmlns=\"\">2021-02-26T14:09:13.783548-08:00</createdOn><createdBy xmlns=\"\">hc-developer</createdBy></headers><triples/><instance><sampleProtein proteinType=\"home\" xmlns:nutFree=\"http://uniprot.org/nutFree\" xmlns:withNuts=\"http://uniprot.org/withNuts\"><proteinId>123EAC</proteinId><nutFree:name><FirstNamePreferred>John</FirstName><LastName>Smith</LastName></nutFree:name><proteinCat>commercial</proteinCat><nutFree:proteinDog>retriever</nutFree:proteinDog><nutFree:proteinDog> </nutFree:proteinDog><nutFree:proteinDog>golden</nutFree:proteinDog><nutFree:proteinDog>labrador</nutFree:proteinDog></sampleProtein></instance><attachments/></envelope>";

const xmlSourceData = [
  {
    rowKey: 1, key: "sampleProtein", children: [
      {rowKey: 2, key: "proteinId", val: "123EAC"},
      {rowKey: 3, key: "@proteinType", val: "home"},
      {
        rowKey: 4, key: "nutFree:name", children: [
          {rowKey: 5, key: "FirstNamePreferred", val: "John"},
          {rowKey: 6, key: "LastName", val: "Smith"}
        ]
      },
      {rowKey: 7, key: "proteinCat", val: "commercial"},
      {rowKey: 8, key: "nutFree:proteinDog", val: "retriever, , golden, labrador", array: true}
    ]
  }
];

const jsonSourceData = [
  {rowKey: 1, key: "proteinId", val: "123EAC", datatype: "string"},
  {rowKey: 2, key: "proteinType", val: "home", datatype: "string"},
  {
    rowKey: 3, key: "nutFreeName", children: [
      {rowKey: 4, key: "FirstNamePreferred", val: "John", datatype: "string"},
      {rowKey: 5, key: "LastName", val: "Smith", datatype: "string", children: [
        {rowKey: 6, key: "suffix", val: "Sr.", datatype: "string"}
      ]}
    ]
  },
  {rowKey: 7, key: "proteinCat", val: "commercial", datatype: "string"},
  {rowKey: 8, key: "proteinDog", val: "retriever, golden, labrador", array: true, datatype: "string"},
  {rowKey: 9, key: "emptyString", val: "", datatype: "string"},
  {rowKey: 10, key: "nullValue", val: "null", datatype: "null"},
  {rowKey: 11, key: "numberValue", val: "321", datatype: "number"},
  {rowKey: 12, key: "booleanValue", val: "true", datatype: "boolean"},
  {rowKey: 13, key: "whitespaceValue", val: " ", datatype: "string"},
  {rowKey: 14, key: "emptyArrayValue", val: "[ ]", datatype: "object"},
  {rowKey: 15, key: "numberArray", val: "1, 2, 3", array: true, datatype: "number"},
  {rowKey: 16, key: "booleanArray", val: "true, false, true", array: true, datatype: "boolean"},
];

const entityTypeProperties = [
  {key: 1, name: "propId", type: "int"},
  {key: 2, name: "propName", type: "string"},
  {key: 3, name: "propAttribute", type: "string"},
  {
    key: 4, name: "items", type: "parent-ItemType [ ]", children: [
      {key: 5, name: "items/itemTypes", type: "string"},
      {
        key: 6, name: "items/itemCategory", type: "parent-catItem", children: [
          {key: 7, name: "items/itemCategory/artCraft", type: "string"},
          {key: 8, name: "items/itemCategory/automobile", type: "string"}
        ]
      }]
  },
  {key: 9, name: "gender", type: "string"}
];

const JSONSourceDataToTruncate = {
  "envelope": {
    "headers": {},
    "triples": [],
    "instance": {
      "proteinId": "extremelylongusername@marklogic.com",
      "proteinType": "s@ml.com, , t@ml.com, u@ml.com, v@ml.com, w@ml.com, x@ml.com, y@ml.com, z@ml.com"
    },
    "attachments": null
  }
};

const truncatedEntityProps = [
  {key: 1, name: "propId", type: "int"},
  {key: 2, name: "propName", type: "string [ ]"},
  {key: 3, name: "propAttribute", type: "string [ ]"}
];

const mapFunctions = [
  {"functionName": "echo", "category": "custom", "signature": "echo(input)"},
  {"functionName": "memoryLookup", "category": "builtin", "signature": "memoryLookup(input,inputDictionary)"},
  {"functionName": "documentLookup", "category": "builtin", "signature": "documentLookup(input,inputDictionaryPath)"},
  {"functionName": "parseDate", "category": "builtin", "signature": "parseDate(value,pattern)"},
  {"functionName": "parseDateTime", "category": "builtin", "signature": "parseDateTime(value,pattern)"},
  {"functionName": "add-function", "category": "custom", "signature": "add-function(num1,num2)"},
  {"functionName": "unparsed-text", "category": "xpath", "signature": "unparsed-text(xs:string)"},
  {"functionName": "month-from-dateTime", "category": "xpath", "signature": "month-from-dateTime(xs:dateTime?)"},
  {"functionName": "seconds-from-dateTime", "category": "xpath", "signature": "seconds-from-dateTime(xs:dateTime?)"},
  {"functionName": "concat", "category": "xpath", "signature": "concat(xs:anyAtomicType?)"}
];

const mapReferences = [{
  name: "$URI",
  description: "The URI of the source document"
}, {
  name: "$ZIP_POINTS",
  description: "Maps zip codes to points"
}];

const mapProps = {
  sourceData: jsonSourceData,
  entityTypeProperties: entityTypeProperties,
  sourceURI: "/dummy/mapping/source/uri1.json",
  mapData: {
    name: "testMap",
    description: "Description of testMap",
    targetEntityType: "Person",
    selectedSource: "collection",
    sourceQuery: "cts.collectionQuery([''])",
    properties: {
      propId: {sourcedFrom: "id"},
      propName: {sourcedFrom: "testNameInExp"},
      propAttribute: {sourcedFrom: "placeholderAttribute"},
      items: {sourcedFrom: "",
        properties:
        {itemTypes: {sourcedFrom: ""}},
        targetEntityType: "#/definitions/ItemType"
      }
    }
  },
  tgtEntityReferences: {"items": "#/definitions/ItemType"},
  namespaces: {
    nutFree: "http://namespaces/nutfree",
    withNuts: "http://namespaces/withNuts"
  },
  mapName: "testMap",
  getMappingArtifactByMapName: jest.fn(),
  updateMappingArtifact: jest.fn(() => Promise.resolve({status: 200, data: {}})),
  mappingVisible: false,
  setMappingVisible: jest.fn(),
  fetchSrcDocFromUri: jest.fn(),
  docUris: ["/dummy/mapping/source/uri1.json", "/dummy/mapping/source/uri2.json", "/dummy/mapping/source/uri3.json"],
  disableURINavLeft: true,
  disableURINavRight: false,
  setDisableURINavLeft: jest.fn(),
  setDisableURINavRight: jest.fn(),
  sourceDatabaseName: "data-hub-STAGING",
  canReadWrite: true,
  canReadOnly: false,
  docNotFound: false,
  entityTypeTitle: "Person",
  extractCollectionFromSrcQuery: jest.fn(),
  mapFunctions: mapFunctions,
  openStepSettings: jest.fn()
};

const newMap = {
  tabKey: "1",
  isEditing: false,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  openStepDetails: jest.fn(),
  createMappingArtifact: jest.fn(),
  stepData: {},
  targetEntityType: "",
  sourceDatabase: "",
  canReadWrite: true,
  canReadOnly: false,
  currentTab: "1",
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  createStep: jest.fn(),
  onCancel: jest.fn(),
};

const editMap = {
  tabKey: "1",
  isEditing: true,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  openStepDetails: jest.fn(),
  createMappingArtifact: jest.fn(),
  stepData: {
    name: "testMap",
    description: "Description of testMap",
    targetEntityType: "Person",
    selectedSource: "collection",
    sourceQuery: "cts.collectionQuery(['map-collection'])",
    properties: {
      id: {sourcedFrom: "id"},
      name: {sourcedFrom: "name"}
    }
  },
  targetEntityType: "",
  sourceDatabase: "",
  canReadWrite: true,
  canReadOnly: false,
  currentTab: "1",
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  createStep: jest.fn(),
  onCancel: jest.fn(),
};

const dropDownWithSearch = {
  setDisplaySelectList: jest.fn(),
  setDisplayMenu: jest.fn(),
  displaySelectList: true,
  displayMenu: true,
  srcData: [{key: "id", value: "id"}, {key: "name", value: "name"}]
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
  tabKey: "1",
  openStepSettings: true,
  setOpenStepSettings: () => {},
  createLoadArtifact: () => {},
  stepData: customData[0],
  canReadWrite: false,
  canReadOnly: false,
  currentTab: "1",
  setIsValid: () => {},
  resetTabs: () => {},
  setHasChanged: () => {}
};


const loadDataPagination = {
  data: [
    {
      name: "testLoad1",
      description: "description for JSON load",
      sourceFormat: "json",
      targetFormat: "json",
      outputURIReplacement: "",
      inputFilePath: "/json-test/data-sets/testLoad",
      lastUpdated: "2000-01-01T12:00:00.000000-00:00"
    },
    {
      name: "testLoad2",
      description: "description for XML load",
      sourceFormat: "json",
      targetFormat: "xml",
      outputURIReplacement: "",
      inputFilePath: "/xml-test/data-sets/testLoad",
      lastUpdated: "2020-04-15T14:22:54.057519-07:00"
    },
    {
      name: "testLoad3",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad4",
      description: "description for JSON load",
      sourceFormat: "json",
      targetFormat: "json",
      outputURIReplacement: "",
      inputFilePath: "/json-test/data-sets/testLoad",
      lastUpdated: "2000-01-01T12:00:00.000000-00:00"
    },
    {
      name: "testLoad5",
      description: "description for XML load",
      sourceFormat: "json",
      targetFormat: "xml",
      outputURIReplacement: "",
      inputFilePath: "/xml-test/data-sets/testLoad",
      lastUpdated: "2020-04-15T14:22:54.057519-07:00"
    },
    {
      name: "testLoad6",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad7",
      description: "description for JSON load",
      sourceFormat: "json",
      targetFormat: "json",
      outputURIReplacement: "",
      inputFilePath: "/json-test/data-sets/testLoad",
      lastUpdated: "2000-01-01T12:00:00.000000-00:00"
    },
    {
      name: "testLoad8",
      description: "description for XML load",
      sourceFormat: "json",
      targetFormat: "xml",
      outputURIReplacement: "",
      inputFilePath: "/xml-test/data-sets/testLoad",
      lastUpdated: "2020-04-15T14:22:54.057519-07:00"
    },
    {
      name: "testLoad9",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad10",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad11",
      description: "description for CSV load",
      sourceFormat: "csv",
      targetFormat: "csv",
      outputURIReplacement: "",
      inputFilePath: "/csv-test/data-sets/testLoad",
      lastUpdated: "2016-08-27T03:10:30.073426-05:00"
    },
    {
      name: "testLoad12",
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



const data = {
  data: {
    canRead: false,
    canWrite: true
  },
  flows: flows,
  flowsAdd: flowsAdd,
  loadData: loadData,
  mapReferences: mapReferences,
  mapProps: mapProps,
  newMap: newMap,
  editMap: editMap,
  dropDownWithSearch: dropDownWithSearch,
  xmlSourceData: xmlSourceData,
  xmlSourceDataMultipleSiblings: xmlSourceDataMultipleSiblings,
  jsonSourceDataMultipleSiblings: jsonSourceDataMultipleSiblings,
  JSONSourceDataToTruncate: JSONSourceDataToTruncate,
  truncatedEntityProps: truncatedEntityProps,
  customData: customData,
  viewCustom: viewCustom,
  namespacedXmlInstance: namespacedXmlInstance,
  noNamespaceXmlInstance: noNamespaceXmlInstance,
  loadDataPagination: loadDataPagination,
  jsonSourceDataDefault: jsonSourceDataDefault,
  jsonSourceDataRelated: jsonSourceDataRelated,
  xmlSourceDataDefault: xmlSourceDataDefault
};

export default data;
