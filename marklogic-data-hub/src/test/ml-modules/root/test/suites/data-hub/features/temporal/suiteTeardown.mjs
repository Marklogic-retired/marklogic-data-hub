import hubTest from "/test/data-hub-test-helper.mjs";
const temporal = require("/MarkLogic/temporal.xqy");

const roles = ["admin"];

hubTest.runWithRolesAndPrivileges(roles, [], function () {
  xdmp.invokeFunction(function () {
    temporal.documentProtect( "koolTest", "/affiliate1.json",
      {  expireTime: fn.currentDateTime() }
    );
  }, {update: "true"});
});

hubTest.runWithRolesAndPrivileges(roles, [], function () {
  xdmp.invokeFunction(function () {
    temporal.documentWipe( "koolTest", "/affiliate1.json" );
  }, {update: "true"});
});
hubTest.runWithRolesAndPrivileges(roles, [], function () {
  xdmp.invokeFunction(function () {
    temporal.collectionRemove("koolTest");
    temporal.axisRemove("system");
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
      config = admin.databaseDeleteRangeElementIndex(config, xdmp.database(), elementRangeIndex);
    });
    admin.saveConfiguration(config);
  });
});
