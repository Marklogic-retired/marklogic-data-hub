// Passed as prop
const advancedLoad = {
    activityType: 'ingestion',
    canWrite: true,
    openAdvancedSettings: true,
    stepData: {
      name: 'AdvancedLoad'
    },
    setOpenAdvancedSettings: jest.fn()
};

// Passed as prop
const advancedMapping = {
    activityType: 'mapping',
    canWrite: true,
    openAdvancedSettings: true,
    stepData: {
      name: 'AdvancedMapping'
    },
    setOpenAdvancedSettings: jest.fn()
};

// Passed as prop
const advancedMatching = {
    activityType: 'matching',
    canWrite: true,
    openAdvancedSettings: true,
    stepData: {
        name: 'AdvancedMatching'
    },
    setOpenAdvancedSettings: jest.fn()
};

// Returned from endpoint: /api/steps/ingestion/AdvancedLoad
const stepLoad = { "data" :
    {
        "collections": [ "testCollection" ],
        "additionalCollections": [ "addedCollection" ],
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
const stepMapping = { "data" :
    {
        "collections": [ "testCollection" ],
        "additionalCollections": [ "addedCollection" ],
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
const stepMatching = { "data" :
        {
            "collections": [ "testCollection" ],
            "additionalCollections": [ "addedCollection" ],
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
const data = {
    advancedLoad: advancedLoad,
    customLoad: {...advancedLoad, stepData: {name: 'CustomLoad'}},
    advancedMapping: advancedMapping,
    advancedMatching: advancedMatching,
    stepLoad: stepLoad,
    stepMapping: stepMapping,
    stepMatching: stepMatching,
};

export default data;
