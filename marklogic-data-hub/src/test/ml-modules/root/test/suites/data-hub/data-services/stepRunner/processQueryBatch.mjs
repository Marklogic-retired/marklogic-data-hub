const test = require("/test/test-helper.xqy");

function invokeProcessQueryBatch(endpointConstants, endpointState = {}) {
  return fn.head(xdmp.invoke("/data-hub/data-services/stepRunner/processQueryBatch.mjs", {endpointConstants, endpointState}));
}
const endpointConstants = {options: {batchSize: 3}, flowName: "SimpleFlow", stepNumber: 2, jobId: "job1"};
const assertions = [];
const processQueryBatchResults1 = invokeProcessQueryBatch(endpointConstants, {});
assertions.push(
  test.assertEqual("/content/3.json", processQueryBatchResults1.lastProcessedURI),
  test.assertEqual(["/content/1.json", "/content/2.json", "/content/3.json"], processQueryBatchResults1.uris)
);
const processQueryBatchResults2 = invokeProcessQueryBatch(endpointConstants, {lastProcessedURI: processQueryBatchResults1.lastProcessedURI});
assertions.push(test.assertTrue(processQueryBatchResults2 === null));

assertions;