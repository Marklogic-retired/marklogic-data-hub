const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
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
      "2": {
        "throwInterceptorErrorOnPurpose": true
      }
    }
  }
);

const firstStepResponse = response.stepResponses["1"];
const secondStepResponse = response.stepResponses["2"];

const assertions = [
  test.assertEqual("failed", response.jobStatus,
    "If an interceptor fails, the job is considered to have failed and no step output is persisted"),
  test.assertEqual("2", response.lastAttemptedStep),
  test.assertEqual("1", response.lastCompletedStep),

  test.assertEqual("completed step 1", firstStepResponse.status),

  test.assertEqual(2, Object.keys(response.stepResponses).length),
  test.assertEqual("failed step 2", secondStepResponse.status),
  test.assertEqual(1, secondStepResponse.stepOutput.length),
  test.assertEqual("Error running JavaScript request", secondStepResponse.stepOutput[0],
    "This is the generic MarkLogic error message from calling xdmp.invoke. While it is not helpful by itself, " +
    "it is expected that a user will look at the console.error logging or the Batch document for full details. " + 
    "It is also not yet known how to improve this; i.e. if a new error is thrown with the data[0] value from the " + 
    "original error, the original stacktrace is lost."),
  test.assertEqual(2, secondStepResponse.totalEvents, "Both items are considered to have been processed"),
  test.assertEqual(2, secondStepResponse.failedEvents, "Both items are considered to have failed due to the hook failure"),
  test.assertEqual(0, secondStepResponse.successfulEvents),
  test.assertEqual(1, secondStepResponse.failedBatches),
  test.assertEqual(0, secondStepResponse.successfulBatches),
  test.assertEqual(false, secondStepResponse.success),

  test.assertEqual(0, hubTest.getUrisInCollection("customStepOne").length, 
    "No step output should have been written due to the interceptor failure"),
  test.assertEqual(0, hubTest.getUrisInCollection("customStepTwo").length, 
    "No step output should have been written due to the interceptor failure")
];

assertions;