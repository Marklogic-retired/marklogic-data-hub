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
      "1": {
        "throwErrorForUris": ["/customer1.json"]
      }
    }
  }
);

const firstStepResponse = response.stepResponses["1"];
const secondStepResponse = response.stepResponses["2"];

const assertions = [
  test.assertEqual("finished_with_errors", response.jobStatus,
    "If any step fails and stops on error, the job is considered to have failed and no step output is written"),
  test.assertEqual("2", response.lastAttemptedStep),
  test.assertEqual("2", response.lastCompletedStep),

  test.assertEqual(2, Object.keys(response.stepResponses).length,
    "The second step should have been run since the first step is stopOnError != true"),
  test.assertEqual("completed with errors step 1", firstStepResponse.status),
  test.assertEqual(1, firstStepResponse.stepOutput.length),
  test.assertEqual("Throwing error on purpose for URI: /customer1.json", firstStepResponse.stepOutput[0]),
  test.assertEqual(2, firstStepResponse.totalEvents, "Both items should have been processed"),
  test.assertEqual(1, firstStepResponse.failedEvents),
  test.assertEqual(1, firstStepResponse.successfulEvents),
  test.assertEqual(1, firstStepResponse.failedBatches, "If at least one item failed, the batch is considered to have failed"),
  test.assertEqual(0, firstStepResponse.successfulBatches),
  test.assertEqual(false, firstStepResponse.success),

  test.assertEqual("completed step 2", secondStepResponse.status),
  test.assertEqual(1, secondStepResponse.totalEvents, 
    "The second step should have only received the successful item from the first step"),
  test.assertEqual(0, secondStepResponse.failedEvents),
  test.assertEqual(1, secondStepResponse.successfulEvents),
  test.assertEqual(0, secondStepResponse.failedBatches),
  test.assertEqual(1, secondStepResponse.successfulBatches),
  test.assertEqual(true, secondStepResponse.success),

  test.assertEqual(1, hubTest.getUrisInCollection("customStepOne").length, 
    "The doc that didn't failed should have been written to the first step's collection"),
  test.assertEqual(1, hubTest.getUrisInCollection("customStepTwo").length, 
    "The doc that didn't failed should have been written to the second step's collection")
];

const record = hubTest.getRecord("/customer2.json");
assertions.push(
  test.assertEqual("customStepOne", record.collections[0]),
  test.assertEqual("customStepTwo", record.collections[1]),
  test.assertEqual(2, record.document.customerId, 
    "Just verifying the content of the doc; the steps aren't expected to transform it")
);

assertions;