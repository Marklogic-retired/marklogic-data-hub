import coreSjs from "/data-hub/5/mapping-functions/core.mjs";

const core = require('/data-hub/5/mapping-functions/core-functions.xqy');
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

let orderUri = callHubUri("Order");
let orderUriSjs = callHubUriUsingSJS("Order");

xdmp.log("orderUri: " + orderUri);
xdmp.log("orderUriSjs: " + orderUriSjs);

assertions.push(
  test.assertTrue(orderUri.startsWith("/Order/")),
  test.assertTrue(orderUri.endsWith(".json")),
  test.assertEqual("Unable to generate URI; entity type should not be an empty string", callHubUri("").data[1]),
  test.assertEqual("Unable to generate URI; entity type should not be an empty string", callHubUri("  ").data[1]),

  test.assertTrue(orderUriSjs.startsWith("/Order/")),
  test.assertTrue(orderUriSjs.endsWith(".json")),
  test.assertEqual("Unable to generate URI; entity type should not be an empty string", callHubUriUsingSJS("").data[1]),
  test.assertEqual("Unable to generate URI; entity type should not be an empty string", callHubUriUsingSJS("  ").data[1])
);

// Adding these tests to debug the regex function on 11.0 nightly. Remove them once the issue is found
assertions.push(
  test.assertTrue(orderUriRegex.test(orderUri), "HubUri: " + orderUri + " has different format"),
  test.assertTrue(orderUriRegex.test(orderUriSjs), "HubUri: " + orderUriSjs + " has different format")
);

assertions

