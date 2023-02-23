import graphUtils from "/data-hub/5/impl/graph-utils.mjs";
const test = require("/test/test-helper.xqy");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/graph/" + module, args));
}

function searchNodes(queryOptions) {
  return invoke("searchNodes.mjs", {query: JSON.stringify(queryOptions), start: 0, limit: 20});
}

const productQuery = {
  "searchText": "",
  "entityTypeIds": [ "Product" ],
  "selectedFacets": {}
};
const resultsTest1 = searchNodes(productQuery);

let expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 9 : 6;
let expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 4 : 0;
let assertions = [
  test.assertEqual(expectedNodeCount, resultsTest1.total),
  test.assertEqual(expectedNodeCount, resultsTest1.nodes.length, xdmp.toJsonString(resultsTest1)),
  test.assertEqual(expectedEdgeCount, resultsTest1.edges.length, xdmp.toJsonString(resultsTest1))
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

const nsCustomerQuery = {
  "searchText": "",
  "entityTypeIds": [ "NamespacedCustomer"],
  "selectedFacets": {}
};
const nsCustomerQueryResults = searchNodes(nsCustomerQuery);
expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 2 : 1;
expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 1 : 0;
assertions.concat([
  test.assertEqual(expectedNodeCount, nsCustomerQueryResults.total),
  test.assertEqual(expectedNodeCount, nsCustomerQueryResults.nodes.length, xdmp.toJsonString(nsCustomerQueryResults)),
  test.assertEqual(expectedEdgeCount, nsCustomerQueryResults.edges.length)
]);

const multipleQuery = {
  "searchText": "",
  "entityTypeIds": [ "BabyRegistry", "Product" ]
};

const resultsTest3 = searchNodes(multipleQuery);

expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 10 : 7;
expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 10 : 6;
let expectedHasRelationship = graphUtils.supportsGraphConceptsSearch() ? 3 : 2;
assertions.concat([
  test.assertEqual(expectedNodeCount, resultsTest3.total),
  test.assertEqual(expectedNodeCount, resultsTest3.nodes.length, xdmp.toJsonString(resultsTest3)),
  test.assertEqual(expectedEdgeCount, resultsTest3.edges.length),
  test.assertEqual(expectedHasRelationship, resultsTest3.nodes.filter((node) => node.hasRelationships).length, xdmp.toJsonString(resultsTest3.nodes))
]);


const withRelatedQuery = {
  "searchText": "",
  "entityTypeIds": [ "BabyRegistry" ],
  "relatedEntityTypeIds": ["Product", "Customer"]

};
const resultsTest4 = searchNodes(withRelatedQuery);

assertions.concat([
  test.assertEqual(3, resultsTest4.total, `wrong total: ${xdmp.toJsonString(resultsTest4)}`),
  test.assertEqual(3, resultsTest4.nodes.length, `wrong nodes length: ${xdmp.toJsonString(resultsTest4)}`),
  test.assertEqual(2, resultsTest4.edges.length, `wrong edges length: ${xdmp.toJsonString(resultsTest4)}`)
]);

resultsTest4.nodes.forEach(node => {
  if(node.id === "/content/babyRegistry1.json") {
    assertions.push(test.assertFalse(node.hasRelationships, `BabyRegistry 3039-42 must have relationships flag in false. Result: ${xdmp.toJsonString(node)}`));
  }
  else if(node.id === "/content/babyRegistry1.json-Product") {
    assertions.push(test.assertFalse(node.hasRelationships, `Product group node must have relationships flag in false. Result: ${xdmp.toJsonString(node)}`));
  }
  else if(node.id === "/content/customer1.json") {
    assertions.push(test.assertTrue(node.hasRelationships, `Customer 301 node must have relationships flag in true. Result: ${xdmp.toJsonString(node)}`));
  }
})

// The relationship is defined in BabyRegistry model. But when searched for Customer, since there is a relation between
// Customer and Baby Registry, BabyRegistry's related nodes and edges should be returned.
const customerQuery = {
  "searchText": "",
  "entityTypeIds": [ "Customer" ],
  "relatedEntityTypeIds": ["BabyRegistry"],
  "selectedFacets": {}
};
const resultsTest6 = searchNodes(customerQuery);
expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 4 : 3;
expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 2 : 1;
const testEdge = resultsTest6.edges.find((edge) => edge.to === "/content/customer1.json");
const mergedNode = resultsTest6.nodes.find(node => node.id === "/content/customer1.json");
assertions = assertions.concat([
  test.assertEqual(expectedNodeCount, resultsTest6.total),
  test.assertEqual(expectedNodeCount, resultsTest6.nodes.length, xdmp.toJsonString(resultsTest6)),
  test.assertEqual(expectedEdgeCount, resultsTest6.edges.length),
  // to and from are in sorted order to support bidirectional queries.
  test.assertEqual("/content/babyRegistry1.json", testEdge.from),
  test.assertEqual("/content/customer1.json", testEdge.to, xdmp.toJsonString(testEdge)),
  test.assertTrue(mergedNode.unmerge),
  test.assertNotEqual(null, mergedNode.unmergeUris),
  test.assertEqual("matchingStep", mergedNode.matchStepName)
]);

const customerWithoutIdNode = resultsTest6.nodes.find(node => node.id === "/content/customer%20without%20id.json");
assertions.push(test.assertEqual("/content/customer without id.json", customerWithoutIdNode.label, `URI id should be decoded for label. Result: ${xdmp.toJsonString(customerWithoutIdNode)}`));

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
]);

resultsTest5.nodes.forEach(node => {
  if(node.id === "/content/babyRegistry1.json") {
    assertions.push(test.assertTrue(node.hasRelationships, `BabyRegistry 3039-42 must have relationships flag in true. Result: ${xdmp.toJsonString(node)}`));
  }
  else if(node.id === "/content/customer1.json") {
    assertions.push(test.assertTrue(node.hasRelationships, `Customer 301 node must have relationships flag in true. Result: ${xdmp.toJsonString(node)}`));
  }
})

const searchTextQuery = {
  "searchText": "Infant Newborn Toddler",
  "entityTypeIds": [ "Product" ]
};

const resultsTestSearchBy = searchNodes(searchTextQuery);
expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 3 : 1;
expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 2 : 0;
assertions.concat([
  test.assertEqual(expectedNodeCount, resultsTestSearchBy.total),
  test.assertEqual(expectedNodeCount, resultsTestSearchBy.nodes.length),
  test.assertEqual(expectedEdgeCount, resultsTestSearchBy.edges.length),
]);

resultsTestSearchBy.nodes.forEach(node => {
  test.assertTrue((node.group.toString().includes("Product") || node.group.toString().includes("BasketballShoes") || node.group.toString().includes("test concept instanc")), xdmp.toJsonString(node));
})


const RelatedByPropertyDifferentFromID = {
  "searchText": "",
  "entityTypeIds": [ "Customer" ],
  "relatedEntityTypeIds": ["Office"]
};

const ResultRelatedByPropertyDifferentFromID = searchNodes(RelatedByPropertyDifferentFromID);
let expectedCountDifferentFromID = graphUtils.supportsGraphConceptsSearch() ? 4 : 3;
const expectedEdgeCountDifferentFromID = graphUtils.supportsGraphConceptsSearch() ? 3 : 2;
assertions.concat([
  test.assertEqual(expectedCountDifferentFromID, ResultRelatedByPropertyDifferentFromID.total),
  test.assertEqual(expectedCountDifferentFromID, ResultRelatedByPropertyDifferentFromID.nodes.length, xdmp.toJsonString(ResultRelatedByPropertyDifferentFromID)),
  test.assertEqual(expectedEdgeCountDifferentFromID, ResultRelatedByPropertyDifferentFromID.edges.length),
]);

const conceptFilterQuery = {
  "searchText": "",
  "entityTypeIds": [ "Product" ],
  "conceptsFilterTypeIds": [ "http://www.example.com/Category/Sneakers" ]
};

const resultsConceptFilter = searchNodes(conceptFilterQuery);
expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 7 : 6;
expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 1 : 0;

assertions.concat([
  test.assertEqual(expectedNodeCount, resultsConceptFilter.total),
  test.assertEqual(expectedNodeCount, resultsConceptFilter.nodes.length, xdmp.toJsonString({ query: conceptFilterQuery, results: resultsConceptFilter})),
  test.assertEqual(expectedEdgeCount, resultsConceptFilter.edges.length),
]);

const conceptFilterQuery2 = {
  "searchText": "",
  "entityTypeIds": [ "Product" ],
  "conceptsFilterTypeIds": [ "http://www.example.com/Category/BasketballShoes" ]
};

const resultsConceptFilter2 = searchNodes(conceptFilterQuery2);

expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 7 : 6;
expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 2 : 0;
assertions.concat([
  test.assertEqual(expectedNodeCount, resultsConceptFilter2.total),
  test.assertEqual(expectedNodeCount, resultsConceptFilter2.nodes.length, xdmp.toJsonString(conceptFilterQuery2)),
  test.assertEqual(expectedEdgeCount, resultsConceptFilter2.edges.length),
]);

const conceptFilterQuery3 = {
  "searchText": "",
  "entityTypeIds": [ "Product" ],
  "conceptsFilterTypeIds": [ "http://www.example.com/Category/Sneakers","http://www.example.com/Category/BasketballShoes" ]
};

const resultsConceptFilter3 = searchNodes(conceptFilterQuery3);
expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 8 : 6;
expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 3 : 0;
assertions.concat([
  test.assertEqual(expectedNodeCount, resultsConceptFilter3.total),
  test.assertEqual(expectedNodeCount, resultsConceptFilter3.nodes.length, xdmp.toJsonString(conceptFilterQuery3)),
  test.assertEqual(expectedEdgeCount, resultsConceptFilter3.edges.length),
]);


const ConceptWithHasRelationship = {
  "searchText": "",
  "entityTypeIds": [ "Office" ]
};

const resultConceptWithHasRelationship = searchNodes(ConceptWithHasRelationship);
expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 3 : 2;
expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 2 : 0;
assertions.concat([
  test.assertEqual(expectedNodeCount, resultConceptWithHasRelationship.total),
  test.assertEqual(expectedNodeCount, resultConceptWithHasRelationship.nodes.length, xdmp.toJsonString(resultConceptWithHasRelationship)),
  test.assertEqual(expectedEdgeCount, resultConceptWithHasRelationship.edges.length)
]);

resultConceptWithHasRelationship.nodes.forEach(node => {
  if(node.id === "/content/office1.json") {
    assertions.push(test.assertTrue(node.hasRelationships, "Office 1 must have relationships flag in true."));
    assertions.push(test.assertFalse(node.isConcept, "Office 1 shouldn't be a concept."));
  }
  else if(node.id === "http://www.example.com/Category/Sneakers") {
    assertions.push(test.assertTrue(node.hasRelationships), "Should have relationships flag set to true.");
    assertions.push(test.assertTrue(node.isConcept, "Sneakers should be a concept."));
    assertions.push(test.assertEqual("ClothType", fn.string(node.conceptClassName), "Sneakers should have a concept class name of ShoeType."));
  }
})

const structuredConceptQuery = {
  "searchText": "",
  "entityTypeIds": [ "Customer"],
  "selectedFacets": {}
};
const structuredConceptQueryResults = searchNodes(structuredConceptQuery);
expectedNodeCount = graphUtils.supportsGraphConceptsSearch() ? 3 : 2;
expectedEdgeCount = graphUtils.supportsGraphConceptsSearch() ? 1 : 0;
assertions.concat([
  test.assertEqual(expectedNodeCount, structuredConceptQueryResults.total, "Includes 2 customer nodes and 1 structured property concept node"),
  test.assertEqual(expectedNodeCount, structuredConceptQueryResults.nodes.length, xdmp.toJsonString(structuredConceptQueryResults)),
  test.assertEqual(expectedEdgeCount, structuredConceptQueryResults.edges.length, "One edge between concept node and structured property concept node")
]);

const withAllEntitiesSelectedQuery = {
  "searchText": "",
  "entityTypeIds": [ "BabyRegistry","Product", "Customer", "NamespacedCustomer", "Office"]

};
const resultsAllEntitiesSelected = searchNodes(withAllEntitiesSelectedQuery);


resultsAllEntitiesSelected.nodes.forEach(node => {
  if(node.count != null && node.count > 1){
    test.assertFail("a node with count greater than 1 must not exists");
  }
})

assertions;
