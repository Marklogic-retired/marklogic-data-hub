const test = require("/test/test-helper.xqy");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

const assertions = [];

let entityType = entityLib.findEntityType("http://test.org/PersonModel-1.0.0/Person");
assertions.push(
  test.assertEqual(7, Object.keys(entityType.properties).length)
);

entityType = entityLib.findEntityType(sem.iri("http://test.org/PersonModel-1.0.0/Person"));
assertions.push(
  test.assertEqual(7, Object.keys(entityType.properties).length)
);

entityType = entityLib.findEntityType("http://test.org/PersonModel-1.0.0/DoesntExist");
assertions.push(
  test.assertEqual(null, entityType, "If no entity type is found, null should be returned. The " +
    "client is expected to determine if this should result in an error being thrown or not.")
);

entityType = entityLib.findEntityType("just-totally-invalid");
assertions.push(test.assertEqual(null, entityType));

assertions
