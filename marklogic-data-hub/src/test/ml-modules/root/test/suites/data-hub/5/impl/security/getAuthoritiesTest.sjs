const Security = require('/data-hub/5/impl/security.sjs');

const test = require("/test/test-helper.xqy");

const sec = new Security();

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

assertions;