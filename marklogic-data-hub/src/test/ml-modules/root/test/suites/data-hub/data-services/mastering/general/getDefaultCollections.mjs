const test = require("/test/test-helper.xqy");

function invokeService(entityType) {
  return fn.head(xdmp.invoke(
    "/data-hub/data-services/mastering/getDefaultCollections.mjs",
    {"entityType": entityType}
  ));
}

let response = invokeService("Order");

let assertions = [
  test.assertEqual("sm-Order-mastered", response.onMerge[0]),
  test.assertEqual("Order", response.onMerge[1]),
  test.assertEqual("sm-Order-merged", response.onMerge[2]),
  test.assertEqual("sm-Order-mastered", response.onNoMatch[0]),
  test.assertEqual("Order", response.onNoMatch[1]),
  test.assertEqual("sm-Order-archived", response.onArchive[0]),
  test.assertEqual("sm-Order-notification", response.onNotification[0]),
  test.assertEqual("sm-Order-auditing", response.onAuditing[0])
];

// test with full entity type IRI
response = invokeService("http://example.org/Order-0.0.1/Order");
assertions.concat([
  test.assertEqual("sm-Order-mastered", response.onMerge[0]),
  test.assertEqual("Order", response.onMerge[1]),
  test.assertEqual("sm-Order-merged", response.onMerge[2]),
  test.assertEqual("sm-Order-mastered", response.onNoMatch[0]),
  test.assertEqual("Order", response.onNoMatch[1]),
  test.assertEqual("sm-Order-archived", response.onArchive[0]),
  test.assertEqual("sm-Order-notification", response.onNotification[0]),
  test.assertEqual("sm-Order-auditing", response.onAuditing[0])
]);
