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
      "path": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/beforeMain.sjs",
      "when": "beforeMain"
    }
  ]
};

const secondMappingStep = {
  "interceptors": [
    {
      "path": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/addHeaders.sjs",
      "when": "beforeMain",
      "vars": {
        "headerNameToAdd": "beforeHeader",
        "headerValueToAdd": "hello"
      }
    },
    {
      "path": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/addHeaders.sjs",
      "when": "beforeContentPersisted",
      "vars": {
        "headerNameToAdd": "afterHeader",
        "headerValueToAdd": "world"
      }
    }
  ],
  "customHook": {
    "module": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/afterHook.sjs",
    "runBefore": false
  }
};

hubTest.createSimpleMappingProject([firstMappingStep, secondMappingStep]);
