const test = require("/test/test-helper.xqy");
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const commonValidateLib = mjsProxy.requireMjsModule("/data-hub/5/data-services/mastering/validateStepCommonLib.mjs");

const testCollections = ['testCol'];
[
    test.assertEqual(
        "Warning: Target Collections includes the source collection testCol",
        commonValidateLib.sourceCollectionWarning(' cts.collectionQuery( [ "testCol" ] )', testCollections).message,
        "Can parse sourceQuery with spaces."),
    test.assertEqual(
        "Warning: Target Collections includes the source collection testCol",
        commonValidateLib.sourceCollectionWarning('cts.collectionQuery("testCol")', testCollections).message,
        "Can parse sourceQuery without array."),
    test.assertEqual(
        "Warning: Target Collections includes the source collection testCol",
        commonValidateLib.sourceCollectionWarning('cts.collectionQuery(\'testCol\')', testCollections).message,
        "Can parse sourceQuery with single-quotes.")
];
