const merging = require("/data-hub/5/builtins/steps/mastering/default/merging.sjs");
const test = require("/test/test-helper.xqy");

let results = [
  {
    uri: "deleteMe",
    "$delete": true
  },
  {
    uri: "hasPermissions",
    context: {
      permissions: [xdmp.permission("manage-user", "read"), xdmp.permission("manage-admin", "update")]
    }
  },
  {
    uri: "hasContextNoPermissions",
    context: {}
  },
  {
    uri: "noContext"
  },
  {
    uri: "hasPermissionsObject",
    context: {
      permissions: xdmp.permission("manage-user", "read")
    }
  }
];

merging.applyPermissionsFromOptions(results, {permissions: "data-hub-operator,read,data-hub-developer,update"});

let assertions = [
  test.assertTrue(results[0].context == null, "Permissions aren't deleted for a document that is intended to be deleted")
];

let perms = results[1].context.permissions;
assertions.push(
  test.assertEqual(4, perms.length),
  test.assertEqual("data-hub-operator", xdmp.roleName(perms[0].roleId)),
  test.assertEqual("read", perms[0].capability),
  test.assertEqual("data-hub-developer", xdmp.roleName(perms[1].roleId)),
  test.assertEqual("update", perms[1].capability),
  test.assertEqual("manage-user", xdmp.roleName(perms[2].roleId)),
  test.assertEqual("read", perms[2].capability),
  test.assertEqual("manage-admin", xdmp.roleName(perms[3].roleId)),
  test.assertEqual("update", perms[3].capability)
);

perms = results[2].context.permissions;
assertions.push(
  test.assertEqual(2, perms.length),
  test.assertEqual("data-hub-operator", xdmp.roleName(perms[0].roleId)),
  test.assertEqual("read", perms[0].capability),
  test.assertEqual("data-hub-developer", xdmp.roleName(perms[1].roleId)),
  test.assertEqual("update", perms[1].capability)
);

perms = results[3].context.permissions;
assertions.push(
  test.assertEqual(2, perms.length),
  test.assertEqual("data-hub-operator", xdmp.roleName(perms[0].roleId)),
  test.assertEqual("read", perms[0].capability),
  test.assertEqual("data-hub-developer", xdmp.roleName(perms[1].roleId)),
  test.assertEqual("update", perms[1].capability)
);

perms = results[4].context.permissions;
assertions.push(
  test.assertEqual(3, perms.length),
  test.assertEqual("data-hub-operator", xdmp.roleName(perms[0].roleId)),
  test.assertEqual("read", perms[0].capability),
  test.assertEqual("data-hub-developer", xdmp.roleName(perms[1].roleId)),
  test.assertEqual("update", perms[1].capability),
  test.assertEqual("manage-user", xdmp.roleName(perms[2].roleId)),
  test.assertEqual("read", perms[2].capability)
);

assertions;
