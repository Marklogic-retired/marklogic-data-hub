'use strict';

import hubTest from "/test/data-hub-test-helper.mjs";
import securityService from "../lib/securityService.mjs";
const test = require("/test/test-helper.xqy");

const roleName = "data-hub-spawn-user";

let response;
hubTest.runWithRolesAndPrivileges(['data-hub-user-reader', 'data-hub-module-reader'], ['http://marklogic.com/xdmp/privileges/xdmp-invoke'], function () {
  response = securityService.describeRole(roleName);
});

const assertions = [
  test.assertEqual(roleName, response.roleName),
  test.assertEqual(1, response.privilegeNames.length, "Should have the single spawn privilege that comes from the role being tested"),
  test.assertEqual("xdmp:spawn", response.privilegeNames[0])
];

assertions;
