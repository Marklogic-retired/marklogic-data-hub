const test = require("/test/test-helper.xqy");

const map = require("/data-hub/5/impl/entity-lib.sjs").findEntityTypesAsMap();
const entityIRIs = Object.keys(map);

[
  test.assertEqual(3, entityIRIs.length),
  test.assertTrue(entityIRIs.includes("http://test.org/PersonModel-1.0.0/Address")),
  test.assertTrue(entityIRIs.includes("http://test.org/PersonModel-1.0.0/Name")),
  test.assertTrue(entityIRIs.includes("http://test.org/PersonModel-1.0.0/Person")),

  test.assertEqual(3, Object.keys(map["http://test.org/PersonModel-1.0.0/Address"].properties).length),
  test.assertEqual(4, Object.keys(map["http://test.org/PersonModel-1.0.0/Name"].properties).length),
  test.assertEqual(7, Object.keys(map["http://test.org/PersonModel-1.0.0/Person"].properties).length)
];
