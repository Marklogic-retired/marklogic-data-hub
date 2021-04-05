declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");

hubTestX.resetHub();

const firstMappingStep = {
  "customHook": {
    "module": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/beforeHook.sjs",
    "runBefore": true
  },
  "interceptors": [
    {
      "path": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/addHeaders.sjs",
      "when": "beforeContentPersisted",
      "vars": {
        "headerValueToAdd": "world"
      }
    }
  ]
};

const secondMappingStep = {
  "customHook": {
    "module": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/afterHook.sjs",
    "runBefore": false
  }
};

hubTest.createSimpleMappingProject([firstMappingStep, secondMappingStep]);
