const test = require("/test/test-helper.xqy");
const config = require("/com.marklogic.hub/config.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

const hubCentralConfig = {
  "modeling": {
    "entities": {
      "BabyRegistry": { x: 10, y: 15, "label":"arrivalDate","propertiesOnHover": ["ownedBy", "babyRegistryId"] },
      "Customer": {
        "graphX": 63,
        "graphY": -57,
        "propertiesOnHover": [
          "shipping",
          "shipping.city",
          "billing.city"
        ]
      }
    }
  }
};
function invoke(module, args) {
  hubUtils.writeDocument("/config/hubCentral.json", hubCentralConfig, [xdmp.permission("data-hub-common", "read"),xdmp.permission("data-hub-common-writer", "update")], [], config.FINALDATABASE);
  return fn.head(xdmp.invoke("/data-hub/5/data-services/graph/" + module, args));
}

function searchNodes(queryOptions) {
  return invoke("searchNodes.sjs", {query: JSON.stringify(queryOptions), start: 0, limit: 20});
}

let assertions = [
];

const withRelatedQuery = {
  "searchText": "",
  "entityTypeIds": [ "BabyRegistry" ]

};
const resultsTest4 = searchNodes(withRelatedQuery);

assertions.concat([
  test.assertEqual(1, resultsTest4.total, `wrong total: ${xdmp.toJsonString(resultsTest4)}`),
  test.assertEqual(1, resultsTest4.nodes.length, `wrong nodes length: ${xdmp.toJsonString(resultsTest4)}`)
]);

resultsTest4.nodes.forEach(node => {
  if(node.id == "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039-42") {
    assertions.push(test.assertEqual("2021-01-07-08:00",node.label.toString()), "BabyRegistry 3039-42 must have arrivalDate value as label.");
  }
  if(node.id == "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039-42") {
    assertions.push(test.assertFalse("30039" === node.label.toString()), "BabyRegistry 3039-42 must have arrivalDate value as label  not primaryKey.");
  }

  if(node.id == "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039-42") {
    assertions.push(test.assertTrue(node.propertiesOnHover.length == 2));
  }
})

const withStructurePropertiesOnHover = {
  "searchText": "",
  "entityTypeIds": [ "Customer" ]
};
const resultsWithStructureProperties = searchNodes(withStructurePropertiesOnHover);

assertions.concat([
  test.assertEqual(1, resultsWithStructureProperties.total, `wrong total: ${xdmp.toJsonString(resultsWithStructureProperties)}`),
  test.assertEqual(1, resultsWithStructureProperties.nodes.length, `wrong nodes length: ${xdmp.toJsonString(resultsWithStructureProperties)}`)
]);

resultsWithStructureProperties.nodes.forEach(node => {
  if(node.id == "http://example.org/Customer-0.0.1/Customer/301") {
    assertions.push(test.assertEqual("301",node.label.toString()), "Customer 301 must have id value as label.");
  }
  if(node.id == "http://example.org/Customer-0.0.1/Customer/301") {
    assertions.push(test.assertTrue(node.propertiesOnHover.length == 3));
  }
  node.propertiesOnHover.forEach(propertyOnHover => {
    if(JSON.stringify(propertyOnHover).toString().includes("shipping.Address.city")){
      assertions.push(test.assertEqual("{\"shipping.Address.city\":\"Columbus\"}",JSON.stringify(propertyOnHover).toString()), "Customer 301 must have Columbus as shipping.Address.city.");
    }
    if(JSON.stringify(propertyOnHover).toString().includes("billing.Address.city")){
      assertions.push(test.assertEqual("{\"billing.Address.city\":\"Cincinnati\"}",JSON.stringify(propertyOnHover).toString()), "Customer 301 must have Cincinnati as billing.Address.city.");
    }
  })
})

assertions;
