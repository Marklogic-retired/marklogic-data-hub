const test = require("/test/test-helper.xqy");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/graph/" + module, args));
}

function nodeExpand(queryOptions) {
  return invoke("nodeExpand.sjs", {nodeInfo: JSON.stringify(queryOptions), start: 0, limit: 20});
}

const expandQuery1 = {
  "parentIRI": "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039-Product",
  "lastObjectIRI": null,
  "predicateFilter": "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/includes"
};
const resultsTest1 = nodeExpand(expandQuery1);

let assertions = [
  test.assertEqual(2, resultsTest1.total),
  test.assertEqual(2, resultsTest1.nodes.length, xdmp.toJsonString(resultsTest1)),
  test.assertEqual(2, resultsTest1.edges.length)
];

const expandQuery2 = {
  "parentIRI": "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039",
};
const resultsTest2 = nodeExpand(expandQuery2);

assertions.concat([
  test.assertEqual(3, resultsTest2.total),
  test.assertEqual(2, resultsTest2.nodes.length, xdmp.toJsonString(resultsTest2)),
  test.assertEqual(2, resultsTest2.edges.length)
]);

assertions;
