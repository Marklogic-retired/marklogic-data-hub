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

const loadData = {
  data: [
    {
      name: "load1",
      description: "description for load1",
      sourceFormat: "json",
      targetFormat: "json"
    },
    {
      name: "load2",
      description: "description for load2",
      sourceFormat: "json",
      targetFormat: "xml",
      lastUpdated: "2020-04-15T14:22:54.057519-07:00"
    }
  ],
  deleteLoadDataArtifact: jest.fn(),
  createLoadDataArtifact: jest.fn(),
  canReadWrite: true,
  canReadOnly: false,
   
};

const entityTypeProperties = [
  { name: 'propId', type: 'int' },
  { name: 'propName', type: 'string' },
  { name: 'items', type: 'parent-ItemType [ ]'},
  { name: 'items/type', type: 'string'},
  { name: 'items/category', type: 'parent-catItem'},
  { name: 'items/category/itemProdCat1', type: 'string'},
  { name: 'items/category/itemProdCat2', type: 'string'},
  { name: 'entityProp1', type: 'string' },
  { name: 'entityProp2', type: 'string' },
  { name: 'entityProp3', type: 'string' },
  { name: 'entityProp4', type: 'string' },
  { name: 'entityProp5', type: 'string' },
  { name: 'entityProp6', type: 'string' },
  { name: 'entityProp7', type: 'string' },
  { name: 'entityProp8', type: 'string' },
  { name: 'entityProp9', type: 'string' },
  { name: 'entityProp10', type: 'string' },
  { name: 'entityProp11', type: 'string' },
  { name: 'entityProp12', type: 'string' },
  { name: 'entityProp13', type: 'string' },
  { name: 'entityProp14', type: 'string' },
  { name: 'entityProp15', type: 'string' },
  { name: 'entityProp16', type: 'string' } 
];

const sourceData = [
  { key: 'proteinId', val: '123EAC' },
  { key: '@proteinType', val: 'home' },
  { key: 'nutFree:name', val: 'testName1' },
  { key: 'sourceProp1', val: '124EAC' },
  { key: 'sourceProp2', val: '125EAC' },
  { key: 'sourceProp3', val: '126EAC' },
  { key: 'sourceProp4', val: '127EAC' },
  { key: 'sourceProp5', val: '128EAC' },
  { key: 'sourceProp6', val: '129EAC' },
  { key: 'sourceProp7', val: '130EAC' },
  { key: 'sourceProp8', val: '131EAC' },
  { key: 'sourceProp9', val: '132EAC' },
  { key: 'sourceProp10', val: '133EAC' },
  { key: 'sourceProp11', val: '134EAC' },
  { key: 'sourceProp12', val: '135EAC' },
  { key: 'sourceProp13', val: '136EAC' },
  { key: 'sourceProp14', val: '137EAC' },
  { key: 'sourceProp15', val: '138EAC' },
  { key: 'sourceProp16', val: '139EAC' },
];

const mapProps = {
  sourceData: sourceData,
  sourceURI: '/dummy/mapping/source/uri1.json',
  mapData: {
    name: 'testMap',
    description: 'Description of testMap',
    targetEntityType: 'Person',
    selectedSource: 'collection',
    sourceQuery: "cts.collectionQuery([''])",
    properties: {
      propId: {  sourcedFrom: 'id' },
      propName: { sourcedFrom: 'mappedName' }
    }
  },
  namespaces: {
    nutFree: 'http://namespaces/nutfree',
    withNuts: 'http://namespaces/withNuts'
  },
  mapName: 'testMap',
  getMappingArtifactByMapName: jest.fn(),
  updateMappingArtifact: jest.fn(),
  mappingVisible:  false,
  setMappingVisible: true,
  fetchSrcDocFromUri: jest.fn(),
  docUris: [ '/dummy/mapping/source/uri1.json', '/dummy/mapping/source/uri2.json', '/dummy/mapping/source/uri3.json'],
  disableURINavLeft: true,
  disableURINavRight: false,
  setDisableURINavLeft: true,
  setDisableURINavRight: false,
  sourceDatabaseName:'data-hub-STAGING',
  canReadWrite: true,
  canReadOnly: false,
  docNotFound: false,
  entityTypeTitle: 'Person',
  extractCollectionFromSrcQuery: jest.fn(),
  entityTypeProperties: entityTypeProperties
};

const newMap = {
  title: 'New Mapping',
  newMap: true,
  setNewMap: jest.fn(),
  canReadWrite: true,
  isMapNameTouched: false,
  isDescriptionTouched: false,
  isSelectedSourceTouched: false,
  isCollectionsTouched: false,
  isSrcQueryTouched: false,
  deleteDialogVisible: false
};

const editMap = {
  title: 'Edit Mapping',
  newMap: true,
  mapData: {
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
  canReadWrite: true
};

const activitySettings = {
  activityType: 'mapping',
  canWrite: true,
  openActivitySettings: true,
  stepData: {
    name: 'testActivitySettings'
  },
  setOpenActivitySettings: jest.fn()
};

const dropDownWithSearch = {
  setDisplaySelectList: jest.fn(),
  setDisplayMenu: jest.fn(),
  displaySelectList: true,
  displayMenu: true,
  srcData: [ 'id', 'name', 'avg', 'memoryLookUp' ]
};

const data = {
  data: {
    canRead: false,
    canWrite: true
  },
  flows: flows,
  loadData: loadData,
  mapProps: mapProps,
  newMap: newMap,
  editMap: editMap,
  activitySettings: activitySettings,
  dropDownWithSearch: dropDownWithSearch
};

export default data;
