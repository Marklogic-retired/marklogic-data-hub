xquery version "1.0-ml";

xdmp:javascript-eval('
const hubTest = require("/test/data-hub-test-helper.sjs");
hubTest.runWithRolesAndPrivileges(["admin"], ["http://marklogic.com/xdmp/privileges/temporal-document-wipe"], function() {
    declareUpdate();
    var temporal = require("/MarkLogic/temporal.xqy");
    for (let uri of cts.uris(null, null, cts.andQuery([cts.collectionQuery("temporal-test"),cts.collectionQuery("latest")]))) {
        temporal.documentProtect("temporal-test", uri,
            {expireTime: "2000-01-01T00:00:00Z"});
    }
});');

xquery version "1.0-ml";

xdmp:javascript-eval('
const hubTest = require("/test/data-hub-test-helper.sjs");
hubTest.runWithRolesAndPrivileges(["admin"], ["http://marklogic.com/xdmp/privileges/temporal-document-wipe"], function() {
    declareUpdate();
    var temporal = require("/MarkLogic/temporal.xqy");
    for (let uri of cts.uris(null, null, cts.andQuery([cts.collectionQuery("temporal-test"),cts.collectionQuery("latest")]))) {
        temporal.documentWipe("temporal-test", uri);
    }
});');
xquery version "1.0-ml";

xdmp:javascript-eval('
const hubTest = require("/test/data-hub-test-helper.sjs");
hubTest.runWithRolesAndPrivileges(["admin"], [], function() {
    var temporal = require("/MarkLogic/temporal.xqy");
    try {
        temporal.collectionRemove("temporal-test");
    } catch(e) {}
});');

xquery version "1.0-ml";

xdmp:javascript-eval('
const hubTest = require("/test/data-hub-test-helper.sjs");
hubTest.runWithRolesAndPrivileges(["admin"], [], function() {
    var temporal = require("/MarkLogic/temporal.xqy");
    try {
        var validResult = temporal.axisRemove("valid");
        var systemResult = temporal.axisRemove("system");
    } catch(e) {}
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
        config = admin.databaseDeleteRangeFieldIndex(config, dbid, validStart);
        config = admin.databaseDeleteRangeFieldIndex(config, dbid, validEnd);
        config = admin.databaseDeleteRangeFieldIndex(config, dbid, systemStart);
        config = admin.databaseDeleteRangeFieldIndex(config, dbid, systemEnd);
        admin.saveConfiguration(config);
    } catch(e) {}
});');

xquery version "1.0-ml";

xdmp:javascript-eval('
const hubTest = require("/test/data-hub-test-helper.sjs");
hubTest.runWithRolesAndPrivileges(["admin"], [], function() {
    var admin = require("/MarkLogic/admin.xqy");
    var config = admin.getConfiguration();
    var dbid = xdmp.database();
    config = admin.databaseDeleteField(config, dbid, "validStart");
    config = admin.databaseDeleteField(config, dbid, "validEnd");
    config = admin.databaseDeleteField(config, dbid, "systemStart");
    config = admin.databaseDeleteField(config, dbid, "systemEnd");
    admin.saveConfiguration(config);
});');