const { Matchable, MatchRulesetDefinition } = require('/data-hub/5/mastering/matching/matchable.sjs');
const test = require("/test/test-helper.xqy");

function testMatchableClass() {
  const matchableInstance = new Matchable({}, {});
  return [
    test.assertExists(matchableInstance, "Matchable class instance should exist."),
    test.assertExists(matchableInstance.baselineQuery, "Matchable class instance function baselineQuery should exist."),
    test.assertExists(matchableInstance.matchRulesetDefinitions, "Matchable class instance function matchRulesetDefinitions should exist."),
    test.assertExists(matchableInstance.thresholdDefinitions, "Matchable class instance function thresholdDefinitions should exist."),
    test.assertExists(matchableInstance.filterQuery, "Matchable class instance function filterQuery should exist."),
    test.assertExists(matchableInstance.scoreDocument, "Matchable class instance function scoreDocument should exist."),
    test.assertExists(matchableInstance.buildActionDetails, "Matchable class instance function buildActionDetails should exist.")
  ];
}

function testBaselineQuery() {
  const matchableEntityInstanceQuery = new Matchable({
    targetEntityType: "http://example.org/Customer-0.0.1/Customer"
  }, {}).baselineQuery();
  const matchableEntityInstanceFallbackQuery = new Matchable({
    targetEntityType: "http://example.org/Customer-0.0.1/CustomerWithoutTriplesFromTDE"
  }, {}).baselineQuery();
  const matchableNoEntityQuery = new Matchable({
    collections: {
      content: "MyMatchCollection"
    }
  }, {}).baselineQuery();
  const matchableWithBaselineQueryInterceptorsQuery = new Matchable({
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    baselineQueryInterceptors: [
      { path: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs", function: "baselineQueryInterceptorA" },
      { path: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs", function: "baselineQueryInterceptorB" }
    ]
  }, {}).baselineQuery();
  const interceptorQueries = fn.tail(cts.andQueryQueries(matchableWithBaselineQueryInterceptorsQuery)).toArray();
  let matchableWithBadBaselineQueryInterceptorsError;
  try {
    let invalidBaselineQuery = new Matchable({
      targetEntityType: "http://example.org/Customer-0.0.1/Customer",
      baselineQueryInterceptors: [
        { path: "/non-existing/matchableInterceptors.sjs", function: "myNonExistentFunction" }
      ]
    }, {}).baselineQuery();
    test.assertNotExists(invalidBaselineQuery, "invalidBaselineQuery should not exist.")
  } catch (e) {
    matchableWithBadBaselineQueryInterceptorsError = e;
  }
  return [
    test.assertExists(matchableEntityInstanceQuery, "matchableEntityInstanceQuery should exist."),
    test.assertTrue(matchableEntityInstanceQuery instanceof cts.tripleRangeQuery, `matchableEntityInstanceQuery should be a triple range query. ${xdmp.describe(matchableEntityInstanceQuery)}`),
    test.assertEqual(sem.iri("http://example.org/Customer-0.0.1/Customer"), cts.tripleRangeQueryObject(matchableEntityInstanceQuery), "matchableEntityInstanceQuery should have it's object properly set."),
    test.assertExists(matchableEntityInstanceFallbackQuery, "matchableEntityInstanceFallbackQuery should exist."),
    test.assertTrue(matchableEntityInstanceFallbackQuery instanceof cts.collectionQuery, "matchableEntityInstanceFallbackQuery should be a collection query."),
    test.assertEqual("CustomerWithoutTriplesFromTDE", cts.collectionQueryUris(matchableEntityInstanceFallbackQuery), "matchableEntityInstanceFallbackQuery should have the proper collection name."),
    test.assertTrue(matchableNoEntityQuery instanceof cts.collectionQuery, "matchableNoEntityQuery should be a collection query."),
    test.assertEqual("MyMatchCollection", cts.collectionQueryUris(matchableNoEntityQuery), "matchableNoEntityQuery should have a scope name of info."),
    test.assertTrue(matchableWithBaselineQueryInterceptorsQuery instanceof cts.andQuery, "matchableWithBaselineQueryInterceptorsQuery should be an and query."),
    test.assertTrue(interceptorQueries[0] instanceof cts.collectionQuery, "interceptorQueries[0] should be a collection query."),
    test.assertEqual("InterceptorA", cts.collectionQueryUris(interceptorQueries[0]), "interceptorQueries[0] should have a scope name of info."),
    test.assertTrue(interceptorQueries[1] instanceof cts.collectionQuery, `interceptorQueries[1] should be a collection query. ${xdmp.toJsonString(interceptorQueries[1])}`),
    test.assertEqual("InterceptorB", cts.collectionQueryUris(interceptorQueries[1]), "interceptorQueries[1] should have a scope name of info."),
    test.assertTrue(fn.exists(matchableWithBadBaselineQueryInterceptorsError), "An error should be thrown if an invalid interceptor is provided."),
    test.assertEqual("400", matchableWithBadBaselineQueryInterceptorsError.data[0], "Bad interceptor error should return Bad Request.")
  ];
}

function testFilterQuery() {
  const docA = cts.doc("/content/docA.json");
  const filterQueryJustDoc = new Matchable({}, {}).filterQuery(docA);
  const filterQueryDocAndSerialized = new Matchable({ filterQuery: { collectionQuery: { uris: ["new"] } } }, {}).filterQuery(docA);
  const filterWithInterceptorQuery = new Matchable({
    filterQueryInterceptors: [
      { path: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs", function: "filterQueryInterceptor" }
    ]
  }, {}).filterQuery(docA);
  const interceptorQuery = fn.head(fn.tail(cts.andQueryQueries(filterWithInterceptorQuery)));
  let matchableWithBadFilterQueryInterceptorError;
  try {
    let invalidFilterQuery = new Matchable({
      filterQueryInterceptors: [
        { path: "/non-existing/matchableInterceptors.sjs", function: "myNonExistentFunction" }
      ]
    }, {}).filterQuery(docA);
    test.assertNotExists(invalidFilterQuery, "invalidFilterQuery should not exist.")
  } catch (e) {
    matchableWithBadFilterQueryInterceptorError = e;
  }
  return [
    test.assertExists(filterQueryJustDoc, "filterQueryJustDoc should exist."),
    test.assertTrue(filterQueryJustDoc instanceof cts.notQuery, "filterQueryJustDoc should be a triple range query."),
    test.assertEqual(Sequence.from(["/content/docA.json", "/content/docB.json"]), cts.documentQueryUris(cts.notQueryQuery(filterQueryJustDoc)), "filterQueryJustDoc should have exclude doc and blocked by triples."),
    test.assertExists(filterQueryDocAndSerialized, "filterQueryDocAndSerialized should exist."),
    test.assertTrue(filterQueryDocAndSerialized instanceof cts.andNotQuery, "filterQueryDocAndSerialized should be an and not query."),
    test.assertEqual("new", cts.collectionQueryUris(cts.andNotQueryPositiveQuery(filterQueryDocAndSerialized)), `filterQueryDocAndSerialized postive query should be a collection query. ${xdmp.toJsonString(filterQueryDocAndSerialized)}`),
    test.assertEqual(Sequence.from(["/content/docA.json", "/content/docB.json"]), cts.documentQueryUris(cts.andNotQueryNegativeQuery(filterQueryDocAndSerialized)), `filterQueryDocAndSerialized negative query should be a document query. ${xdmp.toJsonString(filterQueryDocAndSerialized)}`),
    test.assertTrue(interceptorQuery instanceof cts.collectionQuery, "interceptorQuery should be a collection query."),
    test.assertEqual("docDeterminedCollection", cts.collectionQueryUris(interceptorQuery), "matchableNoEntityQuery should have a scope name of info."),
    test.assertTrue(fn.exists(matchableWithBadFilterQueryInterceptorError), "An error should be thrown if an invalid interceptor is provided."),
    test.assertEqual("400", matchableWithBadFilterQueryInterceptorError.data[0], "Bad interceptor error should return Bad Request.")
  ];
}

function testMatchRulesetDefinitions() {
  const docA = cts.doc("/content/docA.json");
  const matchStep = {
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    matchRulesets: [
      {
        name: "name - exact",
        matchRules: [{ entityPropertyPath: "name", matchType: "exact"}]
      },
      {
        name: "name - synonym",
        fuzzyMatch: true,
        matchRules: [{ entityPropertyPath: "name", matchType: "synonym",
          options: {
            thesaurusURI: "/content/nicknames.xml",
            filter: "<qualifier xmlns=\"http://marklogic.com/xdmp/thesaurus\">lastName</qualifier>"
          }
        }]
      },
      {
        name: "name - synonym - noMatchQualifier",
        matchRules: [{ entityPropertyPath: "name", matchType: "synonym",
          options: {
            thesaurusURI: "/content/nicknames.xml",
            filter: "<qualifier xmlns=\"http://marklogic.com/xdmp/thesaurus\">firstName</qualifier>"
          }
        }]
      },
      {
        name: "name - double metaphone",
        matchRules: [{ entityPropertyPath: "name", matchType: "doubleMetaphone",
          options: {
            dictionaryURI: "/content/last-names.xml",
            distanceThreshold: 100
          }
        }]
      },
      {
        name: "name - double metaphone - noMatch",
        matchRules: [{ entityPropertyPath: "name", matchType: "doubleMetaphone",
          options: {
            dictionaryURI: "/content/last-names.xml",
            distanceThreshold: 100
          }
        }]
      },
      {
        name: "name - zip - 5digit",
        matchRules: [{ entityPropertyPath: "name", matchType: "zip", options: {}}]
      },
      {
        name: "name - zip - 9digit",
        matchRules: [{ entityPropertyPath: "name", matchType: "zip", options: {}}]
      },
      {
        name: "name - custom",
        weight: 10,
        matchRules: [{
            entityPropertyPath: "name",
            matchType: "custom",
            algorithmModulePath: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs",
            algorithmFunction: "customMatchStringInterceptor"
        },
        {
          entityPropertyPath: "name",
          matchType: "custom",
          algorithmModulePath: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs",
          algorithmFunction: "customMatchSequenceInterceptor"
        },
        {
          entityPropertyPath: "name",
          matchType: "custom",
          algorithmModulePath: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs",
          algorithmFunction: "customMatchArrayInterceptor"
        }
        ]
      },
      {
        name: "name - custom empty sequence",
        weight: 10,
        matchRules: [
          {
            entityPropertyPath: "name",
            matchType: "custom",
            algorithmModulePath: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs",
            algorithmFunction: "customMatchEmptySequenceInterceptor"
          }
        ]
      }
    ]
  };
  const matchable = new Matchable(matchStep, {});
  const matchRulesetDefinitions = matchable.matchRulesetDefinitions();
  const assertions = [
    test.assertEqual(matchStep.matchRulesets.length, matchRulesetDefinitions.length, "Count of match ruleset definitions should match count of objects in the step.")
  ];
  for (let i = 0; i < matchStep.matchRulesets.length; i++) {
    let matchRulesetDefinition = matchRulesetDefinitions[i];
    let matchRulesetNode = fn.head(fn.subsequence(matchable.matchStepNode.xpath("matchRulesets"), i + 1,1));
    assertions.push(test.assertEqual(matchStep.matchRulesets[i].name, matchRulesetDefinitions[i].name(), "Name should be set for MatchRulesetDefinition"));
    assertions.push(test.assertEqualJson(matchStep.matchRulesets[i], matchRulesetDefinitions[i].raw(), "Raw value should be set for MatchRulesetDefinition"));
    matchRulesetDefinitions[i].buildCtsQuery(docA);
    if(matchStep.matchRulesets[i].name === "name - custom") {
      let isQuery = matchRulesetDefinition.buildCtsQuery(docA) instanceof cts.query;
      assertions.push(test.assertEqual(isQuery, true, "Cts query is created for matched rule when custom match function returns atomic value"));
    }
    if(matchStep.matchRulesets[i].name === "name - custom empty sequence") {
      let isQuery = matchRulesetDefinition.buildCtsQuery(docA) instanceof cts.query;
      assertions.push(test.assertFalse(isQuery, "Cts query is not created for matched rule when custom match function returns empty sequence"));
    }
    if(matchStep.matchRulesets[i].name === "name - synonym") {
      let matchingTerms = matchRulesetDefinition.synonymMatchFunction("Robert", fn.head(matchRulesetNode.xpath("matchRules")), matchStep);
      const queryHashes = matchRulesetDefinition.queryHashes(docA);
      assertions.push(test.assertTrue(fn.exists(queryHashes), "Query hashes should exists"));
      assertions.push(test.assertEqual(2, matchingTerms.length, "Original term and matching synonym qualifier is returned"));
    }
    if(matchStep.matchRulesets[i].name === "name - synonym - noMatchQualifier") {
      let matchingTerms = matchRulesetDefinition.synonymMatchFunction("Robert", fn.head(matchRulesetNode.xpath("matchRules")), matchStep);
      assertions.push(test.assertEqual(0, matchingTerms.length, "No matching qualifier was found"));
    }
    if(matchStep.matchRulesets[i].name === "name - double metaphone") {
      let matchingTerms = matchRulesetDefinition.doubleMetaphoneMatchFunction("Robert", fn.head(matchRulesetNode.xpath("matchRules")), matchStep);
      assertions.push(test.assertEqual(3, Sequence.from(matchingTerms).toArray().length, "3 words are returned that have distanceThreshold less than equal to 100"));
    }
    if(matchStep.matchRulesets[i].name === "name - double metaphone - noMatch") {
      let matchingTerms = matchRulesetDefinition.doubleMetaphoneMatchFunction("johns", fn.head(matchRulesetNode.xpath("matchRules")), matchStep);
      assertions.push(test.assertEqual(0, Sequence.from(matchingTerms).toArray().length, "No word is returned that have distanceThreshold less than equal to 100"));
      const docB = cts.doc("/content/docB.json");
      const ctsQuery = matchRulesetDefinitions[i].buildCtsQuery(docB);
      assertions.push(test.assertEqual(null, ctsQuery, "double metaphone with no matches should return a null cts query"));
    }
    if(matchStep.matchRulesets[i].name === "name - zip - 5digit") {
      let matchingTerms = matchRulesetDefinition.zipMatchFunction("95101", fn.head(matchRulesetNode.xpath("matchRules")), matchStep)
      assertions.push(test.assertEqual(["95101","95101-*"], matchingTerms, "Original 5 digits zip value and wildcard entry is returned"));
    }
    if(matchStep.matchRulesets[i].name === "name - zip - 9digit") {
      let matchingTerms = matchRulesetDefinition.zipMatchFunction("95101-1210", matchStep.matchRulesets[i].matchRules[0], matchStep)
      assertions.push(test.assertEqual(["95101-1210","95101"], matchingTerms, "Original 9 digits zip value and trimmed 5 digits zip is returned"));
    }
  }
}

function testBuildActionDetails() {
  const docA = cts.doc("/content/docA.json");
  const matchStep = {
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    thresholds: [
      {
        thresholdName: "customThreshold",
        action: "custom",
        score: 40
      },
      {
        thresholdName: "notifyThreshold",
        action: "notify",
        score: 60
      },
      {
        thresholdName: "mergeThreshold",
        action: "merge",
        score: 80
      }
    ]
  };
  const matchable = new Matchable(matchStep, {});
  const thresholdDefinitions = matchable.thresholdDefinitions();
  const assertions = [
    test.assertEqual(matchStep.thresholds.length, thresholdDefinitions.length, "Count of threshold definitions should match count of objects in the step.")
  ];
  for (let i = 0; i < matchStep.thresholds.length; i++) {
    assertions.push(test.assertEqual(matchStep.thresholds[i].thresholdName, thresholdDefinitions[i].name(), "Name should be set for ThresholdDefinition"));
    assertions.push(test.assertEqual(matchStep.thresholds[i].score, thresholdDefinitions[i].score(), "Score should be set for ThresholdDefinition"));
    assertions.push(test.assertEqual(matchStep.thresholds[i].action, thresholdDefinitions[i].action(), "Action should be set for ThresholdDefinition"));
    assertions.push(test.assertEqualJson(matchStep.thresholds[i], thresholdDefinitions[i].raw(), "Raw value should be set for ThresholdDefinition"));
    const actionDetails = matchable.buildActionDetails([{uri: "/content/docA.json", value: docA}], thresholdDefinitions[i]);
    const actionUri = Object.keys(actionDetails)[0] || "";
    let expectedPrefix;
    switch (thresholdDefinitions[i].action()) {
      case "merge":
        expectedPrefix = "/com.marklogic.smart-mastering/merged/";
        break;
      case "notify":
        expectedPrefix = "/com.marklogic.smart-mastering/matcher/notifications/";
        break;
      default:
        expectedPrefix = "/content/";
    }
    assertions.push(test.assertTrue(actionUri.startsWith(expectedPrefix), `action URI should have correct prefix: '${expectedPrefix}' is ${actionUri}. Action: ${thresholdDefinitions[i].action()}`));
    const actionBody = actionDetails[actionUri];
    assertions.push(test.assertEqual(1, actionBody.actions ? actionBody.actions[0].uris.length:  actionBody.uris.length, "Action details should have 1 uri "));
  }
}

function testThresholds() {
  const matchStep = {
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    matchRulesets: [
      { name: "givenName", weight: 12 },
      { name: "surName", weight: 8 },
      { name: "id", weight: 5 },
      { name: "postal", weight: 3 },
      { name: "state", weight: 1 }
    ],
    thresholds: [
      {
        thresholdName: "customThreshold",
        action: "custom",
        score: 10
      },
      {
        thresholdName: "notifyThreshold",
        action: "notify",
        score: 12
      },
      {
        thresholdName: "mergeThreshold",
        action: "merge",
        score: 15
      }
    ]
  };
  const matchable = new Matchable(matchStep, {});
  const thresholdDefinitions = matchable.thresholdDefinitions();
  const assertions = [
    test.assertEqual(matchStep.thresholds.length, thresholdDefinitions.length, "Count of threshold definitions should match count of objects in the step.")
  ];
  const expectedCombinationPerThreshold = [[["givenName"], ["surName","id"], ["surName","postal"]], [["givenName"], ["surName","id"]], [["givenName","surName"], ["givenName","id"], ["givenName","postal"],["surName","id","postal"]]];
  for (let i = 0; i < matchStep.thresholds.length; i++) {
    const thresholdDefinition = thresholdDefinitions[i];
    const minimumMatchCombinations = thresholdDefinition.minimumMatchCombinations();
    const minimumMatchCombinationsJSON = minimumMatchCombinations.map((matchCombination) => matchCombination.map((matchRuleset) => matchRuleset.raw ? matchRuleset.raw().name:"unknown"));
    const expectedMinimumCombinations = expectedCombinationPerThreshold[i];
    const message = `Ruleset combinations for threshold should be correct. Threshold: ${thresholdDefinition.name()}. Expected: ${JSON.stringify(expectedMinimumCombinations, null, 2)}. Got: ${JSON.stringify(minimumMatchCombinationsJSON, null, 2)}`;
    assertions.push(test.assertEqualJson(expectedMinimumCombinations, minimumMatchCombinationsJSON, message));
  }
  return assertions;
}

function testScoreDocument() {
  const docA = cts.doc("/content/docA.json");
  const matchStep = {
    targetEntityType: "http://example.org/Customer-0.0.1/Customer",
    dataFormat: "json",
    matchRulesets: [
      {
        weight: 10,
        name: "name - exact",
        matchRules: [{ entityPropertyPath: "name", matchType: "exact"}]
      },
      {
        weight: 5,
        name: "name - synonym",
        matchRules: [{ entityPropertyPath: "name", matchType: "synonym",
          options: {
            thesaurusURI: "/content/nicknames.xml"
          }
        }]
      },
      {
        weight: 5,
        name: "name - double metaphone",
        matchRules: [{ entityPropertyPath: "name", matchType: "doubleMetaphone",
          options: {
            dictionaryURI: "/content/first-names.xml",
            distanceThreshold: 100
          }
        }]
      },
      {
        weight: 3,
        name: "name - exact",
        matchRules: [
          { entityPropertyPath: "name",
            matchType: "exact"
          },
          { entityPropertyPath: "name",
            matchType: "custom",
            algorithmModulePath: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs",
            algorithmFunction: "customLastNameInterceptor"
          }
        ]
      },
      {
        weight: 2,
        name: "name - exact",
        matchRules: [
          { entityPropertyPath: "name",
            matchType: "exact"
          },
          { entityPropertyPath: "name",
            matchType: "custom",
            algorithmModulePath: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs",
            algorithmFunction: "customFalseLastNameInterceptor"
          }
        ]
      }
    ]
  };

  const matchable = new Matchable(matchStep, {});
  const score = matchable.scoreDocument({uri: "doc1.json", value: docA },{uri: "doc2.json", value: docA });
  const assertions = [
    test.assertEqual(23, score, "score should come back as 23 (exact:10 + doubleMetaphone:5 + exact with custom true function:3 + synonym:5).")
  ];
  const scoreInterceptorMatchable = new Matchable(Object.assign({scoreDocumentInterceptors:  [
      { path: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs", function: "scoreDocumentInterceptor" }
    ]}, matchStep), {});
  const interceptorScore = scoreInterceptorMatchable.scoreDocument({uri: "doc1.json", value: docA },{uri: "doc2.json", value: docA });
  assertions.push(test.assertEqual(10, interceptorScore, "interceptorScore should come back as 10. max(exact:10, doubleMetaphone:5)"))
  return assertions;
}

[]
  .concat(testMatchableClass())
  .concat(testBaselineQuery())
  .concat(testFilterQuery())
  .concat(testMatchRulesetDefinitions())
  .concat(testBuildActionDetails())
  .concat(testThresholds())
  .concat(testScoreDocument());
