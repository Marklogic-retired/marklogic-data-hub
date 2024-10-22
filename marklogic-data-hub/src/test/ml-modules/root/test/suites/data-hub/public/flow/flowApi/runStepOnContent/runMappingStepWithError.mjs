import flowApi from "/data-hub/public/flow/flow-api.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";
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
  test.assertTrue(stepResponse.stepOutput[0].includes("Unable to find function: 'unknownFunction()'. Cause: Either the function does not exist or the wrong number of arguments were specified."),
    "Unexpected error message: " + stepResponse.stepOutput[0]
  )
];

assertions;
