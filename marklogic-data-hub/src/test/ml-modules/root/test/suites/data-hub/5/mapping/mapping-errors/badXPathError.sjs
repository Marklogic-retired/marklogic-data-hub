const test = require("/test/test-helper.xqy");
const lib = require("lib/lib.sjs")
let assertions = [];

const runUnexpectedRparMappingOutput = lib.runMappingStep("unexpectedRparMapping", 5);
const testUnexpectedRparMappingOutput = lib.validateAndTestMapping("unexpectedRparMapping");

assertions = assertions.concat([
  test.assertEqual("Invalid XPath expression: 'string-join(firstName, lastName))'. Cause: Unexpected right parenthesis."
    , testUnexpectedRparMappingOutput.properties.name.errorMessage),

  test.assertEqual("Invalid XPath expression: 'string-join(firstName, lastName))'. Cause: Unexpected right parenthesis."
    , runUnexpectedRparMappingOutput.errors[0].message),
  test.assertEqual("/content/customer.json", runUnexpectedRparMappingOutput.failedItems[0]),
]);

const runExpectingRparMappingOutput = lib.runMappingStep("expectingRparMapping", 6);
const testExpectingRparMappingOutput = lib.validateAndTestMapping("expectingRparMapping");

assertions = assertions.concat([
  test.assertEqual("Invalid XPath expression: 'string-join((firstName, lastName)'. Cause: Missing right parenthesis."
    , testExpectingRparMappingOutput.properties.name.errorMessage),

  test.assertEqual("Invalid XPath expression: 'string-join((firstName, lastName)'. Cause: Missing right parenthesis."
    , runExpectingRparMappingOutput.errors[0].message),
  test.assertEqual("/content/customer.json", runExpectingRparMappingOutput.failedItems[0]),
]);

const runUnexpectedCommaMappingOutput = lib.runMappingStep("unexpectedCommaMapping", 6);
const testUnexpectedCommaMappingOutput = lib.validateAndTestMapping("unexpectedCommaMapping");
console.log(testUnexpectedCommaMappingOutput.properties.name.errorMessage);
assertions = assertions.concat([
  test.assertEqual("Invalid XPath expression: 'string-join((firstName,,lastName))'. Cause: Unexpected comma."
    , testUnexpectedCommaMappingOutput.properties.name.errorMessage),

  test.assertEqual("Invalid XPath expression: 'string-join((firstName,,lastName))'. Cause: Unexpected comma."
    , runUnexpectedCommaMappingOutput.errors[0].message),
  test.assertEqual("/content/customer.json", runUnexpectedCommaMappingOutput.failedItems[0]),
]);

const runUnexpectedCharacterMappingOutput = lib.runMappingStep("unexpectedCharacterMapping", 7);
const testUnexpectedCharacterMappingOutput = lib.validateAndTestMapping("unexpectedCharacterMapping");

assertions = assertions.concat([
  test.assertEqual("Invalid XPath expression: 'upper-case('a)'. Cause: Unexpected character."
    , testUnexpectedCharacterMappingOutput.properties.name.errorMessage),

  test.assertEqual("Invalid XPath expression: 'upper-case('a)'. Cause: Unexpected character."
    , runUnexpectedCharacterMappingOutput.errors[0].message),
  test.assertEqual("/content/customer.json", runUnexpectedCharacterMappingOutput.failedItems[0]),
]);

assertions;
