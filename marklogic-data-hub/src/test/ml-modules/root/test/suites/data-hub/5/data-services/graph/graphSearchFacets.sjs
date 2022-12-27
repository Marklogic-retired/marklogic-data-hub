const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const graphUtils = mjsProxy.requireMjsModule("/data-hub/5/impl/graph-utils.mjs");
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
  return invoke("searchNodes.mjs",
    {query: JSON.stringify(queryData), start: 0, limit: 20, structuredQuery: structuredQuery, queryOptions: queryOptions});
}

const productQuery = {
  "searchText": "",
  "entityTypeIds": [ "Product", "BabyRegistry", "Customer" ],
};
const resultsTest = searchNodes(productQuery);
let expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 9 : 6;
let expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 4 : 0;

let supportConcept = graphUtils.supportsGraphConceptsSearch();

let assertions = [
  test.assertEqual(expectedNodeCount, resultsTest.total),
  test.assertEqual(expectedNodeCount, resultsTest.nodes.length),
  test.assertEqual(expectedEdgeCount, resultsTest.edges.length)
];

  resultsTest.nodes.forEach(node => {
    if(supportConcept){
      if(node.id === "/content/product100.json") {
        assertions.push(test.assertTrue(node.hasRelationships, `Product 100 must have relationships flag in true. Result: ${xdmp.toJsonString(node)}`));
      }
      else if(node.id === "/content/product50.json") {
        assertions.push(test.assertFalse(node.hasRelationships, `Product 50 must have relationships flag in false. Result: ${xdmp.toJsonString(node)}`));
      }
      else if(node.id === "/content/product60.json") {
        assertions.push(test.assertFalse(node.hasRelationships, `Product 60 must have relationships flag in false. Result: ${xdmp.toJsonString(node)}`));
      }
      if (!node.isConcept) {
        assertions.push(test.assertTrue(node.docUri.includes("product")));
      }
    }else{
      if(node.id === "/content/product100.json") {
        assertions.push(test.assertTrue(node.hasRelationships, `Product 100 must have relationships flag in true. Result: ${xdmp.toJsonString(node)}`));
      }
      else if(node.id === "/content/product50.json") {
        assertions.push(test.assertTrue(node.hasRelationships, `Product 50 must have relationships flag in true. Result: ${xdmp.toJsonString(node)}`));
      }
      else if(node.id === "/content/product60.json") {
        assertions.push(test.assertTrue(node.hasRelationships, `Product 60 must have relationships flag in true. Result: ${xdmp.toJsonString(node)}`));
      }
      if (!node.isConcept) {
        assertions.push(test.assertTrue(node.docUri.includes("product")));
      }
    }

  })

assertions;
