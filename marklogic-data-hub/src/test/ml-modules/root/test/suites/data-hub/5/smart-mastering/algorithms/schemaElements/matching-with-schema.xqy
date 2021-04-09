xquery version "1.0-ml";

import module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms" at
  "/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy",
  "/com.marklogic.smart-mastering/algorithms/thesaurus.xqy",
  "/com.marklogic.smart-mastering/algorithms/zip.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

(: This is the minimum to test complex types defined in XML schema used with our match functions :)

let $match-options := object-node {
  "propertyDefs":  array-node { object-node { "property": object-node { "name": "zip", "localname": "zip", "namespace": "testSchema" } }},
  "matchRulesets": array-node {
    object-node {
      "name": "rulesToTestSchema",
      "matchRules": array-node {
        object-node {
          "entityPropertyPath": "zip",
          "matchType": "zip"
        }
      }
    }
  }
}
let $zip-rule := $match-options/matchRulesets[1]/matchRules[1]
let $doc-for-matching := fn:doc("/content/testSchemaXml.xml")
return (
    test:assert-equal(1, fn:count(algorithms:zip($doc-for-matching/*:Customer/*:shipping/*:zip, $zip-rule, $match-options))),
    (: the next 2 we only care that they don't throw errors :)
    test:assert-equal(0, fn:count(algorithms:doubleMetaphone($doc-for-matching/*:Customer/*:shipping/*:zip, $zip-rule, $match-options))),
    test:assert-equal(0, fn:count(algorithms:synonym($doc-for-matching/*:Customer/*:shipping/*:zip, $zip-rule, $match-options)))
)