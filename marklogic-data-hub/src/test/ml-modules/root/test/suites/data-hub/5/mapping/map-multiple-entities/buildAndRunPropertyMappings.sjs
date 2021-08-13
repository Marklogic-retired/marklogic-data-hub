const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];

function testValidJSONMapping(){
  let mapping = fn.head(cts.doc('/steps/mapping/mapCustomersJSON.step.json')).toObject();
  let result = esMappingLib.validateAndTestMapping(mapping, "/content/customerInfo.json");

  let customerProperties = result.properties;
  let productProperties = result.relatedEntityMappings[0].properties;
  let orderProperties = result.relatedEntityMappings[1].properties;


  const customerMessage = "Customer: " + xdmp.describe(customerProperties);
  const productMessage = "Product: " + xdmp.describe(productProperties);
  const orderMessage = "Order: " + xdmp.describe(orderProperties);


  assertions = assertions.concat([
    test.assertEqual("/mapped/content/customerInfo.json", fn.string(mapping.uriExpression.output)),
    test.assertEqual(202, fn.number(customerProperties.customerId.output), customerMessage),
    test.assertEqual("Cynthia", fn.string(customerProperties.firstName.output), customerMessage),
    test.assertEqual('Waters', fn.string(customerProperties.lastName.output), customerMessage)
  ]);


  assertions = assertions.concat([
    test.assertEqual("3 instances (1 shown)", fn.string(result.relatedEntityMappings[0].expressionContext.output)),
    test.assertEqual("/Product/10.json", fn.string(result.relatedEntityMappings[0].uriExpression.output)),
    test.assertEqual(10, fn.number(productProperties.productId.output), productMessage),
    test.assertEqual('New Balance FuelCell Echo V1 Sneaker', fn.string(productProperties.productName.output), productMessage)
  ]);


  assertions = assertions.concat([
    test.assertEqual("2 instances (1 shown)", fn.string(result.relatedEntityMappings[1].expressionContext.output)),
    test.assertEqual("/Order/2002.json", fn.string(result.relatedEntityMappings[1].uriExpression.output)),
    test.assertEqual(2002, fn.number(orderProperties.orderId.output), orderMessage),
    test.assertEqual(202, fn.number(orderProperties.orderedBy.output), orderMessage),
    test.assertEqual(303, fn.number(orderProperties.deliveredTo.output), orderMessage),
    test.assertEqual(1, fn.number(orderProperties.lineItems.properties.quantity.output), orderMessage),
    test.assertEqual(10, fn.number(orderProperties.lineItems.properties.orderIncludes.output), orderMessage)
  ]);
}

function testValidXMLMapping(){
  let mapping = fn.head(cts.doc('/steps/mapping/mapCustomersXML.step.json')).toObject();
  let result = esMappingLib.validateAndTestMapping(mapping, "/content/customerInfo.xml");

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
    test.assertEqual("3 instances (1 shown)", fn.string(result.relatedEntityMappings[0].expressionContext.output)),
    test.assertEqual(10, fn.number(productProperties.productId.output), productMessage),
    test.assertEqual('New Balance FuelCell Echo V1 Sneaker', fn.string(productProperties.productName.output), productMessage)
  ]);


  assertions = assertions.concat([
    test.assertEqual("2 instances (1 shown)", fn.string(result.relatedEntityMappings[1].expressionContext.output)),
    test.assertEqual(2002, fn.number(orderProperties.orderId.output), orderMessage),
    test.assertEqual(202, fn.number(orderProperties.orderedBy.output), orderMessage),
    test.assertEqual(303, fn.number(orderProperties.deliveredTo.output), orderMessage),
    test.assertEqual(1, fn.number(orderProperties.lineItems.properties.quantity.output), orderMessage),
    test.assertEqual(10, fn.number(orderProperties.lineItems.properties.orderIncludes.output), orderMessage)
  ]);
}

function testMappingWithInvalidProperties(){
  let mapping = fn.head(cts.doc('/steps/mapping/mapCustomersWithInvalidExpressions.step.json')).toObject();
  let result = esMappingLib.validateAndTestMapping(mapping, "/content/customerInfo.json");
  const orderUriRegex = new RegExp('^\/Order\/[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}.json$');
  assertions = assertions.concat([
    test.assertEqual("Undefined variable: $URIS", fn.string(mapping.uriExpression.errorMessage)),
    test.assertEqual("202", result.properties.customerId.output),
    test.assertEqual("Not a node", result.properties.firstName.errorMessage),
  ]);

  assertions = assertions.concat([
    test.assertTrue(orderUriRegex.test(fn.string(result.relatedEntityMappings[0].uriExpression.output)), "The uri is " + fn.string(result.relatedEntityMappings[0].uriExpression.output)),
    test.assertEqual("Unable to find function: 'remove-dashes()'. Cause: Either the function does not exist or the wrong number of arguments were specified.", result.relatedEntityMappings[0].properties.orderId.errorMessage)

  ]);
}

testValidJSONMapping();
testValidXMLMapping();
testMappingWithInvalidProperties();

assertions
