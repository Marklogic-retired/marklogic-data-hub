'use strict';

const hubTest = require("/test/data-hub-test-helper.xqy");

function runWithRolesAndPrivileges(roles, privileges, fun)
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
        execute = xdmp.invokeFunction(fun, {userId});
    } catch (e) {
        cleanUp();
        throw e;
    }
    cleanUp();
    return execute;
}

exports.runWithRolesAndPrivileges = module.amp(runWithRolesAndPrivileges);