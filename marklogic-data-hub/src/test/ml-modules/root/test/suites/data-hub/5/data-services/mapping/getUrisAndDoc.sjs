const test = require("/test/test-helper.xqy");
const stepService = require("../lib/stepService.sjs");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/mapping/" + module, args));
}

function getUris(mappingName, limit){
  return invoke("getUris.sjs", {"stepName": mappingName, "limit":limit});
}

function getDoc(mappingName, uri){
  return invoke("getDocument.sjs", {"stepName": mappingName, "uri":uri});
}

function overwriteStep(stepDefinitionType, info) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/step/saveStep.sjs", {stepDefinitionType, stepProperties: xdmp.toJSON(info), overwrite: true}));
}

const resp =[];
stepService.createDefaultMappingStep("testMapping");
stepService.saveStep("mapping", {"name": "testMapping", "sourceDatabase": "data-hub-FINAL", "sourceQuery": "cts.collectionQuery('raw-content')"});

resp.concat([
  test.assertEqual(1, getUris("testMapping",1).length),
  test.assertEqual(2, getUris("testMapping",2).length),
  test.assertEqual(["/content/doc1.json","/content/doc2.json"], getUris("testMapping",5).sort()),
  test.assertEqual(JSON.stringify({"test": "data2"}), getDoc("testMapping", "/content/doc2.json"))
]);

// Tests in case the mapping step doesn't have 'sourceQuery' or 'sourceDatabase'
stepService.createDefaultMappingStep("testIncompleteMapping");
let incompleteStep =  {"name": "testIncompleteMapping",
  "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
  "selectedSource": "query",
  "stepDefinitionType": "mapping"}

overwriteStep("mapping", incompleteStep );
resp.concat([
  test.assertEqual(0, getUris("testIncompleteMapping", 1).length)
]);

incompleteStep["sourceQuery"] = "cts.collectionQuery('raw-content')";
overwriteStep("mapping",incompleteStep);

resp.concat([
  test.assertEqual(1, getUris("testIncompleteMapping", 1).length),
  test.assertEqual(2, getUris("testIncompleteMapping", 5).length),
  test.assertEqual(JSON.stringify({"test": "data2"}), getDoc("testIncompleteMapping", "/content/doc2.json"))
]);

resp
