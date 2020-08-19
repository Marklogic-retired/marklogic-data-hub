xquery version "1.0-ml";

xdmp:javascript-eval('
const hubTest = require("/test/data-hub-test-helper.sjs");
hubTest.runWithRolesAndPrivileges(["admin"], [], function() {
    var admin = require("/MarkLogic/admin.xqy");
    var config = admin.getConfiguration();
    var dbid = xdmp.database();
    var validStart = admin.databaseMetadataField("validStart");
    var validEnd = admin.databaseMetadataField("validEnd");
    var systemStart = admin.databaseMetadataField("systemStart");
    var systemEnd = admin.databaseMetadataField("systemEnd");
    try {
        admin.databaseGetField(config, dbid, "validStart");
    } catch (e) {
        config = admin.databaseAddField(config, dbid, validStart);
    }
    try {
        admin.databaseGetField(config, dbid, "systemEnd");
    } catch (e) {
        config = admin.databaseAddField(config, dbid, validEnd);
    }
    try {
        admin.databaseGetField(config, dbid, "systemEnd");
    } catch (e) {
        config = admin.databaseAddField(config, dbid, systemStart);
    }
    try {
        admin.databaseGetField(config, dbid, "systemEnd");
    } catch (e) {
        config = admin.databaseAddField(config, dbid, systemEnd);
    }
    admin.saveConfiguration(config);
});');

xquery version "1.0-ml";

xdmp:javascript-eval('
const hubTest = require("/test/data-hub-test-helper.sjs");
hubTest.runWithRolesAndPrivileges(["admin"], [], function() {
    var admin = require("/MarkLogic/admin.xqy");
    var config = admin.getConfiguration();
    var dbid = xdmp.database();
    var validStart = admin.databaseRangeFieldIndex(
        "dateTime", "validStart", "", fn.true() );
    var validEnd   = admin.databaseRangeFieldIndex(
        "dateTime", "validEnd", "", fn.true() );
    var systemStart = admin.databaseRangeFieldIndex(
        "dateTime", "systemStart", "", fn.true() );
    var systemEnd   = admin.databaseRangeFieldIndex(
        "dateTime", "systemEnd", "", fn.true() );
    try {
        config = admin.databaseAddRangeFieldIndex(config, dbid, validStart);
        config = admin.databaseAddRangeFieldIndex(config, dbid, validEnd);
        config = admin.databaseAddRangeFieldIndex(config, dbid, systemStart);
        config = admin.databaseAddRangeFieldIndex(config, dbid, systemEnd);
        admin.saveConfiguration(config);
    } catch (e) {}
});');

xquery version "1.0-ml";

xdmp:javascript-eval('
const hubTest = require("/test/data-hub-test-helper.sjs");
hubTest.runWithRolesAndPrivileges(["admin"], [], function() {
    var temporal = require("/MarkLogic/temporal.xqy");
    try {
        var validResult = temporal.axisCreate(
            "valid", 
            cts.fieldReference("validStart", "type=dateTime"), 
            cts.fieldReference("validEnd", "type=dateTime"));
    } catch (e) {}
    try {
        var systemResult = temporal.axisCreate(
            "system", 
            cts.fieldReference("systemStart", "type=dateTime"), 
            cts.fieldReference("systemEnd", "type=dateTime"));
    } catch (e) {}
});');


xquery version "1.0-ml";

xdmp:javascript-eval('
const hubTest = require("/test/data-hub-test-helper.sjs");
hubTest.runWithRolesAndPrivileges(["admin","data-hub-common"], [], function() {
    var temporal = require("/MarkLogic/temporal.xqy");
    try {
        var collectionResult = temporal.collectionCreate("temporal-test", "system", "valid");
    } catch (e) {}
});');
