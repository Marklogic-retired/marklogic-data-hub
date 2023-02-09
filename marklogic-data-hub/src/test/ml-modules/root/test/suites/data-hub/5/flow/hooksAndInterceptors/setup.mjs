import hubTest from "/test/data-hub-test-helper.mjs";
const hubTestX = require("/test/data-hub-test-helper.xqy");

xdmp.invokeFunction(() => {
  hubTestX.resetHub();

  const firstMappingStep = {
    "customHook": {
      "module": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/beforeHook.mjs",
      "runBefore": true
    },
    "interceptors": [
      {
        "path": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/beforeMain.mjs",
        "when": "beforeMain"
      }
    ]
  };

  const secondMappingStep = {
    "interceptors": [
      {
        "path": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/addHeaders.mjs",
        "when": "beforeMain",
        "vars": {
          "headerNameToAdd": "beforeHeader",
          "headerValueToAdd": "hello"
        }
      },
      {
        "path": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/addHeaders.mjs",
        "when": "beforeContentPersisted",
        "vars": {
          "headerNameToAdd": "afterHeader",
          "headerValueToAdd": "world"
        }
      }
    ],
    "customHook": {
      "module": "/test/suites/data-hub/5/flow/hooksAndInterceptors/test-data/afterHook.mjs",
      "runBefore": false
    }
  };

  hubTest.createSimpleMappingProject([firstMappingStep, secondMappingStep]);
}, { update: "true" });