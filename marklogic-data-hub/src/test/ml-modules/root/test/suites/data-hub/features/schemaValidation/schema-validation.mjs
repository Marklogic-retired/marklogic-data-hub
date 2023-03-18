import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");

xdmp.invokeFunction(() => schemaValidation.onArtifactSave("model", "Customer"), {update: "true"});

function checkForSchema(uri){
  return fn.head(xdmp.invokeFunction(() => fn.docAvailable(uri), {database: xdmp.schemaDatabase()}));
}

function verifySchemaGeneration() {
  return [
    test.assertTrue(checkForSchema("/entities/Customer.entity.schema.json"), "Customer json schema should exist"),
    test.assertTrue(checkForSchema("/entities/Customer.entity.xsd"), "Customer xml schema should exist")
  ];
}

[].concat(verifySchemaGeneration());