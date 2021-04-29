const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const runtimeOptions = {};
const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" } }
];
const stepNumbers = ["1"];

const assertions = [];

const response = flowApi.runFlowOnContent(flowName, contentArray, jobId, runtimeOptions, stepNumbers);

assertions.push(
  test.assertEqual("finished", response.jobStatus),
  test.assertEqual("completed step 1", response.stepResponses["1"].status),
  test.assertEqual(1, Object.keys(response.stepResponses).length, 
    "Only the first step should have been run")
);

const job = hubTest.getJobRecord(jobId).document.job;
assertions.push(
  test.assertEqual("finished", job.jobStatus),
  test.assertEqual("completed step 1", job.stepResponses["1"].status),
  test.assertEqual(1, Object.keys(response.stepResponses).length)
);

const batch = hubTest.getFirstBatchRecord().document.batch;
assertions.push(
  test.assertEqual(jobId, batch.jobId),
  test.assertEqual(1, batch.stepResults.length, "Should only have one step result since only one step was run on the batch")
);

assertions;
