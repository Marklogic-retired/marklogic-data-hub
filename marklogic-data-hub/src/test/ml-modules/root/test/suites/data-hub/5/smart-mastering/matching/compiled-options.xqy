xquery version "1.0-ml";

import module namespace match-options = "http://marklogic.com/smart-mastering/options-impl"
at "/com.marklogic.smart-mastering/matcher-impl/options-impl.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

(: This set of options specifically tests legacy options with zip-match algorithm to cover the sccenario for DHFPROD-7954 :)
let $options := xdmp:unquote('{
          "dataFormat" : "json",
          "propertyDefs" : {
            "property" : [ {
              "localname" : "LastName",
              "name" : "LastName"
            }, {
              "localname" : "SSN",
              "name" : "SSN"
            }, {
              "localname" : "FirstName",
              "name" : "FirstName"
            }, {
              "localname" : "DateOfBirth",
              "name" : "DateOfBirth"
            }, {
              "localname" : "ZipCode",
              "name" : "ZipCode"
            }, {
              "localname" : [ "Address" ],
              "name" : [ "Address" ]
            } ]
          },
          "algorithms" : {
            "algorithm" : [ {
              "name" : "double-metaphone",
              "function" : "double-metaphone",
              "namespace" : "http://marklogic.com/smart-mastering/algorithms",
              "at" : "/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy"
            }, {
              "name" : "thesaurus",
              "function" : "thesaurus",
              "namespace" : "http://marklogic.com/smart-mastering/algorithms",
              "at" : "/com.marklogic.smart-mastering/algorithms/thesaurus.xqy"
            }, {
              "name" : "zip-match",
              "function" : "zip-match",
              "namespace" : "http://marklogic.com/smart-mastering/algorithms",
              "at" : "/com.marklogic.smart-mastering/algorithms/zip.xqy"
            }, {
              "name" : "standard-reduction",
              "function" : "standard-reduction"
            }, {
              "name" : "dob-match",
              "function" : "dob-match",
              "namespace" : "http://marklogic.com/smart-mastering/algorithms",
              "at" : "/custom-modules/custom/dob-match.xqy"
            } ]
          },
          "collections" : {
            "content" : [ ]
          },
          "scoring" : {
            "add" : [ {
              "propertyName" : "LastName",
              "weight" : "10"
            }, {
              "propertyName" : "SSN",
              "weight" : "20"
            } ],
            "expand" : [ {
              "propertyName" : "FirstName",
              "algorithmRef" : "double-metaphone",
              "weight" : "10",
              "dictionary" : "/dictionary/first-names.xml",
              "distanceThreshold" : "100"
            }, {
              "propertyName" : "FirstName",
              "algorithmRef" : "thesaurus",
              "weight" : "10",
              "thesaurus" : "/thesaurus/nicknames.xml"
            }, {
              "propertyName" : "DateOfBirth",
              "algorithmRef" : "dob-match",
              "weight" : "10"
            }, {
              "propertyName" : "ZipCode",
              "algorithmRef" : "zip-match",
              "zip" : [ {
                "origin" : 5,
                "weight" : "10"
              }, {
                "origin" : 9,
                "weight" : "10"
              } ]
            } ],
            "reduce" : [ {
              "allMatch" : {
                "property" : [ "Address" ]
              },
              "algorithmRef" : "standard-reduction",
              "weight" : "5"
            } ]
          },
          "actions" : {
            "action" : [ {
              "name" : "customMatch",
              "at" : "/custom-modules/custom/custom-match-action.sjs",
              "function" : "customMatch"
            } ]
          },
          "thresholds" : {
            "threshold" : [ {
              "above" : "19",
              "label" : "Match",
              "action" : "merge"
            }, {
              "above" : "9",
              "label" : "Likely Match",
              "action" : "notify"
            }, {
              "above" : "4",
              "label" : "Slight Match",
              "action" : "customMatch"
            } ]
          },
          "tuning" : {
            "maxScan" : 200
          }
        }')/object-node()
let $compiled-options := match-options:compile-match-options($options, ())
return (
  for $query in ($compiled-options => map:get("queries"))
  return
    test:assert-true(fn:exists($query => map:get("weight")), "Every compiled query should have a weight associated with it. " || xdmp:to-json-string($query))
)