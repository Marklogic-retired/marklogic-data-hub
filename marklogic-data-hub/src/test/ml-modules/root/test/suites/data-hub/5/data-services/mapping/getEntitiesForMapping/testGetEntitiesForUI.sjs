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
  const customerResponse = getEntityResponseByName(response1, "Customer");
  const orderResponse = getEntityResponseByName(response1, "Order");

  const productIncludesResponse = getEntityResponseById(response1, "Customer.customerId:Order.lineItems.includes:Product");
  const productIncludesTypeResponse = getEntityResponseById(response1, "Customer.customerId:Order.lineItems.includes:Product.productCategory:ProductType");

  const productAdditionalItemResponse = getEntityResponseById(response1, "Customer.customerId:Order.lineItems.additionalItem:Product");
  const productAdditionalItemTypeResponse = getEntityResponseById(response1, "Customer.customerId:Order.lineItems.additionalItem:Product.productCategory:ProductType");

  testExpandStructuredProperties(customerResponse.entityModel.definitions.Customer.properties);
  assertions.push(
    test.assertEqual(6, response1.length),
    test.assertEqual("Customer", customerResponse.entityType),
    test.assertEqual("Customer", customerResponse.mappingTitle),
    test.assertEqual(1, customerResponse.relatedEntityMappings.length),
    test.assertEqual("Order (orderedBy Customer)", customerResponse.relatedEntityMappings[0].mappingLinkText),
    test.assertEqual("Customer.customerId:Order", customerResponse.relatedEntityMappings[0].entityMappingId),

    test.assertEqual("integer", orderResponse.entityModel.definitions.Order.properties.orderId.datatype),
    test.assertEqual("integer", orderResponse.entityModel.definitions.Order.properties.orderedBy.datatype),
    test.assertEqual("http://example.org/Customer-0.0.1/Customer", orderResponse.entityModel.definitions.Order.properties.orderedBy.relatedEntityType),
    test.assertEqual("customerId", orderResponse.entityModel.definitions.Order.properties.orderedBy.joinPropertyName),
    test.assertEqual("array", orderResponse.entityModel.definitions.Order.properties.lineItems.datatype),
    test.assertEqual("#/definitions/LineItem", orderResponse.entityModel.definitions.Order.properties.lineItems.items.$ref),
    test.assertEqual("integer", orderResponse.entityModel.definitions.Order.properties.lineItems.subProperties.quantity.datatype),
    test.assertEqual("Customer.customerId:Order", orderResponse.entityMappingId),
    test.assertEqual("Order", orderResponse.entityType),
    test.assertEqual("Order (orderedBy Customer)", orderResponse.mappingTitle),
    test.assertEqual(2, orderResponse.relatedEntityMappings.length),
    test.assertEqual("includes Product", orderResponse.relatedEntityMappings[0].mappingLinkText),
    test.assertEqual("Customer.customerId:Order.lineItems.includes:Product", orderResponse.relatedEntityMappings[0].entityMappingId),
    test.assertEqual("additionalItem Product", orderResponse.relatedEntityMappings[1].mappingLinkText),
    test.assertEqual("Customer.customerId:Order.lineItems.additionalItem:Product", orderResponse.relatedEntityMappings[1].entityMappingId),

    test.assertEqual("integer", productIncludesResponse.entityModel.definitions.Product.properties.productId.datatype),
    test.assertEqual("string", productIncludesResponse.entityModel.definitions.Product.properties.productCategory.datatype),
    test.assertEqual("http://example.org/ProductType-0.0.1/ProductType", productIncludesResponse.entityModel.definitions.Product.properties.productCategory.relatedEntityType),
    test.assertEqual("productType", productIncludesResponse.entityModel.definitions.Product.properties.productCategory.joinPropertyName),
    test.assertEqual("Customer.customerId:Order.lineItems.includes:Product", productIncludesResponse.entityMappingId),
    test.assertEqual("Product", productIncludesResponse.entityType),
    test.assertEqual("Product (Order includes)", productIncludesResponse.mappingTitle),
    test.assertEqual(1, productIncludesResponse.relatedEntityMappings.length),
    test.assertEqual("productCategory ProductType", productIncludesResponse.relatedEntityMappings[0].mappingLinkText),
    test.assertEqual("Customer.customerId:Order.lineItems.includes:Product.productCategory:ProductType", productIncludesResponse.relatedEntityMappings[0].entityMappingId),

    test.assertEqual("string", productIncludesTypeResponse.entityModel.definitions.ProductType.properties.productType.datatype),
    test.assertEqual("Customer.customerId:Order.lineItems.includes:Product.productCategory:ProductType", productIncludesTypeResponse.entityMappingId),
    test.assertEqual("ProductType", productIncludesTypeResponse.entityType),
    test.assertEqual("ProductType (Product productCategory)", productIncludesTypeResponse.mappingTitle),
    test.assertEqual(null, productIncludesTypeResponse.relatedEntityMappings),

    test.assertEqual("integer", productAdditionalItemResponse.entityModel.definitions.Product.properties.productId.datatype),
    test.assertEqual("string", productAdditionalItemResponse.entityModel.definitions.Product.properties.productCategory.datatype),
    test.assertEqual("http://example.org/ProductType-0.0.1/ProductType", productAdditionalItemResponse.entityModel.definitions.Product.properties.productCategory.relatedEntityType),
    test.assertEqual("productType", productAdditionalItemResponse.entityModel.definitions.Product.properties.productCategory.joinPropertyName),
    test.assertEqual("Customer.customerId:Order.lineItems.additionalItem:Product", productAdditionalItemResponse.entityMappingId),
    test.assertEqual("Product", productAdditionalItemResponse.entityType),
    test.assertEqual("Product (Order additionalItem)", productAdditionalItemResponse.mappingTitle),
    test.assertEqual(1, productAdditionalItemResponse.relatedEntityMappings.length),
    test.assertEqual("productCategory ProductType", productAdditionalItemResponse.relatedEntityMappings[0].mappingLinkText),
    test.assertEqual("Customer.customerId:Order.lineItems.additionalItem:Product.productCategory:ProductType", productAdditionalItemResponse.relatedEntityMappings[0].entityMappingId),

    test.assertEqual("string", productAdditionalItemTypeResponse.entityModel.definitions.ProductType.properties.productType.datatype),
    test.assertEqual("Customer.customerId:Order.lineItems.additionalItem:Product.productCategory:ProductType", productAdditionalItemTypeResponse.entityMappingId),
    test.assertEqual("ProductType", productAdditionalItemTypeResponse.entityType),
    test.assertEqual("ProductType (Product productCategory)", productAdditionalItemTypeResponse.mappingTitle),
    test.assertEqual(null, productAdditionalItemTypeResponse.relatedEntityMappings)

  );
}

function getEntityResponseByName(response, entityName){
  return response.find(entityResponse => entityResponse.entityType == entityName);
}

function getEntityResponseById(response, entityMappingId){
  return response.find(entityResponse => entityResponse.entityMappingId == entityMappingId);
}


testFindEntityModelsWithPropertyThatRefersToTargetEntity();
testExpandStructuredProperties(mappableEntityLib.expandStructuredProperties(cts.doc("/entities/Customer.entity.json").toObject(), "Customer"));
testGetAllRelatedEntities();

assertions
