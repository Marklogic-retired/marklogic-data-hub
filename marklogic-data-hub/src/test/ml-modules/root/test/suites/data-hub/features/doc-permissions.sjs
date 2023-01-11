const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const docPermissions = mjsProxy.requireMjsModule("/data-hub/features/doc-permissions.mjs");
const test = require("/test/test-helper.xqy");

const artifactType = "Step";
const artifactName = "myStep";

const result1 = docPermissions.onArtifactSave(artifactType, artifactName);

//assert
const assertions = [
  test.assertTrue(result1, "Dummy test"),
];


const result2 = docPermissions.onArtifactPublish(artifactType, artifactName);
//assert
assertions.push(test.assertTrue(result2, "Dummy test"),);

const stepContext = "";
const model = "";
const contentObject = "";

const result3 = docPermissions.onInstanceSave(stepContext, model, contentObject);
//assert
assertions.push(test.assertTrue(result3, "Dummy test"),);

assertions;
