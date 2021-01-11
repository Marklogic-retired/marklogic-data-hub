xquery version "1.0-ml";

import module namespace helper = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";


import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";


declare variable $match-options := xdmp:unquote('{
  "dataFormat": "json",
  "targetEntityType": "MasteringTestEntity",
  "propertyDefs": [
    {
      "property": {
        "name": "nicknames",
        "indexReferences": [
          {
            "pathReference" : {
              "pathExpression" : "/(es:envelope|envelope)/(es:instance|instance)/MasteringTestEntity/nicknames",
              "scalarType" : "string",
              "collation" : "http://marklogic.com/collation//S2",
              "nullable" : false
            }
          }
        ]
      }
    }
  ],
  "matchRulesets": [
    {
      "name": "name",
      "matchRules": [
        {
          "entityPropertyPath" : "name",
          "matchType": "exact"
        }
      ]
    },
    {
      "name": "nicknames",
      "matchRules": [
        {
          "entityPropertyPath" : "nicknames",
          "matchType": "exact"
        }
      ]
    },
    {
      "name": "status",
      "matchRules": [
        {
          "entityPropertyPath" : "status",
          "matchType": "exact"
        }
      ]
    },
    {
      "name": "customerId",
      "matchRules": [
        {
          "entityPropertyPath" : "customerId",
          "matchType": "exact"
        }
      ]
   }
  ]
}');

let $nicknames-query := helper:property-name-to-query($match-options, "nicknames")("val", 1)
return (
  test:assert-true($nicknames-query instance of cts:range-query, "Expected 'nicknames' query to use the range reference in the options"),
  let $reference := cts:range-query-index($nicknames-query)
  return (
    test:assert-equal("string", cts:reference-scalar-type($reference), "Expected 'nicknames' reference to be of type string"),
    test:assert-equal("http://marklogic.com/collation//S2", cts:reference-collation($reference), "Expected 'nicknames' collation to be 'http://marklogic.com/collation//S2'")
  )
),
let $name-query := helper:property-name-to-query($match-options, "name")("val", 1)
return (
  test:assert-true($name-query instance of cts:range-query, "Expected 'name' query to use the range reference found discovered by Entity Model"),
  let $reference := cts:range-query-index($name-query)
  return (
    test:assert-equal("string", cts:reference-scalar-type($reference), "Expected 'nicknames' reference to be of type string"),
    test:assert-equal("http://marklogic.com/collation//S2", cts:reference-collation($reference), "Expected 'nicknames' collation to be 'http://marklogic.com/collation//S2'")
  )
),
let $customerId-query := helper:property-name-to-query($match-options, "customerId")(1, 1)
return (
  test:assert-true($customerId-query instance of cts:range-query, "Expected 'customerId' query to use the range reference found discovered by Entity Model"),
  let $reference := cts:range-query-index($customerId-query)
  return (
    test:assert-equal("int", cts:reference-scalar-type($reference), "Expected 'customerId' reference to be of type integer")
  )
),
let $status-query := helper:property-name-to-query($match-options, "status")("val", 1)
return (
  test:assert-true($status-query instance of cts:json-property-value-query, "Expected 'status' query to use the be a json-property-value-query as there are no indexes")
)