'use strict';

const config = require("/com.marklogic.hub/config.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");
const provenanceService = require("../lib/provenanceService.sjs");

const assertions = [];

function assertNeedsPrivilege() {
    try {
        hubTest.runWithRolesAndPrivileges(['data-hub-common'], [], function() {
            provenanceService.pruneProvenance({retainDuration: 'P3D'}, {});
        });
        throw new Error("Expected to fail due to missing privilege");
    } catch (e) {
        assertions.push(test.assertTrue(/Need privilege/.test(e.message), `Error: "${e.message}" should match /Need privilege/`));
    }
}

function assertThrowsBadRequest(badConstants, errRegex) {
    try {
        hubTest.runWithRolesAndPrivileges(['data-hub-operator'], [], function() {
            provenanceService.pruneProvenance(badConstants, {});
        });
        throw new Error("Expected constants to fail validation: " + xdmp.toJsonString(badConstants));
    } catch (e) {
        assertions.push(test.assertTrue(errRegex.test(e.data[1]), `Error: "${xdmp.toJsonString(e)}" should match ${errRegex}`));
    }
}

function pruneProvAsOperator(constants) {
    hubTest.runWithRolesAndPrivileges(['data-hub-operator'], [], function() {
        provenanceService.pruneProvenance(constants, {});
    });
}

const permissions = [xdmp.permission('ps-internal', 'update'), xdmp.permission('ps-user', 'read')];
const collections = ["http://marklogic.com/provenance-services/record"];

function insertProvenanceGeneratedAt(dateTime) {
    let uuid = sem.uuidString();
    xdmp.documentInsert(`/prov/${uuid}.xml`, xdmp.unquote(`
        <prov:document 
            xmlns:prov="http://www.w3.org/ns/prov#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ps="http://marklogic.com/provenance-services" xmlns:dhf="http://marklogic.com/dhf">
            <prov:entity prov:id="testEntity-${uuid}"></prov:entity>
            <prov:wasGeneratedBy>
                <prov:entity prov:ref="testEntity-${uuid}"/>
                <prov:activity prov:ref="testActivity-${uuid}"/>
                <prov:time>${dateTime}</prov:time>
            </prov:wasGeneratedBy>
        </prov:document>`), {collections, permissions});

}

const olderThanAYearCount = 3;
const olderThanAMonthCount = 3;
const olderThanADayCount = 3;

function addProvenanceDocuments() {
    xdmp.invokeFunction(function() {
        hubTest.runWithRolesAndPrivileges(['ps-internal'], [], function() {
            declareUpdate();
            // set time reference 5 seconds earlier to avoid hitting time boundary exactly
            const currentDateTime = fn.currentDateTime().subtract(xs.dayTimeDuration('PT5S'));
            for (let i = 0; i < olderThanAYearCount; i++)
            {
                insertProvenanceGeneratedAt(currentDateTime.subtract(xs.yearMonthDuration('P1Y')));
            }
            for (let i = 0; i < olderThanAMonthCount; i++)
            {
                insertProvenanceGeneratedAt(currentDateTime.subtract(xs.yearMonthDuration('P1M')));
            }
            for (let i = 0; i < olderThanADayCount; i++)
            {
                insertProvenanceGeneratedAt(currentDateTime.subtract(xs.dayTimeDuration('P1D')));
            }
        });
    },{database: xdmp.database(config.JOBDATABASE), update: 'true', commit: 'auto'});
}

function getProvenanceCount() {
    return fn.head(xdmp.invokeFunction(function() {
        return fn.head(hubTest.runWithRolesAndPrivileges(['ps-internal'], [], function() {
            return cts.estimate(cts.collectionQuery('http://marklogic.com/provenance-services/record'));
        }));
    },{database: xdmp.database(config.JOBDATABASE), update: 'false', commit: 'auto'}));
}
assertNeedsPrivilege();
//invalid retainDuration (using D to specify days should be before T)
assertThrowsBadRequest({retainDuration: 'PT3D'}, /Format must be in either xs:yearMonthDuration or xs:dayTimeDuration format/);
//invalid retainDuration due to being negative
assertThrowsBadRequest({retainDuration: '-P3D'}, /The retain duration must be a positive duration./);
//invalid batchSize due to not being an unsigned int
assertThrowsBadRequest({retainDuration: 'P3D', batchSize: 'invalid'}, /batchSize must be an unsigned int/);

addProvenanceDocuments();

assertions.push(test.assertEqual(olderThanAYearCount + olderThanAMonthCount + olderThanADayCount, getProvenanceCount()));

// test removing older than a year
pruneProvAsOperator({ retainDuration: 'P1Y' });
assertions.push(test.assertEqual(olderThanAMonthCount + olderThanADayCount, getProvenanceCount()));

// test removing older than a month
pruneProvAsOperator({ retainDuration: 'P1M' });
assertions.push(test.assertEqual(olderThanADayCount, getProvenanceCount()));

// test removing older than a day
pruneProvAsOperator({ retainDuration: 'P1D' });
assertions.push(test.assertEqual(0, getProvenanceCount()));


assertions;
