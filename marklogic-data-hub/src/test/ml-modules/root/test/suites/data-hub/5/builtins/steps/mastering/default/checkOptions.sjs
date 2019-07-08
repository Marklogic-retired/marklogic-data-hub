const main = require("/data-hub/5/builtins/steps/mastering/default/main.sjs");
const test = require("/test/test-helper.xqy");
const emptySequence = Sequence.from([]);

declareUpdate();

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

let archivedDocs = [{"uri": "/1.json","context":{"originalCollections":["mdm-archived"]}},{"uri": "/2.json","context":{"originalCollections":["mdm-archived"]}}];
let currentDocs = [{"uri": "/3.json","context":{"originalCollections":["mdm-content"]}},{"uri": "/4.json","context":{"originalCollections":["mdm-content"]}},{"uri": "/5.json","context":{"originalCollections":["mdm-content"]}}];
let filteredDocs = [];
let allDocs = Sequence.from(archivedDocs.concat(currentDocs));
main.checkOptions(allDocs, { mergeOptions: {}, matchOptions: {} }, filteredDocs);
assertions.push(test.assertEqual(currentDocs.length, filteredDocs.length,
  `There should be ${currentDocs.length} documents of returned after filtering.`));
assertions.push(test.assertEqual(
  Sequence.from(currentDocs[0].context.originalCollections),
  Sequence.from(filteredDocs[0].context.collections),
  'Original collections should be carried forward.'));

assertions;
