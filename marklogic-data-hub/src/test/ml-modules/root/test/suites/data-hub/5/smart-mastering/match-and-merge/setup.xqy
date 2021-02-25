xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
declare option xdmp:mapping "false";

matcher:save-options($lib:MATCH-OPTIONS-NAME, test:get-test-file("match-options.xml"))

;

(:Separating the merge option saves to avoid conflicting update on dictionary :)
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

merging:save-JSON-options($lib:MERGE-OPTIONS-NAME, test:get-test-file("merge-options.json"))
,
for $uri in map:keys($lib:TEST-DATA)
let $doc := test:get-test-file(map:get($lib:TEST-DATA, $uri))
return
  xdmp:document-insert(
    $uri,
    $doc,
    (xdmp:default-permissions(), xdmp:permission('data-hub-common', 'read'), xdmp:permission('data-hub-common', 'update')),
    $const:CONTENT-COLL
  )
,
for $match-summary-uri in ($lib:MATCH-SUMMARY-URI-1, $lib:MATCH-SUMMARY-URI-2)
let $doc := test:get-test-file($match-summary-uri)
return
  xdmp:document-insert(
    $match-summary-uri,
    $doc,
    (xdmp:default-permissions(), xdmp:permission('data-hub-common','read'), xdmp:permission('data-hub-common','update')),
    "datahubMasteringMatchSummary"
  )
