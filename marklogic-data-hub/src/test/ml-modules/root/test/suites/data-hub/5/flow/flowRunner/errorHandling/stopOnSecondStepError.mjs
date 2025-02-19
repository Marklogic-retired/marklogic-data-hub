import flowRunner from "/data-hub/5/flow/flowRunner.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";
const test = require("/test/test-helper.xqy");

const flowName = "myFlow";

xdmp.invokeFunction(() => {
  const response = flowRunner.runFlowOnContent(flowName,
    [
      { "uri": "/customer1.json", "value": { "customerId": 1 } },
      { "uri": "/customer2.json", "value": { "customerId": 2 } }
    ], "jobId", {
    "stepOptions": {
      "2": {
        "throwErrorOnPurpose": true,
        "stopOnError": true
      }
    }
  }
  );

  const firstStepResponse = response.stepResponses["1"];
  const secondStepResponse = response.stepResponses["2"];

  const assertions = [
    test.assertEqual("failed", response.jobStatus,
      "If any step fails and stops on error, the job is considered to have failed and no step output is written"),
    test.assertEqual("2", response.lastAttemptedStep),
    test.assertEqual("1", response.lastCompletedStep),

    test.assertEqual(2, Object.keys(response.stepResponses).length),
    test.assertEqual("completed step 1", firstStepResponse.status),
    test.assertEqual(2, firstStepResponse.totalEvents),
    test.assertEqual(0, firstStepResponse.failedEvents),
    test.assertEqual(2, firstStepResponse.successfulEvents),
    test.assertEqual(0, firstStepResponse.failedBatches),
    test.assertEqual(1, firstStepResponse.successfulBatches),
    test.assertEqual(true, firstStepResponse.success),

    test.assertEqual("failed step 2", secondStepResponse.status),
    test.assertEqual(1, secondStepResponse.stepOutput.length,
      "Should only have an error message for the first item; the second should not have been processed"),
    test.assertEqual("Throwing error on purpose", secondStepResponse.stepOutput[0]),
    test.assertEqual(1, secondStepResponse.totalEvents, "Only one item was processed"),
    test.assertEqual(1, secondStepResponse.failedEvents),
    test.assertEqual(0, secondStepResponse.successfulEvents),
    test.assertEqual(1, secondStepResponse.failedBatches),
    test.assertEqual(0, secondStepResponse.successfulBatches),
    test.assertEqual(false, secondStepResponse.success),

    test.assertEqual(0, hubTest.getUrisInCollection("customStepOne").length,
      "Even though step one succeeded, since step two failed with stopOnError=true, then the entire flow is " +
      "considered to have failed, and no content should have been written"),
    test.assertEqual(0, hubTest.getUrisInCollection("customStepTwo").length)
  ];

  assertions;
}, { update: "true" });