const test = require("/test/test-helper.xqy");
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const Artifacts = mjsProxy.requireMjsModule("/data-hub/5/artifacts/core.mjs");

function invokeSetService(artifactType, artifactName, artifact) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/setArtifact.mjs",
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
  xdmp.invokeFunction(() => {
    const result = Artifacts.getArtifact("ingestion", "validArtifact");
    return [
      test.assertEqual("validArtifact", result.name),
      test.assertEqual("xml", result.sourceFormat),
      test.assertEqual("json", result.targetFormat),
      test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', result.lastUpdated))
    ];
  });
}

[]
  .concat(insertValidArtifact())
  .concat(getArtifact());
