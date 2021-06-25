const test = require("/test/test-helper.xqy");
const lib = require("lib/lib.sjs")
let assertions = [];

const runTooFewArgsMappingOutput = lib.runMappingStep("tooFewArgsMapping", 8);
const testTooFewArgsMappingOutput = lib.validateAndTestMapping("tooFewArgsMapping");

assertions = assertions.concat([
  test.assertEqual("Wrong number of arguments: 'upper-case()'. Cause: Requires 1 arguments but received 0."
    , testTooFewArgsMappingOutput.properties.name.errorMessage),

  test.assertEqual("Wrong number of arguments: 'upper-case()'. Cause: Requires 1 arguments but received 0."
    , runTooFewArgsMappingOutput.errors[0].message),
  test.assertEqual("/content/customer.json", runTooFewArgsMappingOutput.failedItems[0]),
]);

const runTooManyArgsMappingOutput = lib.runMappingStep("tooManyArgsMapping", 9);
const testTooManyArgsMappingOutput = lib.validateAndTestMapping("tooManyArgsMapping");

assertions = assertions.concat([
  test.assertEqual("Wrong number of arguments: 'lower-case(\"a\", \"b\")'. Cause: Requires 1 arguments but received 2."
    , testTooManyArgsMappingOutput.properties.name.errorMessage),

  test.assertEqual("Wrong number of arguments: 'lower-case(\"a\", \"b\")'. Cause: Requires 1 arguments but received 2."
    , runTooManyArgsMappingOutput.errors[0].message),
  test.assertEqual("/content/customer.json", runTooManyArgsMappingOutput.failedItems[0]),
]);

assertions;
