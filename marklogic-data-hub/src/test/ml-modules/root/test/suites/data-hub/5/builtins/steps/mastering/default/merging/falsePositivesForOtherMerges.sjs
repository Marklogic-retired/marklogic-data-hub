const merging = require("/data-hub/5/builtins/steps/mastering/default/merging.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];
let caughtException = null;
//try {
    merging.main({uri: '/merge-with-doc1.json'}, {mergeOptions: {}});
//} catch (e) {
//    caughtException = e;
//}
assertions.push(test.assertFalse(!!caughtException, `Call threw exception unexpectedly. (Exception: ${caughtException})`));
assertions;