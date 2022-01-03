const test = require("/test/test-helper.xqy");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/graph/" + module, args));
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
  return invoke("searchNodes.sjs",
    {query: JSON.stringify(queryData), start: 0, limit: 20, structuredQuery: structuredQuery, queryOptions: queryOptions});
}

const productQuery = {
  "searchText": "",
  "entityTypeIds": [ "Product", "BabyRegistry", "Customer" ],
};
const resultsTest = searchNodes(productQuery);

let assertions = [
  test.assertEqual(2, resultsTest.total),
  test.assertEqual(2, resultsTest.nodes.length),
  test.assertEqual(0, resultsTest.edges.length),
  test.assertFalse(resultsTest.nodes[0].hasRelationships),
  test.assertEqual(resultsTest.nodes[0].docUri, "/content/product50.json"),
  test.assertEqual(resultsTest.nodes[1].docUri, "/content/product60.json"),
];

assertions;
