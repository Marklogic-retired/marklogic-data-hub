const core = require('/data-hub/5/mapping-functions/core-functions.xqy');
const coreSjs = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");

const orderUriRegex = new RegExp('^\/Order\/[0-9a-z\-]*.json$');

const assertions = [];

function callHubUri(entityType){
  try {
    return core.hubURI(entityType);
  }
  catch (e) {
    return e;
  }
}

function callHubUriUsingSJS(entityType){
  try {
    return coreSjs.hubURI(entityType);
  }
  catch (e) {
    return e;
  }
}

assertions.push(
  test.assertTrue(orderUriRegex.test(callHubUri("Order"))),
  test.assertEqual("Unable to generate URI; entity type should not be an empty string", callHubUri("").data[1]),
  test.assertEqual("Unable to generate URI; entity type should not be an empty string", callHubUri("  ").data[1]),

  test.assertTrue(orderUriRegex.test(callHubUriUsingSJS("Order"))),
  test.assertEqual("Unable to generate URI; entity type should not be an empty string", callHubUriUsingSJS("").data[1]),
  test.assertEqual("Unable to generate URI; entity type should not be an empty string", callHubUriUsingSJS("  ").data[1])
);

assertions

