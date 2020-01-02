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

function generateMappingStyleSheet() {
  let mapping =
    {
        targetEntityType: entityType,
        properties: {
          id: {sourcedFrom: "id"}
        }
    }
  let xmlMapping = esMappingLib.buildMappingXML(fn.head(xdmp.unquote(xdmp.quote(mapping))));
  let stylesheet = fn.head(xdmp.xsltInvoke("/MarkLogic/entity-services/mapping-compile.xsl", xmlMapping));
  return stylesheet;
}

function testRemoveStandardFunction() {
  let stylesheet = generateMappingStyleSheet();
  let removedStdFn = String(esMappingLib.removeStandardFunction(stylesheet));
  return [
    test.assertFalse(removedStdFn.includes("/MarkLogic/entity-services/standard-library.xqy"),"standard-library should be removed"),
    test.assertEqual(removedStdFn, String(esMappingLib.removeStandardFunction(xdmp.unquote(removedStdFn)))
    ,"if input doesn't have standard-library the input xslt should bee returned")];
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

function unrecognizedProperty() {
  let result = esMappingLib.validateAndRunMapping({
    targetEntityType: entityType,
    properties: {
      genderr: {sourcedFrom: "gender"}
    }
  }, "/content/mapTest.json");
  return [
    test.assertEqual(null, result.properties.genderr.errorMessage,
      "Per DHFPROD-3627, an error shouldn't be thrown for an unrecognized property")
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
    .concat(unrecognizedProperty())
    .concat(missingFunctionReference())
    .concat(incorrectNumberOfFunctionArguments())
    .concat(functionSyntaxError())
    .concat(mixOfValidAndInvalidExpressions())
    .concat(validUseOfCustomFunction())
    .concat(invalidUseOfCustomFunction())
    .concat(testRemoveStandardFunction())
  ;
}
else {
  []
}

