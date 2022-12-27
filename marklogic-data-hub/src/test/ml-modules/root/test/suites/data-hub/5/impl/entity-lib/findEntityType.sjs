const test = require("/test/test-helper.xqy");
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const entityLib = mjsProxy.requireMjsModule("/data-hub/5/impl/entity-lib.mjs");

const assertions = [];

let entityType = entityLib.findEntityType("http://marklogic.com/example/PersonModel-0.0.1/Person");
assertions.push(
  test.assertEqual(4, Object.keys(entityType.properties).length)
);

entityType = entityLib.findEntityType(sem.iri("http://marklogic.com/example/PersonModel-0.0.1/Address"));
assertions.push(
  test.assertEqual(3, Object.keys(entityType.properties).length)
);

entityType = entityLib.findEntityType(sem.iri("http://marklogic.com/example/PersonModel-0.0.1/Name"));
assertions.push(
  test.assertEqual(2, Object.keys(entityType.properties).length)
);

entityType = entityLib.findEntityType(sem.iri("http://marklogic.com/example/PersonModel-0.0.1/DateRange"));
assertions.push(
  test.assertEqual(2, Object.keys(entityType.properties).length)
);

entityType = entityLib.findEntityType(sem.iri("http://marklogic.com/example/EmployerModel-0.0.1/Employer"));
assertions.push(
  test.assertEqual(2, Object.keys(entityType.properties).length)
);

entityType = entityLib.findEntityType(sem.iri("http://marklogic.com/example/EmployerModel-0.0.1/Address"));
assertions.push(
  test.assertEqual(2, Object.keys(entityType.properties).length)
);


entityType = entityLib.findEntityType("http://marklogic.com/example/PersonModel-0.0.1/DoesntExist");
assertions.push(
  test.assertEqual(null, entityType, "If no entity type is found, null should be returned. The " +
    "client is expected to determine if this should result in an error being thrown or not.")
);

entityType = entityLib.findEntityType("just-totally-invalid");
assertions.push(test.assertEqual(null, entityType));

assertions
