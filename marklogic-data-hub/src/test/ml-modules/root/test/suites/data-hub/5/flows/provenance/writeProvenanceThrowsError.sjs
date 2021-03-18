const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.xqy");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

const assertions = [];
const jobId = "job123";
const flowName = "doesntMatter";
const flowStep = {"name":"myStep", "stepDefinitionName": "myCustomStep", "stepDefinitionType": "custom"};

// Simulate a processed URI so that prov can be generated
datahub.flow.writeQueue.addContent(xdmp.databaseName(xdmp.database()), {"uri": "test.json"});
datahub.flow.globalContext.completedItems = ["test.json"];

// Try writing with an invalid input
datahub.flow.writeProvenanceData(jobId, flowName,
  {"name":"myCustomStep", "type": "unrecognized"}, flowStep
);
assertions.push(test.assertEqual(null, hubTest.getFirstProvDocument(),
  "Because the type of the step definition is not a recognized value, a validation error should be logged, and no prov " +
  "document should have been written (it's not possible though to verify that the error was logged)."
));

// Verify that a valid input results in a prov doc being written
datahub.flow.writeProvenanceData(jobId, flowName,
  {"name":"myCustomStep", "type": "custom"}, flowStep
);
assertions.push(
  test.assertEqual("document", hubTest.getFirstProvDocument().xpath("/*/fn:local-name()"),
  "Since the inputs to writeProvenanceData were valid, and the prov granularity level defaults to " +
  "coarse, a single prov document (with root element name of 'document') should have been written"
));

assertions;
