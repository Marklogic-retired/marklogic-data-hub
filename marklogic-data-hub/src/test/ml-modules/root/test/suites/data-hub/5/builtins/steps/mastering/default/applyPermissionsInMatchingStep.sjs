const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const matching = mjsProxy.requireMjsModule("/data-hub/5/builtins/steps/mastering/default/matching.mjs");
const test = require("/test/test-helper.xqy");

let result = matching.buildResult(
  {"anything": "works here"},
  {permissions: "data-hub-operator,read,data-hub-developer,update"},
  ["coll1", "coll2"]
);

let assertions = [
  test.assertEqual("works here", result.value.anything),
  test.assertEqual("coll1", result.context.collections[0]),
  test.assertEqual("coll2", result.context.collections[1]),

  test.assertEqual("data-hub-operator", xdmp.roleName(result.context.permissions[0].roleId)),
  test.assertEqual("read", result.context.permissions[0].capability),
  test.assertEqual("data-hub-developer", xdmp.roleName(result.context.permissions[1].roleId)),
  test.assertEqual("update", result.context.permissions[1].capability)
];

result = matching.buildResult(
  {"anything": "works here"},
  ["coll1"]
);

assertions.push(
  test.assertEqual("works here", result.value.anything),
  test.assertTrue(result.context.permissions == undefined,
    "If permissions are not in the step options, then no permissions should be assigned to the context")
);

assertions;
