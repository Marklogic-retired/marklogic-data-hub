const core = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");

const orderUriRegex = new RegExp('^\/Order\/[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}.json$');

const assertions = [];

function callHubUri(entityType){
  try {
    return core.hubURI(entityType);
  }
  catch (e) {
    return e;
  }
}

assertions.push(
  test.assertTrue(orderUriRegex.test(callHubUri("Order"))),
  test.assertEqual("Unable to generate uri: 'entityType' should be of type 'string'", callHubUri().data[1]),
  test.assertEqual("Unable to generate uri: 'entityType' should be of type 'string'", callHubUri((1,2)).data[1]),
  test.assertEqual("Unable to generate uri: 'entityType' should not be an empty or whitespace string", callHubUri("").data[1]),
  test.assertEqual("Unable to generate uri: 'entityType' should not be an empty or whitespace string", callHubUri("  ").data[1]),
);

assertions

