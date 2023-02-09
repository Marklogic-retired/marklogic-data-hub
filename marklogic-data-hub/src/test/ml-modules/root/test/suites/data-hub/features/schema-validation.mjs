import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");

const artifactType = "Step";
const artifactName = "myStep";

const result1 = schemaValidation.onArtifactSave(artifactType, artifactName);
// assert
const assertions = [
//    test.assertTrue(result1, "Dummy test")
];

const stepContext = "";
const model = "";
const contentObject = "";

const result2 = schemaValidation.onInstanceSave(stepContext, model, contentObject);
// assert
//assertions.push(test.assertTrue(result2, "Dummy test"));

assertions;
