const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");

let assertions = [];
let results, collections;

const options = {
  sourceDatabase: "data-hub-FINAL",
  targetDatabase: "data-hub-FINAL",
  targetCollectionsAdditivity: true,
  outputFormat: 'json'
};

const content = [{uri:"/customer1.json",
  value:{"hello": "world"},
  context: {originalCollections: ["source"]}
}];
results = flowRunner.processContentWithFlow("simpleMappingFlow", content, "1", options);
collections = hubTest.getRecord("/customer1.json").collections;

assertions.push(
  test.assertEqual("finished", results.jobStatus),
  test.assertEqual(2, collections.length,
    "doc should have collections from both mapping step and from originalCollections"),
  test.assertTrue(collections.includes("Customer"),
    "doc should have collection from mapping step"),
  test.assertTrue(collections.includes("source"),
    "doc should have collection from source doc when targetCollectionsAdditivity is true")
);
assertions;