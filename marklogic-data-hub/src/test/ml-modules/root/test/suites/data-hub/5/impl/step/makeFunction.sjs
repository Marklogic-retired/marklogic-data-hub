const test = require("/test/test-helper.xqy");
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

const assertions = [];

const flowName = "flowNameDoesntMatter";

// This module is known to exist, as it's in src/test/ml-modules
const result = datahub.flow.stepDefinition.makeFunction(flowName, "echo", "/custom-modules/mapping-functions/custom-mapping-functions.sjs");
assertions.push(test.assertTrue(result != null));

try {
  datahub.flow.stepDefinition.makeFunction("flowNameDoesntMatter", "main", "/doesnt/exist.sjs")
  throw Error("Expected makeFunction to fail because module path does not exist");
} catch (e) {
  console.log(e.data[1]);
  assertions.push([
    test.assertEqual("400", e.data[0]),
    test.assertEqual(
      "Unable to access module: /doesnt/exist.sjs. Verify that this module is in your modules database and that your user account has a role that grants read and execute permission to this module",
      e.data[1]
    )
  ]);
}

assertions;
