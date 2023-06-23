const test = require("/test/test-helper.xqy");

function invokeProcessQueryBatch(endpointConstants, endpointState = {}) {
  return fn.head(xdmp.invoke("/data-hub/data-services/stepRunner/processQueryBatch.mjs", {endpointConstants, endpointState}));
}

const endpointConstants = {options: {batchSize: 1}, flowName: "SimpleFlow", stepNumber: 3, jobId: "job1"};
const assertions = [];
const processQueryBatchResults1 = invokeProcessQueryBatch(endpointConstants, {});
xdmp.invokeFunction(() => assertions.push(
  test.assertTrue(fn.docAvailable("/custom-with-update-doc.json"), "Update should have occurred")
));

assertions;