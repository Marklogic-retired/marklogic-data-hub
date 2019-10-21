xquery version "1.0-ml";

import module namespace helper = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";


import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";


let $original-set-of-queries := (
  cts:json-property-scope-query("Person", cts:json-property-value-query("givenName", "John")),
  cts:json-property-scope-query("Person", cts:json-property-value-query("surName", "Doe")),
  cts:element-query(xs:QName("Person"), cts:element-value-query(xs:QName("givenName"), "John")),
  cts:element-query(xs:QName("Person"), cts:element-value-query(xs:QName("surName"), "Doe")),
  cts:element-value-query(xs:QName("category"), "a")
)
let $grouped := helper:group-queries-by-scope($original-set-of-queries, cts:and-query#1)
let $json-property-scope-query := cts:json-property-scope-query-query($grouped[. instance of cts:json-property-scope-query])
let $element-scope-query := cts:element-query-query($grouped[. instance of cts:element-query])
return (
  test:assert-equal(3, fn:count($grouped), "Expected to be grouped into 3 queries"),
  test:assert-true($json-property-scope-query instance of cts:and-query, "JSON property scope query is cts:and-query"),
  test:assert-equal(2, fn:count(cts:and-query-queries($json-property-scope-query)), "Expected to be 2 queries in JSON property scope"),
  test:assert-true($element-scope-query instance of cts:and-query, "Element scope query is cts:and-query"),
  test:assert-equal(2, fn:count(cts:and-query-queries($element-scope-query)), "Expected to be 2 queries in element scope")
)
