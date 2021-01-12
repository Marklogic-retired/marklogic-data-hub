'use strict';

const config = require("/com.marklogic.hub/config.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const securityService = require("../lib/securityService.sjs");
const test = require("/test/test-helper.xqy");

const username = "test-describe-user";

let response;
hubTest.runWithRolesAndPrivileges(['data-hub-user-reader', 'data-hub-module-reader'], ['http://marklogic.com/xdmp/privileges/xdmp-invoke'], function () {
  response = securityService.describeUser(username);
});

[
  test.assertEqual(username, response.username),
  test.assertEqual(config.HUBVERSION, response.hubVersion,
    "The DHF version is included since that impacts stuff inherited from DHF roles"),
  test.assertEqual(xdmp.version(), response.markLogicVersion,
    "The ML version is included since that impacts stuff inherited from OOTB ML roles"),

  test.assertTrue(response.roleNames.includes("test-describe-role")),
  test.assertTrue(response.roleNames.includes("data-hub-common"),
    "data-hub-common should be included because test-describe-role inherits it"),
  test.assertTrue(response.roleNames.includes("rest-reader"),
    "rest-reader should be included because data-hub-common inherits it"),

  // Verify a couple privileges - we again don't care about the exact count, just that at least some are coming through
  test.assertTrue(response.privilegeNames.includes("rest-reader"),
    "Verifying that rest-reader exists verifies that privileges from inherited roles are included"),
  test.assertTrue(response.privilegeNames.includes("sem:sparql")),
  test.assertTrue(response.privilegeNames.includes("xdmp:with-namespaces")),

  test.assertTrue(response.defaultCollections.includes("test-describe-user-collection")),
  test.assertTrue(response.defaultCollections.includes("test-describe-role-collection"),
    "Verifying that default collections are obtained from roles too"),
  test.assertTrue(response.defaultCollections.includes("test-shared-collection")),
  test.assertEqual(3, response.defaultCollections.length,
    "Length should be 3 as test-shared-collection should only show up once (duplicates should not be added)"),

  test.assertEqual(3, response.defaultPermissions.length,
    "Expecting 1 unique from the user, 1 unique from test-describe-role, and 1 common to both"),
  test.assertEqual("data-hub-common", response.defaultPermissions[0].roleName),
  test.assertEqual("read", response.defaultPermissions[0].capability),
  test.assertEqual("data-hub-common-writer", response.defaultPermissions[1].roleName),
  test.assertEqual("update", response.defaultPermissions[1].capability),
  test.assertEqual("qconsole-user", response.defaultPermissions[2].roleName),
  test.assertEqual("update", response.defaultPermissions[2].capability)
]
