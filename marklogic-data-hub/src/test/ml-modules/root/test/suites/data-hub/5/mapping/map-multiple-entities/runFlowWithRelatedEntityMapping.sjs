const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const datahub = DataHubSingleton.instance();

const content = ["/content/customerInfo.json"].map(uri => {
  return {
    uri: uri,
    value: cts.doc(uri)
  };
});

let results = datahub.flow.runFlow('customerFlow', 'test-job', content, {outputFormat: 'json', mapping:{name:'mapCustomersJSON'}}, 1);
let customerUris = getUris("Customer");
let orderUris = getUris("Order");
let productUris = getUris("Product");
let orderDocPermissions = hubTest.getRecord(orderUris[0], "data-hub-FINAL");
let productDocPermissions = hubTest.getRecord(productUris[0], "data-hub-FINAL")
let sqlQueryResponse = executeSql();
let assertions = [
  test.assertEqual(1, results.totalCount),
  test.assertEqual(0, results.errorCount),
  test.assertEqual(1, results.completedItems.length),
  test.assertEqual(1, customerUris.length),
  test.assertEqual("/content/customerInfo.json", customerUris[0]),
  test.assertEqual(2, orderUris.length),
  test.assertEqual(3, productUris.length),
  /* Not checking for permissions of the main entity instance since we have tests for it and also permissions passed through options
  won't get applied before runFlow() is called. */
  test.assertEqual("read", orderDocPermissions.permissions["data-hub-common"][0]),
  test.assertEqual("update", orderDocPermissions.permissions["data-hub-common"][1]),
  test.assertEqual("read", productDocPermissions.permissions["data-hub-operator"][0]),
  test.assertEqual("update", productDocPermissions.permissions["data-hub-operator"][1]),
  test.assertEqual("firstName=Customer.Customer.firstName; lastName=Customer.Customer.lastName; orderId=Order.Order.orderId", sqlQueryResponse[0]),
  test.assertEqual("firstName=Cynthia; lastName=Waters; orderId=2002", sqlQueryResponse[1]),
  test.assertEqual("firstName=Cynthia; lastName=Waters; orderId=2012", sqlQueryResponse[2])

];

function getUris(collection){
  return fn.head(xdmp.eval('cts.uris(null, null, cts.collectionQuery("'+ collection+ '")).toArray()'))
}

function executeSql() {
  let queryResponse = xdmp.eval('xdmp.sql(\'select Customer.Customer.firstName,Customer.Customer.lastName,"Order"."Order".orderId  from Customer, "Order" where "Order".orderedBy = Customer.customerId order by "Order"."Order".orderId\')');
  var res = new Array();
  for (var row of queryResponse) {
    res.push(fn.concat("firstName=", row[0], "; lastName=", row[1], "; orderId=", row[2]));
  }
  return res;
}
assertions;

