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
let $uri1 := "/block-matches1.xml"
let $uri2 := "/block-matches2.xml"
let $uri3 := "/block-matches3.xml"
let $uri4 := "/block-matches4.xml"

(: No blocks in the beginning :)
let $assertions := (
  $assertions,
  test:assert-not-exists(matcher:get-blocks($uri1)/node()),
  test:assert-not-exists(matcher:get-blocks($uri2)/node()),
  test:assert-not-exists(matcher:get-blocks($uri3)/node()),
  test:assert-not-exists(matcher:get-blocks($uri4)/node())
)

(: Record a block :)
let $_ :=
  xdmp:invoke-function(
    function() { matcher:block-matches(($uri1, $uri2, $uri3, $uri4)) },
    <options xmlns="xdmp:eval">
      <isolation>different-transaction</isolation>
    </options>
  )

let $_ := map:clear($blocks-impl:cached-blocks-by-uri)
(: Now each doc should have a block on the other doc. :)
let $assertions := (
  $assertions,
  test:assert-same-values(($uri2, $uri3, $uri4), matcher:get-blocks($uri1)/node()/fn:string()),
  test:assert-same-values(($uri1, $uri3, $uri4), matcher:get-blocks($uri2)/node()/fn:string()),
  test:assert-same-values(($uri1, $uri2, $uri4), matcher:get-blocks($uri3)/node()/fn:string()),
  test:assert-same-values(($uri1, $uri2, $uri3), matcher:get-blocks($uri4)/node()/fn:string())
)

return $assertions
