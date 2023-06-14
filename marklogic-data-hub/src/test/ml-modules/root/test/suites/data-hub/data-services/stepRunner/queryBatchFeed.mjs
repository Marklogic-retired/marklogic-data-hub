const test = require("/test/test-helper.xqy");

function invokeProcessQueryBatch(endpointConstants, endpointState = {}) {
  const [newState, results] = xdmp.invoke("/data-hub/data-services/stepRunner/queryBatchFeed.mjs", {endpointConstants, endpointState}).toArray();
  return {endpointState: newState, results};
}

const endpointConstants = {options: {batchSize: 3}, flowName: "SimpleFlow", stepNumber: 2, jobId: "job1"};
const assertions = [];
let response = invokeProcessQueryBatch(endpointConstants);
const processQueryBatchResults1 = response.results;
let message = `Results: ${xdmp.toJsonString(processQueryBatchResults1)}`;
assertions.push(
  test.assertEqual("/content/3.json", response.endpointState.lastProcessedURI, message),
  test.assertEqual(["/content/1.json", "/content/2.json", "/content/3.json"], processQueryBatchResults1.options.uris, message)
);
response = invokeProcessQueryBatch(endpointConstants, response.endpointState);
message = `Results: ${xdmp.toJsonString(response)}`;
const processQueryBatchResults2 = response.results;
assertions.push(
  test.assertTrue(response.endpointState.endOfJob, message),
  test.assertEqual("/content/5.json", response.endpointState.lastProcessedURI, message),
  test.assertEqual(["/content/4.json", "/content/5.json"], processQueryBatchResults2.options.uris, message)
);

assertions;