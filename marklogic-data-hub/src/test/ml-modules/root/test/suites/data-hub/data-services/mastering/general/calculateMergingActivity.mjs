import cma from "/data-hub/data-services/mastering/calculateMergingActivityLib.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";
const test = require("/test/test-helper.xqy");

const assertions = [];
hubTest.runWithRolesAndPrivileges(['data-hub-match-merge-reader'], [], function() {
    const results = cma.calculateMergingActivity({ targetEntityType: 'Customer' });
    assertions.push(test.assertEqual(2, results.sourceNames.length, `There should be 2 values in sourceNames: ${xdmp.toJsonString(results.sourceNames)}`));
    assertions.push(test.assertEqual('matchingSourceJSON', results.sourceNames[0], `First source name should be 'matchingSourceJSON': ${results.sourceNames[0]}`));
    assertions.push(test.assertEqual('matchingSourceXML', results.sourceNames[1], `Second source name should be 'matchingSourceXML': ${results.sourceNames[1]}`));
});

assertions;
