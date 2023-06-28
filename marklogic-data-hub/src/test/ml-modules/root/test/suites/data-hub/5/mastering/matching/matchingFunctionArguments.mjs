import MatchableModule from "/data-hub/5/mastering/matching/matchable.mjs";
const test = require("/test/test-helper.xqy");
const Matchable = MatchableModule.Matchable;


function testMatchQuickStartArgumentsDefinitions() {
  const docAContentObject = {uri: "/content/docA.json", value: cts.doc("/content/docA.json"), context: {}};
  const matchStep = {
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    propertyDefs: {
      property: [{
        localname: "name",
        name: "name"
      }]
    },
    algorithms: {
      algorithm: [{
        name: "custom-js",
        function: "quickStartMatchProperties",
        at: "/test/suites/data-hub/5/mastering/matching/test-data/javascriptMatchingFunctions.sjs"
      }, {
        name: "custom-xqy",
        function: "quickStartMatchProperties",
        namespace: "http://marklogic.com/smart-mastering/xqueryMatching",
        at: "/test/suites/data-hub/5/mastering/matching/test-data/xqueryMatchingFunctions.xqy"
      }]
    },
    scoring: {
      expand: [
        {
          propertyName: "name",
          algorithmRef: "custom-js",
          weight: "10"
        },
        {
          propertyName: "name",
          algorithmRef: "custom-xqy",
          weight: "10"
        }
      ]
    }
  };
  const assertions = [];
  const matchable = new MatchableModule.Matchable(matchStep, {});
  const matchRulesetDefinitions = matchable.matchRulesetDefinitions();
  for (const matchRulesetDefinition of matchRulesetDefinitions) {
    const query = matchRulesetDefinition.buildCtsQuery(docAContentObject);
    let isQuery = query instanceof cts.wordQuery;
    assertions.push(test.assertTrue(isQuery, "word query should be built from match definition"));
    assertions.push(test.assertEqual("QuickStart Match: name", fn.head(cts.wordQueryText(query))));
  }
  return assertions;
}

function testMatchHubCentralArgumentsDefinitions() {
  const docAContentObject = {uri: "/content/docA.json", value: cts.doc("/content/docA.json"), context: {}};
  const matchStep = {
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    matchRulesets: [
      {
        name: "name - custom 1",
        weight: 10,
        matchRules: [{
          entityPropertyPath: "name",
          matchType: "custom",
          algorithmModulePath: "/test/suites/data-hub/5/mastering/matching/test-data/javascriptMatchingFunctions.sjs",
          algorithmFunction: "hubCentralMatchProperties"
        }]
      },
      {
        name: "name - custom 2",
        weight: 10,
        matchRules: [
          {
            entityPropertyPath: "name",
            matchType: "custom",
            algorithmModulePath: "/test/suites/data-hub/5/mastering/matching/test-data/xqueryMatchingFunctions.xqy",
            algorithmFunction: "hubCentralMatchProperties"
          }
        ]
      }
    ]
  };
  const assertions = [];
  const matchable = new MatchableModule.Matchable(matchStep, {});
  const matchRulesetDefinitions = matchable.matchRulesetDefinitions();
  for (const matchRulesetDefinition of matchRulesetDefinitions) {
    const query = matchRulesetDefinition.buildCtsQuery(docAContentObject);
    let isQuery = query instanceof cts.wordQuery;
    assertions.push(test.assertTrue(isQuery, "word query should be built from match definition"));
    assertions.push(test.assertEqual("Hub Central Match: name", fn.head(cts.wordQueryText(query))));
  }
  return assertions;
}

[]
  .concat(testMatchHubCentralArgumentsDefinitions())
  .concat(testMatchQuickStartArgumentsDefinitions());
