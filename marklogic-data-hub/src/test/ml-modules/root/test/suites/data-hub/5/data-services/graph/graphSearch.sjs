const test = require("/test/test-helper.xqy");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/graph/" + module, args));
}

function searchNodes(queryOptions) {
  return invoke("searchNodes.sjs", {query: JSON.stringify(queryOptions), start: 0, limit: 20});
}

const productQuery = {
  "searchText": "",
  "entityTypeIds": [ "Product" ],
  "selectedFacets": {}
};
const resultsTest1 = searchNodes(productQuery);

let assertions = [
  test.assertEqual(2, resultsTest1.total),
  test.assertEqual(2, resultsTest1.nodes.length, xdmp.toJsonString(resultsTest1)),
  test.assertEqual(0, resultsTest1.edges.length)
];

const babyRegistryQuery = {
  "searchText": "",
  "entityTypeIds": [ "BabyRegistry"],
  "selectedFacets": {}
};

const resultsTest2 = searchNodes(babyRegistryQuery);
assertions.concat([
  test.assertEqual(1, resultsTest2.total),
  test.assertEqual(1, resultsTest2.nodes.length, xdmp.toJsonString(resultsTest2)),
  test.assertEqual(0, resultsTest2.edges.length)
]);

const multipleQuery = {
  "searchText": "",
  "entityTypeIds": [ "BabyRegistry", "Product" ]
};

const resultsTest3 = searchNodes(multipleQuery);

assertions.concat([
  test.assertEqual(3, resultsTest3.total),
  test.assertEqual(3, resultsTest3.nodes.length, xdmp.toJsonString(resultsTest3)),
  test.assertEqual(2, resultsTest3.edges.length)
]);


const withRelatedQuery = {
  "searchText": "",
  "entityTypeIds": [ "BabyRegistry" ],
  "selectedFacets": {
    "relatedEntityTypeIds": ["Product", "Customer"]
  }
};

const resultsTest4 = searchNodes(withRelatedQuery);

assertions.concat([
  test.assertEqual(4, resultsTest4.total),
  test.assertEqual(3, resultsTest4.nodes.length, xdmp.toJsonString(resultsTest4)),
  test.assertEqual(2, resultsTest4.edges.length)
]);

assertions;
