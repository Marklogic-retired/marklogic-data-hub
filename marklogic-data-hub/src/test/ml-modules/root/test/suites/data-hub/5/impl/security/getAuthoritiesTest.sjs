const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");

const assertions = [];

// Test minimal hub-central-user

hubTest.runWithRolesAndPrivileges(['hub-central-user'], [], function() {
    const authorities = require('/data-hub/5/impl/security.sjs').getAuthorities();
    assertions.push(test.assertEqual(1, authorities.length, 'hub-central-user should only have 1 authority'));
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-user should only have "loginToHubCentral"'));
});

// Test hub-central-load-reader
hubTest.runWithRolesAndPrivileges(['hub-central-load-reader'], [], function() {
    const authorities = require('/data-hub/5/impl/security.sjs').getAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-load-reader should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readIngestion'), 'hub-central-load-reader should have "readIngestion"'));
    assertions.push(test.assertFalse(authorities.includes('writeIngestion'), 'hub-central-load-reader should not have "writeIngestion"'));
});

// Test hub-central-load-writer
hubTest.runWithRolesAndPrivileges(['hub-central-load-writer'], [], function() {
    const authorities = require('/data-hub/5/impl/security.sjs').getAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-load-writer should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readIngestion'), 'hub-central-load-writer should have "readIngestion"'));
    assertions.push(test.assertTrue(authorities.includes('writeIngestion'), 'hub-central-load-writer should  have "writeIngestion"'));
});

// Test hub-central-mapping-reader
hubTest.runWithRolesAndPrivileges(['hub-central-mapping-reader'], [], function() {
    const authorities = require('/data-hub/5/impl/security.sjs').getAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-mapping-reader should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readMapping'), 'hub-central-mapping-reader should have "readMapping"'));
    assertions.push(test.assertFalse(authorities.includes('writeMapping'), 'hub-central-mapping-reader should not have "writeMapping"'));
});

// Test hub-central-mapping-writer
hubTest.runWithRolesAndPrivileges(['hub-central-mapping-writer'], [], function() {
    const authorities = require('/data-hub/5/impl/security.sjs').getAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-mapping-writer should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readMapping'), 'hub-central-mapping-writer should have "readMapping"'));
    assertions.push(test.assertTrue(authorities.includes('writeMapping'), 'hub-central-mapping-writer should have "writeMapping"'));
});

// Test hub-central-match-merge-reader
hubTest.runWithRolesAndPrivileges(['hub-central-match-merge-reader'], [], function() {
    const authorities = require('/data-hub/5/impl/security.sjs').getAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-match-merge-reader should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readMatching'), 'hub-central-match-merge-reader should have "readMatching"'));
    assertions.push(test.assertFalse(authorities.includes('writeMatching'), 'hub-central-match-merge-reader should not have "writeMatching"'));
    assertions.push(test.assertTrue(authorities.includes('readMerging'), 'hub-central-match-merge-reader should have "readMerging"'));
    assertions.push(test.assertFalse(authorities.includes('writeMerging'), 'hub-central-match-merge-reader should not have "writeMerging"'));
});

// Test hub-central-match-merge-writer
hubTest.runWithRolesAndPrivileges(['hub-central-match-merge-writer'], [], function() {
    const authorities = require('/data-hub/5/impl/security.sjs').getAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-match-merge-writer should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readMatching'), 'hub-central-match-merge-reader should have "readMatching"'));
    assertions.push(test.assertTrue(authorities.includes('writeMatching'), 'hub-central-match-merge-reader should have "writeMatching"'));
    assertions.push(test.assertTrue(authorities.includes('readMerging'), 'hub-central-match-merge-reader should have "readMerging"'));
    assertions.push(test.assertTrue(authorities.includes('writeMerging'), 'hub-central-match-merge-reader should have "writeMerging"'));
});

// Test hub-central-step-runner
hubTest.runWithRolesAndPrivileges(['hub-central-step-runner'], [], function() {
    const authorities = require('/data-hub/5/impl/security.sjs').getAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-step-runner should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readFlow'), 'hub-central-step-runner should have "readFlow"'));
    assertions.push(test.assertTrue(authorities.includes('runStep'), 'hub-central-step-runner should have "runStep"'));
    assertions.push(test.assertFalse(authorities.includes('writeFlow'), 'hub-central-step-runner should not have "writeFlow"'));
});

// Test hub-central-custom-reader
hubTest.runWithRolesAndPrivileges(['hub-central-custom-reader'], [], function() {
    const authorities = require('/data-hub/5/impl/security.sjs').getAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-custom-reader should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readCustom'), 'hub-central-custom-reader should have "readStepDefinition"'));
    assertions.push(test.assertFalse(authorities.includes('writeStepDefinition'), 'hub-central-custom-reader should not have "writeStepDefinition"'));
});

assertions;
