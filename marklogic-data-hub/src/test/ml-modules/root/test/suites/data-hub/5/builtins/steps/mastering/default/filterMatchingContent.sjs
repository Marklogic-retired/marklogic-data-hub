const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const matching = mjsProxy.requireMjsModule("/data-hub/5/builtins/steps/mastering/default/matching.mjs");
const lib = mjsProxy.requireMjsModule("/data-hub/5/builtins/steps/mastering/default/lib.mjs");
const test = require("/test/test-helper.xqy");


const collectionInfo = lib.checkOptions(null, { targetEntity: 'Customer', mergeOptions: {}, matchOptions: {} });
const content = Sequence.from([
    { uri: 'doc1', context: {originalCollections: [collectionInfo.auditingCollection, collectionInfo.contentCollection]}},
    { uri: 'doc2', context: {originalCollections: [collectionInfo.contentCollection, collectionInfo.notificationCollection]}},
    { uri: 'doc3', context: {originalCollections: [collectionInfo.contentCollection, collectionInfo.archivedCollection]}}
]);

const filteredContent = matching.filterContentAlreadyProcessed(content, 'summaryCollection', collectionInfo, "jobId").toArray();

const assertions = [
    test.assertEqual(1, filteredContent.length, 'Should only have one filtered document left'),
    test.assertEqual('doc3', filteredContent[0].uri, '"doc3" should be the uri left since it did not have auditing or notification collections')
];

assertions;
