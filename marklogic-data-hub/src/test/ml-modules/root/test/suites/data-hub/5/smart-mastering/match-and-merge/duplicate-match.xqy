xquery version "1.0-ml";

import module namespace process = "http://marklogic.com/smart-mastering/process-records"
  at "/com.marklogic.smart-mastering/process-records.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace es="http://marklogic.com/entity-services";
declare namespace sm="http://marklogic.com/smart-mastering";

declare option xdmp:update "true";

declare option xdmp:mapping "false";

(:
 : We're batching calls to process-match-and-merge. The first call merges $lib:URI2 and $lib:URI3. In the second call,
 : the match process will find $lib:URI2 as a match for $lib:URI3, but it should see that those two docs have already
 : been merged and do nothing.
 :)

(: test with filtering query :)
let $actual :=
  xdmp:invoke-function(
    function() {
      let $q := cts:not-query(cts:document-query($lib:URI4))
      return
        process:process-match-and-merge(($lib:URI2, $lib:URI3), $lib:MERGE-OPTIONS-NAME, $q)
    },
    $lib:INVOKE_OPTIONS
  )


return (
  test:assert-equal(2, fn:count($actual)),
  test:assert-exists(($actual[1])),
  test:assert-equal(xs:QName("es:envelope"), fn:node-name($actual[1])),
  test:assert-equal(xs:QName("sm:notification"), fn:node-name($actual[2])),
  test:assert-same-values(($lib:URI2, $lib:URI3), $actual[1]/es:headers/sm:merges/sm:document-uri/fn:string())
)
