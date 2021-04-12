const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const runtimeOptions = {
  "stepOptions": {
    "1": {
      "writeStepOutput": false,
      "fullOutput": true
    },
    "2": {
      "writeStepOutput": false,
      "fullOutput": true
    }
  }
};

const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" } },
  { "uri": "/customer2.json", "value": { "customerId": "2" } }
];

const assertions = [];

const response = flowRunner.processContentWithFlow(flowName, contentArray, jobId, runtimeOptions);

const ingestResponse = response.stepResponses["1"];
assertions.push(
  test.assertEqual("finished", response.jobStatus, "Unexpected status: " + xdmp.toJsonString(response)),
  test.assertEqual("completed step 1", ingestResponse.status),
  test.assertEqual(2, ingestResponse.successfulEvents),
  test.assertEqual(0, ingestResponse.failedEvents),
  test.assertEqual(1, ingestResponse.successfulBatches),
  test.assertEqual(2, Object.keys(ingestResponse.fullOutput).length),
  test.assertEqual("/customer1.json", ingestResponse.fullOutput["/customer1.json"].uri),
  test.assertEqual("/customer2.json", ingestResponse.fullOutput["/customer2.json"].uri)
);

const mapResponse = response.stepResponses["2"];
assertions.push(
  test.assertEqual("completed step 2", mapResponse.status),
  test.assertEqual(2, mapResponse.successfulEvents),
  test.assertEqual(0, mapResponse.failedEvents),
  test.assertEqual(1, mapResponse.successfulBatches),
  test.assertEqual(2, Object.keys(mapResponse.fullOutput).length),
  test.assertEqual("/customer1.json", mapResponse.fullOutput["/customer1.json"].uri),
  test.assertEqual("/customer2.json", mapResponse.fullOutput["/customer2.json"].uri)
);

assertions.push(
  test.assertEqual(false, hubTest.stagingDocumentExists("/customer1.json")),
  test.assertEqual(false, hubTest.finalDocumentExists("/customer1.json")),
  test.assertEqual(false, hubTest.stagingDocumentExists("/customer2.json")),
  test.assertEqual(false, hubTest.finalDocumentExists("/customer2.json"))
);

assertions;
