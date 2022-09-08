const test = require("/test/test-helper.xqy");
const config = require("/com.marklogic.hub/config.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");


const hubCentralConfig = {
  "modeling": {
    "entities": {
      "BabyRegistry": { x: 10, y: 15, "label":"arrivalDate","propertiesOnHover": ["ownedBy", "babyRegistryId"] },
      "Office": { x: 12, y: 16, "label":"name"},
      "Product": {
        "graphX": 63,
        "graphY": -57,
        "label": "productName",
        "propertiesOnHover": [
          "productId"
        ]
      }
    }
  }
};

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/graph/" + module, args));
}

function nodeExpand(queryOptions) {
  return invoke("nodeExpand.sjs", {nodeInfo: JSON.stringify(queryOptions), start: 0, limit: 20});
}
function nodeExpandWithLimit4(queryOptions) {
  hubUtils.writeDocument("/config/hubCentral.json", hubCentralConfig, [xdmp.permission("data-hub-common", "read"),xdmp.permission("data-hub-common-writer", "update")], [], config.FINALDATABASE);
  return invoke("nodeExpand.sjs", {nodeInfo: JSON.stringify(queryOptions), start: 0, limit: 4});
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
  test.assertEqual(6, resultsTest1.edges.length)
];

const expandQuery2 = {
  "parentIRI": "/content/babyRegistry1.json",
};
const resultsTest2 = nodeExpand(expandQuery2);

assertions.concat([
  test.assertEqual(7, resultsTest2.total, xdmp.toJsonString(resultsTest2)),
  test.assertEqual(2, resultsTest2.nodes.length, xdmp.toJsonString(resultsTest2)),
  test.assertEqual(2, resultsTest2.edges.length)
]);


const expandQuery3 = {
  "parentIRI": "/content/babyRegistry1.json",
  "predicateFilter": "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/includes"
};
const resultsTest3 = nodeExpandWithLimit4(expandQuery3);

assertions.concat([
  test.assertEqual(6, resultsTest3.total),
  test.assertEqual(5, resultsTest3.nodes.length, xdmp.toJsonString(resultsTest3)),
  test.assertEqual(5, resultsTest3.edges.length)
]);

const expandConceptQuery = {
  "isConcept":true,
  "parentIRI": "http://example.org/Office-0.0.1/Office/1",
  "objectConcept": "http://www.example.com/Category/Sneakers"
};
const resultConceptExpand = nodeExpandWithLimit4(expandConceptQuery);

assertions.concat([
  test.assertEqual(1, resultConceptExpand.total, xdmp.toJsonString(resultConceptExpand)),
  test.assertEqual(1, resultConceptExpand.nodes.length, xdmp.toJsonString(resultConceptExpand)),
  test.assertEqual(1, resultConceptExpand.edges.length),
  test.assertEqual("ProductName60", resultConceptExpand.nodes[0].label)

]);

const expandConceptQueryProduct = {
  "isConcept":true,
  "parentIRI": "http://example.org/Product-1.0.0/Product/60",
  "objectConcept": "http://www.example.com/Category/Sneakers"
};
const resultConceptQueryProduct = nodeExpandWithLimit4(expandConceptQueryProduct);

assertions.concat([
  test.assertEqual(2, resultConceptQueryProduct.total, xdmp.toJsonString(resultConceptQueryProduct)),
  test.assertEqual(2, resultConceptQueryProduct.nodes.length, xdmp.toJsonString(resultConceptQueryProduct)),
  test.assertEqual(2, resultConceptQueryProduct.edges.length),
  test.assertEqual("office name", resultConceptQueryProduct.nodes[0].label)

]);

assertions;
