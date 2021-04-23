xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace merging-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy",
     "/com.marklogic.smart-mastering/survivorship/merging/options.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

declare variable $quickstart-javascript-options := object-node {
  "propertyDefs": array-node {
    object-node {
      "property": object-node {
        "name": "property1",
        "path": "/property"
      }
    }
  },
  "algorithms": object-node {
    "custom": array-node {
      object-node {
          "name": "quickStartMergeProperties",
          "at": "/test/suites/data-hub/5/smart-mastering/merging/test-data/javascriptMergingFunctions.sjs",
          "function": "quickStartMergeProperties"
        }
    }
  },
  "merging": array-node {
    object-node {
      "propertyName":"property1",
      "algorithmRef": "quickStartMergeProperties",
      "maxValues": "1"
    }
  },
  "tripleMerge": object-node {
    "at": "/test/suites/data-hub/5/smart-mastering/merging/test-data/javascriptMergingFunctions.sjs",
    "function": "quickStartMergeTriples"
  }
};

declare variable $quickstart-xquery-options := object-node {
  "propertyDefs": array-node {
    object-node {
      "property": object-node {
        "name": "property1",
        "path": "/property"
      }
    }
  },
  "algorithms": object-node {
    "custom": array-node {
      object-node {
          "name": "quickStartMergeProperties",
          "namespace": "http://marklogic.com/smart-mastering/xqueryMerging",
          "at": "/test/suites/data-hub/5/smart-mastering/merging/test-data/xqueryMergingFunctions.xqy",
          "function": "quickStartMergeProperties"
        }
    }
  },
  "merging": array-node {
    object-node {
      "propertyName":"property1",
      "algorithmRef": "quickStartMergeProperties",
      "maxValues": "1"
    }
  },
  "tripleMerge": object-node {
    "namespace": "http://marklogic.com/smart-mastering/xqueryMerging",
    "at": "/test/suites/data-hub/5/smart-mastering/merging/test-data/xqueryMergingFunctions.xqy",
    "function": "quickStartMergeTriples"
  }
};

declare variable $hub-central-javascript-options := object-node {
  "mergeRules": array-node {
    object-node {
      (: using documentXPath to avoid the need to load an entity  :)
      "documentXPath":"/property",
      "mergeModulePath": "/test/suites/data-hub/5/smart-mastering/merging/test-data/javascriptMergingFunctions.sjs",
      "mergeModuleFunction": "hubCentralMergeProperties",
      "maxValues": "1"
    }
  },
  "tripleMerge": object-node {
    "at": "/test/suites/data-hub/5/smart-mastering/merging/test-data/javascriptMergingFunctions.sjs",
    "function": "hubCentralMergeTriples"
  }
};

declare variable $hub-central-xquery-options := object-node {
  "mergeRules": array-node {
    object-node {
      (: using documentXPath to avoid the need to load an entity  :)
      "documentXPath":"/property",
      "mergeModulePath": "/test/suites/data-hub/5/smart-mastering/merging/test-data/xqueryMergingFunctions.xqy",
      "mergeModuleNamespace": "http://marklogic.com/smart-mastering/xqueryMerging",
      "mergeModuleFunction": "hubCentralMergeProperties",
      "maxValues": "1"
    }
  },
  "tripleMerge": object-node {
    "at": "/test/suites/data-hub/5/smart-mastering/merging/test-data/xqueryMergingFunctions.xqy",
    "namespace": "http://marklogic.com/smart-mastering/xqueryMerging",
    "function": "hubCentralMergeTriples"
  }
};

declare variable $test-docs := (
  document { object-node { "property": "val1" } },
  document { object-node { "property": "val2" } }
);

declare variable $test-content-objects := (
  map:new((
    map:entry("uri", "test1"),
    map:entry("value", $test-docs[1])
  )),
  map:new((
    map:entry("uri", "test2"),
    map:entry("value", $test-docs[2])
  ))
);

  (: Test XQuery triple functions :)
  try {
    let $results := merging-impl:build-final-triples(merging-impl:compile-merge-options($quickstart-xquery-options), $test-docs, ())
    return (
      test:assert-equal("QuickStart", sem:triple-subject($results), "Triple should have 'QuickStart' as the subject."),
      test:assert-equal("XQuery", sem:triple-object($results), "Triple should have 'XQuery' as the object.")
    )
  } catch ($e) {
    test:assert-false(fn:true(), "Unexpected exception for XQuery QuickStart triple merge. Exception: " || xdmp:describe($e, (), ()))
  },
  try {
    let $results := merging-impl:build-final-triples(merging-impl:compile-merge-options($hub-central-xquery-options), $test-docs, ())
    return (
      test:assert-equal("Hub Central", sem:triple-subject($results), "Triple should have 'Hub Central' as the subject."),
      test:assert-equal("XQuery", sem:triple-object($results), "Triple should have 'XQuery' as the object.")
    )
  } catch ($e) {
    test:assert-false(fn:true(), "Unexpected exception for XQuery Hub Central triple merge. Exception: " || xdmp:describe($e, (), ()))
  },

  try {
    let $results := merging-impl:get-merge-values(merging-impl:compile-merge-options($quickstart-xquery-options) => map:get("mergeRulesInfo"), $test-content-objects, map:map(), map:map(), "options-ref")
    return test:assert-equal("QuickStart XQuery Merge", fn:string($results => map:get("values")), " should have 'QuickStart XQuery Merge' as the values.")
  } catch ($e) {
    test:assert-false(fn:true(), "Unexpected exception for QuickStart XQuery Merge. Exception: " || xdmp:describe($e, (), ()))
  },

  try {
    let $results := merging-impl:get-merge-values(merging-impl:compile-merge-options($hub-central-xquery-options) => map:get("mergeRulesInfo"), $test-content-objects, map:map(), map:map(), "options-ref")
    return test:assert-equal("Hub Central XQuery Merge", fn:string($results => map:get("values")), " should have 'Hub Central XQuery Merge' as the values.")
  } catch ($e) {
    test:assert-false(fn:true(), "Unexpected exception for Hub Central XQuery Merge. Exception: " || xdmp:describe($e, (), ()))
  },
  (: Test JavaScript functions :)
  try {
    let $results := merging-impl:build-final-triples(merging-impl:compile-merge-options($quickstart-javascript-options), $test-docs, ())
    return (
      test:assert-equal("QuickStart", sem:triple-subject($results), "Triple should have 'QuickStart' as the subject."),
      test:assert-equal("JavaScript", sem:triple-object($results), "Triple should have 'JavaScript' as the object.")
    )
  } catch ($e) {
    test:assert-false(fn:true(), "Unexpected exception for JavaScript QuickStart triple merge. Exception: " || xdmp:describe($e, (), ()))
  },
  try {
    let $results := merging-impl:build-final-triples(merging-impl:compile-merge-options($hub-central-javascript-options), $test-docs, ())
    return (
      test:assert-equal("Hub Central", sem:triple-subject($results), "Triple should have 'Hub Central' as the subject."),
      test:assert-equal("JavaScript", sem:triple-object($results), "Triple should have 'JavaScript' as the object.")
    )
  } catch ($e) {
    test:assert-false(fn:true(), "Unexpected exception for JavaScript Hub Central triple merge. Exception: " || xdmp:describe($e, (), ()))
  },

  try {
    let $results := merging-impl:get-merge-values(merging-impl:compile-merge-options($quickstart-javascript-options) => map:get("mergeRulesInfo"), $test-content-objects, map:map(), map:map(), "options-ref")
    return test:assert-equal("QuickStart JavaScript Merge", fn:string($results => map:get("values")), " should have 'QuickStart JavaScript Merge' as the values.")
  } catch ($e) {
    test:assert-false(fn:true(), "Unexpected exception for QuickStart JavaScript Merge. Exception: " || xdmp:describe($e, (), ()))
  },

  try {
    let $results := merging-impl:get-merge-values(merging-impl:compile-merge-options($hub-central-javascript-options) => map:get("mergeRulesInfo"), $test-content-objects, map:map(), map:map(), "options-ref")
    return test:assert-equal("Hub Central JavaScript Merge", fn:string($results => map:get("values")), " should have 'Hub Central JavaScript Merge' as the values.")
  } catch ($e) {
    test:assert-false(fn:true(), "Unexpected exception for Hub Central JavaScript Merge. Exception: " || xdmp:describe($e, (), ()))
  }

