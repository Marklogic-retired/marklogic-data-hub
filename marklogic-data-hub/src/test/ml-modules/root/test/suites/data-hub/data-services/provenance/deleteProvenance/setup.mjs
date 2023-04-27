import config from "/com.marklogic.hub/config.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";

xdmp.invokeFunction(function() {
    hubTest.runWithRolesAndPrivileges(['ps-internal'], [], function() {
        declareUpdate();
        xdmp.collectionDelete('http://marklogic.com/provenance-services/record');
    });
},{database: xdmp.database(config.JOBDATABASE), update: 'true', commit: 'auto'});