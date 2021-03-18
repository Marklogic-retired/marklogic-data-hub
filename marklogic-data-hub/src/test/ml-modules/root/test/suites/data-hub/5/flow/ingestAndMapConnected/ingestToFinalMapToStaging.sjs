/**
 * Simple test to make sure that connected steps work for any target database.
 * Also a good exercise of step-specific options.
 */

const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const runtimeOptions = {
  "stepOptions": {
    "1": {
      "targetDatabase": "data-hub-FINAL"
    },
    "2": {
      "targetDatabase": "data-hub-STAGING"
    }
  }
};

const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" }}
];

flowRunner.processContentWithFlow(flowName, contentArray, jobId, runtimeOptions);

const mappedCustomer = hubTest.getStagingRecord("/customer1.json");
const assertions = [
  test.assertEqual(1, mappedCustomer.document.envelope.instance.Customer.customerId,
    "The mapping step should write to the staging database")
];

const ingestedCustomer = hubTest.getRecord("/customer1.json");
assertions.concat(
  test.assertEqual("1", ingestedCustomer.document.envelope.instance.customerId, 
    "The ingestion step should write to the final database")
);
