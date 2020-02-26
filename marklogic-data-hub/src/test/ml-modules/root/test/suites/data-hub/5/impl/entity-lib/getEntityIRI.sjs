const test = require("/test/test-helper.xqy");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

const model = entityLib.findModelForEntityIRI("http://test.org/PersonModel-1.0.0/Person").toObject();

[
  test.assertEqual("http://test.org/PersonModel-1.0.0/Person", entityLib.getEntityIRI(model, "Person")),
  test.assertEqual("http://test.org/PersonModel-1.0.0/Address", entityLib.getEntityIRI(model, "Address")),
  test.assertEqual("http://test.org/PersonModel-1.0.0/Name", entityLib.getEntityIRI(model, "Name"))
];
