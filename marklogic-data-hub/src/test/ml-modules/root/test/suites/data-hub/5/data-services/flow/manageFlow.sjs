const flowService = require("../lib/flowService.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const hubJsTest = require("/test/data-hub-test-helper.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];
const flowName = "testFlow";

let expectedFlow = {
  name: flowName,
  description: "description"
};

// Create and verify a flow
let serviceResponse = flowService.createFlow(flowName, "description");
hubJsTest.verifyJson(expectedFlow, serviceResponse, assertions);
hubJsTest.verifyJson(expectedFlow, flowService.getFlow(flowName), assertions);

// attempting to create another flow with the same name should fail
try {
  flowService.createFlow(flowName, "another description");
  test.assertFalse(fn.true(), "Exception should have been thrown for creating a flow with the same name.");
} catch (e) {
  test.assertEqual("400", e.data[0], "Exception should throw status code 400.");
  test.assertTrue(fn.contains(e.data[1], 'already exists'), "Exception should thrown due to already existing flow.");
}

// Create 3 mapping steps and add them to the flow
["firstMapper", "secondMapper", "thirdMapper"].forEach(mappingName => {
  let info = {
    name: mappingName,
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    selectedSource: "collection"
  };
  stepService.saveStep("mapping", info);
  flowService.addStepToFlow(flowName, "mapping", mappingName);
});

// Get the flow and verify it has 3 steps
let flow = flowService.getFlow(flowName);
assertions.push(
  test.assertEqual(3, Object.keys(flow.steps).length),
  test.assertEqual("firstMapper-mapping", flow.steps["1"].stepId),
  test.assertEqual("secondMapper-mapping", flow.steps["2"].stepId),
  test.assertEqual("thirdMapper-mapping", flow.steps["3"].stepId)
);

// Add a step that doesn't exist, verify it throws an error
try {
  flowService.addStepToFlow(flowName, "mapping", "stepThatDoesntExist");
  throw new Error("Expected an error because no step exists with the given name");
} catch (e) {
  test.assertEqual("400", e.data[0]);
  test.assertEqual("Could not find step with name stepThatDoesntExist and type mapping", e.data[1]);
}


// Remove the second step, verify the step numbers are adjusted
flowService.removeStepFromFlow(flowName, "2");
flow = flowService.getFlow(flowName);
assertions.push(
  test.assertEqual(2, Object.keys(flow.steps).length),
  test.assertEqual("firstMapper-mapping", flow.steps["1"].stepId),
  test.assertEqual("thirdMapper-mapping", flow.steps["2"].stepId)
);

// Remove the first step and verify
flowService.removeStepFromFlow(flowName, "1");
flow = flowService.getFlow(flowName);
assertions.push(
  test.assertEqual(1, Object.keys(flow.steps).length),
  test.assertEqual("thirdMapper-mapping", flow.steps["1"].stepId)
);

// Remove a step that doesn't exist, verify we get an error
try {
  flowService.removeStepFromFlow(flowName, "2");
  throw new Error("Error should have been thrown because only one step exists");
} catch (e) {
  assertions.push(
    test.assertEqual("400", e.data[0]),
    test.assertEqual("Cannot remove step; could not find in flow testFlow a step with number 2", e.data[1])
  );
}

// Delete the flow and verify an error is thrown when trying to get it
flowService.deleteFlow(flowName);
try {
  flowService.getFlow(flowName);
  throw new Error("Error should have been thrown because flow was deleted");
} catch (e) {
  assertions.push(
    test.assertEqual("404", e.data[0]),
    test.assertEqual("flow with name 'testFlow' not found", e.data[1])
  );
}

assertions
