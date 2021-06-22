const test = require("/test/test-helper.xqy");
const lib = require("lib/lib.sjs")
let assertions = [];

const runMappingOutput = lib.runMappingStep("cannotComputeMapping", 2);
const testMappingOutput = lib.validateAndTestMapping("cannotComputeMapping");

assertions = assertions.concat([
  test.assertEqual("Cannot compute. Cause: The provided argument(s) for a mapping expression include invalid values."
    , testMappingOutput.properties.customerId.errorMessage),

  test.assertEqual("Cannot compute. Cause: The provided argument(s) for a mapping expression include invalid values."
    , runMappingOutput.errors[0].message),
  test.assertEqual("/content/customer.json", runMappingOutput.failedItems[0]),
]);

assertions;
