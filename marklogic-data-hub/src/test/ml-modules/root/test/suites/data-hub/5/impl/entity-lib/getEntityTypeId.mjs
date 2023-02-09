import entityLib from "/data-hub/5/impl/entity-lib.mjs";
const test = require("/test/test-helper.xqy");

const model = entityLib.findModelForEntityTypeId("http://marklogic.com/example/PersonModel-0.0.1/Person").toObject();

[
  test.assertEqual("http://marklogic.com/example/PersonModel-0.0.1/Person", entityLib.getEntityTypeId(model, "Person")),
  test.assertEqual("http://marklogic.com/example/PersonModel-0.0.1/Address", entityLib.getEntityTypeId(model, "Address")),
  test.assertEqual("http://marklogic.com/example/PersonModel-0.0.1/Name", entityLib.getEntityTypeId(model, "Name"))
];
