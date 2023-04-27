import commonValidateLib from "/data-hub/data-services/mastering/validateStepCommonLib.mjs";

const test = require("/test/test-helper.xqy");

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
