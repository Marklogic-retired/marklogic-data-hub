const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const schemaValidations = mjsProxy.requireMjsModule("/data-hub/features/schema-validations.mjs");

const artifactType = "Step";
const artifactName = "myStep";

const result1 = schemaValidations.onArtifactSave(artifactType, artifactName);
// assert
const assertions = [
    test.assertTrue(result1, "Dummy test")
];

const stepContext = "";
const model = "";
const contentObject = "";

const result2 = schemaValidations.onInstanceSave(stepContext, model, contentObject);
// assert
assertions.push(test.assertTrue(result2, "Dummy test"));

assertions;
