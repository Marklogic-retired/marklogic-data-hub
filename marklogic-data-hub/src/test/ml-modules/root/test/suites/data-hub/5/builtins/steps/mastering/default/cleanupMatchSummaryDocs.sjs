const merging = require("/data-hub/5/builtins/steps/mastering/default/merging.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];
// Insert two docs in sourceQuery, but only have one in datahubMasteringMatchSummary collection
xdmp.invokeFunction(
  function() {
    xdmp.documentInsert('/non-match-summary-doc.json', {}, { collections: ['sourceQueryCollection']});
    xdmp.documentInsert('/match-summary-doc.json', {}, { collections: ['sourceQueryCollection', 'datahubMasteringMatchSummary']});
  },
  {update: 'true', commit: 'auto'}
);

// Test unparseable sourceQuery
xdmp.invokeFunction(
  function() {
    merging.jobReport('test-unparseable-sourceQuery', { success: true, successfulEvents: 1 }, { sourceQuery: 'cts.uris(null, null, cts.collectionQuery("sourceQueryCollection"))', mergeOptions: {} });
  },
  {update: 'true', commit: 'auto'}
);

xdmp.invokeFunction(
  function() {
    assertions.push(test.assertEqual(2, cts.estimate(cts.collectionQuery('sourceQueryCollection'))));
  },
  {update: 'false', commit: 'auto'}
);

// Test parseable sourceQuery
xdmp.invokeFunction(
  function() {
    merging.jobReport('test-parseable-sourceQuery', { success: true, successfulEvents: 1 }, { sourceQuery: 'cts.collectionQuery("sourceQueryCollection")', mergeOptions: {} });
  },
  {update: 'true', commit: 'auto'}
);

xdmp.invokeFunction(
  function() {
    assertions.push(test.assertEqual(1, cts.estimate(cts.collectionQuery('sourceQueryCollection'))));
  },
  {update: 'false', commit: 'auto'}
);

assertions;
