const stepService = require("../lib/stepService.sjs");
const customService = require("../lib/customStepService.sjs");
const hubJsTest = require("/test/data-hub-test-helper.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

let assertions = [];

const stepName = "myCustom";
const stepDefinitionType = "custom";

// Create a step
let info = {
  name: stepName,
  targetFormat: "xml",
  stepDefinitionType: "custom",
  stepDefinitionName: "custom-step",
  dummy: "value1",
  targetEntityType : "http://example.org/Person-0.0.1/Person",
  collections: ["default-custom"],
  batchSize: 52
};


stepService.saveStep(stepDefinitionType, info);
//This will fail due to an incorrect stepDefinitionType
try{
  stepService.saveStep("anotherCustom", Object.assign({}, info, {name:"anotherCustom"}))
}
catch(ex) {
  assertions.concat(test)
}
stepService.saveStep(stepDefinitionType, Object.assign({}, info, {name:"anotherCustom", username:"joe", targetEntityType :""}))

const expectedUri = "/steps/custom/myCustom.step.json";
assertions = assertions
  .concat(hubTest.assertInCollections(expectedUri, ['http://marklogic.com/data-hub/steps/custom', 'http://marklogic.com/data-hub/steps']))
  .concat(hubTest.assertHasPermissions(expectedUri, "data-hub-custom-reader,read,data-hub-custom-writer,update"));

let expectedStep = Object.assign({}, info);
expectedStep.selectedSource = "query";
expectedStep.permissions = "data-hub-common,read,data-hub-common,update";
expectedStep.sourceDatabase = "data-hub-STAGING";
expectedStep.targetDatabase = "data-hub-FINAL";
expectedStep.batchSize = 52;
expectedStep.provenanceGranularityLevel = "coarse"
expectedStep.stepId = stepName + "-" + "custom";


let customStep = customService.getCustomStep(stepName);
hubJsTest.verifyJson({dummy: "value1"}, customStep.additionalSettings, assertions);

// remove 'lastUpdated' from artifact when testing for equality
delete customStep.lastUpdated;
// 'additionalSettings' is a json object, tested it separately, hence can be removed .
delete customStep.additionalSettings;
// DHFPROD-7059: custom settings are not longer returned in duplicate as root element
delete expectedStep.dummy;
hubJsTest.verifyJson(expectedStep, customStep, assertions);

expectedStep = Object.assign(info, { name:"anotherCustom", targetEntityType :""});
expectedStep.stepId = "anotherCustom" + "-" + "custom";

let anotherStep = customService.getCustomStep("anotherCustom");
hubJsTest.verifyJson({dummy: "value1", username:"joe"}, anotherStep.additionalSettings, assertions);
delete anotherStep.lastUpdated;
delete anotherStep.additionalSettings;
delete expectedStep.dummy;
hubJsTest.verifyJson(expectedStep, anotherStep, assertions);

let customStepsWithoutEntity = customService.getCustomSteps().stepsWithoutEntity;

assertions.concat(test.assertTrue(customStepsWithoutEntity.length == 1, "The number of custom steps without associated entity type"));
delete customStepsWithoutEntity[0].lastUpdated;
hubJsTest.verifyJson(expectedStep, customStepsWithoutEntity[0], assertions);
assertions;
