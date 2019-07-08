xquery version "1.0-ml";

(:
 : Test the custom xqy action feature.
 :)

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace process = "http://marklogic.com/smart-mastering/process-records"
  at "/com.marklogic.smart-mastering/process-records.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace sm = "http://marklogic.com/smart-mastering";

(: Force update mode :)
declare option xdmp:update "true";

declare option xdmp:mapping "false";

declare function local:confirm-file($uri as xs:string)
  as xs:boolean
{
  xdmp:invoke-function(function() {
    fn:doc-available($uri)
  }, $lib:INVOKE_OPTIONS)
};

let $assertions :=
  test:assert-false(xdmp:invoke-function(function() {
    fn:exists(cts:uri-match("xqy-action-output/*"))
  }, $lib:INVOKE_OPTIONS))

(: Merge a couple documents :)
let $merged-doc :=
  xdmp:invoke-function(
    function() {
      process:process-match-and-merge(map:keys($lib:TEST-DATA), $lib:OPTIONS-NAME-CUST-ACTION-XQY-MERGE)
    },
    $lib:INVOKE_OPTIONS
  )

(: verifiy that the custom action was called twice :)
let $assertions := (
  $assertions,
  map:keys($lib:TEST-DATA) ! test:assert-true(local:confirm-file("/xqy-action-output" || .))
)

return $assertions
