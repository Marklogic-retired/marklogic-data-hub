const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

// Used to verify the ingest response in both the RunFlowResponse and the job doc
function verifyIngestResponse(ingestResponse) {
  assertions.push(
    test.assertEqual("ingestAndMap", ingestResponse.flowName),
    test.assertEqual("ingestCustomer", ingestResponse.stepName),
    test.assertEqual("default-ingestion", ingestResponse.stepDefinitionName),
    test.assertEqual("ingestion", ingestResponse.stepDefinitionType),
    test.assertEqual("data-hub-STAGING", ingestResponse.targetDatabase),
    test.assertEqual("completed step 1", ingestResponse.status),
    test.assertEqual(2, ingestResponse.totalEvents),
    test.assertEqual(2, ingestResponse.successfulEvents),
    test.assertEqual(0, ingestResponse.failedEvents),
    test.assertEqual(1, ingestResponse.successfulBatches),
    test.assertEqual(0, ingestResponse.failedBatches),
    test.assertEqual(true, ingestResponse.success),
    test.assertTrue(new Date(ingestResponse.stepStartTime) < new Date(ingestResponse.stepEndTime))
  );
}

// Used to verify the map response in both the RunFlowResponse and the job doc
function verifyMapResponse(mapResponse) {
  assertions.push(
    test.assertEqual("ingestAndMap", mapResponse.flowName),
    test.assertEqual("mapCustomer", mapResponse.stepName),
    test.assertEqual("entity-services-mapping", mapResponse.stepDefinitionName),
    test.assertEqual("mapping", mapResponse.stepDefinitionType),
    test.assertEqual("http://example.org/Customer-0.0.1/Customer", mapResponse.targetEntityType),
    test.assertEqual("data-hub-FINAL", mapResponse.targetDatabase),
    test.assertEqual("completed step 2", mapResponse.status),
    test.assertEqual(2, mapResponse.totalEvents),
    test.assertEqual(2, mapResponse.successfulEvents),
    test.assertEqual(0, mapResponse.failedEvents),
    test.assertEqual(1, mapResponse.successfulBatches),
    test.assertEqual(0, mapResponse.failedBatches),
    test.assertEqual(true, mapResponse.success),
    test.assertTrue(new Date(mapResponse.stepStartTime) < new Date(mapResponse.stepEndTime))
  );
}

/**
 * This test focuses on the details of the response object, while the one JSON doc test
 * focuses on the details of the documents that are persisted.
 */
const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const options = {
  "stepOptions": {
    "1": {
      "customOption": "one"
    },
    "2": {
      "customOption": "two"
    }
  }
};
const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" } },
  { "uri": "/customer2.json", "value": { "customerId": "2" } }
];

const response = flowApi.runFlowOnContent(flowName, contentArray, jobId, options);

const assertions = [
  test.assertEqual("finished", response.jobStatus, "Unexpected status: " + xdmp.toJsonString(response)),
  test.assertEqual(jobId, response.jobId),
  test.assertEqual("ingestAndMap", response.flow),
  test.assertEqual(xdmp.getCurrentUser(), response.user),
  test.assertEqual("2", response.lastAttemptedStep),
  test.assertEqual("2", response.lastCompletedStep),
  test.assertNotEqual(null, response.timeStarted),
  test.assertNotEqual(null, response.timeEnded),
  test.assertTrue(new Date(response.timeStarted) < new Date(response.timeEnded)),
  test.assertEqual(2, Object.keys(response.stepResponses).length),
  test.assertTrue(new Date(response.stepResponses["1"].stepStartTime) > new Date(response.timeStarted),
    "The first step should start after the flow starts"),
  test.assertTrue(new Date(response.stepResponses["2"].stepStartTime) > new Date(response.stepResponses["1"].stepEndTime),
    "The second step should start after the first step ends")
];

verifyIngestResponse(response.stepResponses["1"]);
verifyMapResponse(response.stepResponses["2"]);

// Verify that the expected documents exist
assertions.push(
  test.assertNotEqual(null, hubTest.getRecord("/customer1.json")),
  test.assertNotEqual(null, hubTest.getStagingRecord("/customer1.json")),
  test.assertNotEqual(null, hubTest.getRecord("/customer2.json")),
  test.assertNotEqual(null, hubTest.getStagingRecord("/customer2.json"))
);

const jobRecord = hubTest.getJobRecord(jobId);
const job = jobRecord.document.job;
assertions.push(
  test.assertEqual(jobId, job.jobId),
  test.assertEqual(flowName, job.flow),
  test.assertEqual(xdmp.getCurrentUser(), job.user),
  test.assertTrue(job.timeStarted != null),
  test.assertTrue(job.timeEnded != null),
  test.assertTrue(new Date(job.timeStarted) < new Date(job.timeEnded)),
  test.assertEqual("finished", job.jobStatus),
  test.assertEqual("2", job.lastAttemptedStep),
  test.assertEqual("2", job.lastCompletedStep)
);

// The step response data in the RunFlowResponse should match what's in the job doc
verifyIngestResponse(job.stepResponses["1"]);
verifyMapResponse(job.stepResponses["2"]);

const batchRecord = hubTest.getFirstBatchRecord();
const batch = batchRecord.document.batch;
assertions.push(
  test.assertEqual(jobId, batch.jobId),
  test.assertTrue(batch.batchId != null),
  test.assertEqual(flowName, batch.flowName),
  test.assertTrue(batch.timeStarted != null),
  test.assertTrue(batch.timeEnded != null),
  test.assertTrue(new Date(batch.timeStarted) < new Date(batch.timeEnded)),
  test.assertEqual(xdmp.hostName(), batch.hostName),
  test.assertTrue(batch.reqTimeStamp != null),
  test.assertTrue(batch.reqTrnxID != null),
  test.assertEqual(2, batch.writeTransactions.length, "Because connected steps can result in writes to multiple databases, " +
    "we need to capture info about multiple transactions, and hence we need an array"),
  test.assertEqual("data-hub-STAGING", batch.writeTransactions[0].databaseName),
  test.assertTrue(batch.writeTransactions[0].transactionId != null),
  test.assertTrue(batch.writeTransactions[0].transactionDateTime != null),
  test.assertEqual("data-hub-FINAL", batch.writeTransactions[1].databaseName),
  test.assertTrue(batch.writeTransactions[1].transactionId != null),
  test.assertTrue(batch.writeTransactions[1].transactionDateTime != null)
);

const ingestResult = batch.stepResults[0];
assertions.push(
  test.assertEqual("ingestCustomer-ingestion", ingestResult.stepId),
  test.assertTrue(ingestResult.step != null),
  test.assertEqual("one", ingestResult.step.options.customOption, "Verifying that runtime options are included in the step"),
  test.assertEqual("1", ingestResult.stepNumber),
  test.assertEqual("finished", ingestResult.batchStatus),
  test.assertEqual(2, ingestResult.uris.length),
  test.assertEqual("/customer1.json", ingestResult.uris[0]),
  test.assertEqual("/customer2.json", ingestResult.uris[1]),
  test.assertTrue(ingestResult.stepStartDateTime != null),
  test.assertTrue(ingestResult.stepEndDateTime != null),
  test.assertTrue(new Date(ingestResult.stepStartDateTime) < new Date(ingestResult.stepEndDateTime))
);

const mapResult = batch.stepResults[1];
assertions.push(
  test.assertEqual("mapCustomer-mapping", mapResult.stepId),
  test.assertTrue(mapResult.step != null),
  test.assertEqual("two", mapResult.step.options.customOption, "Verifying that runtime options are included in the step"),
  test.assertEqual("2", mapResult.stepNumber),
  test.assertEqual("finished", mapResult.batchStatus),
  test.assertEqual(2, mapResult.uris.length),
  test.assertEqual("/customer1.json", mapResult.uris[0]),
  test.assertEqual("/customer2.json", mapResult.uris[1]),
  test.assertTrue(mapResult.stepStartDateTime != null),
  test.assertTrue(mapResult.stepEndDateTime != null),
  test.assertTrue(new Date(mapResult.stepStartDateTime) < new Date(mapResult.stepEndDateTime))
);

assertions.push(
  test.assertEqual(4, hubTest.getProvenanceCount(),
    "Expected 2 prov docs for the ingestion step, and 2 for the mapping step, as both have prov enabled")
);

assertions;
