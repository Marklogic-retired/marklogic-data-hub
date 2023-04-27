import hubTest from "/test/data-hub-test-helper.mjs";
const hubTestX = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

xdmp.invokeFunction(() => {
  hubTestX.resetHub();
  hubTestX.loadNonEntities(test.__CALLER_FILE__);
}, { update: "true" });

xdmp.invokeFunction(() => {
  hubTest.createSimpleMappingProject([
    {
      "name": "testMapping",
      "sourceDatabase": "data-hub-FINAL",
      "sourceQuery": "cts.collectionQuery('raw-content')",
      "interceptors": [
        {
          "path": "/test/suites/data-hub/data-services/mapping/general/test-data/beforeMain.mjs",
          "when": "beforeMain"
        }
      ]
    },
    {
      "name": "testIncompleteMapping",
      "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
      "selectedSource": "query",
      "stepDefinitionType": "mapping"
    }
  ]);
}, { update: "true" });
