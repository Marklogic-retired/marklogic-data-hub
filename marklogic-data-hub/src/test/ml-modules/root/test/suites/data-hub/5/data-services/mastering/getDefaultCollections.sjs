const test = require("/test/test-helper.xqy");

function invokeService(entityType) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/mastering/getDefaultCollections.sjs",
    {"entityType": entityType}
  ));
}

let response = invokeService("Order");

[
  test.assertEqual("sm-Order-mastered", response.onMerge[0]),
  test.assertEqual("sm-Order-merged", response.onMerge[1]),
  test.assertEqual("sm-Order-mastered", response.onNoMatch[0]),
  test.assertEqual("sm-Order-archived", response.onArchive[0]),
  test.assertEqual("sm-Order-notification", response.onNotification[0]),
  test.assertEqual("sm-Order-auditing", response.onAuditing[0])
];
