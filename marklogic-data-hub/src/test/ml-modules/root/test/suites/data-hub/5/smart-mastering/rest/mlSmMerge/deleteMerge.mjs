const mlSmMergeRest = require("/marklogic.rest.resource/mlSmMerge/assets/resource.xqy");
const test = require("/test/test-helper.xqy");

const assertions = [];

function callDelete(context, params, document) {
  return fn.head(xdmp.invokeFunction(() => mlSmMergeRest.delete(context, params).toObject()));
}

xdmp.invokeFunction(() => {
  const context = {};
  const params = {
    mergeURI: ["/content/mergedCustomer.json"],
    retainAuditTrail: false,
    blockFutureMerges: false,
    removeURI: ["/content/customerForUnmerge3.json"]
  };

  const results = callDelete(context, params);

  assertions.push(
    test.assertTrue(results.success, xdmp.toJsonString(results)),
    test.assertEqual(1, results.mergeURIs.length, "One merged URI should be unmerged"),
    test.assertEqual(1, results.documentsRestored.length, `The restored documents must be 1. Documents restored: ${xdmp.toJsonString(results.documentsRestored)}`)
  );
}, {update: "true"});

assertions;


