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

const mapProps = {
  sourceData: [
    { key: 'proteinId', val: '123EAC' },
    { key: '@proteinType', val: 'home' },
    { key: 'nutFree:name', val: 'testName1' }
  ],
  srcData: [
    { key: 'proteinId', val: '123EAC' },
    { key: '@proteinType', val: 'home' },
    { key: 'nutFree:name', val: 'testName1' }
  ],
  sourceURI: '/dummy/mapping/source/uri1.json',
  mapData: {
    name: 'testMap',
    description: 'Description of testMap',
    targetEntityType: 'Person',
    selectedSource: 'collection',
    sourceQuery: "cts.collectionQuery([''])",
    properties: {
      id: {  sourcedFrom: 'id' },
      name: { sourcedFrom: 'mappedName' }
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
  entityTypeProperties: [
    { name: 'id', type: 'int' },
    { name: 'name', type: 'string' }
  ]
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
