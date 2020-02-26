const test = require("/test/test-helper.xqy");

const entityIRIs = require("/data-hub/5/impl/entity-lib.sjs").findEntityIRIs();

[
  test.assertEqual(3, entityIRIs.length),
  test.assertTrue(entityIRIs.includes("http://test.org/PersonModel-1.0.0/Address")),
  test.assertTrue(entityIRIs.includes("http://test.org/PersonModel-1.0.0/Name")),
  test.assertTrue(entityIRIs.includes("http://test.org/PersonModel-1.0.0/Person"))
];
