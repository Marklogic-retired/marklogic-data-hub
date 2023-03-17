import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");

schemaValidation.onArtifactSave("model", "Customer");

// assert
const assertions = [
test.assertTrue(getSchema("/entities/Customer.entity.schema.json"), "Customer json schema should exist"),
test.assertTrue(getSchema("/entities/Customer.entity.xsd"), "Customer xml schema should exist")
];

function getSchema(uri) {
  return fn.exists(fn.head(xdmp.invokeFunction(() => cts.doc(uri), {database: xdmp.schemaDatabase()})));
}


assertions;
