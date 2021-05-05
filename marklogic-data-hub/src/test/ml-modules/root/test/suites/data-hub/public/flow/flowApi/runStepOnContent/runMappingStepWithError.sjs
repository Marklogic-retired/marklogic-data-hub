const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "simpleMappingFlow";
const options = {};

const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" }}
];

const response = flowApi.runFlowStepOnContent(flowName, "2", contentArray, options);

const stepResponse = response.stepResponse;
const assertions = [
  test.assertEqual(0, response.contentArray.length, 
    "Since the mapping is invalid, no content objects should have been returned"),
  test.assertEqual("failed step 2", stepResponse.status),
  test.assertEqual(1, stepResponse.totalEvents),
  test.assertEqual(0, stepResponse.successfulEvents),
  test.assertEqual(1, stepResponse.failedEvents),
  test.assertEqual(1, stepResponse.stepOutput.length),
  test.assertTrue(stepResponse.stepOutput[0].includes("Undefined function unknownFunction()"),
    "Unexpected error message: " + stepResponse.stepOutput[0]
  )
];

assertions;