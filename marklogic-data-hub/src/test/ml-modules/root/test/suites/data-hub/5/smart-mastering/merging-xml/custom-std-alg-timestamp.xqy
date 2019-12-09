xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace merging-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace util-impl = "http://marklogic.com/smart-mastering/util-impl"
  at "/com.marklogic.smart-mastering/impl/util.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare namespace map = "http://marklogic.com/xdmp/map";

declare option xdmp:mapping "false";

declare function local:all-true($seq as xs:boolean*) as xs:boolean
{
  fn:fold-left(function($z, $a) { $z and $a }, fn:true(), ($seq))
};

let $uris := map:keys($lib:TEST-DATA)
let $docs := $uris ! fn:doc(.)
let $merge-options := merging:get-options($lib:ONE-FIRST-OPTIONS, $const:FORMAT-XML)
let $sources := merging-impl:get-sources($docs, $merge-options)
let $instances := merging-impl:get-instances($docs)
let $sources-by-document-uri := util-impl:combine-maps(map:map(),for $doc-uri in $sources/documentUri return map:entry($doc-uri, $doc-uri/..))
let $actual := merging-impl:build-final-properties(
  $merge-options,
  $instances,
  $docs,
  $sources-by-document-uri
)

let $map :=
  for $map in $actual
  where map:contains(-$map, "OnlyOne")
  return $map
return (
  test:assert-exists($map),
  test:assert-equal(1, fn:count(map:get($map, "sources"))),
  test:assert-equal(text{ "1" }, map:get($map, "values")/text())
),

let $uris := map:keys($lib:TEST-DATA)
let $docs := $uris ! fn:doc(.)
let $merge-options := merging:get-options($lib:TWO-FIRST-OPTIONS, $const:FORMAT-XML)
let $sources := merging-impl:get-sources($docs, $merge-options)
let $sources-by-document-uri := util-impl:combine-maps(map:map(),for $doc-uri in $sources/documentUri return map:entry($doc-uri, $doc-uri/..))
let $instances := merging-impl:get-instances($docs)
let $actual := merging-impl:build-final-properties(
  $merge-options,
  $instances,
  $docs,
  $sources-by-document-uri
)

let $map :=
  for $map in $actual
  where map:contains(-$map, "OnlyOne")
  return $map
return (
  test:assert-exists($map),
  test:assert-equal(1, fn:count(map:get($map, "sources"))),
  test:assert-equal(text{ "2" }, map:get($map, "values")/text())
)
