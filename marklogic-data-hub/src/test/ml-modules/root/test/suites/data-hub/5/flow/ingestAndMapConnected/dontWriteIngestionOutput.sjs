const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const runtimeOptions = {
  "stepOptions": {
    "1": {
      "writeStepOutput": false
    }
  }
};

const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" } }
];

const assertions = [];

const response = flowRunner.processContentWithFlow(flowName, contentArray, jobId, runtimeOptions);

const ingestResponse = response.stepResponses["1"];
assertions.push(
  test.assertEqual("finished", response.jobStatus),
  test.assertEqual("completed step 1", ingestResponse.status, "The step is still considered to have completed successfully, even though it didn't write anything"),
  test.assertEqual(1, ingestResponse.successfulEvents),
  test.assertEqual(0, ingestResponse.failedEvents),
  test.assertEqual(1, ingestResponse.successfulBatches)
);

assertions.push(
  test.assertEqual(false, hubTest.stagingDocumentExists("/customer1.json"), 
    "Because writeStepOutput=true for the ingestion step, no output should have been persisted")
);

const mappedCustomer = hubTest.getRecord("/customer1.json");
assertions.push(
  test.assertEqual(1, mappedCustomer.document.envelope.instance.Customer.customerId, 
    "The output of the mapping step should have been written"
  )
);

assertions;
