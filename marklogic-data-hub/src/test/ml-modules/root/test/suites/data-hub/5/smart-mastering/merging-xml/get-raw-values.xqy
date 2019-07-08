xquery version "1.0-ml";

(:
 : Test the custom xqy algorithm feature.
 :)

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy",
      "/com.marklogic.smart-mastering/survivorship/merging/options.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace sm = "http://marklogic.com/smart-mastering";
declare namespace endswith = "endswith";

declare option xdmp:mapping "false";

let $options := merge-impl:get-options($lib:OPTIONS-NAME-PATH, $const:FORMAT-XML)

let $shallow-prop := $options/merging:property-defs/merging:property[@name="shallow"]

let $deep-prop := $options/merging:property-defs/merging:property[@name="deep"]

let $ends-with-ns-prop := $options/merging:property-defs/merging:property[@name="endswithns"]

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
      "values":"<shallow xmlns=\"\">shallow value 1</shallow>",
      "name": "shallow"
    }
    {
      "sources":{"name":"SOURCE2", "dateTime":"2018-04-26T16:40:16.760311Z", "documentUri":"/source/2/doc2.xml"},
      "values":"<shallow xmlns=\"\">shallow value 2</shallow>",
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
        <shallow xmlns="">shallow value 1</shallow>,
        map:get($act, "values")
      )
    else if ($src-name = "SOURCE2") then
      test:assert-equal(
        <shallow xmlns="">shallow value 2</shallow>,
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
let $assertions := (
  $assertions,
  test:assert-equal(2, fn:count($actual)),

  for $act in $actual
  let $src-name := map:get($act, "sources")/name/fn:string()
  return
    if ($src-name = "SOURCE1") then
      test:assert-equal(
        <path xmlns="">deep value 1</path>,
        map:get($act, "values")
      )
    else if ($src-name = "SOURCE2") then
      test:assert-equal(
        <path xmlns="">deep value 2</path>,
        map:get($act, "values")
      )
    else
      test:fail("invalid source: " || $src-name),
  test:assert-equal(xs:QName("path"), map:get($actual[1], "name")),
  test:assert-equal(xs:QName("path"), map:get($actual[2], "name"))
)


let $actual :=
  merge-impl:get-raw-values(
    $docs,
    $ends-with-ns-prop,
    $sources,
    map:new((
      map:entry("es", "http://marklogic.com/entity-services"),
      map:entry("has", "has"),
      map:entry("endswith", "endswith")
    ))
  )

(:
 : Expecting all values from sources:
    {
      "sources":[{"name":"SOURCE1", "dateTime":"2018-04-26T16:40:16.760311Z", "documentUri":"/source/1/doc1.xml"},{"name":"SOURCE2", "dateTime":"2018-04-26T16:40:16.760311Z", "documentUri":"/source/2/doc2.xml"}],
      "values":"<endswith:ns>endswith value 1</endswith:ns><endswith:ns>endswith value 2</endswith:ns>",
      "namespaces": [{"es": "http://marklogic.com/entity-services"}],
      "path":"/es:envelope/es:headers/custom/this/has:a/deep/endswith:ns",
      "propQName": "endswith:ns"
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
        <endswith:ns>endswith value 1</endswith:ns>,
        map:get($act, "values")
      )
    else if ($src-name = "SOURCE2") then
      test:assert-equal(
        <endswith:ns>endswith value 2</endswith:ns>,
        map:get($act, "values")
      )
    else
      test:fail("invalid source: " || $src-name),

  test:assert-equal(fn:QName("endswith", "ns"), map:get($actual[1], "name")),
  test:assert-equal(fn:QName("endswith", "ns"), map:get($actual[2], "name"))
)
