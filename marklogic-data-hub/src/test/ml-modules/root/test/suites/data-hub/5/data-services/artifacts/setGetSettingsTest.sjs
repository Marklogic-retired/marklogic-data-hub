const test = require("/test/test-helper.xqy");

function invokeSetService(artifactType, artifactName, artifact) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/setArtifact.mjs",
    {artifactType, artifactName, artifact: xdmp.toJSON(artifact)}
  ));
}

function invokeGetService(artifactType, artifactName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/getArtifact.mjs",
    {artifactType, artifactName}
  ));
}

function invokeSetSettingsService(artifactType, artifactName, settings) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/setArtifactSettings.mjs",
    {artifactType, artifactName, settings: xdmp.toJSON(settings)}
  ));
}

function invokeGetSettngsService(artifactType, artifactName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/getArtifactSettings.mjs",
    {artifactType, artifactName}
  ));
}

function insertValidArtifact() {
  const result = invokeSetService('loadData','validArtifact', { 'name': 'validArtifact', 'sourceFormat': 'xml', 'targetFormat': 'json'});
  return [
    test.assertEqual("validArtifact", result.name),
    test.assertEqual("xml", result.sourceFormat),
    test.assertEqual("json", result.targetFormat)
  ];
}

function getArtifact() {
  const result = invokeGetService('loadData','validArtifact');
  return [
    test.assertEqual("validArtifact", result.name),
    test.assertEqual("xml", result.sourceFormat),
    test.assertEqual("json", result.targetFormat),
    test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', result.lastUpdated))
  ];
}

function insertArtifactSettings() {
  const result = invokeSetSettingsService('loadData','validArtifact', {
    'artifactName' : 'validArtifact',
    'additionalCollections' : [ 'Collection1', 'Collection2' ],
    'targetDatabase' : 'data-hub-STAGING',
    'permissions' : 'rest-reader,read,rest-writer,update',
    'customHook' : {
      'module' : '',
      'parameters' : { },
      'user' : '',
      'runBefore' : false
    }
  });
  return [
    test.assertEqual("validArtifact", result.artifactName),
    test.assertEqual("data-hub-STAGING", result.targetDatabase)
  ];
}

function getArtifactSettings() {
  const result = invokeGetSettngsService('loadData','validArtifact');
  return [
    test.assertEqual("validArtifact", result.artifactName),
    test.assertEqual("data-hub-STAGING", result.targetDatabase),
    test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', result.lastUpdated))
  ];
}

function deleteArtifact() {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/deleteArtifact.mjs",
    {artifactType: 'loadData', artifactName: 'validArtifact'}
  ));
}

[]
  .concat(insertValidArtifact())
  .concat(getArtifact())
  .concat(insertArtifactSettings())
  .concat(getArtifactSettings())
  .concat(deleteArtifact());

