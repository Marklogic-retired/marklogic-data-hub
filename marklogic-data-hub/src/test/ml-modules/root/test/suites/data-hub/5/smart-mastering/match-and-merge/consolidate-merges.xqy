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
        <result uri="/source/1/doc1.xml" index="2" score="70" threshold="Likely Match" action="notify"/>
      </results>
    )
  ))
let $actual := proc:consolidate-merges($matches,
  <options/>,
  500,
  79,
  cts:true-query()
)
let $assertions := (
  test:assert-equal(2, fn:count(map:keys($actual))),
  for $key in map:keys($actual)
  return
    if ("/source/2/doc2.xml" = map:get($actual, $key)) then
      test:assert-same-values(("/source/2/doc2.xml", "/source/3/doc3.xml"), map:get($actual, $key))
    else if ("/source/3/doc4.xml" = map:get($actual, $key)) then
      test:assert-same-values(("/source/3/doc4.xml", "/source/2/doc5.xml"), map:get($actual, $key))
    else
      test:fail("Consolidated entry does not hold expected URIs: " || fn:string-join(map:get($actual, $key), "; "))
)

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
let $actual := proc:consolidate-merges($matches,
  (),
  500,
  79,
  cts:true-query()
)

return (
  $assertions,
  test:assert-equal(0, fn:count(map:keys($actual)))
)
