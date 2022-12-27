'use strict';

const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const Artifacts = mjsProxy.requireMjsModule("/data-hub/5/artifacts/core.mjs");
const flowService = require("../lib/flowService.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "flowWithOutOfOrderStepNumbers";
flowService.createFlow(flowName);

["first", "second", "third"].forEach(name => {
  stepService.createDefaultMappingStep(name);
  flowService.addStepToFlow(flowName, "mapping", name);
});

// Now manually change the step numbers so they're not in sequence
const flow = flowService.getFlow(flowName);
const steps = flow.steps;
steps["4"] = steps["1"];
steps["17"] = steps["2"];
steps["6"] = steps["3"];
delete steps["1"];
delete steps["2"];
delete steps["3"];
Artifacts.setArtifact("flow", flow.name, flow);

// Now add another step
stepService.createDefaultMappingStep("fourth");
flowService.addStepToFlow(flowName, "mapping", "fourth");

const updatedSteps = flowService.getFlow(flowName).steps;

[
  test.assertEqual(4, Object.keys(updatedSteps).length),
  test.assertEqual("fourth-mapping", updatedSteps["18"].stepId,
    "If the numbers are out of sequence, then when a new step is added, it'll get a step number equal to " +
    "the highest step number plus one"),

  test.assertEqual("first-mapping", updatedSteps["4"].stepId),
  test.assertEqual("second-mapping", updatedSteps["17"].stepId),
  test.assertEqual("third-mapping", updatedSteps["6"].stepId)
]
