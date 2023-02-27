import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");

const assertions = [];

schemaValidation.onArtifactSave("model", "Customer");

// assert
xdmp.invokeFunction(function() {
  assertions.push(test.assertTrue(fn.exists(cts.doc("/entities/Customer.entity.xsd")), `Customer xml schema should exist.`))
  assertions.push(test.assertTrue(fn.exists(cts.doc("/entities/Customer.entity.schema.json")), `Customer json schema should exist.`))
},{database: xdmp.schemaDatabase()});




assertions;
