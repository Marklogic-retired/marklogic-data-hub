'use strict';

const config = require("/com.marklogic.hub/config.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const securityService = require("../lib/securityService.sjs");
const test = require("/test/test-helper.xqy");

const roleName = "test-describe-role";

let response;
hubTest.runWithRolesAndPrivileges(['data-hub-user-reader', 'data-hub-module-reader'], ['http://marklogic.com/xdmp/privileges/xdmp-invoke'], function() {
  response = securityService.describeRole(roleName);
});

[
  test.assertEqual(roleName, response.roleName),
  test.assertEqual(config.HUBVERSION, response.hubVersion,
    "The DHF version is included since that impacts stuff inherited from DHF roles"),
  test.assertEqual(xdmp.version(), response.markLogicVersion,
    "The ML version is included since that impacts stuff inherited from OOTB ML roles"),

  test.assertTrue(response.roleNames.includes("data-hub-common"),
    "data-hub-common should be included because test-describe-role inherits it"),
  test.assertTrue(response.roleNames.includes("rest-reader"),
    "rest-reader should be included because data-hub-common inherits it"),

  // Verify a couple privileges - we again don't care about the exact count, just that at least some are coming through
  test.assertTrue(response.privilegeNames.includes("rest-reader"),
    "Verifying that rest-reader exists verifies that privileges from inherited roles are included"),
  test.assertTrue(response.privilegeNames.includes("sem:sparql")),
  test.assertTrue(response.privilegeNames.includes("xdmp:with-namespaces")),

  test.assertTrue(response.defaultCollections.includes("test-describe-role-collection")),
  test.assertTrue(response.defaultCollections.includes("test-shared-collection")),
  test.assertEqual(2, response.defaultCollections.length),

  test.assertEqual(2, response.defaultPermissions.length),
  test.assertEqual("data-hub-common", response.defaultPermissions[0].roleName),
  test.assertEqual("read", response.defaultPermissions[0].capability),
  test.assertEqual("qconsole-user", response.defaultPermissions[1].roleName),
  test.assertEqual("update", response.defaultPermissions[1].capability)
]