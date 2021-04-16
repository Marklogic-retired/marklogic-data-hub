const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.xqy");
const flowProvenance = require("/data-hub/5/flow/flowProvenance.sjs");
const StepExecutionContext = require("/data-hub/5/flow/stepExecutionContext.sjs");

const assertions = [];
const flowName = "doesntMatter";

const fakeFlow = {
  name:flowName,
  steps: {
    "1": {"name":"myStep", "stepDefinitionName": "myCustomStep", "stepDefinitionType": "custom"}
  }
};

// Try writing with an invalid input
let stepExecutionContext = new StepExecutionContext(fakeFlow, "1", {"name":"myCustomStep", "type": "unrecognized"});
stepExecutionContext.completedItems = ["test.json"];

flowProvenance.writeProvenanceData(stepExecutionContext, [{"uri": "test.json"}]);

assertions.push(test.assertEqual(null, hubTest.getFirstProvDocument(),
  "Because the type of the step definition is not a recognized value, a validation error should be logged, and no prov " +
  "document should have been written (it's not possible though to verify that the error was logged)."
));

// Verify that a valid input results in a prov doc being written
stepExecutionContext = new StepExecutionContext(fakeFlow, "1", {"name":"myCustomStep", "type": "custom"});
stepExecutionContext.completedItems = ["test.json"];

flowProvenance.writeProvenanceData(stepExecutionContext, [{"uri": "test.json"}]);

assertions.push(
  test.assertEqual("document", hubTest.getFirstProvDocument().xpath("/*/fn:local-name()"),
  "Since the inputs to writeProvenanceData were valid, and the prov granularity level defaults to " +
  "coarse, a single prov document (with root element name of 'document') should have been written"
));

assertions;
