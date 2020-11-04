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
flowService.addStepToFlow(flowName, "mapping", mappingName);
flowService.addStepToFlow(flowName, "ingestion", ingestionName);
const flow = flowService.getFlowWithLatestJobInfo(flowName);

[
  test.assertEqual(flowName, flow.name),
  test.assertEqual(5, flow.steps.length, "Expecting the inline ingestion and referenced mapping and ingestion steps"),
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
  test.assertEqual("completed step 3", flow.steps[2].lastRunStatus),
  test.assertEqual("350e45u9-c1e9-4fa7-8269-d9aefe3b4b9a", flow.steps[2].jobId),
  test.assertEqual("2020-06-27T23:11:27.462273Z", flow.steps[2].stepEndTime),

  test.assertEqual("4", flow.steps[3].stepNumber),
  test.assertEqual(mappingName, flow.steps[3].stepName),
  test.assertEqual("mapping", flow.steps[3].stepDefinitionType),
  test.assertEqual("completed step 4", flow.steps[3].lastRunStatus),
  test.assertEqual("175da405-c1e9-4fa7-8269-d9cdfe3b4b9a", flow.steps[3].jobId),
  test.assertEqual("2020-06-28T23:11:30.836606Z", flow.steps[3].stepEndTime),

  test.assertEqual("5", flow.steps[4].stepNumber),
  test.assertEqual(ingestionName, flow.steps[4].stepName),
  test.assertEqual("ingestion", flow.steps[4].stepDefinitionType),
  test.assertEqual("completed step 5", flow.steps[4].lastRunStatus),
  test.assertEqual("350e45u9-c1e9-4fa7-8269-d9aefe3b4b9a", flow.steps[4].jobId),
  test.assertEqual("2020-06-27T23:11:32.572273Z", flow.steps[4].stepEndTime),
];
