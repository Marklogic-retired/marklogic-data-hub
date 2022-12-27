const test = require("/test/test-helper.xqy");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/graph/" + module, args));
}

function nodeExpand(queryOptions) {
  return invoke("nodeExpand.mjs", {nodeInfo: JSON.stringify(queryOptions), start: 0, limit: 20});
}
function nodeExpandWithLimit4(queryOptions) {
  return invoke("nodeExpand.mjs", {nodeInfo: JSON.stringify(queryOptions), start: 0, limit: 4});
}

const expandQuery1 = {
  "parentIRI": "/content/babyRegistry1.json",
  "lastObjectIRI": null,
  "predicateFilter": "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/includes"
};
const resultsTest1 = nodeExpand(expandQuery1);

let assertions = [
  test.assertEqual(6, resultsTest1.total),
  test.assertEqual(6, resultsTest1.nodes.length, xdmp.toJsonString(resultsTest1)),
  test.assertEqual(6, resultsTest1.edges.length, xdmp.toJsonString(resultsTest1))
];

const expandQuery2 = {
  "parentIRI": "/content/babyRegistry1.json",
};
const resultsTest2 = nodeExpand(expandQuery2);

assertions.concat([
  test.assertEqual(7, resultsTest2.total),
  test.assertEqual(2, resultsTest2.nodes.length, xdmp.toJsonString(resultsTest2)),
  test.assertEqual(7, resultsTest2.edges.length, `3 edges for new nodes + 3 edges from the new nodes so they'll connect if already on the graph. Output: ${xdmp.toJsonString(resultsTest2)}`)
]);


const expandQuery3 = {
  "parentIRI": "/content/babyRegistry1.json",
  "predicateFilter": "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/includes"
};
const resultsTest3 = nodeExpandWithLimit4(expandQuery3);

assertions.concat([
  test.assertEqual(6, resultsTest3.total),
  test.assertEqual(5, resultsTest3.nodes.length, xdmp.toJsonString(resultsTest3)),
  test.assertEqual(5, resultsTest3.edges.length, xdmp.toJsonString(resultsTest3))
]);

const expandConceptQuery = {
  "isConcept":true,
  "objectConcept": "http://www.example.com/Category/Sneakers"
};
const resultConceptExpand = nodeExpandWithLimit4(expandConceptQuery);

assertions.concat([
  test.assertEqual(4, resultConceptExpand.total, xdmp.toJsonString(resultConceptExpand)),
  test.assertEqual(4, resultConceptExpand.nodes.length, xdmp.toJsonString(resultConceptExpand)),
  test.assertEqual(4, resultConceptExpand.edges.length),
  test.assertTrue(resultConceptExpand.nodes.some(node => "office name" === fn.string(node.label)), xdmp.toJsonString(resultConceptExpand.nodes)),
  test.assertTrue(resultConceptExpand.nodes.some(node => "ProductName60" === fn.string(node.label)), xdmp.toJsonString(resultConceptExpand.nodes))
]);

const expandQuery4 = {
  "parentIRI": "/content/product60.json",
};
const resultsTest4 = nodeExpand(expandQuery4);

assertions.concat([
  test.assertEqual(2, resultsTest4.total, xdmp.toJsonString(resultsTest4)),
  test.assertEqual(2, resultsTest4.nodes.length, xdmp.toJsonString(resultsTest4)),
  test.assertEqual(9, resultsTest4.edges.length, `2 edges for new nodes + 7 edges from the new nodes so they'll connect if already on the graph. Output: ${xdmp.toJsonString(resultsTest4.edges)}`),
  test.assertTrue(resultsTest4.nodes.some(node => node.isConcept && fn.string(node.conceptClassName) === "ShoeType"), xdmp.toJsonString(resultsTest4))
]);

assertions;
