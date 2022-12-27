const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const config = mjsProxy.requireMjsModule("/com.marklogic.hub/config.mjs");
const test = require("/test/test-helper.xqy");
const jobs = mjsProxy.requireMjsModule("/data-hub/5/impl/jobs.mjs");

const result = jobs.buildJobPermissions();
const assertions = [
    test.assertEqual("data-hub-job-reader,read,data-hub-job-internal,update", config.JOBPERMISSIONS,
      "The value of this is a token - %%mlJobPermissions%% - that should have been replaced when the config.sjs module was loaded")
  ];
const expectedParsedPermissions = [xdmp.permission('data-hub-job-reader', 'read'), xdmp.permission('data-hub-job-internal', 'update')];
expectedParsedPermissions.forEach((expectedPermission) => {
  assertions.push(test.assertTrue(result.some((permission) => fn.string(expectedPermission.roleId) === fn.string(permission.roleId) && fn.string(expectedPermission.capability) === fn.string(permission.capability)), `The job permissions script should add the data-hub-job-reader/data-hub-job-internal perms to the default permissions of the current user; the flow-developer-role/flow-operator-role update permissions are being retained for backwards compatibility. result: ${xdmp.describe(result, Sequence.from([]), Sequence.from([]))} expected: ${xdmp.describe(expectedPermission)}`));
});

assertions;
