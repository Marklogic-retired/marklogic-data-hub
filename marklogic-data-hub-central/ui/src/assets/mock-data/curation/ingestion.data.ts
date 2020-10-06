const headerContentDefault = `[ "headers": [
  "validationEnabled": true,
  "validationParameters": [
    "min": 0,
    "max": 10]]]`;

const loads = {"data" :
    [{
      "name": "testLoad",
      "description": "Test JSON.",
      "sourceFormat": "json",
      "targetFormat": "json",
      "outputURIReplacement": "",
      "inputFilePath": "/json-test/data-sets/testLoad",
      "lastUpdated": "2000-01-01T12:00:00.000000-00:00",
    }],
  "status" :200
};

const flows = {
  "data": [{
    "name": "testFlow",
    "description": "",
      "steps": [
          {
              "stepName": "testLoad",
              "stepDefinitionType": "INGESTION",
              "stepNumber": "1",
              "sourceFormat": "json"
          }
      ]
  }]
  ,
  "status" :200
};

const loadsXML = {"data" :
    [{
      "name": "testLoadXML",
      "description": "Test XML.",
      "sourceFormat": "xml",
      "targetFormat": "xml",
      "outputURIReplacement": "",
      "inputFilePath": "/xml-test/data-sets/testLoadXML",
      "lastUpdated": "2020-04-02T23:08:28.287065-07:00",
    }],
  "status" :200
};

const loadSettings = {"data" :
    {
        "provenanceGranularityLevel": "coarse",
        "batchSize": 35,
        "permissions": "data-hub-operator,read,data-hub-operator,update",
        "targetFormat": "json",
        "targetDatabase": "data-hub-STAGING",
        "collections": [
          "testLoad"
        ],
        "additionalCollections": ['addedCollection'],
        "lastUpdated": "2020-05-27T12:19:02.446622-07:00",
        "headers": {
          "header": true
        },
        "processors": {
            "processor": true
        },
        "customHook": {
            "hook": true
        }
    },
    "status" :200
};

const genericSuccess = {
  data: {},
  status: 200
};

const loadCardProps = {
    addStepToFlow: jest.fn(),
    addStepToNew: jest.fn(),
    canReadOnly: true,
    canReadWrite: false,
    canWriteFlow: false,
    createLoadArtifact: jest.fn(),
    data: {},
    deleteLoadArtifact: jest.fn(),
    flows: {}
};
const data = {
    loadCardProps,
    genericSuccess: genericSuccess,
    headerContentDefault: headerContentDefault,
    flows: flows,
    loads: loads,
    loadsXML: loadsXML,
    loadSettings: loadSettings,
};

export default data;
