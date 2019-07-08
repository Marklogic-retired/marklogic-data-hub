xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
(: Force update mode :)
declare option xdmp:update "true";

declare option xdmp:mapping "false";

()
(: Commenting out for now due to bug https://bugtrack.marklogic.com/52853 :)
(:
let $assertions := ()
let $uri1 := "/content1.xml"
let $uri2 := "/content2.xml"
let $uri3 := "/content3.xml"

(: setup.xqy creates a block. Remove it. :)
let $removed :=
  xdmp:invoke-function(
    function() { matcher:allow-match($uri2, $uri1) },
    <options xmlns="xdmp:eval">
      <isolation>different-transaction</isolation>
    </options>
  )

(: Attempt to remove a block that does not exist (should return false). Note
 : that it doesn't matter whether the URIs actually refer to existing documents.
 :)
let $does-not-exist :=
  xdmp:invoke-function(
    function() { matcher:allow-match($uri1, $uri3) },
    <options xmlns="xdmp:eval">
      <isolation>different-transaction</isolation>
    </options>
  )

(: Blocks should be gone :)
return (
  $assertions,
  test:assert-true($removed),
  test:assert-false($does-not-exist),
  test:assert-not-exists(matcher:get-blocks($uri1)/node()),
  test:assert-not-exists(matcher:get-blocks($uri2)/node())
)
:)
