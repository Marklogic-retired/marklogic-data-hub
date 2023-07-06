import schemaValidation from "/data-hub/features/schema-validation.mjs";
const test = require("/test/test-helper.xqy");

function getSchema(uri) {
  return fn.head(xdmp.invokeFunction(
    () => fn.doc(uri),
    {database: xdmp.schemaDatabase()}
  ));
}

function verifySchemaGeneration() {
  const uri = "/entities/Customer.entity.json";
  const artifact = cts.doc(uri).toObject();
  schemaValidation.onArtifactSave("model", "Customer", uri, artifact);
  const jsonSchema = getSchema("/entities/Customer.entity.schema.json");
  const xmlSchema = getSchema("/entities/Customer.entity.xsd");
  return [
    test.assertTrue(fn.exists(jsonSchema), "Customer json schema should exist"),
    test.assertTrue(fn.exists(xmlSchema), "Customer xml schema should exist"),
    test.assertEqual(1, fn.count(xmlSchema.xpath("/*:schema/*:element")), `Element count isn't accurate`)
  ];
}

[].concat(verifySchemaGeneration());
