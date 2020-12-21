// Passed as prop
const advancedLoad = {
  tabKey: "2",
  tooltipsData: {},
  isEditing: true,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  stepData: {name: "AdvancedLoad"},
  updateLoadArtifact: jest.fn(),
  activityType: "ingestion",
  canWrite: true,
  currentTab: "2",
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  createStep: jest.fn(),
  onCancel: jest.fn(),
};

// Passed as prop
const advancedMapping = {
  tabKey: "2",
  tooltipsData: {},
  isEditing: true,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  stepData: {name: "AdvancedMapping"},
  updateLoadArtifact: jest.fn(),
  activityType: "mapping",
  canWrite: true,
  currentTab: "2",
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  createStep: jest.fn(),
  onCancel: jest.fn(),
};

// Passed as prop
const advancedMatching = {
  tabKey: "2",
  tooltipsData: {},
  isEditing: true,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  openAdvancedSettings: true,
  setOpenAdvancedSettings: jest.fn(),
  stepData: {name: "AdvancedMatching"},
  updateLoadArtifact: jest.fn(),
  activityType: "matching",
  canWrite: true,
  currentTab: "2",
  setIsValid: true,
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  createStep: jest.fn(),
  onCancel: jest.fn(),
};

const advancedMerging = {
  tabKey: "2",
  tooltipsData: {},
  isEditing: true,
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  openAdvancedSettings: true,
  setOpenAdvancedSettings: jest.fn(),
  stepData: {name: "AdvancedMerging"},
  updateLoadArtifact: jest.fn(),
  activityType: "merging",
  canWrite: true,
  currentTab: "2",
  setIsValid: true,
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  createStep: jest.fn(),
  onCancel: jest.fn(),
};

// Returned from endpoint: /api/steps/ingestion/AdvancedLoad
const stepLoad = {"data":
    {
      "collections": ["testCollection"],
      "additionalCollections": ["addedCollection"],
      "batchSize": 35,
      "permissions": "data-hub-common,read,data-hub-common,update",
      "name": "AdvancedLoad",
      "description": "",
      "sourceFormat": "json",
      "targetFormat": "json",
      "outputURIPrefix": "",
      "stepDefinitionName": "default-ingestion",
      "stepDefinitionType": "ingestion",
      "stepId": "AdvancedLoad-ingestion",
      "sourceDatabase": null,
      "targetDatabase": "data-hub-STAGING",
      "outputFormat": "json",
      "provenanceGranularityLevel": "coarse",
      "lastUpdated": "2020-01-01T00:00:00.000001-07:00",
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
"status": 200
};

// Returned from endpoint: /api/steps/mapping/AdvancedMapping
const stepMapping = {"data":
    {
      "collections": ["testCollection"],
      "additionalCollections": ["addedCollection"],
      "batchSize": 35,
      "permissions": "data-hub-common,read,data-hub-common,update",
      "name": "AdvancedMapping",
      "targetEntityType": "http://example.org/Address-0.0.1/Test",
      "description": "",
      "selectedSource": "collection",
      "sourceQuery": "cts.collectionQuery(['test'])",
      "stepDefinitionName": "entity-services-mapping",
      "stepDefinitionType": "mapping",
      "stepId": "AdvancedMapping-mapping",
      "sourceDatabase": "data-hub-STAGING",
      "targetDatabase": "data-hub-FINAL",
      "validateEntity": "doNotValidate",
      "provenanceGranularityLevel": "coarse",
      "lastUpdated": "2020-01-01T00:00:00.000001-07:00",
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
"status": 200
};

// Returned from endpoint: /api/steps/matching/AdvancedMatching
const stepMatching = {"data":
        {
          "collections": ["testCollection"],
          "additionalCollections": ["addedCollection"],
          "batchSize": 35,
          "permissions": "data-hub-common,read,data-hub-common,update",
          "name": "AdvancedMatching",
          "targetEntityType": "http://example.org/Address-0.0.1/Test",
          "description": "",
          "selectedSource": "collection",
          "sourceQuery": "cts.collectionQuery(['test'])",
          "stepDefinitionName": "default-matching",
          "stepDefinitionType": "matching",
          "stepId": "AdvancedMatching-matching",
          "sourceDatabase": "data-hub-FINAL",
          "targetDatabase": "data-hub-FINAL",
          "provenanceGranularityLevel": "coarse",
          "lastUpdated": "2020-01-01T00:00:00.000001-07:00",
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
"status": 200
};

// Returned from endpoint: /api/steps/merging/AdvancedMerging
const stepMerging = {"data":
        {
          "batchSize": 35,
          "permissions": "data-hub-common,read,data-hub-common,update",
          "name": "AdvancedMerging",
          "targetEntityType": "http://example.org/Address-0.0.1/Test",
          "targetCollections": {
            "onMerge": {"add": ["merged"]},
            "onNoMatch": {"add": ["noMatch"]},
            "onArchive": {"add": ["archived"]},
            "onNotification": {"add": ["notification"]}
          },
          "description": "",
          "selectedSource": "collection",
          "sourceQuery": "cts.collectionQuery(['test'])",
          "stepDefinitionName": "default-merging",
          "stepDefinitionType": "merging",
          "stepId": "AdvancedMerging-merging",
          "sourceDatabase": "data-hub-FINAL",
          "targetDatabase": "data-hub-FINAL",
          "provenanceGranularityLevel": "coarse",
          "lastUpdated": "2020-01-01T00:00:00.000001-07:00",
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
"status": 200
};

// Returned from endpoint: /api/steps/merging/defaultCollections/${encodeURI(targetEntityType)}
const defaultTargetCollections = {"data":
    {
      "onMerge": ["sm-Test-merged", "sm-Test-mastered"],
      "onNoMatch": ["sm-Test-mastered"],
      "onArchive": ["sm-Test-archived"],
      "onNotification": ["sm-Test-notification"]
    },
"status": 200
};

const data = {
  advancedLoad: advancedLoad,
  customLoad: {...advancedLoad, stepData: {name: "CustomLoad"}},
  advancedMapping: advancedMapping,
  advancedMatching: advancedMatching,
  advancedMerging: advancedMerging,
  stepLoad: stepLoad,
  stepMapping: stepMapping,
  stepMatching: stepMatching,
  stepMerging: stepMerging,
  defaultTargetCollections: defaultTargetCollections,
};

export default data;
