xquery version "1.0-ml";

(:
 : Scenario: We run process-match-and-merge on a document (doc1.xml). Then we run
 : it again on doc2.xml
 : The idea is to reproduce a use case that caused 2 notification to be created
 : where only 1 should be.
 :
 : Desired result:
 :   - create merged document (doc12.xml)
 :   - create notification that refers to the merged doc
 :   - ensure only 1 notification is created
 :)

import module namespace const = "http://marklogic.com/smart-mastering/constants"
at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace process = "http://marklogic.com/smart-mastering/process-records"
at "/com.marklogic.smart-mastering/process-records.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace es="http://marklogic.com/entity-services";
declare namespace sm="http://marklogic.com/smart-mastering";

declare option xdmp:update "true";

declare option xdmp:mapping "false";

declare variable $MERGED-QNAME := xs:QName("es:envelope");
declare variable $NOTIFY-QNAME := xs:QName("sm:notification");

let $actual := matcher:get-notifications-as-xml(1, 10, map:map())
return
  test:assert-equal(0, fn:count($actual)),

let $_ :=
  xdmp:invoke-function(
    function() {
      process:process-match-and-merge(($lib:URI1, $lib:URI2), $lib:MERGE-OPTIONS-NAME)
    },
    $lib:INVOKE_OPTIONS
  )

let $actual := xdmp:invoke-function(function() {
  matcher:get-notifications-as-xml(1, 10, map:map())
}, $lib:INVOKE_OPTIONS)
return
  test:assert-equal(1, fn:count($actual))
