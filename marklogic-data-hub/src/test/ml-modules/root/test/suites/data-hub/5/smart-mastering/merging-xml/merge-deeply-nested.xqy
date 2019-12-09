xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace history = "http://marklogic.com/smart-mastering/auditing/history"
  at "/com.marklogic.smart-mastering/auditing/history.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace nested = "nested";

declare option xdmp:update "false";

declare option xdmp:mapping "false";

(: Merge the nested docs :)
let $merged-doc :=
  xdmp:invoke-function(
    function() {
      merging:save-merge-models-by-uri(
        map:keys($lib:NESTED-DATA),
        merging:get-options($lib:NESTED-OPTIONS, $const:FORMAT-XML))
    },
    $lib:INVOKE_OPTIONS
  )

let $assertions := (
  test:assert-equal("another string", $merged-doc/es:instance/TopProperty/nested:LowerProperty1/EvenLowerProperty/LowestProperty1/fn:string()),
  test:assert-equal("some string", $merged-doc/es:instance/TopProperty/nested:LowerProperty1/EvenLowerProperty/LowestProperty2/fn:string()),
  test:assert-equal("another string", $merged-doc/es:instance/TopProperty/nested:LowerProperty1/EvenLowerProperty/LowestProperty3/fn:string()),
  test:assert-equal(123, $merged-doc/es:instance/TopProperty/EntityReference/PropValue/fn:data())
)

let $merged-uri := xdmp:invoke-function(
  function() {cts:uris((), "limit=1", cts:collection-query($const:MERGED-COLL))},
  $lib:INVOKE_OPTIONS
)
let $prop-history := xdmp:invoke-function(
  function() {history:property-history($merged-uri)},
  $lib:INVOKE_OPTIONS
)

let $clark-path := "{http://marklogic.com/entity-services}envelope/{http://marklogic.com/entity-services}instance/TopProperty/{nested}LowerProperty1/EvenLowerProperty/LowestProperty1"

let $assertions := (
  $assertions,
  test:assert-exists(map:get($prop-history, $clark-path)),
  test:assert-equal(
    "/nested/doc2.xml",
    map:get($prop-history, $clark-path) => map:get("another string") => map:get("details") => map:get("sourceLocation"))
)

return $assertions
