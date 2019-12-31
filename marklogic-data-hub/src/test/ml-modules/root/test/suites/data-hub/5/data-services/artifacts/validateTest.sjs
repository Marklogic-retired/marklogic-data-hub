const test = require("/test/test-helper.xqy");

function invokeService(artifactType, artifactName, artifact) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/validateArtifact.mjs",
    {artifactType, artifactName, artifact: xdmp.toJSON(artifact)}
  ));
}

function validArtifact() {
  const result = invokeService('loadData','validArtifact', { name: 'validArtifact', sourceFormat: 'xml', targetFormat: 'json'});
  return [
    test.assertEqual("validArtifact", result.name),
    test.assertEqual("xml", result.sourceFormat),
    test.assertEqual("json", result.targetFormat)
  ];
}

function invalidArtifact() {
  try {
    const result = invokeService('loadData', "invalidArtifact", { name: 'invalidArtifact'});
    return [test.assertTrue(false, 'Should have thrown a validation error')];
  } catch (e) {
    let msg = e.data[2];
    return [
      test.assertTrue(fn.contains(msg, 'required')),
      test.assertTrue(fn.contains(msg, 'targetFormat')),
      test.assertTrue(fn.contains(msg, 'sourceFormat')),
      test.assertFalse(fn.contains(msg, 'name'))
    ];
  }
}

[]
  .concat(validArtifact())
  .concat(invalidArtifact());
