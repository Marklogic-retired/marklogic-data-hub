const Security = require('/data-hub/5/impl/security.sjs');
const sec = new Security();

const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");

const assertions = [];
assertions.push(
 test.assertTrue(sec.getDataHubAuthorities().includes('manageSavedQuery'), 'Authority for manageSavedQuery should be returned')
);
let err = null;
try {
    sec.dataHubAuthorityAssert('manageSavedQuery');
} catch (e) {
    err = e;
}
assertions.push(
    test.assertTrue(err === null, `Unexpected exception: ${err}`)
);
err = null;
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

assertions;