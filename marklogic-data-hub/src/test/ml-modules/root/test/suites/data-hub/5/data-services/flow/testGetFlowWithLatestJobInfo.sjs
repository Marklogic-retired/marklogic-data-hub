const flowService = require("../lib/flowService.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "flowWithStepDetails";
const mappingName = "testMapper";
const ingestionName = "testIngestion";

stepService.createDefaultMappingStep(mappingName);
flowService.addStepToFlow(flowName, "mapping", mappingName);

stepService.createDefaultIngestionStep(ingestionName);
flowService.addStepToFlow(flowName, "ingestion", ingestionName);

const flow = flowService.getFlowWithLatestJobInfo(flowName);

[
  test.assertEqual(flowName, flow.name),
  test.assertEqual(3, flow.steps.length, "Expecting the inline ingestion and referenced mapping and ingestion steps"),
  test.assertEqual("1", flow.steps[0].stepNumber),
  test.assertEqual("ingestData", flow.steps[0].stepName),
  test.assertEqual("INGESTION", flow.steps[0].stepDefinitionType),
  test.assertEqual("completed step 1", flow.steps[0].lastRunStatus),
  test.assertEqual("293c638e-21e9-45b6-98cc-223d834f9222", flow.steps[0].jobId),
  test.assertEqual("2020-06-26T23:11:27.462273Z", flow.steps[0].stepEndTime),

  test.assertEqual("2", flow.steps[1].stepNumber),
  test.assertEqual(mappingName, flow.steps[1].stepName),
  test.assertEqual("mapping", flow.steps[1].stepDefinitionType),
  test.assertEqual("completed with errors step 2", flow.steps[1].lastRunStatus),
  test.assertEqual("293c638e-21e9-45b6-98cc-223d834f9222", flow.steps[1].jobId),
  test.assertEqual("2020-06-26T23:11:32.836606Z", flow.steps[1].stepEndTime),

  test.assertEqual("3", flow.steps[2].stepNumber),
  test.assertEqual(ingestionName, flow.steps[2].stepName),
  test.assertEqual("ingestion", flow.steps[2].stepDefinitionType),
  test.assertEqual(undefined, flow.steps[2].lastRunStatus),
  test.assertEqual(undefined, flow.steps[2].jobId),
  test.assertEqual(undefined, flow.steps[2].stepEndTime)
];
