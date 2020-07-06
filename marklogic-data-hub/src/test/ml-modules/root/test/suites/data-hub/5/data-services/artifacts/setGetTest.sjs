const test = require("/test/test-helper.xqy");
const Artifacts = require('/data-hub/5/artifacts/core.sjs');

function invokeSetService(artifactType, artifactName, artifact) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/setArtifact.sjs",
    {artifactType, artifactName, artifact: xdmp.toJSON(artifact)}
  ));
}

function insertValidArtifact() {
  const result = invokeSetService('ingestion','validArtifact', { name: 'validArtifact', sourceFormat: 'xml', targetFormat: 'json'});
  return [
    test.assertEqual("validArtifact", result.name),
    test.assertEqual("xml", result.sourceFormat),
    test.assertEqual("json", result.targetFormat),
    test.assertEqual(100, result.batchSize)
  ];
}

function getArtifact() {
  const result = Artifacts.getArtifact("ingestion", "validArtifact");
  return [
    test.assertEqual("validArtifact", result.name),
    test.assertEqual("xml", result.sourceFormat),
    test.assertEqual("json", result.targetFormat),
    test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', result.lastUpdated))
  ];
}

[]
  .concat(insertValidArtifact())
  .concat(getArtifact());
