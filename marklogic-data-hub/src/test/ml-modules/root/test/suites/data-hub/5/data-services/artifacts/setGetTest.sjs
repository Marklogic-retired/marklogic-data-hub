const test = require("/test/test-helper.xqy");

function invokeSetService(artifactType, artifactName, artifact) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/setArtifact.sjs",
    {artifactType, artifactName, artifact: xdmp.toJSON(artifact)}
  ));
}

function invokeGetService(artifactType, artifactName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/getArtifact.sjs",
    {artifactType, artifactName}
  ));
}

function insertValidArtifact() {
  const result = invokeSetService('ingestion','validArtifact', { name: 'validArtifact', sourceFormat: 'xml', targetFormat: 'json'});
  return [
    test.assertEqual("validArtifact", result.name),
    test.assertEqual("xml", result.sourceFormat),
    test.assertEqual("json", result.targetFormat)
  ];
}

function getArtifact() {
  const result = invokeGetService('ingestion','validArtifact');
  return [
    test.assertEqual("validArtifact", result.name),
    test.assertEqual("xml", result.sourceFormat),
    test.assertEqual("json", result.targetFormat),
    test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', result.lastUpdated))
  ];
}

function deleteArtifact() {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/deleteArtifact.sjs",
    {artifactType: 'ingestion', artifactName: 'validArtifact'}
  ));
}

[]
  .concat(insertValidArtifact())
  .concat(getArtifact())
  .concat(deleteArtifact());
