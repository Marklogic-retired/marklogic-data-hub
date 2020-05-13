const test = require("/test/test-helper.xqy");
const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();

const flowNode  =
  {
    "name": "testFlow",
    "steps": {
      "1": {
        "name": "loadDataTest",
        "options": {
          "loadData": {
            "name": "loadDataTest"
          }
        },
        "stepDefinitionName": "default-ingestion",
        "stepDefinitionType": "INGESTION"
      },
      "2": {
        "name": "mappingTest",
        "options": {
          "mapping": {
            "name": "mappingTest"
          }
        },
        "stepDefinitionName": "entity-services-mapping",
        "stepDefinitionType": "MAPPING"
      },
      "3": {
        "name": "mapjson",
        "description": "",
        "options": {
          "additionalCollections": [],
          "sourceQuery": "cts.collectionQuery([\"ingestjson\"])",
          "mapping": {
            "name": "jsonFlow-mapjson",
            "version": 31
          },
          "targetEntity": "Person",
          "sourceDatabase": "data-hub-STAGING",
          "collections": ["mapjson", "Person"],
          "validateEntity": false,
          "sourceCollection": "ingestjson",
          "outputFormat": "json",
          "targetDatabase": "data-hub-FINAL",
          "fullOutput": true
        },
        "retryLimit": 0,
        "batchSize": 100,
        "threadCount": 4,
        "stepDefinitionName": "entity-services-mapping",
        "stepDefinitionType": "MAPPING"
      }
    }
  };

function invokeSetService(artifactType, artifactName, artifact) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/setArtifact.sjs",
    {artifactType, artifactName, artifact: xdmp.toJSON(artifact)}
  ));
}
function invokeSetSettingsService(artifactType, artifactName, settings) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/setArtifactSettings.sjs",
    {artifactType, artifactName, settings: xdmp.toJSON(settings)}
  ));
}

function invokeGetFullFlowService(flowName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/flow/getFullFlow.sjs",
    {flowName}
  ));
}

function updateArtifactSettings(artifactName) {
  invokeSetSettingsService('loadData', 'loadData' + artifactName, {"artifactName":'loadData' + `${artifactName}`,'targetDatabase' : 'data-hub-FINAL',
    "customHook":{"module":"/abc.sjs","parameters":"{}","user":"","runBefore":false}, 'additionalCollections' : [ 'TestColl']});
  const map = invokeSetSettingsService('mapping', 'mapping' + artifactName, {'artifactName': 'mapping' + `${artifactName}`, 'collections' : ['default-mapping'],
    'additionalCollections' : [ 'Collection1', 'Collection2' ], 'targetDatabase' : 'data-hub-STAGING', 'targetFormat':'xml' ,'permissions' : 'rest-reader,read,rest-writer,update'});

}

function updateArtifact(artifactName) {
  invokeSetService('loadData', 'loadData' + artifactName, {"name":'loadData' + `${artifactName}`,"description":"","sourceFormat":"json","targetFormat":"xml","outputURIReplacement":"","inputFilePath":"/xml-test/data-sets/rty"});
  invokeSetService('mapping', 'mapping' + artifactName, {'name': 'mapping' + `${artifactName}`, 'targetEntityType': 'TestEntity-hasMappingConfig', 'description': 'Mapping does ...', 'selectedSource': 'query', 'sourceQuery': 'cts.collectionQuery(\"default-ingestion\")', 'collections': ['RAW-COL']});
}

function testGetFullFlow1(resp, artifactName){

  //Test Default settings
  test.assertEqualJson(flowNode["steps"]["3"], resp["steps"]["3"], "Old mapping step should not be modified"),

  test.assertEqual(dataHub.config.STAGINGDATABASE, resp["steps"]["1"]["options"]["targetDatabase"], "Fetch default settings for loadData"),
  test.assertEqual(['loadData' + artifactName], resp["steps"]["1"]["options"]["collections"], "Fetch default settings for loadData"),
  test.assertEqual('xml', resp["steps"]["1"]["options"]["outputFormat"], "Fetch outputFormat from artifact for loadData"),

  test.assertEqual(dataHub.config.STAGINGDATABASE, resp["steps"]["2"]["options"]["sourceDatabase"], "Fetch default settings for mapping"),
  test.assertEqual(['mapping' + artifactName, 'TestEntity-hasMappingConfig'], resp["steps"]["2"]["options"]["collections"], "Fetch default settings for mapping")

}

function testGetFullFlow2(resp){
  test.assertEqualJson(flowNode["steps"]["3"], resp["steps"]["3"], "Old mapping step should not be modified"),

  test.assertEqual(dataHub.config.FINALDATABASE, resp["steps"]["1"]["options"]["targetDatabase"]),
  test.assertEqual([ 'loadDataTest', 'TestColl'], resp["steps"]["1"]["options"]["collections"]),
  test.assertEqual("/abc.sjs", resp["steps"]["1"]["customHook"]["module"]),


  test.assertEqual(dataHub.config.STAGINGDATABASE, resp["steps"]["2"]["options"]["targetDatabase"], "New mapping step should be modified"),
  test.assertEqual(['default-mapping','Collection1', 'Collection2'], resp["steps"]["2"]["options"]["collections"], "collections should be modified"),
  test.assertEqual('xml', resp["steps"]["2"]["options"]["outputFormat"], "Fetch outputFormat from settings for mapping"),
  test.assertEqual('rest-reader,read,rest-writer,update', resp["steps"]["2"]["options"]["permissions"], "Fetch permissions from settings for mapping"),
  test.assertEqual("cts.collectionQuery(\"default-ingestion\")", resp["steps"]["2"]["options"]["sourceQuery"], "New mapping step should be modified")
}



updateArtifact("Test");

let output = [];
//test default settings
let resp = invokeGetFullFlowService('testFlow');
output = output.concat(testGetFullFlow1(resp, "Test"));

//update settings
updateArtifactSettings("Test");

resp = invokeGetFullFlowService('testFlow');

//test updated settings
output = output.concat(testGetFullFlow2(resp));
output
