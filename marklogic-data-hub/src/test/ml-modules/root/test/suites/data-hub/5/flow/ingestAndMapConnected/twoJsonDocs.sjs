const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

/**
 * This test focuses on the details of the response object, while the one JSON doc test 
 * focuses on the details of the documents that are persisted.
 */
const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const options = {};
const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" } },
  { "uri": "/customer2.json", "value": { "customerId": "2" } }
];

const response = flowRunner.processContentWithFlow(flowName, contentArray, jobId, options);

const assertions = [
  test.assertNotEqual(null, response.jobId),
  test.assertEqual("finished", response.jobStatus),
  test.assertEqual("ingestAndMap", response.flow),
  test.assertEqual(xdmp.getCurrentUser(), response.user),
  test.assertEqual("2", response.lastAttemptedStep),
  test.assertEqual("2", response.lastCompletedStep),
  test.assertNotEqual(null, response.timeStarted),
  test.assertNotEqual(null, response.timeEnded),
  test.assertTrue(new Date(response.timeStarted) < new Date(response.timeEnded)),
  test.assertEqual(2, Object.keys(response.stepResponses).length)
];

const ingestResponse = response.stepResponses["1"];
const mapResponse = response.stepResponses["2"];

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
  test.assertTrue(new Date(ingestResponse.stepStartTime) < new Date(ingestResponse.stepEndTime)),

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

// Verify that the expected documents exist
assertions.concat(
  test.assertNotEqual(null, hubTest.getRecord("/customer1.json")),
  test.assertNotEqual(null, hubTest.getStagingRecord("/customer1.json")),
  test.assertNotEqual(null, hubTest.getRecord("/customer2.json")),
  test.assertNotEqual(null, hubTest.getStagingRecord("/customer2.json"))
);