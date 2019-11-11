const config = require("/com.marklogic.hub/config.sjs");
const test = require("/test/test-helper.xqy");
const Jobs = require("/data-hub/5/impl/jobs.sjs");

const result = new Jobs().buildJobPermissionsScript(config);
[
  test.assertEqual("data-hub-job-reader,read,data-hub-job-internal,update", config.JOBPERMISSIONS,
    "The value of this is a token - %%mlJobPermissions%% - that should have been replaced when the config.sjs module was loaded"),

  test.assertEqual("xdmp.defaultPermissions().concat([" +
    "xdmp.permission('flow-developer-role', 'update'), " +
    "xdmp.permission('flow-operator-role', 'update'), " +
    "xdmp.permission('data-hub-job-reader', 'read'), " +
    "xdmp.permission('data-hub-job-internal', 'update')" +
    "])", result,
    "The job permissions script should add the data-hub-job-reader/data-hub-job-internal perms to the default permissions of the current user; " +
    "the flow-developer-role/flow-operator-role update permissions are being retained for backwards compatibility.")
];
