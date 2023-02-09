import lib from "/test/suites/data-hub/5/mapping/mapping-errors/lib/lib.mjs";

const test = require("/test/test-helper.xqy");

let assertions = [];

const runMappingOutput = lib.runMappingStep("invalidLexicalValueMapping", 4);
const testMappingOutput = lib.validateAndTestMapping("invalidLexicalValueMapping");

assertions = assertions.concat([
  test.assertEqual("Data type mismatch. Cause: Returned type value (\"abc\") from a mapping expression does not match expected property type (integer)."
    , testMappingOutput.properties.customerId.errorMessage),

  test.assertEqual("Data type mismatch. Cause: Returned type value (\"abc\") from a mapping expression does not match expected property type (integer)."
    , runMappingOutput.errors[0].message),
  test.assertEqual("/content/customer.json", runMappingOutput.failedItems[0]),
]);

assertions;
