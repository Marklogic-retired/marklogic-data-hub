const test = require("/test/test-helper.xqy");
const ArtifactService = require('../lib/artifactService.sjs');

const stepDef =  {
  name: "default-myStepDef", 
  type: "custom"
};

const firstResponse = ArtifactService.invokeSetService('stepDefinition', stepDef.name, stepDef);
const secondResponse = ArtifactService.invokeSetService('stepDefinition', stepDef.name, stepDef);

const assertions = [
  test.assertEqual("default-myStepDef", firstResponse.name, 
    "Verifying that a user can create a custom step def whose name starts with 'default-', which was a problem in 5.4.0"),
  test.assertEqual("default-myStepDef", secondResponse.name, 
    "Verifying that the step def was updated successfully")
];

assertions 
