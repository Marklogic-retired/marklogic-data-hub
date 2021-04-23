declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

hubTestX.resetHub();
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

hubTest.createSimpleProject("myFlow", [mappingStep, matchingStep, mergingStep]);
