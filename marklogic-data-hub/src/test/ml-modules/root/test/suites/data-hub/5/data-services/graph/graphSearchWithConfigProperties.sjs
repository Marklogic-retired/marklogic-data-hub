const test = require("/test/test-helper.xqy");
const config = require("/com.marklogic.hub/config.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

const hubCentralConfig = {
  "modeling": {
    "entities": {
      "BabyRegistry": { x: 10, y: 15, "label":"arrivalDate","propertiesOnHover": ["ownedBy", "babyRegistryId"] }
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
  if(node.id == "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039") {
    assertions.push(test.assertEqual("2021-01-07-08:00",node.label.toString()), "BabyRegistry 3039 must have arrivalDate value as label.");
  }
  if(node.id == "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039") {
    assertions.push(test.assertFalse("30039" === node.label.toString()), "BabyRegistry 3039 must have arrivalDate value as label  not primaryKey.");
  }

  if(node.id == "http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039") {
    assertions.push(test.assertTrue(node.propertiesOnHover.length == 2));
  }
})



assertions;
