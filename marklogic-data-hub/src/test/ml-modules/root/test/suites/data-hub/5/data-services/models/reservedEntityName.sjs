const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

function assertNameIsReserved(name) {
  const model = {};
  model[name] = {"properties": {}};
  try {
    entityLib.validateModelDefinitions(model);
    throw Error(`Expected validation to fail because ${name} is reserved due to it being used in the generated search options`);
  } catch (error) {
    assertions.push(
      test.assertEqual("400", error.data[0]),
      test.assertEqual(`${name} is a reserved term and is not allowed as an entity name.`, error.data[1])
    );
  }
}

// This list is based on knowledge of the constraint names in the search options generated for the Explore feature. 
assertNameIsReserved("Collection");
assertNameIsReserved("createdByJob");
assertNameIsReserved("createdByJobWord");
assertNameIsReserved("createdByStep");
assertNameIsReserved("createdOnRange");
assertNameIsReserved("createdInFlowRange");
assertNameIsReserved("entity-type");
assertNameIsReserved("sourceName");
assertNameIsReserved("sourceType");

assertions;