'use strict';

const test = require('/test/test-helper.xqy');
const lib = require('/test/suites/data-hub/5/smart-mastering/match-and-merge/lib/lib.xqy');
const merge = require('/data-hub/5/builtins/steps/mastering/default/merging.sjs');

const options = { mergeOptions: {}};
const assertions = [];
const noActionResults = merge.main({uri: lib['MATCH-SUMMARY-URI-1'], value: cts.doc(lib['MATCH-SUMMARY-URI-1'])}, options);
// One result to delete the match summary
assertions.push(
  test.assertEqual(1, noActionResults.length, 'Since there is another merge containing more documents this merge should result in an array with only the match summary')
);

assertions.push(
    test.assertTrue(noActionResults[0]['$delete'], 'The match summary should be marked for deletion.')
);

const results = merge.main({uri: lib['MATCH-SUMMARY-URI-2'], value: cts.doc(lib['MATCH-SUMMARY-URI-2'])}, options).map((contentObj) => contentObj.uri);
assertions.push(
  test.assertEqual(6, results.length, `This merge should result in 6 content objects (1 merge + 1 auditing + 3 archives + 1 delete match summary) Got: ${xdmp.describe(results, Sequence.from([]), Sequence.from([]))}`)
);

assertions;

