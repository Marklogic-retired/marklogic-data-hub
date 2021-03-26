const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.xqy");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const StepExecutionContext = require("/data-hub/5/flow/stepExecutionContext.sjs");

const assertions = [];
const flowName = "doesntMatter";

// Simulate a processed URI so that prov can be generated
datahub.flow.writeQueue.addContent(xdmp.databaseName(xdmp.database()), {"uri": "test.json"});

const fakeFlow = {
  name:flowName,
  steps: {
    "1": {"name":"myStep", "stepDefinitionName": "myCustomStep", "stepDefinitionType": "custom"}
  }
};

// Try writing with an invalid input
let stepExecutionContext = new StepExecutionContext(fakeFlow, "1", {"name":"myCustomStep", "type": "unrecognized"});
stepExecutionContext.completedItems = ["test.json"];

datahub.flow.writeProvenanceData(stepExecutionContext);

assertions.push(test.assertEqual(null, hubTest.getFirstProvDocument(),
  "Because the type of the step definition is not a recognized value, a validation error should be logged, and no prov " +
  "document should have been written (it's not possible though to verify that the error was logged)."
));

// Verify that a valid input results in a prov doc being written
stepExecutionContext = new StepExecutionContext(fakeFlow, "1", {"name":"myCustomStep", "type": "custom"});
stepExecutionContext.completedItems = ["test.json"];

datahub.flow.writeProvenanceData(stepExecutionContext);

assertions.push(
  test.assertEqual("document", hubTest.getFirstProvDocument().xpath("/*/fn:local-name()"),
  "Since the inputs to writeProvenanceData were valid, and the prov granularity level defaults to " +
  "coarse, a single prov document (with root element name of 'document') should have been written"
));

assertions;
