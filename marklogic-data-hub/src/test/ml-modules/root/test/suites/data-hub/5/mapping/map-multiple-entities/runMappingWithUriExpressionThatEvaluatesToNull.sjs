const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const test = require("/test/test-helper.xqy");
const datahub = DataHubSingleton.instance();

const content = ["/content/customerInfo.json"].map(uri => {
  return {
    uri: uri,
    value: cts.doc(uri)
  };
});

let result = datahub.flow.runFlow('customerFlow', 'mapWithUriExpressionEvaluatesToNull', content, {outputFormat: 'json', mapping:{name:'mapWithUriExpressionEvaluatesToNull'}}, 3);

[
  test.assertEqual(1, result.totalCount),
  test.assertEqual(1, result.errorCount),
  test.assertEqual(0, result.completedItems.length),
  test.assertEqual(1, result.failedItems.length),
  test.assertEqual("/content/customerInfo.json", result.failedItems[0]),
  test.assertEqual("400", result.errors[0].data[0], "HTTP error code is 400"),
  test.assertEqual("Unable to write mapped instance for entity model 'Order'; cause: The URI xpath expression for the mapping evaluates to null", result.errors[0].data[1])

];
