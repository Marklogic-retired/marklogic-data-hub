const test = require("/test/test-helper.xqy");

function invokeService(index) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/getSourceDataDocument/getSourceDataDocument.sjs",
    {
      "sourceQuery": "cts.collectionQuery('raw-content')",
      "index": index
    }
  ))
}

let assertions = [];

let response = invokeService(1);
assertions.push(
  test.assertEqual("/content/customer1.json", response.uri),
  test.assertEqual("111", response.document.envelope.instance.customerId)
);

response = invokeService(2);
assertions.push(
  test.assertEqual("/content/customer2.json", response.uri),
  test.assertEqual("222", response.document.envelope.instance.customerId)
);

response = invokeService(3);
assertions.push(
  test.assertEqual(null, response,
    "In the case of no matching document or an index that is higher than the number of results, null should be returned")
);

assertions
