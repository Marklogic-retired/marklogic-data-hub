const lib = require("/data-hub/5/builtins/steps/mastering/default/lib.sjs");
const test = require("/test/test-helper.xqy");
const emptySequence = Sequence.from([]);

let assertions = [];

xdmp.invokeFunction(
  function() {
    let errorCount = 0;
    try {
      lib.checkOptions(emptySequence, {});
    } catch (exc) {
      errorCount = errorCount + 1;
      assertions.push(test.assertTrue(/mergeOptions/.test(exc.message) && /matchOptions/.test(exc.message), `Error should contain matchOptions and mergeOptions. (Error: ${exc.message})`))
    }
    try {
      lib.checkOptions(emptySequence, { matchOptions: {}});
    } catch (exc) {
      errorCount = errorCount + 1;
      assertions.push(test.assertTrue(/mergeOptions/.test(exc.message) && !/matchOptions/.test(exc.message), `Error should contain mergeOptions. (Error: ${exc.message})`))
    }
    try {
      lib.checkOptions(emptySequence, { mergeOptions: {} });
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
    lib.checkOptions(allDocs, { mergeOptions: {}, matchOptions: {} }, filteredDocs);
    assertions.push(test.assertEqual(currentDocs.length, filteredDocs.length,
      `There should be ${currentDocs.length} documents of returned after filtering.`));
    assertions.push(test.assertEqual(
      Sequence.from(currentDocs[0].context.originalCollections),
      Sequence.from(filteredDocs[0].context.collections),
      'Original collections should be carried forward.'));
    let optionsWithTargetEntity = { targetEntity: "TestTargetEntityCarryOver", mergeOptions: {}, matchOptions: {} };
    lib.checkOptions(null, optionsWithTargetEntity, null);
    assertions.push(test.assertEqual(
        "TestTargetEntityCarryOver",
        optionsWithTargetEntity.targetEntityType,
        "targetEntity should be moved to the new standard targetEntityType."));
      assertions.push(test.assertEqual(
          "TestTargetEntityCarryOver",
          optionsWithTargetEntity.matchOptions.targetEntityType,
          "Child matchOptions should now have targetEntityType set since that gets passed to the lower-level matching function."));
      assertions.push(test.assertEqual(
          "TestTargetEntityCarryOver",
          optionsWithTargetEntity.mergeOptions.targetEntityType,
          "Child mergeOptions should now have targetEntityType set since that gets passed to the lower-level merging function."));
    let optionsWithTargetCollections = {
      targetEntityType: "TestTargetEntityCarryOver",
      targetCollections: {
        onNoMatch: { add:["no-match"], remove: ["matched"]},
        onArchived:{ add:["archived"], remove: ["not-archived"]},
        onNotification:{ add:["notification"], remove: ["not-notification"]},
        onMerge:{ add:["merged"], remove: ["not-merged"]}
      }
    };
    let targetCollections = optionsWithTargetCollections.targetCollections;
    lib.checkOptions(null, optionsWithTargetCollections, null, []);
    assertions.push(test.assertTrue(
      targetCollections.onNoMatch.add.includes("no-match"),
      "Options should retain 'no-match' in onNoMatch.add."));
    assertions.push(test.assertTrue(
      targetCollections.onNoMatch.remove.includes("matched"),
      "Options should retain 'matched' in onNoMatch.remove."));
    assertions.push(test.assertTrue(
      targetCollections.onArchived.add.includes("archived"),
      "Options should retain 'archived' in onArchived.add."));
    assertions.push(test.assertTrue(
      targetCollections.onArchived.remove.includes("not-archived"),
      "Options should retain 'not-archived' in onArchived.remove."));
    assertions.push(test.assertTrue(
      targetCollections.onNotification.add.includes("notification"),
      "Options should retain 'notification' in onNotification.add."));
    assertions.push(test.assertTrue(
      targetCollections.onNotification.remove.includes("not-notification"),
      "Options should retain 'not-notification' in onNotification.remove."));
    assertions.push(test.assertTrue(
      targetCollections.onMerge.add.includes("merged"),
      "Options should retain 'merged' in onNotification.add."));
    assertions.push(test.assertTrue(
      targetCollections.onMerge.remove.includes("not-merged"),
      "Options should retain 'not-merged' in onMerge.remove."));
  },
  {update: 'true', commit: 'auto'}
);

assertions;
