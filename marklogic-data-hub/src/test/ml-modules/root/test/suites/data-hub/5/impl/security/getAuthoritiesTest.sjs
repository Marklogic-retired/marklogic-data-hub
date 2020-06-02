const Security = require('/data-hub/5/impl/security.sjs');
const sec = new Security();

const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");

const assertions = [];
let err = null;
try {
    sec.dataHubAuthorityAssert('bogusAuthority');
} catch (e) {
    err = e;
}
assertions.push(
    test.assertTrue(err !== null, `Expected an exception for missing authority`)
);

// Test minimal hub-central-user

hubTest.runWithRolesAndPrivileges(['hub-central-user'], [], function() {
    const Security = require('/data-hub/5/impl/security.sjs');
    const authorities = new Security().getDataHubAuthorities();
    assertions.push(test.assertEqual(1, authorities.length, 'hub-central-user should only have 1 authority'));
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-user should only have "loginToHubCentral"'));
});

// Test hub-central-load-reader
hubTest.runWithRolesAndPrivileges(['hub-central-load-reader'], [], function() {
    const Security = require('/data-hub/5/impl/security.sjs');
    const authorities = new Security().getDataHubAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-load-reader should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readIngestion'), 'hub-central-load-reader should have "readIngestion"'));
    assertions.push(test.assertFalse(authorities.includes('writeIngestion'), 'hub-central-load-reader should not have "writeIngestion"'));
});

// Test hub-central-load-writer
hubTest.runWithRolesAndPrivileges(['hub-central-load-writer'], [], function() {
    const Security = require('/data-hub/5/impl/security.sjs');
    const authorities = new Security().getDataHubAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-load-writer should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readIngestion'), 'hub-central-load-writer should have "readIngestion"'));
    assertions.push(test.assertTrue(authorities.includes('writeIngestion'), 'hub-central-load-writer should  have "writeIngestion"'));
});

// Test hub-central-mapping-reader
hubTest.runWithRolesAndPrivileges(['hub-central-mapping-reader'], [], function() {
    const Security = require('/data-hub/5/impl/security.sjs');
    const authorities = new Security().getDataHubAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-mapping-reader should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readMapping'), 'hub-central-mapping-reader should have "readMapping"'));
    assertions.push(test.assertFalse(authorities.includes('writeMapping'), 'hub-central-mapping-reader should not have "writeMapping"'));
});

// Test hub-central-mapping-writer
hubTest.runWithRolesAndPrivileges(['hub-central-mapping-writer'], [], function() {
    const Security = require('/data-hub/5/impl/security.sjs');
    const authorities = new Security().getDataHubAuthorities();
    assertions.push(test.assertTrue(authorities.includes('loginToHubCentral'), 'hub-central-mapping-writer should have "loginToHubCentral"'));
    assertions.push(test.assertTrue(authorities.includes('readMapping'), 'hub-central-mapping-writer should have "readMapping"'));
    assertions.push(test.assertTrue(authorities.includes('writeMapping'), 'hub-central-mapping-writer should have "writeMapping"'));
});
assertions;