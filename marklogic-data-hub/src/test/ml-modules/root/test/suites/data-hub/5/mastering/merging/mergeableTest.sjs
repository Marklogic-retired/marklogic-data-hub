const { Mergeable } = require('/data-hub/5/mastering/merging/mergeable.sjs');
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const test = require("/test/test-helper.xqy");

function testMergeableClass() {
  let mergeStep = {};
  let options = {};
  const mergeableInstance = new Mergeable({mergeStep}, {options});
  return [
    test.assertExists(mergeableInstance, "Mergeable class instance should exist."),
    test.assertExists(mergeableInstance.mergeStep, "Mergeable class instance mergeStep object should exist."),
    test.assertExists(mergeableInstance.options, "Mergeable class instance options object should exist."),
  ];
}

function testApplyContext() {
  let mergeStep = {};
  let options = {targetEntityTitle: "Customer"};
  const mergeableInstance = new Mergeable(mergeStep, options);

  const contentObject =
      { uri: "/content/CustNoMatch.json",
        value: cts.doc("/content/CustNoMatch.json"),
        context: {
          collections: ["raw-content", "Customer"],
        }
      };

  const actionDetails = {
    "/merge-with-doc1.json": {
      action: "merge",
      uris: ["/match1.json","/match2.json"]
    },
    "/content/CustNoMatch.json": {
      action: "notify",
      uris: ["/match3.json","/match4.json"]}
  };
  let applyDocumentContext = mergeableInstance.applyDocumentContext(contentObject, actionDetails["/content/CustNoMatch.json"]);
  return [
    test.assertEqual(applyDocumentContext.context.collections.length, 3, "Collection is pushed for respective action"),
    test.assertEqual(applyDocumentContext.context.collections[2], "sm-Customer-notification", "Collection is pushed for respective action")
  ];
}

function testApplyContextInterceptor() {
  let mergeStep = {};
  let options = {targetEntityTitle: "Customer"};

  const contentObject =
    {
      uri: "/content/CustNoMatch.json",
      value: cts.doc("/content/CustNoMatch.json"),
      context: {
        collections: ["raw-content", "Customer"],
      }
    };

  const actionDetails = {
    "/merge-with-doc1.json": {
      action: "merge",
      uris: ["/match1.json", "/match2.json"]
    },
    "/content/CustNoMatch.json": {
      action: "notify",
      uris: ["/match3.json", "/match4.json"]
    }
  };
  const contextObjectMergeable = new Mergeable(Object.assign({
    customApplyDocumentContextInterceptors: [
      {
        path: "/test/suites/data-hub/5/mastering/matching/test-data/mergeableInterceptors.sjs",
        function: "customApplyDocumentContextInterceptor"
      }
    ]
  }, mergeStep), options);
  const applyDocumentContextInterceptor = contextObjectMergeable.applyDocumentContext(contentObject, actionDetails["/content/CustNoMatch.json"]);
  return [
    test.assertEqual(applyDocumentContextInterceptor.context.collections.length, 4, "Additional Collection is pushed for respective action vis interceptor"),
    test.assertEqual(applyDocumentContextInterceptor.context.collections[2], "sm-Customer-notification", "Collection created for notify action before interceptor"),
    test.assertEqual(applyDocumentContextInterceptor.context.collections[3], "sm-Customer-notification-intercepted", "Collection created for notify action after interceptor")
  ];
}

function testMergeRuleDefinitions() {
  let mergeStep = {
    "dataFormat": "json",
    "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
    "lastUpdatedLocation": {
      "documentXPath": "/envelope/headers/createdOn"
    },
    "mergeStrategies": [
      {
        "strategyName": "myFavoriteNameSource",
        "maxSources": 1,
        "maxValues": 1,
        "priorityOrder": {
          "lengthWeight": 0,
          "timeWeight": 9,
          "sources": [
            {
              "sourceName": "source 1",
              "weight": 12
            },
            {
              "sourceName": "source 2",
              "weight": 8
            }
          ]
        }
      },
      {
        "strategyName": "myFavoriteBirthDateSource",
        "maxSources": 1,
        "maxValues": 1,
        "priorityOrder": {
          "lengthWeight": 0,
          "timeWeight": 9,
          "sources": [
            {
              "sourceName": "source 1",
              "weight": 8
            },
            {
              "sourceName": "source 2",
              "weight": 12
            }
          ]
        }
      },{
        "strategyName": "Default Strategy",
        "maxSources": 1,
        "maxValues": 1,
        "priorityOrder": {
          "lengthWeight": 0,
          "timeWeight": 9,
          "sources": [
            {
              "sourceName": "source 3",
              "weight": 12
            },
            {
              "sourceName": "source 1",
              "weight": 8
            },
            {
              "sourceName": "source 2",
              "weight": 6
            }
          ]
        },
        "default": true
      }
    ],
    "mergeRules": [
      {
        "entityPropertyPath": "name",
        "mergeType": "strategy",
        "mergeStrategyName": "myFavoriteNameSource"
      },
      {
        "entityPropertyPath": "birthDate",
        "mergeType": "strategy",
        "mergeStrategyName": "myFavoriteBirthDateSource"
      }
    ]
  };
  let options = {};
  const mergeableInstance = new Mergeable(mergeStep, options);
  const mergeRuleDefinitions = mergeableInstance.mergeRuleDefinitions();
  const assertions = [
    test.assertEqual(mergeStep.mergeRules.length, mergeRuleDefinitions.length, "Should have the correct number of Merge Rule Definitions."),
  ];
  const mergeDocuments = hubUtils.normalizeToArray(fn.doc(["/content/CustMatchMerge1.json","/content/CustMatchMerge2.json","/content/CustMatchMerge3.json"]));
  for (const mergeRuleDefinition of mergeRuleDefinitions) {
    let mergedProperties = mergeRuleDefinition.mergeProperties(mergeDocuments);
    if (mergeRuleDefinition.name() === "name") {
      assertions.push(
        test.assertEqual(1, mergedProperties.length, "Name should have one property."),
        test.assertEqual("Holland Wells", fn.string(mergedProperties[0].values),  `Name should follow myFavoriteNameSource strategy. Merge properties: ${xdmp.describe(mergedProperties)}`)
      );
    } else if (mergeRuleDefinition.name() === "birthDate") {
      assertions.push(
        test.assertEqual(1, mergedProperties.length, "Birth date should have one property."),
        test.assertEqual("1985-01-01", fn.string(mergedProperties[0].values), `Birth date should follow myFavoriteBirthDateSource strategy. Merge properties: ${xdmp.describe(mergedProperties)}`)
      );
    }
  }
  return assertions;
}

[]
  .concat(testMergeableClass())
  .concat(testApplyContext())
  .concat(testApplyContextInterceptor())
  .concat(testMergeRuleDefinitions());
