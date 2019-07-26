const main = require("/data-hub/5/builtins/steps/mastering/default/main.sjs");
const test = require("/test/test-helper.xqy");
const emptySequence = Sequence.from([]);

let assertions = [];
let errorCount = 0;
try {
  main.checkOptions(emptySequence, {});
} catch (exc) {
  errorCount = errorCount + 1;
  assertions.push(test.assertTrue(/mergeOptions/.test(exc.message) && /matchOptions/.test(exc.message), `Error should contain matchOptions and mergeOptions. (Error: ${exc.message})`))
}
try {
  main.checkOptions(emptySequence, { matchOptions: {}});
} catch (exc) {
  errorCount = errorCount + 1;
  assertions.push(test.assertTrue(/mergeOptions/.test(exc.message) && !/matchOptions/.test(exc.message), `Error should contain mergeOptions. (Error: ${exc.message})`))
}
try {
  main.checkOptions(emptySequence, { mergeOptions: {} });
} catch (exc) {
  errorCount = errorCount + 1;
  assertions.push(test.assertTrue(!/mergeOptions/.test(exc.message) && /matchOptions/.test(exc.message), `Error should contain matchOptions. (Error: ${exc.message})`))
}
assertions.push(test.assertEqual(errorCount, 3,
    "3 errors should have been thrown by checkOptions"));
assertions;
