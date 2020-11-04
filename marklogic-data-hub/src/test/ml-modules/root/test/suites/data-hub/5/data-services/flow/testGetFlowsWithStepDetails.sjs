const flowService = require("../lib/flowService.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const hubJsTest = require("/test/data-hub-test-helper.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "flowWithStepDetails";
const mappingName = "testMapper";
const ingestionName = "testIngestion";


stepService.createDefaultMappingStep(mappingName);
flowService.addStepToFlow(flowName, "mapping", mappingName);

stepService.createDefaultIngestionStep(ingestionName);
flowService.addStepToFlow(flowName, "ingestion", ingestionName);
flowService.addStepToFlow(flowName, "mapping", mappingName);
flowService.addStepToFlow(flowName, "ingestion", ingestionName);
const flows = flowService.getFlowsWithStepDetails();
const flow = flows[0];

[
  test.assertEqual(1, flows.length, "Expecting just the single flow"),
  test.assertEqual(flowName, flow.name),
  test.assertFalse(flow.hasOwnProperty("description"), "Descripton isn't present because the flow doesn't have one"),

  test.assertEqual(5, flow.steps.length, "Expecting the inline ingestion and referenced mapping and ingestion steps"),

  test.assertEqual("1", flow.steps[0].stepNumber),
  test.assertEqual("ingestData", flow.steps[0].stepName),
  test.assertEqual("INGESTION", flow.steps[0].stepDefinitionType),
  test.assertEqual(undefined, flow.steps[0].stepId),

  test.assertEqual("2", flow.steps[1].stepNumber),
  test.assertEqual(mappingName, flow.steps[1].stepName),
  test.assertEqual("mapping", flow.steps[1].stepDefinitionType),
  test.assertEqual(undefined, flow.steps[1].sourceFormat),
  test.assertEqual("http://example.org/Customer-0.0.1/Customer", flow.steps[1].targetEntityType),
  test.assertEqual(mappingName + "-mapping", flow.steps[1].stepId),

  test.assertEqual("3", flow.steps[2].stepNumber),
  test.assertEqual(ingestionName, flow.steps[2].stepName),
  test.assertEqual("ingestion", flow.steps[2].stepDefinitionType),
  test.assertEqual("json", flow.steps[2].sourceFormat),
  test.assertEqual(ingestionName + "-ingestion", flow.steps[2].stepId),

  test.assertEqual("4", flow.steps[3].stepNumber),
  test.assertEqual(mappingName, flow.steps[3].stepName),
  test.assertEqual("mapping", flow.steps[3].stepDefinitionType),
  test.assertEqual(undefined, flow.steps[3].sourceFormat),
  test.assertEqual("http://example.org/Customer-0.0.1/Customer", flow.steps[3].targetEntityType),
  test.assertEqual(mappingName + "-mapping", flow.steps[3].stepId),

  test.assertEqual("5", flow.steps[4].stepNumber),
  test.assertEqual(ingestionName, flow.steps[4].stepName),
  test.assertEqual("ingestion", flow.steps[4].stepDefinitionType),
  test.assertEqual("json", flow.steps[4].sourceFormat),
  test.assertEqual(ingestionName + "-ingestion", flow.steps[4].stepId),
];
