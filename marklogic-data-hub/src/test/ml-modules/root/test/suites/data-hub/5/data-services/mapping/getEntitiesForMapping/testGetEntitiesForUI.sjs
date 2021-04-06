const mappableEntityLib = require("/data-hub/5/data-services/mapping/mappable-entity-lib.sjs");
const test = require("/test/test-helper.xqy");
const assertions = [];

function testFindEntityModelsWithPropertyThatRefersToTargetEntity(){
  const result1 = mappableEntityLib.findEntityModelsWithPropertyThatRefersToTargetEntity(cts.doc("/entities/Customer.entity.json").toObject(),"Customer");
  const result2 = mappableEntityLib.findEntityModelsWithPropertyThatRefersToTargetEntity(cts.doc("/entities/Order.entity.json").toObject(),"Order");

  assertions.push(

    test.assertEqual(1, result1.length),
    test.assertEqual("Order", result1[0].info.title),

    test.assertEqual(0, result2.length)
  );
}

function testExpandStructuredProperties(result){
  assertions.push(
    test.assertEqual("integer", result.customerId.datatype),
    test.assertEqual("array", result.nicknames.datatype),
    test.assertEqual("string", result.nicknames.items.datatype),

    test.assertEqual("array", result.shipping.subProperties.street.datatype),
    test.assertEqual("string", result.shipping.subProperties.street.items.datatype),
    test.assertEqual("string", result.shipping.subProperties.city.datatype),
    test.assertEqual("#/definitions/Zip", result.shipping.subProperties.zip.$ref),
    test.assertEqual("string", result.shipping.subProperties.zip.subProperties.fiveDigit.datatype),

    test.assertEqual("array", result.billing.subProperties.street.datatype),
    test.assertEqual("string", result.billing.subProperties.street.items.datatype),
    test.assertEqual("string", result.billing.subProperties.city.datatype),
    test.assertEqual("#/definitions/Zip", result.billing.subProperties.zip.$ref),
    test.assertEqual("string", result.billing.subProperties.zip.subProperties.fiveDigit.datatype),

    test.assertEqual("date", result.customerSince.datatype),
    test.assertEqual(null, result.orders, "External references should be removed")
  );
}

function testGetAllRelatedEntities(){
  const response1 = mappableEntityLib.getEntitiesForUI("Customer");
  const customerResponse = getEntityResponse(response1, "Customer");
  const orderResponse = getEntityResponse(response1, "Order");
  //console.log(JSON.stringify(orderResponse))
  const productResponse = getEntityResponse(response1, "Product");
  const productTypeResponse = getEntityResponse(response1, "ProductType");

  testExpandStructuredProperties(customerResponse.entityModel.definitions.Customer.properties);
  assertions.push(
    test.assertEqual(4, response1.length),
    test.assertEqual("Customer", customerResponse.entityType),
    test.assertEqual("Customer", customerResponse.mappingTitle),
    test.assertEqual(1, customerResponse.relatedEntityMappings.length),
    test.assertEqual("Order (orderedBy Customer)", customerResponse.relatedEntityMappings[0].mappingLinkText),
    test.assertEqual("Order:Customer.customerId", customerResponse.relatedEntityMappings[0].entityMappingId),

    test.assertEqual("integer", orderResponse.entityModel.definitions.Order.properties.orderId.datatype),
    test.assertEqual("integer", orderResponse.entityModel.definitions.Order.properties.orderedBy.datatype),
    test.assertEqual("http://example.org/Customer-0.0.1/Customer", orderResponse.entityModel.definitions.Order.properties.orderedBy.relatedEntityType),
    test.assertEqual("customerId", orderResponse.entityModel.definitions.Order.properties.orderedBy.joinPropertyName),
    test.assertEqual("array", orderResponse.entityModel.definitions.Order.properties.lineItems.datatype),
    test.assertEqual("#/definitions/LineItem", orderResponse.entityModel.definitions.Order.properties.lineItems.items.$ref),
    test.assertEqual("integer", orderResponse.entityModel.definitions.Order.properties.lineItems.subProperties.quantity.datatype),
    test.assertEqual("Order:Customer.customerId", orderResponse.entityMappingId),
    test.assertEqual("Order", orderResponse.entityType),
    test.assertEqual("Order (orderedBy Customer)", orderResponse.mappingTitle),
    test.assertEqual(1, orderResponse.relatedEntityMappings.length),
    test.assertEqual("includes Product", orderResponse.relatedEntityMappings[0].mappingLinkText),
    test.assertEqual("Product:Order.lineItems.includes", orderResponse.relatedEntityMappings[0].entityMappingId),

    test.assertEqual("integer", productResponse.entityModel.definitions.Product.properties.productId.datatype),
    test.assertEqual("string", productResponse.entityModel.definitions.Product.properties.productCategory.datatype),
    test.assertEqual("http://example.org/ProductType-0.0.1/ProductType", productResponse.entityModel.definitions.Product.properties.productCategory.relatedEntityType),
    test.assertEqual("productType", productResponse.entityModel.definitions.Product.properties.productCategory.joinPropertyName),
    test.assertEqual("Product:Order.lineItems.includes", productResponse.entityMappingId),
    test.assertEqual("Product", productResponse.entityType),
    test.assertEqual("Product (Order includes)", productResponse.mappingTitle),
    test.assertEqual(1, productResponse.relatedEntityMappings.length),
    test.assertEqual("productCategory ProductType", productResponse.relatedEntityMappings[0].mappingLinkText),
    test.assertEqual("ProductType:Product.productCategory", productResponse.relatedEntityMappings[0].entityMappingId),

    test.assertEqual("string", productTypeResponse.entityModel.definitions.ProductType.properties.productType.datatype),
    test.assertEqual("ProductType:Product.productCategory", productTypeResponse.entityMappingId),
    test.assertEqual("ProductType", productTypeResponse.entityType),
    test.assertEqual("ProductType (Product productCategory)", productTypeResponse.mappingTitle),
    test.assertEqual(null, productTypeResponse.relatedEntityMappings)

  );
}

function getEntityResponse(response, entityName){
  return response.find(entityResponse => entityResponse.entityType == entityName);
}


testFindEntityModelsWithPropertyThatRefersToTargetEntity();
testExpandStructuredProperties(mappableEntityLib.expandStructuredProperties(cts.doc("/entities/Customer.entity.json").toObject(), "Customer"));
testGetAllRelatedEntities();

assertions
