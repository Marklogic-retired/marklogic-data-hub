xquery version "1.0-ml";

(:
 : Test the custom xqy algorithm feature.
 :)

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace sm = "http://marklogic.com/smart-mastering";

declare option xdmp:mapping "false";

let $options := merge-impl:get-options($lib:OPTIONS-NAME-PATH, $const:FORMAT-XML)

let $shallow-prop := $options/merging:property-defs/merging:property[@name="shallow"]

let $deep-prop := $options/merging:property-defs/merging:property[@name="deep"]

let $docs := map:keys($lib:TEST-DATA) ! fn:doc(.)

let $sources := merge-impl:get-sources($docs, $options)

let $actual :=
  merge-impl:get-raw-values(
    $docs,
    $shallow-prop,
    $sources,
    ()
  )
(:
 : Expecting all values from sources:

    {
      "sources":{"name":"SOURCE1", "dateTime":"2018-04-26T16:40:16.760311Z", "documentUri":"/source/1/doc1.xml"},
      "values":"shallow value 1",
      "name": "shallow"
    }
    {
      "sources":{"name":"SOURCE2", "dateTime":"2018-04-26T16:40:16.760311Z", "documentUri":"/source/2/doc2.xml"},
      "values":"shallow value 2",
      "name": "shallow"
    }
 :)
let $assertions := (
  test:assert-equal(2, fn:count($actual)),

  for $act in $actual
  let $src-name := map:get($act, "sources")/name/fn:string()
  return
    if ($src-name = "SOURCE1") then
      test:assert-equal(
        text { "shallow value 1" },
        map:get($act, "values")
      )
    else if ($src-name = "SOURCE2") then
      test:assert-equal(
        text { "shallow value 2" },
        map:get($act, "values")
      )
    else
      test:fail("invalid source: " || $src-name),

  test:assert-equal(xs:QName("shallow"), map:get($actual[1], "name")),
  test:assert-equal(xs:QName("shallow"), map:get($actual[2], "name"))
)

let $actual :=
  merge-impl:get-raw-values(
    $docs,
    $deep-prop,
    $sources,
    map:new((
      map:entry("es", "http://marklogic.com/entity-services"),
      map:entry("has", "has")
    ))
  )

(:
 : Expecting all values from sources:
    {
      "sources":[{"name":"SOURCE1", "dateTime":"2018-04-26T16:40:16.760311Z", "documentUri":"/source/1/doc1.xml"},{"name":"SOURCE2", "dateTime":"2018-04-26T16:40:16.760311Z", "documentUri":"/source/2/doc2.xml"}],
      "values":"<path xmlns=\"\">deep value 1</path><path xmlns=\"\">deep value 2</path>",
      "namespaces": [{"es": "http://marklogic.com/entity-services"}],
      "path":"/es:envelope/es:headers/custom/this/has:a/deep/path",
      "propQName": "path"
    }
 :)
return (
  $assertions,
  test:assert-equal(2, fn:count($actual)),

  for $act in $actual
  let $src-name := map:get($act, "sources")/name/fn:string()
  return
    if ($src-name = "SOURCE1") then
      test:assert-equal(
        text { "deep value 1" },
        map:get($act, "values")
      )
    else if ($src-name = "SOURCE2") then
      test:assert-equal(
        text { "deep value 2" },
        map:get($act, "values")
      )
    else
      test:fail("invalid source: " || $src-name),

  test:assert-equal(xs:QName("path"), map:get($actual[1], "name")),
  test:assert-equal(xs:QName("path"), map:get($actual[2], "name"))
)
