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
  test.assertEqual(2, resultsTest3.edges.length),
  test.assertFalse(resultsTest3.nodes[0].hasRelationships),
  test.assertFalse(resultsTest3.nodes[1].hasRelationships),
  test.assertFalse(resultsTest3.nodes[2].hasRelationships)
]);


const withRelatedQuery = {
  "searchText": "",
  "entityTypeIds": [ "BabyRegistry" ],
  "relatedEntityTypeIds": ["Product", "Customer"]

};

const resultsTest4 = searchNodes(withRelatedQuery);

assertions.concat([
  test.assertEqual(4, resultsTest4.total),
  test.assertEqual(3, resultsTest4.nodes.length, xdmp.toJsonString(resultsTest4)),
  test.assertEqual(2, resultsTest4.edges.length),
  test.assertFalse(resultsTest4.nodes[0].hasRelationships),
  test.assertFalse(resultsTest4.nodes[1].hasRelationships),
  test.assertTrue(resultsTest4.nodes[2].hasRelationships)
]);

const nodeLeafQuery = {
  "searchText": "",
  "entityTypeIds": [ "BabyRegistry" ],
  "relatedEntityTypeIds": ["Customer"]
};

const resultsTest5 = searchNodes(nodeLeafQuery);

assertions.concat([
  test.assertEqual(2, resultsTest5.total),
  test.assertEqual(2, resultsTest5.nodes.length, xdmp.toJsonString(resultsTest5)),
  test.assertEqual(1, resultsTest5.edges.length),
  test.assertTrue(resultsTest5.nodes[1].hasRelationships)
]);

const searchTextQuery = {
  "searchText": "Infant Newborn Toddler",
  "entityTypeIds": [ "Product", "Office" ],
};

const resultsTestSearchBy = searchNodes(searchTextQuery);

assertions.concat([
  test.assertEqual(2, resultsTestSearchBy.total),
  test.assertEqual(2, resultsTestSearchBy.nodes.length),
  test.assertEqual(0, resultsTestSearchBy.edges.length),
  test.assertFalse(resultsTestSearchBy.nodes[0].hasRelationships),
  test.assertEqual(resultsTestSearchBy.nodes[0].group, "http://example.org/Product-1.0.0/Product"),
  test.assertEqual(resultsTestSearchBy.nodes[1].group, "http://example.org/Product-1.0.0/Product"),
]);


assertions;
