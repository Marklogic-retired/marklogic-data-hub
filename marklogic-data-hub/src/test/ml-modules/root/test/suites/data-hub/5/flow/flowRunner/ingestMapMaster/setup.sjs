declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

hubTestX.resetHub();
// Clearing the schema databases so that the merge step does not pickup any TDE triples that might be left behind from any previous tests
hubTestX.clearSchemasDatabases();
hubTestX.loadArtifacts(test.__CALLER_FILE__);

const mappingStep = hubTest.makeSimpleMappingStep("mappingStep", {
  "headers": {
    "headerFromMappingStep": true
  }
});

const matchingStep = {
  "stepDefinitionName": "default-matching",
  "stepDefinitionType": "MATCHING",
  "sourceQuery": "cts.collectionQuery('mapCustomersJSON')",
  "selectedSource": "query",
  "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
  "sourceDatabase": "data-hub-FINAL",
  "collections": ["matched-customers"],
  "targetDatabase": "data-hub-FINAL",
  "targetFormat": "json",
  "matchRulesets": [{
    "name": "customerId - Exact",
    "weight": 10,
    "matchRules": [{
      "entityPropertyPath": "customerId",
      "matchType": "exact",
      "options": {}
    }]
  }],
  "thresholds": [{
    "thresholdName": "Definitive Match",
    "action": "merge",
    "score": 5
  }]
};

const mergingStep = {
  "stepDefinitionName": "default-merging",
  "stepDefinitionType": "MERGING",
  "selectedSource": "query",
  "sourceQuery": "cts.collectionQuery('matched-customers')",
  "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
  "sourceDatabase": "data-hub-FINAL",
  "collections": ["merged-customer"],
  "targetFormat": "json",
  "mergeStrategies": [],
  "mergeRules": [{
    "entityPropertyPath": "customerId",
    "priorityOrder": {
      "sources": []
    }
  }],
  "targetCollections": {
    "onNoMatch": {
      "add": [],
      "remove": []
    }
  }
};

const customStepThatThrowsError = {
  "stepDefinitionName": "errorThrowingStep",
  "stepDefinitionType": "custom",
  "testStepModulePath": "/custom-modules/errorThrowingStepModule.sjs",
  "collections": ["customStepCollection"],
  "sourceDatabase": "data-hub-FINAL",
  "targetDatabase": "data-hub-FINAL",
  "sourceQuery": "cts.collectionQuery('doesnt-matter')",
  "throwErrorOnPurpose": true
};

hubTest.createSimpleProject("myFlow", [mappingStep, matchingStep, mergingStep, customStepThatThrowsError]);
