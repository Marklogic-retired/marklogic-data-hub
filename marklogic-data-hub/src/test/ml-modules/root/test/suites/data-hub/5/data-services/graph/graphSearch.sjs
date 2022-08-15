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
  test.assertEqual(9, resultsTest1.total),
  test.assertEqual(9, resultsTest1.nodes.length, xdmp.toJsonString(resultsTest1)),
  test.assertEqual(4, resultsTest1.edges.length)
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
  test.assertEqual(10, resultsTest3.total),
  test.assertEqual(10, resultsTest3.nodes.length, xdmp.toJsonString(resultsTest3)),
  test.assertEqual(10, resultsTest3.edges.length),
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
  test.assertEqual(8, resultsTest4.total, `wrong total: ${xdmp.toJsonString(resultsTest4)}`),
  test.assertEqual(3, resultsTest4.nodes.length, `wrong nodes length: ${xdmp.toJsonString(resultsTest4)}`),
  test.assertEqual(2, resultsTest4.edges.length, `wrong edges length: ${xdmp.toJsonString(resultsTest4)}`)
]);

resultsTest4.nodes.forEach(node => {
  if(node.id === "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039") {
    assertions.push(test.assertFalse(node.hasRelationships), "BabyRegistry 3039 must have relationships flag in false.");
  }
  else if(node.id === "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039-Product") {
    assertions.push(test.assertFalse(node.hasRelationships), "Product group node must have relationships flag in false.");
  }
  else if(node.id === "http://example.org/Customer-0.0.1/Customer/301") {
    assertions.push(test.assertTrue(node.hasRelationships), "Customer 301 node must have relationships flag in true.");
  }
})


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
  if(node.id === "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039") {
    assertions.push(test.assertFalse(node.hasRelationships), "BabyRegistry 3039 must have relationships flag in false.");
  }
  else if(node.id === "http://example.org/Customer-0.0.1/Customer/301") {
    assertions.push(test.assertTrue(node.hasRelationships), "Customer 301 node must have relationships flag in true.");
  }
})

const searchTextQuery = {
  "searchText": "Infant Newborn Toddler",
  "entityTypeIds": [ "Product" ]
};

const resultsTestSearchBy = searchNodes(searchTextQuery);

assertions.concat([
  test.assertEqual(3, resultsTestSearchBy.total),
  test.assertEqual(3, resultsTestSearchBy.nodes.length),
  test.assertEqual(2, resultsTestSearchBy.edges.length),
]);

resultsTestSearchBy.nodes.forEach(node => {
  test.assertTrue((node.group.toString().includes("Product") || node.group.toString().includes("BasketballShoes") || node.group.toString().includes("test concept instanc")));
  test.assertFalse(node.hasRelationships)
})

const conceptFilterQuery = {
  "searchText": "",
  "entityTypeIds": [ "Product" ],
  "conceptsFilterTypeIds": [ "http://www.example.com/Category/Sneakers" ]
};

const resultsConceptFilter = searchNodes(conceptFilterQuery);

assertions.concat([
  test.assertEqual(9, resultsConceptFilter.total),
  test.assertEqual(7, resultsConceptFilter.nodes.length, xdmp.toJsonString(conceptFilterQuery)),
  test.assertEqual(1, resultsConceptFilter.edges.length),
]);

const conceptFilterQuery2 = {
  "searchText": "",
  "entityTypeIds": [ "Product" ],
  "conceptsFilterTypeIds": [ "http://www.example.com/Category/BasketballShoes" ]
};

const resultsConceptFilter2 = searchNodes(conceptFilterQuery2);

assertions.concat([
  test.assertEqual(9, resultsConceptFilter2.total),
  test.assertEqual(7, resultsConceptFilter2.nodes.length, xdmp.toJsonString(conceptFilterQuery2)),
  test.assertEqual(2, resultsConceptFilter2.edges.length),
]);

const conceptFilterQuery3 = {
  "searchText": "",
  "entityTypeIds": [ "Product" ],
  "conceptsFilterTypeIds": [ "http://www.example.com/Category/Sneakers","http://www.example.com/Category/BasketballShoes" ]
};

const resultsConceptFilter3 = searchNodes(conceptFilterQuery3);

assertions.concat([
  test.assertEqual(9, resultsConceptFilter3.total),
  test.assertEqual(8, resultsConceptFilter3.nodes.length, xdmp.toJsonString(conceptFilterQuery3)),
  test.assertEqual(3, resultsConceptFilter3.edges.length),
]);


const ConceptWithHasRelationship = {
  "searchText": "",
  "entityTypeIds": [ "Office" ]
};

const resultConceptWithHasRelationship = searchNodes(ConceptWithHasRelationship);

assertions.concat([
  test.assertEqual(2, resultConceptWithHasRelationship.total),
  test.assertEqual(2, resultConceptWithHasRelationship.nodes.length, xdmp.toJsonString(resultConceptWithHasRelationship)),
  test.assertEqual(1, resultConceptWithHasRelationship.edges.length),
]);

resultConceptWithHasRelationship.nodes.forEach(node => {
  if(node.id === "http://example.org/Office-0.0.1/Office/1") {
    assertions.push(test.assertFalse(node.hasRelationships), "Office 1 must have relationships flag in false.");
    assertions.push(test.assertFalse(node.isConcept), "Office 1 shouldn't be a concept.");
  }
  else if(node.id === "http://www.example.com/Category/Sneakers") {
    assertions.push(test.assertTrue(node.hasRelationships), "Should have relationships flag in true.");
    assertions.push(test.assertTrue(node.isConcept), "Sneakers should be a concept.");
  }
})


assertions;
