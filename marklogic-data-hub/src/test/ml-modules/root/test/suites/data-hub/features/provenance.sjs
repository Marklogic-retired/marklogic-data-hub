const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const provenance = mjsProxy.requireMjsModule("/data-hub/features/provenance.mjs");

const artifactType = "Step";
const artifactName = "myStep";

const result1 = provenance.onArtifactSave(artifactType, artifactName);
// assert
const assertions = [
//  test.assertTrue(result1, "Dummy test")
];

const stepContext = "";
const model = "";
const contentObject = "";

const result2 = provenance.onInstancePassToStep(stepContext, model, contentObject);
// assert
//assertions.push(test.assertTrue(result2, "Dummy test"));

provenance.onInstanceSave(stepContext, model, contentObject);
// assert
//assertions.push(test.assertTrue(result3, "Dummy test"));

assertions;
