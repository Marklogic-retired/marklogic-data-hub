const matchOptions = require('/com.marklogic.smart-mastering/matcher-impl/options-impl.xqy');
const test = require("/test/test-helper.xqy");

const compiledOptions = matchOptions.compileMatchOptions({
  targetEntityType: "http://example.org/Customer-0.0.1/Customer",
  baselineQueryInterceptors: [
    { path: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs", function: "baselineQueryInterceptorA" },
    { path: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs", function: "baselineQueryInterceptorB" }
  ],
  filterQueryInterceptors: [
    { path: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs", function: "filterQueryInterceptor" }
  ],
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
    },
  ],
  scoreDocumentInterceptors:  [
    { path: "/test/suites/data-hub/5/mastering/matching/test-data/matchableInterceptors.sjs", function: "scoreDocumentInterceptor" }
  ],
  thresholds: [
    {
      thresholdName: "customThreshold",
      action: "custom",
      score: 4
    },
    {
      thresholdName: "notifyThreshold",
      action: "notify",
      score: 6
    },
    {
      thresholdName: "mergeThreshold",
      action: "merge",
      score: 8
    }
  ]
}, 4);

function testBaselineQuery() {
  const matchableWithBaselineQueryInterceptorsQuery = compiledOptions.baseContentQuery;
  const interceptorQueries = matchableWithBaselineQueryInterceptorsQuery instanceof cts.andQuery ? fn.tail(cts.andQueryQueries(matchableWithBaselineQueryInterceptorsQuery)).toArray(): [];
  return [
    test.assertTrue(matchableWithBaselineQueryInterceptorsQuery instanceof cts.andQuery, `matchableWithBaselineQueryInterceptorsQuery should be an and query. ${xdmp.describe(matchableWithBaselineQueryInterceptorsQuery)}`),
    test.assertTrue(interceptorQueries[0] instanceof cts.collectionQuery, "interceptorQueries[0] should be a collection query."),
    test.assertEqual("InterceptorA", cts.collectionQueryUris(interceptorQueries[0]), "interceptorQueries[0] should have a scope name of info."),
    test.assertTrue(interceptorQueries[1] instanceof cts.collectionQuery, `interceptorQueries[1] should be a collection query. ${xdmp.toJsonString(interceptorQueries[1])}`),
    test.assertEqual("InterceptorB", cts.collectionQueryUris(interceptorQueries[1]), "interceptorQueries[1] should have a scope name of info.")
  ];
}

function invokeInterceptor(fun, ...args) {
  return fn.head(xdmp.apply(fun, ...args));
}

function testFilterQuery() {
  const docA = cts.doc("/content/docA.json");
  const filterWithInterceptorQuery = invokeInterceptor(compiledOptions.filterQueryInterceptor, cts.notQuery(cts.documentQuery("/content/docA.json")), docA);
  const interceptorQuery = fn.head(fn.tail(cts.andQueryQueries(filterWithInterceptorQuery)));
  return [
    test.assertTrue(interceptorQuery instanceof cts.collectionQuery, "interceptorQuery should be a collection query."),
    test.assertEqual("docDeterminedCollection", cts.collectionQueryUris(interceptorQuery), "matchableNoEntityQuery should have a scope name of info.")
  ];
}

function testScoreDocument() {
  const docA = cts.doc("/content/docA.json");
  const interceptorScore = invokeInterceptor(compiledOptions.scoreDocumentInterceptor, 23, {uri: "doc1.json", value: docA },{uri: "doc2.json", value: docA }, []);
  return [
    test.assertEqual(10, interceptorScore, "interceptorScore should come back as 10. max(exact:10, doubleMetaphone:5)")
  ];
}

[]
  .concat(testBaselineQuery())
  .concat(testFilterQuery())
  .concat(testScoreDocument());
