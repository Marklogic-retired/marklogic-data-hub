xquery version "1.0-ml";

(:
 : Test the custom xqy algorithm feature.
 :)

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace sm = "http://marklogic.com/smart-mastering";

declare option xdmp:update "false";

declare option xdmp:mapping "false";

(: Merge a couple documents :)
let $merged-doc :=
  xdmp:invoke-function(
    function() {
      merging:save-merge-models-by-uri(
        map:keys($lib:TEST-DATA),
        merging:get-options($lib:OPTIONS-NAME-CUST-XQY, $const:FORMAT-XML))
    },
    $lib:INVOKE_OPTIONS
  )

let $merged-id := $merged-doc/es:headers/sm:id
let $merged-uri := $merge-impl:MERGED-DIR || $merged-id || ".xml"

(: verifiy that the docs were merged and that the higher # survived :)
let $assertions := (
  test:assert-exists($merged-doc),
  test:assert-equal(1, fn:count($merged-doc//*:CustomThing)),
  test:assert-equal(2, $merged-doc//*:CustomThing/xs:int(.))
)

return $assertions
