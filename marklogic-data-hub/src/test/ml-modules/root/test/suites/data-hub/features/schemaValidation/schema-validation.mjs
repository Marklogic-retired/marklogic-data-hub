import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");

function checkForSchema(uri){
  return fn.head(xdmp.invokeFunction(
    () => fn.docAvailable(uri),
    {database: xdmp.schemaDatabase()}
  ));
}

function verifySchemaGeneration() {
  schemaValidation.onArtifactSave("model", "Customer");
  return [
    test.assertTrue(checkForSchema("/entities/Customer.entity.schema.json"), "Customer json schema should exist"),
    test.assertTrue(checkForSchema("/entities/Customer.entity.xsd"), "Customer xml schema should exist")
  ];
}

[].concat(verifySchemaGeneration());
