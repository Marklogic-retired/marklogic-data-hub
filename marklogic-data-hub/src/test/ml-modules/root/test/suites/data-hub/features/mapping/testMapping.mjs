import mappingFeature from "/data-hub/features/mapping.mjs";

const test = require("/test/test-helper.xqy");
const uri = "/steps/mapping/MappingFeatureStep.step.json";
const artifact = cts.doc(uri).toObject();
const result1 = mappingFeature.onArtifactSave("mapping", "MappingFeatureStep", uri, artifact);
const assertions = [
  test.assertTrue(result1, "executing mapping feature")
];

const resultClean = mappingFeature.onArtifactDelete("mapping", "MappingFeatureStep", uri, artifact);
assertions.push(test.assertTrue(resultClean, "clean up mapping xml and compiled xslts"));


assertions;
