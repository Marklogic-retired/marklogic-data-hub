const test = require("/test/test-helper.xqy");

function invokeService(artifactType, artifactName, artifact) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/validateArtifact.sjs",
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
      test.assertEqual(3, e.data.length, `Error doesn't have the expected validate information: "${JSON.stringify(e)}"`),
      test.assertTrue(fn.contains(msg, 'required'), `Message: "${msg}" doesn't have "required"`),
      test.assertTrue(fn.contains(msg, 'targetFormat'), `Message: "${msg}" doesn't have "targetFormat"`),
      test.assertTrue(fn.contains(msg, 'sourceFormat'), `Message: "${msg}" doesn't have "sourceFormat"`),
      test.assertFalse(fn.contains(msg, 'name'), `Message: "${msg}" has "name" when it shouldn't`)
    ];
  }
}

[]
  .concat(validArtifact())
  .concat(invalidArtifact());
