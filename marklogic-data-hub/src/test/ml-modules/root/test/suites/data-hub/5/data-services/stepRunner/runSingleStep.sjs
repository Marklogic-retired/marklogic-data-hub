const StepRunner = require("/data-hub/5/impl/step-runner.sjs");
const test = require("/test/test-helper.xqy");

const stepRunner = new StepRunner();

const workUnit = {
  flowName: "PersonFlow",
  steps: ["1"],
  batchSize: 2,
  jobId: "job123"
};
let endpointState = {};

let results = stepRunner.runSteps(workUnit, endpointState).toArray();
endpointState = results[0];
let batchResponse = results[1];

let assertions = [
  test.assertEqual("/content/person2.json", endpointState.lastProcessedItem),
  test.assertEqual("job123", endpointState.jobId),

  test.assertEqual("job123", batchResponse.jobId),
  test.assertEqual(2, batchResponse.totalCount),
  test.assertEqual(0, batchResponse.errorCount),
  test.assertEqual("/content/person1.json", batchResponse.completedItems[0]),
  test.assertEqual("/content/person2.json", batchResponse.completedItems[1])
];

results = stepRunner.runSteps(workUnit, endpointState).toArray();
endpointState = results[0];
batchResponse = results[1];

assertions.push(
  test.assertEqual("/content/person3.json", endpointState.lastProcessedItem),
  test.assertEqual("job123", endpointState.jobId),

  test.assertEqual("job123", batchResponse.jobId),
  test.assertEqual(1, batchResponse.totalCount),
  test.assertEqual(0, batchResponse.errorCount),
  test.assertEqual("/content/person3.json", batchResponse.completedItems[0])
);

results = stepRunner.runSteps(workUnit, endpointState);

assertions.concat(
  test.assertEqual(undefined, results,
    "Since all the items have been processed, the endpoint should not return anything, indicating that the step is complete")
);
