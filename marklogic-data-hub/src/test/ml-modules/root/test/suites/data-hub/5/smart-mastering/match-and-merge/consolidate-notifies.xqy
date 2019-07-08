xquery version "1.0-ml";

import module namespace constants = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace proc = "http://marklogic.com/smart-mastering/process-records/impl"
  at "/com.marklogic.smart-mastering/impl/process.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace es="http://marklogic.com/entity-services";
declare namespace sm="http://marklogic.com/smart-mastering";

declare option xdmp:mapping "false";

(:
 : Scenario #1
 :)
let $matches :=
  map:new((
    map:entry("/source/2/doc2.xml",
      <results total="3" page-length="500" start="1">
        <result uri="/source/3/doc3.xml" index="1" score="79" threshold="Definitive Match" action="merge"/>
        <result uri="/source/1/doc1.xml" index="2" score="70" threshold="Likely Match" action="notify"/>
      </results>
    ),
    map:entry("/source/3/doc3.xml",
      <results total="3" page-length="500" start="1">
        <result uri="/source/2/doc2.xml" index="1" score="79" threshold="Definitive Match" action="merge"/>
        <result uri="/source/1/doc1.xml" index="2" score="70" threshold="Likely Match" action="notify"/>
      </results>
    ),
    map:entry("/source/3/doc4.xml",
      <results total="3" page-length="500" start="1">
        <result uri="/source/2/doc5.xml" index="1" score="79" threshold="Definitive Match" action="merge"/>
        <result uri="/source/1/doc1.xml" index="2" score="70" threshold="Possible Match" action="notify"/>
      </results>
    )
  ))
let $consolidated-merges :=
  map:new((
    map:entry("/com.marklogic.smart-mastering/merged/25df72f1-8026-4171-bc87-96a4662ff6b1.xml", ("/source/2/doc2.xml", "/source/3/doc3.xml")),
    map:entry("/com.marklogic.smart-mastering/merged/0dab6878-6fca-49e3-899d-5e4347316334.xml", ("/source/3/doc4.xml", "/source/2/doc5.xml"))
  ))
let $actual := proc:consolidate-notifies($matches, -$consolidated-merges)
let $merged-2-3-uri := "/com.marklogic.smart-mastering/merged/25df72f1-8026-4171-bc87-96a4662ff6b1.xml"
let $merged-4-5-uri := "/com.marklogic.smart-mastering/merged/0dab6878-6fca-49e3-899d-5e4347316334.xml"
let $assertions := (
  test:assert-equal(2, fn:count($actual)),
  for $key in $actual
  let $parts := fn:tokenize($key, $proc:STRING-TOKEN)
  let $threshold := fn:head($parts)
  let $uris := fn:tail($parts)
  return
    if ($merged-2-3-uri = $uris) then (
      test:assert-same-values(("/source/1/doc1.xml", $merged-2-3-uri), $uris),
      test:assert-equal("Likely Match", $threshold)
    )
    else if ($merged-4-5-uri = $uris) then (
      test:assert-same-values(("/source/1/doc1.xml", $merged-4-5-uri), $uris),
      test:assert-equal("Possible Match", $threshold)
    )
    else
      test:fail("Consolidated entry does not hold expected URIs: " || $key)
)

(:
 : Scenario #2.
 :)
let $matches :=
  map:new((
    map:entry(
      "/source/2/doc2.xml",
      <results total="1" page-length="500" start="1">
        <result uri="/source/1/doc1.xml" index="1" score="64" threshold="Likely Match" action="notify"/>
      </results>
    ),
    map:entry(
      "/source/1/doc1.xml",
      <results total="1" page-length="500" start="1">
        <result uri="/source/2/doc2.xml" index="1" score="64" threshold="Likely Match" action="notify"/>
      </results>
    )
  ))
let $actual := proc:consolidate-notifies($matches, map:new(()))

let $parts := fn:tokenize($actual, $proc:STRING-TOKEN)
let $threshold := fn:head($parts)
let $uris := fn:tail($parts)

return (
  $assertions,
  test:assert-equal(1, fn:count($actual)),
  (: The string we get back might be in either order, so split it and check :)
  test:assert-same-values(("/source/1/doc1.xml", "/source/2/doc2.xml"), $uris),
  test:assert-equal("Likely Match", $threshold)
)
