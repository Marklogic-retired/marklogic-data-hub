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

function testValidateAndRunMapping(mapURI = "/mappings/PersonMapping/PersonMapping-3.mapping.json", uri = "/content/person2.json") {
  let map = cts.doc(mapURI).toObject();
  let result = esMappingLib.validateAndRunMapping(map, uri);
  return [
    test.assertEqual(222, fn.number(result.properties.id.output), `Expected output '222', got '${xdmp.describe(result.properties.id)}'`),
    test.assertEqual("Middle", result.properties.name.properties.middle.output, `Expected output 'Middle', got '${xdmp.describe(result.properties.name.properties.middle)}'`),
    test.assertEqual("Last", result.properties.name.properties.last.output, `Expected output 'Last', got '${xdmp.describe(result.properties.name.properties.last)}'`),
    test.assertEqual("First", result.properties.name.properties.first.properties.value.output, `Expected output 'First', got '${xdmp.describe(result.properties.name.properties.first.properties.value)}'`),
    test.assertEqual("SomePrefix", result.properties.name.properties.first.properties.prefix.output, `Expected output 'SomePrefix', got '${xdmp.describe(result.properties.name.properties.first.properties.prefix)}'`)
  ];
}

function testValidateAndRunMappingArrayValues(mapURI = "/mappings/OrdersMapping/OrdersMapping-3.mapping.json", uri = "/content/orderTest.json") {
  let map = cts.doc(mapURI).toObject();
  let result = esMappingLib.validateAndRunMapping(map, uri);
  return [
    test.assertEqual(1, fn.number(result.properties.id.output), `Expected output '1', got '${xdmp.describe(result.properties.id)}'`),
    test.assertEqual("Voltsillam, Latlux, ... (3 more)", result.properties.items.properties.name.output, `Expected output 'Voltsillam, Latlux, ... (3 more)', got '${xdmp.describe(result.properties.items.properties.name)}'`),
    test.assertEqual("7, 10, ... (3 more)", result.properties.items.properties.quantity.output, `Expected output '7, 10, ... (3 more)', got '${xdmp.describe(result.properties.items.properties.quantity)}'`),
    test.assertEqual("2, 7.17, ... (3 more)", result.properties.items.properties.price.output, `Expected output '2, 7.17, ... (3 more)', got '${xdmp.describe(result.properties.items.properties.price)}'`),
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
    .concat(testValidateAndRunMappingArrayValues())
    .concat(testValidateAndRunMapping("/mappings/PersonNsMapping/PersonNsMapping-1.mapping.json", "/content/person-ns.xml"))
    .concat(testValidateAndRunMappingWithErrors())
  ;
}
else {
  []
}

