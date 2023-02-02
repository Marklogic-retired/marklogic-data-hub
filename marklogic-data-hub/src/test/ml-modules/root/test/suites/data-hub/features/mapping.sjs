const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const mapping = mjsProxy.requireMjsModule("/data-hub/features/mapping.mjs");

const artifactType = "Step";
const artifactName = "myStep";

const result1 = mapping.onArtifactSave(artifactType, artifactName);
//assert
const assertions = [
//  test.assertTrue(result1, "Dummy test"),
];


const result2 = mapping.onArtifactDelete(artifactType, artifactName)
//assert
//assertions.push(test.assertTrue(result2, "Dummy test"));


assertions;
