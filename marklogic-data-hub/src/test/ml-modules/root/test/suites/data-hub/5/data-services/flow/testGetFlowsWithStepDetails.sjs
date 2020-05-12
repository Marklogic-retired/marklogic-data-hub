const flowService = require("../lib/flowService.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const hubJsTest = require("/test/data-hub-test-helper.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "flowWithStepDetails";
const mappingName = "testMapper";

stepService.createDefaultMappingStep(mappingName);
flowService.addStepToFlow(flowName, "mapping", mappingName);

const flows = flowService.getFlowsWithStepDetails();
const flow = flows[0];

[
  test.assertEqual(1, flows.length, "Expecting just the single flow"),
  test.assertEqual(flowName, flow.name),
  test.assertFalse(flow.hasOwnProperty("description"), "Descripton isn't present because the flow doesn't have one"),

  test.assertEqual(2, flow.steps.length, "Expecting the inline ingestion and referenced mapping steps"),

  test.assertEqual("1", flow.steps[0].stepNumber),
  test.assertEqual("ingestData", flow.steps[0].stepName),
  test.assertEqual("INGESTION", flow.steps[0].stepDefinitionType),

  test.assertEqual("2", flow.steps[1].stepNumber),
  test.assertEqual(mappingName, flow.steps[1].stepName),
  test.assertEqual("mapping", flow.steps[1].stepDefinitionType)
];
