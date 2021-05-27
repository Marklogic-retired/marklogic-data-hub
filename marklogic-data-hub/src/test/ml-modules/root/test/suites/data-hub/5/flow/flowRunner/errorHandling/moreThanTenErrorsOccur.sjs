const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "myFlow";

const contentArray = [];
for (var i = 1; i <= 11; i++) {
  contentArray.push({ "uri": "/customer" + i + ".json", "value": { "customerId": i } });
}

const response = flowRunner.runFlowOnContent(flowName, contentArray, "jobId", {
  "stepOptions": {
    "1": {
      "throwErrorOnPurpose": true
    }
  }
});

const stepResponse = response.stepResponses["1"];

const assertions = [
  test.assertEqual("failed step 1", stepResponse.status),
  test.assertEqual(0, stepResponse.successfulEvents),
  test.assertEqual(11, stepResponse.failedEvents),
  test.assertEqual(0, stepResponse.successfulBatches),
  test.assertEqual(1, stepResponse.failedBatches),
  test.assertTrue(stepResponse.stepOutput.length > 0, "Expecting 10 errors"),
  test.assertEqual(10, stepResponse.stepOutput.length, "Expecting 10 errors, even though all 11 content objects failed; " +
    "A max of 10 error messages are returned to be consistent with the Java FlowRunner")
];

assertions;
