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
  test.assertEqual(2, Object.keys(response.stepResponses).length),

  test.assertEqual("completed step 1", firstStepResponse.status),
  test.assertEqual(2, firstStepResponse.totalEvents),
  test.assertEqual(0, firstStepResponse.failedEvents),
  test.assertEqual(2, firstStepResponse.successfulEvents),
  test.assertEqual(0, firstStepResponse.failedBatches),
  test.assertEqual(1, firstStepResponse.successfulBatches),
  test.assertEqual(true, firstStepResponse.success),

  test.assertEqual("completed with errors step 2", secondStepResponse.status),
  test.assertEqual(1, secondStepResponse.stepOutput.length),
  test.assertEqual("Throwing error on purpose for URI: /customer1.json", secondStepResponse.stepOutput[0]),
  test.assertEqual(2, secondStepResponse.totalEvents),
  test.assertEqual(1, secondStepResponse.failedEvents),
  test.assertEqual(1, secondStepResponse.successfulEvents),
  test.assertEqual(1, secondStepResponse.failedBatches),
  test.assertEqual(0, secondStepResponse.successfulBatches),
  test.assertEqual(false, secondStepResponse.success),

  test.assertEqual(2, hubTest.getUrisInCollection("customStepOne").length, 
    "Since step one completed both docs, both should have been written to the step one colletion"),
  test.assertEqual(1, hubTest.getUrisInCollection("customStepTwo").length, 
    "The doc that didn't failed should have been written to the second step's collection")
];

const customer1 = hubTest.getRecord("/customer1.json");
assertions.push(
  test.assertEqual("customStepOne", customer1.collections[0]),
  test.assertEqual(1, customer1.collections.length),
  test.assertEqual(1, customer1.document.customerId)
);

const customer2 = hubTest.getRecord("/customer2.json");
assertions.push(
  test.assertEqual("customStepOne", customer2.collections[0]),
  test.assertEqual("customStepTwo", customer2.collections[1]),
  test.assertEqual(2, customer2.collections.length),
  test.assertEqual(2, customer2.document.customerId)
);

assertions;