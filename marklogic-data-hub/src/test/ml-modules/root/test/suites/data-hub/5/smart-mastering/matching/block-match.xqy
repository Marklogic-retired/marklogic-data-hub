xquery version "1.0-ml";

import module namespace blocks-impl = "http://marklogic.com/smart-mastering/blocks-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/blocks-impl.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
(: Force update mode :)
declare option xdmp:update "true";

declare option xdmp:mapping "false";

let $assertions := ()
let $uri3 := "/content3.xml"
let $uri4 := "/content4.xml"

(: No blocks in the beginning :)
let $assertions := (
  $assertions,
  test:assert-not-exists(matcher:get-blocks($uri3)/node()),
  test:assert-not-exists(matcher:get-blocks($uri4)/node())
)

(: Record a block :)
let $_ :=
  xdmp:invoke-function(
    function() { blocks-impl:block-match($uri3, $uri4) },
    <options xmlns="xdmp:eval">
      <isolation>different-transaction</isolation>
    </options>
  )

(: Now each doc should have a block on the other doc. :)
let $assertions := (
  $assertions,
  test:assert-equal(array-node{ $uri4 }, matcher:get-blocks($uri3)),
  test:assert-equal(array-node{ $uri3 }, matcher:get-blocks($uri4))
)

return $assertions
