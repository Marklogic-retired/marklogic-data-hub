const mlSmHistoryPropertiesRest = require("/marklogic.rest.resource/mlSmHistoryProperties/assets/resource.xqy");
const test = require("/test/test-helper.xqy");

const assertions = [];

const context = {};
const propertyHistory = fn.head(xdmp.invokeFunction(() => mlSmHistoryPropertiesRest.get(context, { uri: fn.head(cts.uris(null, null, cts.collectionQuery("sm-Customer-merged")))}))).toObject();

assertions.push(
  test.assertTrue(!!propertyHistory["customerName"], `customerName should be returned by the property history. ${xdmp.describe(propertyHistory)}`),
  test.assertEqual("/content/customer1.json", propertyHistory["customerName"]["Bob"].details.sourceLocation, "property history should identify value 'Bob' came from '/content/customer1.json'"),
  test.assertEqual("/content/customer2.json", propertyHistory["customerName"]["Robert"].details.sourceLocation, "property history should identify value 'Robert' came from '/content/customer2.json'")
)

assertions;