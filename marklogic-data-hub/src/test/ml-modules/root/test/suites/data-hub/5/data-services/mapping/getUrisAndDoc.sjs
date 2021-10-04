const test = require("/test/test-helper.xqy");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/mapping/" + module, args));
}

function getUris(mappingName, limit){
  return invoke("getUris.sjs", {"stepName": mappingName, "limit":limit});
}

function getDoc(mappingName, uri){
  return invoke("getDocument.sjs", {"stepName": mappingName, "uri":uri});
}

const resp =[];

const expectedResponse = xdmp.toJsonString({
  "data": {
    "test": "intercepted-data2"
  },
  "namespaces": {},
  "format": "JSON",
  "sourceProperties": [
    {
      "name": "test",
      "xpath": "/test",
      "struct": false,
      "level": 0
    }
  ]
});

const getDocument = getDoc("testMapping", "/content/doc2.json");
resp.concat([
  test.assertEqual(1, getUris("testMapping",1).length),
  test.assertEqual(2, getUris("testMapping",2).length),
  test.assertEqual(["/content/doc1.json","/content/doc2.json"], getUris("testMapping",5).sort()),
  test.assertEqual(expectedResponse, xdmp.toJsonString(getDocument))
]);

// Tests in case the mapping step doesn't have 'sourceQuery' or 'sourceDatabase'

resp.concat([
  test.assertEqual(0, getUris("testIncompleteMapping", 1).length),
  test.assertEqual(0, getUris("testIncompleteMapping", 5).length)
]);

resp
