const es = require('/MarkLogic/entity-services/entity-services');
const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

const entityType = "http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType";

// Convenience function for simplifying tests
function validateGenderMapping(sourcedFrom) {
  return esMappingLib.validateMapping({
    targetEntityType: entityType,
    properties: {
      gender: {sourcedFrom: sourcedFrom}
    }
  });
}

function validMapping() {
  let sourcedFrom = "memoryLookup(gender, '{\"m\": \"Male\", \"f\": \"Female\", \"nb\": \"Non-Binary\"}')";
  let result = validateGenderMapping(sourcedFrom);
  return [
    test.assertEqual(sourcedFrom, result.properties.gender.sourcedFrom,
      "The original sourcedFrom is included in the validated mapping as a way of confirming what was validated"),
    test.assertEqual(null, result.properties.gender.errorMessage,
      "An errorMessage shouldn't exist since the mapping expression is valid")
  ];
}

function invalidProperty() {
  let result = esMappingLib.validateMapping({
    targetEntityType: entityType,
    properties: {
      genderr: {sourcedFrom: "gender"}
    }
  });
  return [
    test.assertEqual("The property 'genderr' is not defined by the entity model", result.properties.genderr.errorMessage)
  ];
}

function missingFunctionReference() {
  let result = validateGenderMapping("memoryLookupp()");
  return [
    test.assertEqual("Undefined function: memoryLookupp()", result.properties.gender.errorMessage)
  ];
}

function incorrectNumberOfFunctionArguments() {
  let result = validateGenderMapping("memoryLookup(gender)");
  return [
    test.assertEqual("Undefined function: memoryLookup()", result.properties.gender.errorMessage,
      "If an incorrect number of function arguments are included, then the XSLT validation treats this as the function not being recognized")
  ];
}

function functionSyntaxError() {
  let result = validateGenderMapping("concat('test',)");
  return [
    test.assertEqual("Invalid XPath expression: concat('test',)", result.properties.gender.errorMessage)
  ];
}

function mixOfValidAndInvalidExpressions() {
  let validatedMapping = esMappingLib.validateMapping({
    "targetEntityType": entityType,
    "properties": {
      "firstname": {
        "sourcedFrom": "concat(firstName, )"
      },
      "lastname": {
        "sourcedFrom": "lastName"
      },
      "gender": {
        "sourcedFrom": "memoryLookupp()"
      }
    }
  });

  return [
    test.assertEqual(entityType, validatedMapping.targetEntityType),
    test.assertEqual("concat(firstName, )", validatedMapping.properties.firstname.sourcedFrom),
    test.assertEqual("Invalid XPath expression: concat(firstName, )", validatedMapping.properties.firstname.errorMessage),
    test.assertEqual("lastName", validatedMapping.properties.lastname.sourcedFrom),
    test.assertEqual(null, validatedMapping.properties.lastname.errorMessage),
    test.assertEqual("memoryLookupp()", validatedMapping.properties.gender.sourcedFrom),
    test.assertEqual("Undefined function: memoryLookupp()", validatedMapping.properties.gender.errorMessage)
  ];
}

function validUseOfCustomFunction() {
  let sourcedFrom = "echo(gender)";
  let result = validateGenderMapping(sourcedFrom);
  return [
    test.assertEqual(sourcedFrom, result.properties.gender.sourcedFrom),
    test.assertEqual(null, result.properties.gender.errorMessage)
  ];
}

function invalidUseOfCustomFunction() {
  let result = validateGenderMapping("echo(gender, 'invalidSecondArg')");
  return [
    test.assertEqual("Undefined function: echo()", result.properties.gender.errorMessage)
  ];
}

if (esMappingLib.versionIsCompatibleWithES()) {
  []
    .concat(validMapping())
    .concat(invalidProperty())
    .concat(missingFunctionReference())
    .concat(incorrectNumberOfFunctionArguments())
    .concat(functionSyntaxError())
    .concat(mixOfValidAndInvalidExpressions())
    .concat(validUseOfCustomFunction())
    .concat(invalidUseOfCustomFunction())
  ;
}
else {
  []
}

