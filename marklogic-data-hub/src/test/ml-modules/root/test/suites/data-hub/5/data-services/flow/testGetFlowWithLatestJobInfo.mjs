import flowService from "../lib/flowService.mjs";
import stepService from "../lib/stepService.mjs";
const test = require("/test/test-helper.xqy");


function testFlowLatestJobInfo() {
  const flowName = "flowWithStepDetails";
  const mappingName = "testMapper";
  const ingestionName = "testIngestion";

  stepService.createDefaultMappingStep(mappingName);
  flowService.addStepToFlow(flowName, "mapping", mappingName);

  stepService.createDefaultIngestionStep(ingestionName);
  flowService.addStepToFlow(flowName, "ingestion", ingestionName);

  const flow = flowService.getFlowWithLatestJobInfo(flowName);

  return [
    test.assertEqual(flowName, flow.name),
    test.assertEqual(4, flow.steps.length, "Expecting the inline ingestion and referenced mapping and ingestion steps"),
    test.assertEqual("1", flow.steps[0].stepNumber),
    test.assertEqual("ingestData", flow.steps[0].stepName),
    test.assertEqual("INGESTION", flow.steps[0].stepDefinitionType),
    test.assertEqual("completed step 1", flow.steps[0].lastRunStatus),
    test.assertEqual("293c638e-21e9-45b6-98cc-223d834f9222", flow.steps[0].jobId),
    test.assertEqual("2022-06-26T23:11:27.462273Z", flow.steps[0].stepEndTime),

    test.assertEqual("3", flow.steps[2].stepNumber),
    test.assertEqual(mappingName, flow.steps[2].stepName),
    test.assertEqual("mapping", flow.steps[2].stepDefinitionType),
    test.assertEqual("completed with errors step 3", flow.steps[2].lastRunStatus),
    test.assertEqual("293c638e-21e9-45b6-98cc-223d834f9222", flow.steps[2].jobId),
    test.assertEqual("2022-06-26T23:11:32.836606Z", flow.steps[2].stepEndTime),

    test.assertEqual("4", flow.steps[3].stepNumber),
    test.assertEqual(ingestionName, flow.steps[3].stepName),
    test.assertEqual("ingestion", flow.steps[3].stepDefinitionType),
    test.assertEqual("completed step 4", flow.steps[3].lastRunStatus),
    test.assertEqual("350e45u9-c1e9-4fa7-8269-d9aefe3b4b9a", flow.steps[3].jobId),
    test.assertEqual("2020-06-27T23:11:27.462273Z", flow.steps[3].stepEndTime)
  ];
}

function testAllFlowsLatestJobInfo() {
  const flows = flowService.getFlowsWithLatestJobInfo();
  const flowNames = flows.map(flow => flow.name);
  const flowWithStepDetails = flows.filter(flow => flow.name === "flowWithStepDetails")[0];
  const flowWithStepDetails2 = flows.filter(flow => flow.name === "flowWithStepDetails2")[0];
  return [
    test.assertEqual(2, flows.length, "Expecting both flows job data is returned"),
    test.assertTrue(flowNames.includes("flowWithStepDetails") && flowNames.includes("flowWithStepDetails2")),
    test.assertEqual(4, flowWithStepDetails.steps.length),
    test.assertEqual(1, flowWithStepDetails2.steps.length),
    test.assertEqual("293c638e-21e9-45b6-98cc-223d834f9222", flowWithStepDetails.steps[0].jobId),
    test.assertEqual("350da405-c1e9-4fa7-8269-d9aefe3b4bzz", flowWithStepDetails2.steps[0].jobId),
    test.assertTrue(flowWithStepDetails.steps[0].stepEndTime != null),
    test.assertTrue(flowWithStepDetails2.steps[0].stepEndTime != null)
  ]
}

const assertions = []
  .concat(testFlowLatestJobInfo())
  .concat(testAllFlowsLatestJobInfo());

assertions;
