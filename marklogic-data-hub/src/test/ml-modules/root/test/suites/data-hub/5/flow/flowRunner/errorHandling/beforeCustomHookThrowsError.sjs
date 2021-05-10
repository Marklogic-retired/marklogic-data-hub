const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "myFlow";

const response = flowRunner.runFlowOnContent(flowName,
  [
    { "uri": "/customer1.json", "value": { "customerId": 1 } },
    { "uri": "/customer2.json", "value": { "customerId": 2 } }
  ],
  "jobId",
  {
    "stepOptions": {
      "1": {
        "throwHookErrorOnPurpose": true
      }
    }
  }
);

const stepResponse = response.stepResponses["1"];

const assertions = [
  test.assertEqual("failed", response.jobStatus,
    "If a custom hook fails, the job is considered to have failed and no step output is persisted"),
  test.assertEqual("1", response.lastAttemptedStep),
  test.assertEqual(undefined, response.lastCompletedStep),

  test.assertEqual(1, Object.keys(response.stepResponses).length,
    "The second step should not have been run since the first step stopped with an error"),
  test.assertEqual("failed step 1", stepResponse.status),
  test.assertEqual(1, stepResponse.stepOutput.length),
  test.assertEqual("Error running JavaScript request", stepResponse.stepOutput[0],
    "This is the generic MarkLogic error message from calling xdmp.invoke. While it is not helpful by itself, " +
    "it is expected that a user will look at the console.error logging or the Batch document for full details"),
  test.assertEqual(2, stepResponse.totalEvents, "Both items are considered to have been processed"),
  test.assertEqual(2, stepResponse.failedEvents, "Both items are considered to have failed due to the hook failure"),
  test.assertEqual(0, stepResponse.successfulEvents),
  test.assertEqual(1, stepResponse.failedBatches),
  test.assertEqual(0, stepResponse.successfulBatches),
  test.assertEqual(false, stepResponse.success)
];

assertions;