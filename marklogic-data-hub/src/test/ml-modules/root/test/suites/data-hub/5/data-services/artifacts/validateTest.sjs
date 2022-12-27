const test = require("/test/test-helper.xqy");
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const Artifacts = mjsProxy.requireMjsModule("/data-hub/5/artifacts/core.mjs");

function invokeService(artifactType, artifactName, artifact) {
  return Artifacts.validateArtifact(artifactType, artifactName, artifact);
}

function validArtifact() {
  const result = invokeService('ingestion','validArtifact', { name: 'validArtifact', sourceFormat: 'xml', targetFormat: 'json'});
  return [
    test.assertEqual("validArtifact", result.name),
    test.assertEqual("xml", result.sourceFormat),
    test.assertEqual("json", result.targetFormat)
  ];
}

function invalidArtifact() {
  try {
    invokeService('ingestion', "invalidArtifact", { name: 'invalidArtifact'});
    throw Error ("Should have thrown a validation error");
  } catch (e) {
    let msg = e.data[1];
    return test.assertEqual("Ingestion step 'invalidArtifact' is missing the following required properties: [\"sourceFormat\",\"targetFormat\"]", msg);
  }
}

[]
  .concat(validArtifact())
  .concat(invalidArtifact());
