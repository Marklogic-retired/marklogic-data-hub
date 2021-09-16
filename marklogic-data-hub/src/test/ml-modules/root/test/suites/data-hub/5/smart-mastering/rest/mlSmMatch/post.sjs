const mlSmMatchRest = require("/marklogic.rest.resource/mlSmMatch/assets/resource.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

const emptyDocument = new NodeBuilder().startDocument().endDocument().toNode();
const context = {};
const validMatchParams = { flowName: "CurateCustomerJSON", step: "1", uri: "/content/customer1.json" };

const validResults = mlSmMatchRest.POST(context, validMatchParams, emptyDocument);

assertions.push(
  test.assertEqual(1, fn.number(validResults.results.total),`Should find 1 match. Results: ${xdmp.toJsonString(validResults)}`),
  test.assertEqual(1, validResults.results.result.length),
  test.assertEqual("/content/customer2.json", fn.string(validResults.results.result[0].uri)),
);

const invalidMatchParams = { flowName: "CurateCustomerJSON", step: "2", uri: "/content/customer1.json" };

try {
  mlSmMatchRest.POST(context, invalidMatchParams, emptyDocument);
  assertions.push(test.assertTrue(false,"Match should have failed"));
} catch (e) {
  assertions.push(test.assertEqual("400", e.data[0], xdmp.toJsonString(e)));
  assertions.push(test.assertEqual("Bad Request", e.data[1], xdmp.toJsonString(e)));
  assertions.push(test.assertEqual("The step referenced must be a matching step. Step type: merging", e.data[2], xdmp.toJsonString(e)));
}


assertions;