xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub()

;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare variable $module-permissions := (
  xdmp:permission("rest-extension-user", 'execute'), xdmp:default-permissions(),
  xdmp:permission("data-hub-module-reader", "read"), xdmp:permission("data-hub-module-writer", "update")
);

let $_ := (
hub-test:load-artifacts($test:__CALLER_FILE__),
test:load-test-file("custom-xqy-matching-algo-dob.xqy", xdmp:modules-database(), "/custom-xqy-matching-algo-dob.xqy", $module-permissions)
)
return ()
;

xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";



matcher:save-options($lib:MATCH-OPTIONS-CUST-DOB-NAME, test:get-test-file($lib:MATCH-OPTIONS-CUST-DOB-NAME || ".json")/matchOptions),

for $uri in cts:uris()
return xdmp:log($uri)
,

merging:save-JSON-options($lib:MERGE-OPTIONS-NAME, test:get-test-file("merge-options.json"))
,
for $uri in ($lib:URI-DOB1, $lib:URI-DOB2)
let $doc := test:get-test-file(map:get($lib:TEST-DATA, $uri))
return
  xdmp:document-insert(
    $uri,
    $doc,
    (xdmp:default-permissions(),xdmp:permission('data-hub-common','read'),xdmp:permission('data-hub-common','update')),
    $const:CONTENT-COLL
  )

;

xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace process = "http://marklogic.com/smart-mastering/process-records"
  at "/com.marklogic.smart-mastering/process-records.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace es="http://marklogic.com/entity-services";
declare namespace sm="http://marklogic.com/smart-mastering";

declare option xdmp:update "false";
declare option xdmp:mapping "false";

let $actual :=
  xdmp:invoke-function(
    function() {
      let $match-options := matcher:get-options($lib:MATCH-OPTIONS-CUST-DOB-NAME, $const:FORMAT-XML)
      let $merge-options := merging:get-JSON-options($lib:MERGE-OPTIONS-NAME)
      return process:process-match-and-merge-with-options(($lib:URI-DOB2, $lib:URI-DOB1), $merge-options, $match-options, cts:true-query(), fn:false())
    },
    $lib:INVOKE_OPTIONS
  )

let $_ :=
(
  test:assert-true($actual instance of json:array, "Result should be a json array"),
  test:assert-true(json:array-size($actual) gt 1, "There should be at least one item in the array")
)

let $actual := json:array-values($actual)

let $uris :=
  for $obj in $actual
  return map:get($obj, "uri")

return (
  test:assert-equal(1, fn:count($uris[fn:contains(., "/merged/")]), "There should be one merged document."),
  test:assert-equal(0, fn:count($uris[fn:contains(., "/notifications/")]), "There should not be any notification documents. " ||
    "This is a test of an asymmetric match between two documents, where dob1.json matches dob2.json at the merge threshold " ||
    "but dob2.json matches dob1.json at the notify threshold, due to the custom matching algorithm on DOB. " ||
    "Before this fix for DHFPROD-6422 there was an extraneous notification document. ")
)

