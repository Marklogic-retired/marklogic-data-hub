// Example of a test module that runs a step in a flow and verifies the output of the step, without any data
// actually being written to MarkLogic. 

const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require('/test/test-helper.xqy');

const contentArray = [{
  "uri": "/can/be/anything.json",
  "value": {
    "CustomerID": 3,
    "Name": {
      "FirstName": "Jane",
      "LastName": "Smith"
    }
  }
}];

const flowName = "CurateCustomerJSON";
const runtimeOptions = {};
const result = flowApi.runFlowStepOnContent(flowName, "2", contentArray, runtimeOptions);

const assertions = [
  test.assertEqual("completed step 2", result.stepResponse.status),
  test.assertEqual(1, result.contentArray.length)
];

const content = result.contentArray[0];
const context = content.context;
const customer = content.value.toObject().envelope.instance.Customer;

assertions.push(
  test.assertEqual(3, customer.customerId),
  test.assertEqual("Jane Smith", customer.name, "FirstName and LastName should have been concatenated together"),
  test.assertEqual(2, context.collections.length),
  test.assertEqual("Customer", context.collections[0]),
  test.assertEqual("mapCustomersJSON", context.collections[1])
);

assertions
