const hubTest = require("/test/data-hub-test-helper.sjs");
const temporal = require("/MarkLogic/temporal.xqy");

const roles = ["admin"];

hubTest.runWithRolesAndPrivileges(roles, [], function () {
  xdmp.invokeFunction(function () {
    try {
      temporal.axisRemove("system");
    } catch (e) {
    }
  }, {update: "true"});
});

hubTest.runWithRolesAndPrivileges(roles, [], function () {
  xdmp.invokeFunction(function () {
    const admin = require("/MarkLogic/admin");
    let config = admin.getConfiguration();
    let elementRangeIndexes = [
      admin.databaseRangeElementIndex("dateTime", "", "systemStart", "", fn.false()),
      admin.databaseRangeElementIndex("dateTime", "", "systemEnd", "", fn.false())]
    elementRangeIndexes.forEach((elementRangeIndex) => {
      try {
        config = admin.databaseAddRangeElementIndex(config, xdmp.database(), elementRangeIndex);
      } catch (e) {
      }
    });
    admin.saveConfiguration(config);
  });
});

hubTest.runWithRolesAndPrivileges(roles, [], function () {
  xdmp.invokeFunction(function () {
    temporal.axisCreate("system", cts.elementReference("systemStart", "type=dateTime"), cts.elementReference("systemEnd", "type=dateTime"));
    temporal.collectionCreate("kool", "system", null, "updates-admin-override");
  }, {update: "true"});
});
