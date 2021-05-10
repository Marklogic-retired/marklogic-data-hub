declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

hubTestX.resetHub();
hubTestX.loadArtifacts(test.__CALLER_FILE__);

const customStepOne = {
  "stepDefinitionName": "errorThrowingStep",
  "stepDefinitionType": "custom",
  "testStepModulePath": "/custom-modules/errorThrowingStepModule.sjs",
  "collections": ["customStepOne"],
  "sourceDatabase": "data-hub-FINAL",
  "targetDatabase": "data-hub-FINAL",
  "sourceQuery": "cts.collectionQuery('doesnt-matter')",
  "customHook" : {
    "module" : "/custom-modules/errorThrowingCustomHook.sjs",
    "runBefore" : false
  }
};

const customStepTwo = {
  "stepDefinitionName": "errorThrowingStep",
  "stepDefinitionType": "custom",
  "testStepModulePath": "/custom-modules/errorThrowingStepModule.sjs",
  "collections": ["customStepTwo"],
  "sourceDatabase": "data-hub-FINAL",
  "targetDatabase": "data-hub-FINAL",
  "sourceQuery": "cts.collectionQuery('doesnt-matter')",
  "interceptors": [
    {
      "path": "/custom-modules/errorThrowingInterceptor.sjs",
      "when": "beforeContentPersisted"
    }
  ]
};

hubTest.createSimpleProject("myFlow", [customStepOne, customStepTwo]);
