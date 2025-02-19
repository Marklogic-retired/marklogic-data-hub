import flowApi from "/data-hub/public/flow/flow-api.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";
const test = require("/test/test-helper.xqy");

const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const runtimeOptions = {};

const contentArray = [
  { "uri": "/duplicateCustomer.json", "value": { "customerId": "1" } },
  { "uri": "/duplicateCustomer.json", "value": { "customerId": "2" } }
];

const assertions = [];

const response = flowApi.runFlowOnContent(flowName, contentArray, jobId, runtimeOptions);

assertions.push(
  test.assertEqual("finished", response.jobStatus,
    "Job should have finished successfully with no conflicting updates error"),
  test.assertEqual(2, response.stepResponses["1"].successfulEvents)
);

const stagingRecord = hubTest.getStagingRecord("/duplicateCustomer.json");
assertions.push(
  test.assertEqual("2", stagingRecord.document.envelope.instance.customerId,
    "The second content object should have overwritten the first one in the write queue")
);

assertions;
