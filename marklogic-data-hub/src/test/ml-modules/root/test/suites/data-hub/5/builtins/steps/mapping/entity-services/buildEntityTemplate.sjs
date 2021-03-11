const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

function entityNameDoesntExist() {
  const model = {
    "definitions": {}
  };
  const mapping = {
    targetEntityType: "http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType",
    properties: {}
  };

  try {
    esMappingLib.buildEntityTemplate(mapping, model, "", 0)
    throw Error("Expected a failure because there's no matching definition in the entity model");
  } catch (e) {
    const errorMessage = e.toString();
    return test.assertEqual(
      "Error: Could not find an entity type with name: CustomerType",
      errorMessage,
      "Expected the error message to identify which entity could not be found"
    );
  }
}

[]
  .concat(entityNameDoesntExist());
