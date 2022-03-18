const {Matchable} = require('/data-hub/5/mastering/matching/matchable.sjs');
const test = require("/test/test-helper.xqy");

const matchableInstance = new Matchable({}, {});

[
  test.assertExists(matchableInstance, "Matchable class instance should exist."),
  test.assertExists(matchableInstance.baselineQuery, "Matchable class instance function baselineQuery should exist."),
  test.assertExists(matchableInstance.matchRulesetDefinitions, "Matchable class instance function matchRulesetDefinitions should exist."),
  test.assertExists(matchableInstance.thresholdDefinitions, "Matchable class instance function thresholdDefinitions should exist."),
  test.assertExists(matchableInstance.filterQuery, "Matchable class instance function filterQuery should exist."),
  test.assertExists(matchableInstance.scoreDocument, "Matchable class instance function scoreDocument should exist."),
  test.assertExists(matchableInstance.buildActionDetails, "Matchable class instance function buildActionDetails should exist.")
];


