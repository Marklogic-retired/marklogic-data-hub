declareUpdate();

const mlSmMergeRest = require("/marklogic.rest.resource/mlSmMerge/assets/resource.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

const context = {};
const params = { mergeURI: ["/content/mergedCustomer.json"], retainAuditTrail: false,  blockFutureMerges: false, removeURI: ["/content/customerForUnmerge3.json"]};

const results = mlSmMergeRest.DELETE(context, params);

assertions.push(
  test.assertTrue(results.success, xdmp.describe(results)),
  test.assertEqual(1, results.mergeURIs.length, "One merged URI should be unmerged"),
  test.assertEqual(2,results.documentsRestored.length, "The restored documents must be 1")
);

assertions;


