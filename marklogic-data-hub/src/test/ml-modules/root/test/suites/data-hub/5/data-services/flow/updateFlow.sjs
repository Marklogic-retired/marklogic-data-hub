const flowService = require("../lib/flowService.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const hubJsTest = require("/test/data-hub-test-helper.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];
const newFlowName = "newTestFlow";
const stepList = {};


// Create a flow and add steps
let flowTest = flowService.createFlow(newFlowName, "description");
let flowStepIds = JSON.stringify(["firstMapper-mapping", "secondMapper-mapping", "thirdMapper-mapping"]);
flowTest = flowService.updateFlow(newFlowName, "description", flowStepIds);

// Get flows and verify they have 3 steps
flowTest = flowService.getFlow(newFlowName);

assertions.push(
  test.assertEqual(3, Object.keys(flowTest.steps).length),
  test.assertEqual("firstMapper-mapping", flowTest.steps["1"].stepId),
  test.assertEqual("secondMapper-mapping", flowTest.steps["2"].stepId),
  test.assertEqual("thirdMapper-mapping", flowTest.steps["3"].stepId)
);

// Update the description and verify
flowTest = flowService.updateFlow(newFlowName, "modified", flowStepIds);
assertions.push(
  test.assertEqual(flowTest.description, "modified"),
  test.assertEqual("firstMapper-mapping", flowTest.steps["1"].stepId),
  test.assertEqual("secondMapper-mapping", flowTest.steps["2"].stepId),
  test.assertEqual("thirdMapper-mapping", flowTest.steps["3"].stepId)
);

// Reorder steps and verify
let newStepIds = JSON.stringify(["secondMapper-mapping", "firstMapper-mapping", "thirdMapper-mapping"]);
flowTest = flowService.updateFlow(newFlowName, "modified", newStepIds);

assertions.push(
  test.assertEqual(3, Object.keys(flowTest.steps).length),
  test.assertEqual("secondMapper-mapping", flowTest.steps["1"].stepId),
  test.assertEqual("firstMapper-mapping", flowTest.steps["2"].stepId),
  test.assertEqual("thirdMapper-mapping", flowTest.steps["3"].stepId)
);

// Reorder steps again and verify
newStepIds = JSON.stringify(["secondMapper-mapping", "thirdMapper-mapping", "firstMapper-mapping"]);
flowTest = flowService.updateFlow(newFlowName, "modified", newStepIds);

assertions.push(
  test.assertEqual(3, Object.keys(flowTest.steps).length),
  test.assertEqual("secondMapper-mapping", flowTest.steps["1"].stepId),
  test.assertEqual("thirdMapper-mapping", flowTest.steps["2"].stepId),
  test.assertEqual("firstMapper-mapping", flowTest.steps["3"].stepId)
);


assertions
