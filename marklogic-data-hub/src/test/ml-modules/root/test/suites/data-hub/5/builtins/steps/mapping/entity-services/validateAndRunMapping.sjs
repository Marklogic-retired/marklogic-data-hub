const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

const entityType = "http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType";

// Convenience function for simplifying tests
function validateAndRunGenderMapping(sourcedFrom) {
  return esMappingLib.validateAndRunMapping({
    targetEntityType: entityType,
    properties: {
      gender: {sourcedFrom: sourcedFrom}
    }}, "/content/mapTest.json");


}
// The first 4 tests are same as validateMapping.sjs, there are being run to ensure validateAndRunMapping() returns
// the same result as well.
function validMapping() {
  let sourcedFrom = "memoryLookup(customer/gender, '{\"m\": \"Male\", \"f\": \"Female\", \"nb\": \"Non-Binary\"}')";
  let result = validateAndRunGenderMapping(sourcedFrom);
  return [
      test.assertEqual("Female", result.properties.gender.output,
        "'gender' should correctly be mapped to the expected value"),
      test.assertEqual(null, result.properties.gender.errorMessage,
        "An errorMessage shouldn't exist since the mapping expression is valid")
    ];
}

function invalidProperty() {
  let result = esMappingLib.validateAndRunMapping({
    targetEntityType: entityType,
    properties: {
      genderr: {sourcedFrom: "gender"}
    }
  }, "/content/mapTest.json");
  return [
    test.assertEqual("The property 'genderr' is not defined by the entity model", result.properties.genderr.errorMessage)
  ];
}

function missingFunctionReference() {
  let result = validateAndRunGenderMapping("memoryLookupp()");
  return [
    test.assertEqual("Undefined function: memoryLookupp()", result.properties.gender.errorMessage)
  ];
}

function incorrectNumberOfFunctionArguments() {
  let result = validateAndRunGenderMapping("memoryLookup(gender)");
  return [
    test.assertEqual("Undefined function: memoryLookup()", result.properties.gender.errorMessage,
      "If an incorrect number of function arguments are included, then the XSLT validation treats this as the function not being recognized")
  ];
}

function testValidateAndRunMapping() {
  let map = cts.doc("/mappings/PersonMapping/PersonMapping-3.mapping.json").toObject();
  let uri = "/content/person2.json";
  let result = esMappingLib.validateAndRunMapping(map, uri);
  return [
    test.assertEqual(222, fn.number(result.properties.id.output)),
    test.assertEqual("Middle", result.properties.name.properties.middle.output),
    test.assertEqual("Last", result.properties.name.properties.last.output),
    test.assertEqual("First", result.properties.name.properties.first.properties.value.output),
    test.assertEqual("SomePrefix", result.properties.name.properties.first.properties.prefix.output)
  ];
}

function testValidateAndRunMappingWithErrors() {
  let map = {
              "targetEntityType": "http://marklogic.com/data-hub/example/Person-1.0.0/Person",
              "properties": {
                "id": {"sourcedFrom": "concat(theNickname,'-ID')"}
              }
            };
  let uri = "/content/person2.json";
  let result = esMappingLib.validateAndRunMapping(map, uri);
  return [
    test.assertEqual("Invalid lexical value: \"Nicky-ID\"", result.properties.id.errorMessage, "Error thrown since int prop is mapped to string"),
  ];
}

if (esMappingLib.versionIsCompatibleWithES()) {
  []
    .concat(validMapping())
    .concat(invalidProperty())
    .concat(missingFunctionReference())
    .concat(incorrectNumberOfFunctionArguments())
    .concat(testValidateAndRunMapping())
    .concat(testValidateAndRunMappingWithErrors())
  ;
}
else {
  []
}

