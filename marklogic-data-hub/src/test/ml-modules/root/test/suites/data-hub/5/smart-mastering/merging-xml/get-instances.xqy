xquery version "1.0-ml";

(:
 : Verify that merge-impl:get-instances works correctly.
 :)

import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare option xdmp:mapping "false";

let $uris := map:keys($lib:TEST-DATA)
let $docs := $uris ! fn:doc(.)
let $actual := merge-impl:get-instances($docs)
return (
  test:assert-equal(2, fn:count($actual)),
  test:assert-equal(xs:QName("PersonType"), fn:node-name($actual[1])),
  test:assert-equal(xs:QName("PersonType"), fn:node-name($actual[2]))
)
