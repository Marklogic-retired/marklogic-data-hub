const test = require("/test/test-helper.xqy");

const map = require("/data-hub/5/impl/entity-lib.sjs").findEntityTypesAsMap();
const entityTypeIds = Object.keys(map);

[
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/PersonModel-0.0.1/Address")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/PersonModel-0.0.1/Name")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/PersonModel-0.0.1/DateRange")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/PersonModel-0.0.1/Person")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/EmployerModel-0.0.1/Employer")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/EmployerModel-0.0.1/Address")),

  test.assertEqual(3, Object.keys(map["http://marklogic.com/example/PersonModel-0.0.1/Address"].properties).length),
  test.assertEqual(2, Object.keys(map["http://marklogic.com/example/PersonModel-0.0.1/Name"].properties).length),
  test.assertEqual(2, Object.keys(map["http://marklogic.com/example/PersonModel-0.0.1/DateRange"].properties).length),
  test.assertEqual(4, Object.keys(map["http://marklogic.com/example/PersonModel-0.0.1/Person"].properties).length),
  test.assertEqual(2, Object.keys(map["http://marklogic.com/example/EmployerModel-0.0.1/Employer"].properties).length),
  test.assertEqual(2, Object.keys(map["http://marklogic.com/example/EmployerModel-0.0.1/Address"].properties).length)
];
