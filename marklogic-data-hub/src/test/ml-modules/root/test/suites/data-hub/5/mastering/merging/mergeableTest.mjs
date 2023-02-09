import Mergeable from "/data-hub/5/mastering/merging/mergeable.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
const test = require("/test/test-helper.xqy");

function testMergeableClass() {
  let mergeStep = {};
  let options = {};
  const mergeableInstance = new Mergeable({mergeStep}, {options});
  return [
    test.assertExists(mergeableInstance, "Mergeable class instance should exist."),
    test.assertExists(mergeableInstance.mergeStep, "Mergeable class instance mergeStep object should exist.")
  ];
}

function testApplyContext() {
  let mergeStep = {targetEntityType: "http://example.org/Customer-0.0.1/Customer"};
  let options = {};
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
    test.assertEqual(applyDocumentContext.context.collections.length, 3, `Collection is pushed for respective action. Collections: ${xdmp.toJsonString(applyDocumentContext.context.collections)}`),
    test.assertEqual(applyDocumentContext.context.collections[2], "sm-Customer-notification", "Collection is pushed for respective action")
  ];
}

function testApplyContextInterceptor() {
  let mergeStep = {targetEntityType: "http://example.org/Customer-0.0.1/Customer"};
  let options = {};

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
    test.assertEqual(applyDocumentContextInterceptor.context.collections.length, 4, `Additional Collection is pushed for respective action vis interceptor. Collections: ${xdmp.toJsonString(applyDocumentContextInterceptor.context.collections)}`),
    test.assertEqual(applyDocumentContextInterceptor.context.collections[2], "sm-Customer-notification", "Collection created for notify action before interceptor"),
    test.assertEqual(applyDocumentContextInterceptor.context.collections[3], "sm-Customer-notification-intercepted", "Collection created for notify action after interceptor")
  ];
}

const mergeRuleStep = {
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
    },
    {
      "entityPropertyPath": "active",
      "mergeType": "custom",
      "mergeModulePath": "/test/suites/data-hub/5/mastering/matching/test-data/mergeableInterceptors.sjs",
      "mergeModuleFunction": "customMerge",
    }
  ],
  "targetCollections": {
    "onMerge": {
      "add": [""],
      "remove": []
    },
    "onNoMatch": {
      "add": [""],
      "remove": []
    },
    "onNotification": {
      "add": [""],
      "remove": []
    }
  }
};

const customTripleMerge = {
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
  "tripleMerge": {
    "function": "customTrips",
    "at": "/test/suites/data-hub/5/smart-mastering/merging-xml/test-data/custom-triple-merge-sjs.sjs",
    "someParam": "3"
  },
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
    },
    {
      "entityPropertyPath": "active",
      "mergeType": "custom",
      "mergeModulePath": "/test/suites/data-hub/5/mastering/matching/test-data/mergeableInterceptors.sjs",
      "mergeModuleFunction": "customMerge",
    }
  ],
  "targetCollections": {
    "onMerge": {
      "add": [""],
      "remove": []
    },
    "onNoMatch": {
      "add": [""],
      "remove": []
    },
    "onNotification": {
      "add": [""],
      "remove": []
    }
  }
};

function copyStep(step) {
  return Object.assign({}, step, {mergeRules: step.mergeRules.map(mergeRule => Object.assign({}, mergeRule))});
}

function testMergeRuleDefinitions() {
  let mergeStep = copyStep(mergeRuleStep);
  let options = {};
  const mergeableInstance = new Mergeable(mergeStep, options);
  const mergeRuleDefinitions = mergeableInstance.mergeRuleDefinitions();
  const assertions = [
    test.assertEqual(mergeStep.mergeRules.length, mergeRuleDefinitions.length, "Should have the correct number of Merge Rule Definitions."),
  ];
  const mergeDocuments = hubUtils.normalizeToArray(fn.doc(["/content/CustMatchMerge1.json","/content/CustMatchMerge2.json","/content/CustMatchMerge3.json"]))
    .map(doc => ({ uri: xdmp.nodeUri(doc), value: doc}));
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
    } else if (mergeRuleDefinition.name() === "active") {
      assertions.push(
        test.assertEqual(1, mergedProperties.length, "Active should have one property."),
        test.assertTrue(mergedProperties[0].values, `Active should return true from customMerge. Merge properties: ${xdmp.describe(mergedProperties)}`)
      );
    }
  }
  return assertions;
}

function testBuildMergeDocumentJson() {
  let mergeStep = copyStep(mergeRuleStep);
  let options = {};
  const mergeableInstance = new Mergeable(mergeStep, options);
  const mergeContentObjects = ["/content/CustMatchMerge1.json","/content/CustMatchMerge2.json","/content/CustMatchMerge3.json"].map(uri => ({
    uri,
    value: cts.doc(uri)
  }));
  const mergedDocument = mergeableInstance.buildMergeDocument(mergeContentObjects);
  const assertions = [];
  assertions.push(
    test.assertTrue(fn.exists(mergedDocument.xpath("/*:envelope/*:headers/*:merge-options/*:value")), `Should have merge options. Merge document: ${xdmp.toJsonString(mergedDocument)}`)
  );
  const name = mergedDocument.xpath("/envelope/instance/Customer/name");
  assertions.push(
    test.assertEqual(1, fn.count(name), `Name should have one property. Merge document: ${xdmp.toJsonString(mergedDocument)}`),
    test.assertEqual("Holland Wells", fn.string(name),  `Name should follow myFavoriteNameSource strategy. Merge document: ${xdmp.toJsonString(mergedDocument)}`)
  );
  const birthDate = mergedDocument.xpath("/envelope/instance/Customer/birthDate");
  assertions.push(
    test.assertEqual(1, fn.count(birthDate), `Birth date should have one property. Merge document: ${xdmp.toJsonString(mergedDocument)}`),
    test.assertEqual("1985-01-01", fn.string(birthDate), `Birth date should follow myFavoriteBirthDateSource strategy. Merge properties: ${xdmp.toJsonString(mergedDocument)}`)
  );
  const active = mergedDocument.xpath("/envelope/instance/Customer/active");
  assertions.push(
    test.assertEqual(1, fn.count(active), `Active should have one property. Merge document: ${xdmp.toJsonString(mergedDocument)}`),
    test.assertEqual("true", fn.string(active), `Active should be true due to custom function. Merge properties: ${xdmp.toJsonString(mergedDocument)}`)
  );
  assertions.push(
    test.assertEqual(15, fn.count(mergedDocument.xpath("/envelope/triples")), `Should have 15 triples (1 from raw + 14 from TDEs). Merge document: ${xdmp.toJsonString(mergedDocument)}`)
  );
  assertions.push(
    test.assertEqual(15, fn.count(mergedDocument.xpath("/envelope/triples")), `Should have 15 triples (1 from raw + 14 from TDEs). Merge document: ${xdmp.toJsonString(mergedDocument)}`)
  );
  const mergeContentObject = {context: {collections: [], permissions: []}};
  mergeableInstance.applyDocumentContext(mergeContentObject, {action:"merge"});
  assertions.push(
    test.assertEqual(3, mergeContentObject.context.collections.length),
    test.assertTrue(mergeContentObject.context.collections.includes("sm-Customer-merged")),
    test.assertTrue(mergeContentObject.context.collections.includes("sm-Customer-mastered")),
    test.assertTrue(mergeContentObject.context.collections.includes("Customer"))
  );
  const noMatchContentObject = {context: {collections: [], permissions: []}};
  mergeableInstance.applyDocumentContext(noMatchContentObject, {action:"no-action"});
  assertions.push(
    test.assertEqual(2, noMatchContentObject.context.collections.length),
    test.assertTrue(noMatchContentObject.context.collections.includes("sm-Customer-mastered")),
    test.assertTrue(noMatchContentObject.context.collections.includes("Customer"))
  );
  const archivedContentObject = {context: {collections: [], permissions: []}};
  mergeableInstance.applyDocumentContext(archivedContentObject, {action:"archive"});
  assertions.push(
    test.assertEqual(1, archivedContentObject.context.collections.length),
    test.assertTrue(archivedContentObject.context.collections.includes("sm-Customer-archived"))
  );
  const notifyContentObject = {context: {collections: [], permissions: []}};
  mergeableInstance.applyDocumentContext(notifyContentObject, {action:"notify"});
  assertions.push(
    test.assertEqual(1, notifyContentObject.context.collections.length),
    test.assertTrue(notifyContentObject.context.collections.includes("sm-Customer-notification"))
  );
  return assertions;
}

function testBuildMergeDocumentXml() {
  let mergeStep = Object.assign(copyStep(mergeRuleStep), {targetEntityType: "http://example.org/NamespacedCustomer-0.0.1/NamespacedCustomer"});
  let options = {};
  const mergeableInstance = new Mergeable(mergeStep, options);
  const mergeContentObjects = ["/content/NsCustMatchMerge1.xml","/content/NsCustMatchMerge2.xml","/content/NsCustMatchMerge3.xml"].map(uri => ({
    uri,
    value: cts.doc(uri)
  }));
  const mergedDocument = mergeableInstance.buildMergeDocument(mergeContentObjects);
  const assertions = [];
  assertions.push(
    test.assertTrue(fn.exists(mergedDocument.xpath("/*:envelope/*:headers/*:merge-options/*:value")), `Should have merge options. Merge document: ${xdmp.toJsonString(mergedDocument)}`)
  );
  const name = mergedDocument.xpath("/*:envelope/*:instance/*:NamespacedCustomer/*:name");
  assertions.push(
    test.assertEqual(1, fn.count(mergedDocument.xpath("/*:envelope/*:instance/*:NamespacedCustomer")), `Should only have 1 root entity instance. Merge document: ${xdmp.toJsonString(mergedDocument)}`)
  );
  assertions.push(
    test.assertEqual(1, fn.count(name), `Name should have one property. Merge document: ${xdmp.toJsonString(mergedDocument)}`),
    test.assertEqual("Holland Wells", fn.string(name),  `Name should follow myFavoriteNameSource strategy. Merge document: ${xdmp.toJsonString(mergedDocument)}`)
  );
  const birthDate = mergedDocument.xpath("/*:envelope/*:instance/*:NamespacedCustomer/*:birthDate");
  assertions.push(
    test.assertEqual(1, fn.count(birthDate), `Birth date should have one property. Merge document: ${xdmp.toJsonString(mergedDocument)}`),
    test.assertEqual("1985-01-01", fn.string(birthDate), `Birth date should follow myFavoriteBirthDateSource strategy. Merge properties: ${xdmp.toJsonString(mergedDocument)}`)
  );
  const active = mergedDocument.xpath("/*:envelope/*:instance/*:NamespacedCustomer/*:active");
  assertions.push(
    test.assertEqual(1, fn.count(active), `Active should have one property. Merge document: ${xdmp.toJsonString(mergedDocument)}`),
    test.assertEqual("true", fn.string(active), `Active should be true due to custom function. Merge properties: ${xdmp.toJsonString(mergedDocument)}`)
  );
  assertions.push(
    test.assertEqual(1, fn.count(mergedDocument.xpath("/*:envelope/*:triples/*:triple")), `Should have 1 triple. Merge document: ${xdmp.toJsonString(mergedDocument)}`)
  );
  return assertions;
}


function testCustomTripleMerge() {
  let mergeStep = copyStep(customTripleMerge);
  let options = {};
  const mergeableInstance = new Mergeable(mergeStep, options);
  const mergeContentObjects = ["/content/CustMatchMerge1.json","/content/CustMatchMerge2.json","/content/CustMatchMerge3.json"].map(uri => ({
    uri,
    value: cts.doc(uri)
  }));
  const mergedDocument = mergeableInstance.buildMergeDocument(mergeContentObjects);
  const assertions = [];
  assertions.push(
    test.assertEqual(1, fn.count(mergedDocument.xpath("/envelope/triples")), `Using a custom function for merging triples: ${xdmp.toJsonString(mergedDocument)}`)
  );
  return assertions;
}

[]
  .concat(testMergeableClass())
  .concat(testApplyContext())
  .concat(testApplyContextInterceptor())
  .concat(testMergeRuleDefinitions())
  .concat(testBuildMergeDocumentJson())
  .concat(testCustomTripleMerge())
  .concat(testBuildMergeDocumentXml());
