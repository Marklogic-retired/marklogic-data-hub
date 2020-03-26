const test = require("/test/test-helper.xqy");
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

const assertions = [];

const flowName = "flowNameDoesntMatter";

// This module is known to exist, as it's in src/test/ml-modules
const result = datahub.flow.step.makeFunction(flowName, "echo", "/custom-modules/mapping-functions/custom-mapping-functions.sjs");
assertions.push(test.assertTrue(result != null));

try {
  datahub.flow.step.makeFunction("flowNameDoesntMatter", "main", "/doesnt/exist.sjs")
  throw Error("Expected makeFunction to fail because module path does not exist");
} catch (e) {
  console.log(e.data);
  console.log(e.data[2])
  assertions.push(test.assertEqual(
    "Unable to access module: /doesnt/exist.sjs. Verify that this module is in your modules database and that your user account has a role that grants read permission to this module.",
    e.data[2]
  ));
}

assertions;
