xquery version "1.0-ml";

import module namespace constants = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace process = "http://marklogic.com/smart-mastering/process-records"
  at "/com.marklogic.smart-mastering/process-records.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace es="http://marklogic.com/entity-services";
declare namespace sm="http://marklogic.com/smart-mastering";

declare option xdmp:update "true";

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

return (
  test:assert-equal(2, fn:count($actual)),
  test:assert-equal(xs:QName("es:envelope"), fn:node-name($actual[1])),
  test:assert-equal(xs:QName("sm:notification"), fn:node-name($actual[2])),
  test:assert-equal(3, fn:count($actual[2]/sm:document-uris/sm:document-uri))
)
