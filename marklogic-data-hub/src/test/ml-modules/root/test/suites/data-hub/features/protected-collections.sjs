const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const protectedCollections = mjsProxy.requireMjsModule("/data-hub/features/protected-collections.mjs");

const artifactType = "Step";
const artifactName = "myStep";

const results1 = protectedCollections.onArtifactPublish (artifactType, artifactName);
// assert
const assertions = [
  test.assertTrue(result1, "Dummy test")
];

const stepContext = "";
const model = "";
const contentObject = "";

const results2 = protectedCollections.onInstanceSave(stepContext, model, contentObject);
// assert
assertions.push(test.assertTrue(result2, "Dummy test"));

assertions;
