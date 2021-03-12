const flowService = require("../lib/flowService.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const hubJsTest = require("/test/data-hub-test-helper.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];
const newFlowName = "newTestFlow";
const unchangedFlowName = "newUnchangedFlow"
const stepList = {};

let newFlow = {
  "name": newFlowName,
  "description": "description",
  "steps": {}
}

let unchangedFlow = {
  "name": unchangedFlowName,
  "description": "description",
  "steps": {}
}

// Create a flow and add steps
let flowTest = flowService.createFlow(newFlowName, "description");
let unchangedFlowTest = flowService.createFlow(unchangedFlowName, "description");
flowTest.steps = ["firstMapper-mapping", "secondMapper-mapping", "thirdMapper-mapping"];
flowTest = flowService.updateFlow(flowTest);
unchangedFlowTest.steps = ["firstMapper-mapping", "secondMapper-mapping", "thirdMapper-mapping"];
unchangedFlowTest = flowService.updateFlow(unchangedFlowTest);

// Get flows and verify they have 3 steps
flowTest = flowService.getFlow(newFlowName);
unchangedFlowTest = flowService.getFlow(unchangedFlowName);

assertions.push(
  test.assertEqual(3, Object.keys(flowTest.steps).length),
  test.assertEqual("firstMapper-mapping", flowTest.steps["1"].stepId),
  test.assertEqual("secondMapper-mapping", flowTest.steps["2"].stepId),
  test.assertEqual("thirdMapper-mapping", flowTest.steps["3"].stepId)
);

assertions.push(
  test.assertEqual(3, Object.keys(unchangedFlowTest.steps).length),
  test.assertEqual("firstMapper-mapping", unchangedFlowTest.steps["1"].stepId),
  test.assertEqual("secondMapper-mapping", unchangedFlowTest.steps["2"].stepId),
  test.assertEqual("thirdMapper-mapping", unchangedFlowTest.steps["3"].stepId)
);

// Update the description and verify
flowTest.description = "modified";
flowTest.steps = ["firstMapper-mapping", "secondMapper-mapping", "thirdMapper-mapping"];
flowTest = flowService.updateFlow(flowTest);

flowTest = flowService.getFlow(newFlowName);
assertions.push(
  test.assertEqual(flowTest.description, "modified"),
  test.assertEqual(flowTest.steps["1"].stepId, unchangedFlowTest.steps["1"].stepId),
  test.assertEqual(flowTest.steps["2"].stepId, unchangedFlowTest.steps["2"].stepId),
  test.assertEqual(flowTest.steps["3"].stepId, unchangedFlowTest.steps["3"].stepId),
);

// Reorder steps and verify
flowTest.steps = ["secondMapper-mapping", "firstMapper-mapping", "thirdMapper-mapping"];
let newFlowTest = flowService.updateFlow(flowTest);

newFlowTest = flowService.getFlow(newFlowName);
assertions.push(
  test.assertEqual(3, Object.keys(newFlowTest.steps).length),
  test.assertEqual("secondMapper-mapping", newFlowTest.steps["1"].stepId),
  test.assertEqual("firstMapper-mapping", newFlowTest.steps["2"].stepId),
  test.assertEqual("thirdMapper-mapping", newFlowTest.steps["3"].stepId)
);

// Reorder steps again and verify
flowTest.steps = ["secondMapper-mapping", "thirdMapper-mapping", "firstMapper-mapping"];
newFlowTest = flowService.updateFlow(flowTest);

newFlowTest = flowService.getFlow(newFlowName);
assertions.push(
  test.assertEqual(3, Object.keys(newFlowTest.steps).length),
  test.assertEqual("secondMapper-mapping", newFlowTest.steps["1"].stepId),
  test.assertEqual("thirdMapper-mapping", newFlowTest.steps["2"].stepId),
  test.assertEqual("firstMapper-mapping", newFlowTest.steps["3"].stepId)
);

assertions
