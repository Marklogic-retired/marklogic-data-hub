xquery version "1.0-ml";

import module namespace constants = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace process = "http://marklogic.com/smart-mastering/process-records"
  at "/com.marklogic.smart-mastering/process-records.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace es="http://marklogic.com/entity-services";
declare namespace sm="http://marklogic.com/smart-mastering";

declare option xdmp:update "false";

declare option xdmp:mapping "false";

(:
 : We're batching calls to process-match-and-merge. URI2 and URI3 should get merged. We should then get a notification
 : about the merged document + URI1 + URI4.
 :)

(: test w/o filtering query :)
let $actual :=
  xdmp:invoke-function(
    function() {
      process:process-match-and-merge(($lib:URI2, $lib:URI3), $lib:MERGE-OPTIONS-NAME)
    },
    $lib:INVOKE_OPTIONS
  )
let $merges := $actual[self::es:envelope]
let $notifications := $actual[self::sm:notification]
return (
  test:assert-equal(2, fn:count($actual)),
  test:assert-equal(1, fn:count($merges)),
  test:assert-equal(1, fn:count($notifications)),
  test:assert-equal(3, fn:count($notifications/sm:document-uris/sm:document-uri))
)
