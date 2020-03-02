const test = require("/test/test-helper.xqy");

const entityTypeIds = require("/data-hub/5/impl/entity-lib.sjs").findEntityTypeIds();

[
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/PersonModel-0.0.1/Address")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/PersonModel-0.0.1/Name")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/PersonModel-0.0.1/Person")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/PersonModel-0.0.1/DateRange")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/EmployerModel-0.0.1/Employer")),
  test.assertTrue(entityTypeIds.includes("http://marklogic.com/example/EmployerModel-0.0.1/Address"))
];
