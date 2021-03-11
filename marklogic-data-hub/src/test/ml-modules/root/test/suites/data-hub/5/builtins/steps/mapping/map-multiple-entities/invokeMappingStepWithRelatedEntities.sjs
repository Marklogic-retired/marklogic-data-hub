const mapping = require("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];

let doc = fn.head(cts.doc('/content/customerInfo.json'));
let result = mapping.main({uri: '/content/customerInfo.json', value: doc}, {
  mapping: {name: 'mapCustomersJSON'},
  outputFormat: 'json'
});

let instance0 = result[0].value.root.envelope.instance;
let instance1 = result[1].value.root.envelope.instance;
let instance2 = result[2].value.root.envelope.instance;
let instance3 = result[3].value.root.envelope.instance;
let instance4 = result[4].value.root.envelope.instance;
let instance5 = result[5].value.root.envelope.instance;

const instance0Message = "instance0: " + xdmp.describe(instance0);
assertions = assertions.concat([
  test.assertEqual(202, fn.number(instance0.Customer.customerId), instance0Message),
  test.assertEqual("Cynthia", fn.string(instance0.Customer.firstName), instance0Message),
  test.assertEqual('Waters', fn.string(instance0.Customer.lastName), instance0Message)
]);


const instance1Message = "instance1: " + xdmp.describe(instance1);
assertions = assertions.concat([
  test.assertEqual(10, fn.number(instance1.Product.productId), instance1Message),
  test.assertEqual('New Balance FuelCell Echo V1 Sneaker', fn.string(instance1.Product.productName), instance1Message)
]);

const instance2Message = "instance2: " + xdmp.describe(instance2);
assertions = assertions.concat([
  test.assertEqual(30, fn.number(instance2.Product.productId), instance2Message),
  test.assertEqual('Crock-Pot 8 Quart Manual Slow Cooker with 16 Oz Little Dipper Food Warmer, Stainless', fn.string(instance2.Product.productName), instance2Message)
]);

const instance3Message = "instance3: " + xdmp.describe(instance3);
assertions = assertions.concat([
  test.assertEqual(40, fn.number(instance3.Product.productId), instance3Message),
  test.assertEqual('Cuisinart 8-Cup Stainless Steel Electric Kettle with Automatic Shut-off', fn.string(instance3.Product.productName), instance3Message)
]);

const instance4Message = "instance4: " + xdmp.describe(instance4);
assertions = assertions.concat([
  test.assertEqual(2002, fn.number(instance4.Order.orderId), instance4Message),
  test.assertEqual(202, fn.number(instance4.Order.orderedBy), instance4Message),
  test.assertEqual(303, fn.number(instance4.Order.deliveredTo), instance4Message),
  test.assertEqual(1, fn.number(instance4.Order.lineItems[0].LineItem.quantity), instance4Message),
  test.assertEqual(10, fn.number(instance4.Order.lineItems[0].LineItem.orderIncludes), instance4Message)
]);


const instance5Message = "instance5: " + xdmp.describe(instance5);
assertions = assertions.concat([
  test.assertEqual(2012, fn.number(instance5.Order.orderId), instance5Message),
  test.assertEqual(404, fn.number(instance5.Order.deliveredTo), instance5Message),
  test.assertEqual(1, fn.number(instance5.Order.lineItems[0].LineItem.quantity), instance5Message),
  test.assertEqual(30, fn.number(instance5.Order.lineItems[0].LineItem.orderIncludes), instance5Message),
  test.assertEqual(2, fn.number(instance5.Order.lineItems[1].LineItem.quantity), instance5Message),
  test.assertEqual(40, fn.number(instance5.Order.lineItems[1].LineItem.orderIncludes), instance5Message)
]);

assertions;
