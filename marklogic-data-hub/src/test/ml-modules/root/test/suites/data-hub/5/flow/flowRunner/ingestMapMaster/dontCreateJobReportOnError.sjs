const config = require("/com.marklogic.hub/config.sjs");
const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "myFlow";

const response = flowApi.runFlowOnContent(flowName,
  [{
    "uri": "/incomingCustomer.json",
    "value": {
      "envelope": {
        "instance": {
          "customerId": 1,
          "name": "New Jane",
          "status": "new status"    
        }
      }
    }
  }]
);

const assertions = [
  test.assertEqual("failed", response.jobStatus),
  test.assertEqual(0, hubTest.getUrisInCollection("sm-Customer-merged", config.FINALDATABASE).length, 
    "Because the custom step failed, nothing should have been persisted from the merging step"),
  test.assertEqual(1, hubTest.getUrisInCollection("Job", config.JOBDATABASE).length, 
    "The Job document should still have been written so the user knows what failed"),
  test.assertEqual(1, hubTest.getUrisInCollection("Batch", config.JOBDATABASE).length, 
    "The Batch document should still have been written so the user knows what failed"),
  test.assertEqual(0, hubTest.getUrisInCollection("JobReport", config.JOBDATABASE).length, 
    "The merging step should not automatically persist the JobReport; it needs to be added to the writeQueue so that " + 
    "it can be written after all the steps have completed")
];

assertions;
