const flowUtils = require("/data-hub/5/impl/flow-utils.sjs")
const test = require("/test/test-helper.xqy");

const assertions = [];


var options = flowUtils.buildInvokeOptionsForCustomHook("nobody", "data-hub-FINAL");
assertions.push(
  test.assertEqual(true, options.ignoreAmps),
  test.assertEqual(xdmp.user("nobody"), options.userId),
  test.assertEqual(xdmp.database("data-hub-FINAL"), options.database)
);

options = flowUtils.buildInvokeOptionsForCustomHook(null, null);
assertions.push(
  test.assertEqual(true, options.ignoreAmps),
  test.assertNotExists(options.userId),
  test.assertNotExists(options.database)
);

options = flowUtils.buildInvokeOptionsForCustomHook(xdmp.getCurrentUser(), null);
assertions.push(
  test.assertEqual(true, options.ignoreAmps),
  // userId shouldn't be set when the user passed in is the current user
  test.assertNotExists(options.userId),
  test.assertNotExists(options.database)
);

assertions
