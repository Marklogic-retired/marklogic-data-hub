const config = require("/com.marklogic.hub/config.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");

xdmp.invokeFunction(function() {
    hubTest.runWithRolesAndPrivileges(['ps-internal'], [], function() {
        declareUpdate();
        xdmp.collectionDelete('http://marklogic.com/provenance-services/record');
    });
},{database: xdmp.database(config.JOBDATABASE), update: 'true', commit: 'auto'});