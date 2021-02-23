const Flow = require("/data-hub/5/impl/flow.sjs")
const test = require("/test/test-helper.xqy");
const results = [];

const flow = new Flow();

var options = flow.buildCustomHookInvokeOptions("nobody", "data-hub-FINAL");
results.push(
  test.assertEqual(true, options.ignoreAmps),
  test.assertEqual(xdmp.user("nobody"), options.userId),
  test.assertEqual(xdmp.database("data-hub-FINAL"), options.database)
);

options = flow.buildCustomHookInvokeOptions(null, null);
results.push(
  test.assertEqual(true, options.ignoreAmps),
  test.assertNotExists(options.userId),
  test.assertNotExists(options.database)
);

options = flow.buildCustomHookInvokeOptions(xdmp.getCurrentUser(), null);
results.push(
  test.assertEqual(true, options.ignoreAmps),
  // userId shouldn't be set when the user passed in is the current user
  test.assertNotExists(options.userId),
  test.assertNotExists(options.database)
);

results
