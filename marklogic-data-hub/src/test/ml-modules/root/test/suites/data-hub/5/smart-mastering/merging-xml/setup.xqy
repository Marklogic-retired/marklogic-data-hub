xquery version "1.0-ml";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare option xdmp:mapping "false";

for $uri in map:keys($lib:TEST-DATA)
let $doc := test:get-test-file(map:get($lib:TEST-DATA, $uri))
return
  xdmp:document-insert(
    $uri,
    $doc,
    xdmp:default-permissions(),
    $const:CONTENT-COLL
  ),

for $uri in map:keys($lib:NESTED-DATA)
let $doc := test:get-test-file(map:get($lib:NESTED-DATA, $uri))
return
  xdmp:document-insert(
    $uri,
    $doc,
    xdmp:default-permissions(),
    $const:CONTENT-COLL
  )

