const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

const entityType = "http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType";

function testFunctionInMapping(functionSignature) {
  return esMappingLib.validateAndRunMapping({
    targetEntityType: entityType,
    properties: {
      gender: {
        sourcedFrom: functionSignature
      }
    }
  }, "/content/mapTest.json");
}

const expectedFunctionsThatDontWork = esMappingLib.getXpathFunctionsThatDoNotWorkInMappingExpressions();

/**
 * This test uses the approach below to identify functions that don't work. The approach is fairly primitive, but seems
 * effective - grab the signature and try using it as the "sourcedFrom", and if there's an error that starts with
 * "Undefined function", then the function will never work in a mapping expression. Other errors, such as invalid arg
 * type, indicates that the function will work, just need to give it valid args.
 *
 * The goal of this test then is to verify that we don't get any additional functions that don't work - i.e. that
 * the ones excluded by esMappingLib covers all the functions that should be ignored.
 */
const functions = esMappingLib.getFunctionsWithSignatures(xdmp.functions().toObject(), []);
const actualFunctionsThatDontWork = [];
for(let i=0; i< functions.length; i++){
  const result = testFunctionInMapping(functions[i].signature);
  if (result.properties.gender.errorMessage && result.properties.gender.errorMessage.startsWith("Undefined function")){
    actualFunctionsThatDontWork.push(String(functions[i].functionName));
  }
}
console.log(actualFunctionsThatDontWork);
[
  test.assertEqual(expectedFunctionsThatDontWork.length, actualFunctionsThatDontWork.length,
    "Expected to find zero functions that don't work, as getXpathMappingFunctions should have already removed " +
    "ones that don't work. Note that base-uri and document-uri aren't expected to be in these lists; those are " +
    "separately excluded based on the knowledge that they won't work against in-memory objects.")
];
