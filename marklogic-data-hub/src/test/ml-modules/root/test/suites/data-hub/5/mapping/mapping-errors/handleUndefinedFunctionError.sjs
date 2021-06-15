const test = require("/test/test-helper.xqy");
const lib = require("lib/lib.sjs")
let assertions = [];

const runMappingOutput = lib.runMappingStep("undefinedFunctionMapping", 1);
const testMappingOutput = lib.validateAndTestMapping("undefinedFunctionMapping");

assertions = assertions.concat([
  test.assertEqual("Unable to find function: 'parseDate()'. Cause: Either the function does not exist or the wrong number of arguments were specified."
    , testMappingOutput.properties.customerId.errorMessage),
  test.assertEqual("Unable to find function: 'unavailableFunction()'. Cause: Either the function does not exist or the wrong number of arguments were specified."
    , testMappingOutput.properties.name.errorMessage),

  test.assertEqual("Unable to find function: 'parseDate()'. Cause: Either the function does not exist or the wrong number of arguments were specified."
    , runMappingOutput.errors[0].message),
  test.assertEqual("/content/customer.json", runMappingOutput.failedItems[0]),
]);

assertions;
