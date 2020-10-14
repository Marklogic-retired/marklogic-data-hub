/*
Contains helper functions that are best written in SJS instead of XQuery.
 */

'use strict';

const hubTest = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

function runWithRolesAndPrivileges(roles, privileges, funOrModule, variables)
{
    hubTest.assertCalledFromTest();
    const securityOptions = { "defaultXqueryVersion": "1.0-ml", "database": xdmp.securityDatabase() };
    try {
        xdmp.invoke("/test/invoke/create-test-role.xqy", {"roles": Sequence.from(roles), "privileges": Sequence.from(privileges)}, securityOptions);
    } catch (e) {
        throw e;
    }
    const userId = fn.head(xdmp.invoke("/test/invoke/create-test-user.xqy", {}, securityOptions));
    const cleanUp = function() {
        try {
            xdmp.invoke("/test/invoke/delete-test-role.xqy", {},securityOptions);
        } catch (e) {
        }
        try {
            xdmp.invoke("/test/invoke/delete-test-user.xqy", {}, securityOptions);
        } catch (e) {
        }
    }
    let execute;
    try {
        if (funOrModule instanceof Function || typeof funOrModule === 'function') {
            execute = xdmp.invokeFunction(funOrModule, {userId});
        } else {
            execute = xdmp.invoke(funOrModule, variables, {userId});
        }
    } catch (e) {
        cleanUp();
        throw e;
    }
    cleanUp();
    return execute;
}

function verifyJson(expectedObject, actualObject, assertions) {
  Object.keys(expectedObject).forEach(key => {
    const expectedValue = expectedObject[key];
    if (Array.isArray(expectedValue)) {
      assertions.push(hubTest.assertArraysEqual(expectedValue, actualObject[key]));
    } else {
      assertions.push(test.assertEqual(expectedValue, actualObject[key]));
    }
  });
}

/**
 * Helper function for when you want a "Record" object that contains the URI, document, and metadata. Feel free to
 * add new keys to this object as needed. Note that collections and permissions are sorted to allow for reliable
 * assertions on specific indexes in the arrays.
 *
 * @param uri
 * @returns {*|this|this}
 */
function getRecord(uri) {
  return fn.head(xdmp.invokeFunction(function() {
    return {
      uri : uri.toString(),
      document : cts.doc(uri).toObject(),
      collections : xdmp.documentGetCollections(uri).sort(),
      permissions : buildPermissionsMap(xdmp.documentGetPermissions(uri)),
      metadata : xdmp.documentGetMetadata(uri)
    }
  }));
}

/**
 * Intended for the common use case of - I know my test module just did something that resulted in one document being
 * written to a certain collection, so gimme back a Record for that document.
 *
 * @param collection
 * @returns {*|*}
 */
function getRecordInCollection(collection) {
  const uris = xdmp.eval('cts.uris(null, null, cts.collectionQuery("' + collection + '"))').toArray();
  if (uris.length != 1) {
    throw Error("Expected single document to be in collection: " + collection);
  }
  return getRecord(uris[0]);
}

/**
 * Makes life easy for verifying permissions by building a map of them, keyed on role name, with arrays of capabilities
 * as values.
 *
 * @param permissions
 * @returns {{}}
 */
function buildPermissionsMap(permissions) {
  const map = {};
  permissions.forEach(perm => {
    const roleName = xdmp.roleName(perm.roleId);
    if (map[roleName]) {
      map[roleName].push(perm.capability);
    } else {
      map[roleName] = [perm.capability];
    }
  })
  Object.keys(map).forEach(key => map[key].sort());
  return map;
}

module.exports = {
  getRecord,
  getRecordInCollection,
  verifyJson,
  runWithRolesAndPrivileges: module.amp(runWithRolesAndPrivileges)
};
