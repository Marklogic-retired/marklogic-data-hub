const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];

let mapping = fn.head(cts.doc('/steps/mapping/mapCustomersJSON.step.json')).toObject();
let result = esMappingLib.validateAndTestMapping(mapping, "/content/customerInfo.json");

let customerProperties = result.properties;
let productProperties = result.relatedEntityMappings[0].properties;
let orderProperties = result.relatedEntityMappings[1].properties;


const customerMessage = "Customer: " + xdmp.describe(customerProperties);
const productMessage = "Product: " + xdmp.describe(productProperties);
const orderMessage = "Order: " + xdmp.describe(orderProperties);


assertions = assertions.concat([
  test.assertEqual(202, fn.number(customerProperties.customerId.output), customerMessage),
  test.assertEqual("Cynthia", fn.string(customerProperties.firstName.output), customerMessage),
  test.assertEqual('Waters', fn.string(customerProperties.lastName.output), customerMessage)
]);


assertions = assertions.concat([
  test.assertEqual(10, fn.number(productProperties.productId.output), productMessage),
  test.assertEqual('New Balance FuelCell Echo V1 Sneaker', fn.string(productProperties.productName.output), productMessage)
]);


assertions = assertions.concat([
  test.assertEqual(2002, fn.number(orderProperties.orderId.output), orderMessage),
  test.assertEqual(202, fn.number(orderProperties.orderedBy.output), orderMessage),
  test.assertEqual(303, fn.number(orderProperties.deliveredTo.output), orderMessage),
  test.assertEqual(1, fn.number(orderProperties.lineItems.properties.quantity.output), orderMessage),
  test.assertEqual(10, fn.number(orderProperties.lineItems.properties.orderIncludes.output), orderMessage)
]);

assertions
