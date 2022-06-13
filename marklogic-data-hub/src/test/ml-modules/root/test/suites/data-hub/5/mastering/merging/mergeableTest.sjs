const { Mergeable } = require('/data-hub/5/mastering/merging/mergeable.sjs');
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
  const contextObjectMergeable = new Mergeable(Object.assign({customApplyDocumentContextInterceptors:  [
      { path: "/test/suites/data-hub/5/mastering/matching/test-data/mergeableInterceptors.sjs", function: "customApplyDocumentContextInterceptor" }
    ]}, mergeStep), options);
  const applyDocumentContextInterceptor = contextObjectMergeable.applyDocumentContext(contentObject, actionDetails["/content/CustNoMatch.json"]);
  return [
    test.assertEqual(applyDocumentContextInterceptor.context.collections.length, 4, "Additional Collection is pushed for respective action vis interceptor"),
    test.assertEqual(applyDocumentContextInterceptor.context.collections[2], "sm-Customer-notification", "Collection created for notify action before interceptor"),
    test.assertEqual(applyDocumentContextInterceptor.context.collections[3], "sm-Customer-notification-intercepted", "Collection created for notify action after interceptor")
  ];
}

[]
  .concat(testMergeableClass())
  .concat(testApplyContext())
  .concat(testApplyContextInterceptor())