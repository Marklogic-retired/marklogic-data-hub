const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "myFlow";

const response = flowRunner.processContentWithFlow(flowName,
  [
    { "uri": "/customer1.json", "value": { "customerId": 1 } },
    { "uri": "/customer2.json", "value": { "customerId": 2 } }
  ], "jobId", {
  "stepOptions": {
    "1": {
      "acceptsBatch": true,
      "throwErrorOnPurpose": true,
      "stopOnError": true
    }
  }
}
);

const stepResponse = response.stepResponses["1"];
const assertions = [
  test.assertEqual("failed", response.jobStatus, 
    "If any step fails and stops on error, the job is considered to have failed and no step output is written"),
  test.assertEqual("1", response.lastAttemptedStep),
  test.assertEqual(undefined, response.lastCompletedStep),

  test.assertEqual(1, Object.keys(response.stepResponses).length, 
    "The second step should not have been run since the first step stopped with an error"),
  test.assertEqual("failed step 1", stepResponse.status),
  test.assertEqual(1, stepResponse.stepOutput.length, 
    "Should have a single error for the entire batch, since acceptsBatch=true"),
  test.assertEqual("Throwing error on purpose", stepResponse.stepOutput[0]),
  test.assertEqual(2, stepResponse.totalEvents, "Both items are considered to have been processed"),
  test.assertEqual(2, stepResponse.failedEvents),
  test.assertEqual(0, stepResponse.successfulEvents),
  test.assertEqual(1, stepResponse.failedBatches),
  test.assertEqual(0, stepResponse.successfulBatches),
  test.assertEqual(false, stepResponse.success)
];

assertions;