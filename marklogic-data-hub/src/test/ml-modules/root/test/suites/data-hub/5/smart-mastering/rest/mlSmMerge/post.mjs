const mlSmMergeRest = require("/marklogic.rest.resource/mlSmMerge/assets/resource.xqy");
const test = require("/test/test-helper.xqy");

function callPost(context, params, document) {
  return fn.head(xdmp.invokeFunction(() => mlSmMergeRest.post(context, params, document).toObject()));
}

const assertions = [];

const emptyDocument = new NodeBuilder().startDocument().endDocument().toNode();
const context = {};
const validMergeParams = {preview: "true", flowName: "CurateCustomerJSON", step: "2", uri: ["/content/customer1.json", "/content/customer2.json"]};

const validResults = callPost(context, validMergeParams, emptyDocument);

assertions.push(
  test.assertTrue(validResults.success, "Merge should be successful"),
  test.assertEqual(2, validResults.mergedURIs.length),
  test.assertTrue(validResults.mergedDocument.value.envelope.headers.interceptorCalled, "Interceptor should be called on merge.")
);

const differentFlowMergeParams = {flowName: "CurateCustomerJSON2", uri: ["/content/customer1.json", "/content/customer2.json"]};

const resultsWithDifferentFlow = callPost(context, differentFlowMergeParams, emptyDocument);
assertions.push(
  test.assertTrue(resultsWithDifferentFlow.success, `Merge should be successful. Result: ${xdmp.toJsonString(resultsWithDifferentFlow)}`),
  test.assertEqual(2, resultsWithDifferentFlow.mergedURIs.length),
  test.assertTrue(resultsWithDifferentFlow.mergedDocument.value.envelope.headers.interceptorCalled, "Interceptor should be called on merge.")
);

const validMergeParamsWithoutStep = {preview: "true", flowName: "CurateCustomerJSON", uri: ["/content/customer1.json", "/content/customer2.json"]};

const validResultsWithoutStep = callPost(context, validMergeParamsWithoutStep, emptyDocument);

assertions.push(
  test.assertTrue(validResultsWithoutStep.success, "Merge should be successful"),
  test.assertEqual(2, validResultsWithoutStep.mergedURIs.length),
  test.assertTrue(validResultsWithoutStep.mergedDocument.value.envelope.headers.interceptorCalled, "Interceptor should be called on merge.")
);

// test preview without existing merge step should succeed
const validPreviewMergeParams = {preview: "true", flowName: "CurateCustomerJSON2", uri: ["/content/customerWithoutMerge1.json", "/content/customerWithoutMerge2.json"]};
const validPreviewMergeResults = callPost(context, validPreviewMergeParams, emptyDocument);
assertions.push(
  test.assertTrue(validPreviewMergeResults.success, "Merge should be successful"),
  test.assertEqual(2, validPreviewMergeResults.mergedURIs ? validPreviewMergeResults.mergedURIs.length: 0, `Results: ${xdmp.toJsonString(validPreviewMergeResults)}`)
);

// attempt to merge without existing merge should fail
const invalidMergeParams = {flowName: "CurateCustomerJSON2", uri: ["/content/customerWithoutMerge1.json", "/content/customerWithoutMerge2.json"]};
try {
  callPost(context, invalidMergeParams, emptyDocument);
  assertions.push(test.assertTrue(false, "Merge should have failed"));
} catch (e) {
  assertions.push(test.assertEqual("400", e.data ? e.data[0]:"", xdmp.toJsonString(e)));
  assertions.push(test.assertEqual("The step referenced must be a merging step. Step type: matching", e.data[1], xdmp.toJsonString(e)));
}

assertions;