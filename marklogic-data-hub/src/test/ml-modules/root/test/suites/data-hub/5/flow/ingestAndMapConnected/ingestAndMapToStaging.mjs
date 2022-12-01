const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const runtimeOptions = {
  "stepOptions": {
    "1": {
      "targetDatabase": "data-hub-STAGING"
    },
    "2": {
      "targetDatabase": "data-hub-STAGING"
    }
  }
};

const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" } }
];

flowApi.runFlowOnContent(flowName, contentArray, jobId, runtimeOptions);

const mappedCustomer = hubTest.getStagingRecord("/customer1.json");
const assertions = [
  test.assertEqual(1, mappedCustomer.document.envelope.instance.Customer.customerId,
    "Because both the ingestion and mapping step are writing the same URI to the same database, and the " +
    "mapping step runs after the ingestion step, the content object outputted by the mapping step " +
    "should overwrite the one outputted by the ingestion step")
];

assertions.concat(
  test.assertEqual(false, hubTest.finalDocumentExists("/customer1.json"), 
    "The doc should not exist in final since both steps write to staging")
)
