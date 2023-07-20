import MatchableModule from "/data-hub/5/mastering/matching/matchable.mjs";
const test = require("/test/test-helper.xqy");
const Matchable = MatchableModule.Matchable;
const lib = require('/test/suites/data-hub/5/smart-mastering/matching/lib/lib.xqy');
const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');

const matchJson = matcher.getOptionsAsJson(lib['MATCH-OPTIONS-NAME']);

function testNullNodeMatch() {
  const matchableInstance = new Matchable(matchJson.toObject(), {});
  const uri = lib["URI9"];
  const contentObject = {uri, value: cts.doc(uri)};
  matchableInstance.matchRulesetDefinitions().forEach(def => def.buildCtsQuery(contentObject));
  return [
    test.assertExists(matchableInstance, "Matchable class instance should exist.")
  ];
}

testNullNodeMatch();