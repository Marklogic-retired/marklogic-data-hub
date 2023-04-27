const test = require("/test/test-helper.xqy");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/data-services/graph/" + module, args));
}

const structuredQuery = "<query xmlns=\"http://marklogic.com/appservices/search\" xmlns:search=\"http://marklogic.com/appservices/search\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><and-query><collection-constraint-query><constraint-name>Collection</constraint-name><uri>Product</uri></collection-constraint-query></and-query></query>"
const queryOptions ="<search:options xml:lang=\"zxx\" xmlns:search=\"http://marklogic.com/appservices/search\">\n" +
  "  <search:constraint name=\"Collection\">\n" +
  "    <search:collection>\n" +
  "      <search:facet-option>limit=25</search:facet-option>\n" +
  "      <search:facet-option>frequency-order</search:facet-option>\n" +
  "      <search:facet-option>descending</search:facet-option>\n" +
  "    </search:collection>\n" +
  "  </search:constraint>" +
  "</search:options>"

function searchNodes(queryData) {
  return invoke("searchNodes.mjs",
    {query: JSON.stringify(queryData), start: 0, limit: 20, structuredQuery: structuredQuery, queryOptions: queryOptions});
}

const productQuery = {
  "searchText": "",
  "entityTypeIds": [ "Product", "BabyRegistry", "Customer" ],
};
const resultsTest = searchNodes(productQuery);

let expectedNodeCount = 10; // 6 Products + 1 Baby Registry + 3 Concepts (Collection Constraint Filters out customers)
let expectedEdgeCount = 10;
const resultString = xdmp.toJsonString(resultsTest);
let assertions = [
  test.assertEqual(expectedNodeCount, resultsTest.total, resultString),
  test.assertEqual(expectedNodeCount, resultsTest.nodes.length, resultString),
  test.assertEqual(expectedEdgeCount, resultsTest.edges.length, resultString)
];

  resultsTest.nodes.forEach(node => {
    if(node.id === "/content/babyRegistry1.json") {
      assertions.push(test.assertTrue(node.hasRelationships, `Baby registry must have relationships flag in true for filtered out customer. Result: ${xdmp.toJsonString(node)}`));
    } else if (!node.isConcept) {
      assertions.push(test.assertTrue(node.docUri.includes("product")));
    }
  });

assertions;
