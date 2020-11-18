
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const cma = require("/data-hub/5/data-services/mastering/calculateMergingActivityLib.sjs");
const assertions = [];
hubTest.runWithRolesAndPrivileges(['data-hub-match-merge-reader'], [], function() {
    const results = cma.calculateMergingActivity({ targetEntityType: 'Customer' });
    assertions.push(test.assertEqual(2, results.sourceNames.length, `There should be 2 values in sourceNames: ${xdmp.toJsonString(results.sourceNames)}`));
    assertions.push(test.assertEqual('matchingSourceJSON', results.sourceNames[0], `First source name should be 'matchingSourceJSON': ${results.sourceNames[0]}`));
    assertions.push(test.assertEqual('matchingSourceXML', results.sourceNames[1], `Second source name should be 'matchingSourceXML': ${results.sourceNames[1]}`));
});

assertions;