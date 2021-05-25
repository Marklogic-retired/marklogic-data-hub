const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const test = require("/test/test-helper.xqy");

const customerModel = entityLib.findModelByEntityName("Customer");
const customerForeignKeyReferences = entityLib.findForeignKeyReferencesInOtherModels(customerModel);

const productModel = entityLib.findModelByEntityName("Product");
const productForeignKeyReferences = entityLib.findForeignKeyReferencesInOtherModels(productModel);

const customerIdForeignKeyReferences = entityLib.findForeignKeyReferencesInOtherModels(customerModel, "customerId");

const customerFirstNameForeignKeyReferences = entityLib.findForeignKeyReferencesInOtherModels(customerModel, "firstName");

[
  test.assertEqual(1, customerForeignKeyReferences.length),
  test.assertEqual("Order", customerForeignKeyReferences[0]),
  test.assertEqual(1, customerIdForeignKeyReferences.length),
  test.assertEqual("Order", customerIdForeignKeyReferences[0]),
  test.assertEqual(0, customerFirstNameForeignKeyReferences.length),
  test.assertEqual(0, productForeignKeyReferences.length)
];
