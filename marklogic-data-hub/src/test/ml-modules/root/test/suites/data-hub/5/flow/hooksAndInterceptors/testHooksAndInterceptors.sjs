const config = require("/com.marklogic.hub/config.sjs");
const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const response = flowApi.runFlowOnContent("simpleMappingFlow",
  [{
    "uri": "/customer1.json",
    "value": {
      "customerId": 1,
      "name": "Jane"
    }
  }],
  sem.uuidString(), {}
);

const message = "Unexpected response: " + xdmp.toJsonString(response);
const assertions = [
  test.assertEqual("finished", response.jobStatus, message),
  test.assertEqual("completed step 1", response.stepResponses["1"].status, message),
  test.assertEqual("completed step 2", response.stepResponses["2"].status, message)
];

const mappedCustomer = hubTest.getRecord("/customer1.json");

assertions.push(
  test.assertEqual("world", mappedCustomer.document.envelope.headers.interceptorHeader,
    "Verifying that the interceptor was invoked correctly")
);

const beforeHookDoc = hubTest.getRecord("/beforeHook/customer1.json", config.STAGINGDATABASE);
assertions.push(
  test.assertEqual("Jane", beforeHookDoc.document.name, "Since the hook is a 'before' one, the document written by the hook " +
    "should be the input document, and it should be written to the source database for the step, which is staging"),
  test.assertEqual(1, beforeHookDoc.document.customerId)
);

const afterHookDoc = hubTest.getRecord("/afterHook/customer1.json", config.FINALDATABASE);
assertions.push(
  test.assertEqual("world", afterHookDoc.document.envelope.headers.interceptorHeader, 
    "Starting in 5.5, an 'after' hook receives the output content array from a step instead of the input " + 
    "content array. So the hook should see the data added by the interceptor.")
);

assertions;
