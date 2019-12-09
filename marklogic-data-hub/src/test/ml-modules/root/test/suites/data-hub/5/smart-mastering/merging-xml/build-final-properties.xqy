xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace merging-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace test-ext = "http://marklogic.com/test/dh/ext" at "/test/additional-helper.xqy";
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
let $merge-options := merging:get-options($lib:OPTIONS-NAME, $const:FORMAT-XML)
let $sources := merging-impl:get-sources($docs, $merge-options)
let $instances := merging-impl:get-instances($docs)
let $sources-by-document-uri := util-impl:combine-maps(map:map(),for $doc-uri in $sources/documentUri return map:entry($doc-uri, $doc-uri/..))
let $actual := merging-impl:build-final-properties(
  $merge-options,
  $instances,
  $docs,
  $sources-by-document-uri
)

let $personname-map :=
  for $map in $actual
  where map:contains(-$map, "PersonName")
  return $map
let $personsex-map :=
  for $map in $actual
  where map:contains(-$map, "PersonSex")
  return $map
(: The revenue property is in only one of the documents. Make sure the attributed source is correct. :)
let $revenue-maps :=
  for $map in $actual
  where map:contains(-$map, "Revenues")
  return $map
(: Both docs have the same value for the CaseAmount property. :)
let $case-amount-map :=
  for $map in $actual
  where map:contains(-$map, "CaseAmount")
  return $map
(: The docs have different values for the id property. :)
let $id-maps :=
  for $map in $actual
  where map:contains(-$map, "id")
  return $map
return (
  test:assert-exists($personname-map),
  let $p :=
    <PersonName>
      <PersonNameType>
        <PersonSurName>JONES</PersonSurName>
        <PersonGivenName>LINDSEY</PersonGivenName>
      </PersonNameType>
    </PersonName>
  let $actual := map:get($personname-map, "values")
  return
    test-ext:assert-equal-tidy-xml($p, $actual),

  test:assert-exists($personsex-map),
  let $expected := <PersonSex>F</PersonSex>
  return
    test:assert-equal($expected, map:get($personsex-map, "values")),

  test:assert-equal(2, fn:count($revenue-maps)),
  test:assert-true(
    let $map := $revenue-maps[1]
    let $truths := (
      (map:get($map, "sources")/name = text{"SOURCE1"} and fn:deep-equal(map:get($map, "values")/RevenuesType/Revenue, <Revenue/>)) or
        (map:get($map, "sources")/name = text{"SOURCE2"} and fn:deep-equal(map:get($map, "values")/RevenuesType/Revenue, <Revenue>4332</Revenue>))
    )
    return  local:all-true($truths)
  ),

  test:assert-exists($case-amount-map),
  test:assert-equal(2, fn:count(map:get($case-amount-map, "sources"))),
  test:assert-equal(<CaseAmount>1287.9</CaseAmount>, map:get($case-amount-map, "values")),

  test:assert-equal(2, fn:count($id-maps)),
  test:assert-true(
    let $map := $id-maps[1]
    let $truths := (
      (map:get($map, "sources")/name = text{"SOURCE1"} and fn:deep-equal(map:get($map, "values"), <id>6986792174</id>)) or
        (map:get($map, "sources")/name = text{"SOURCE2"} and fn:deep-equal(map:get($map, "values"), <id>6270654339</id>))
    )
    return  local:all-true($truths)
  )
)
