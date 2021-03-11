xquery version "1.0-ml";

import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace oex = "http://example.org/";
declare namespace tde = "http://marklogic.com/xdmp/tde";

let $assertions := (
  test:assert-equal(2, 
    xdmp:estimate(/(es:envelope|envelope)/(es:instance|instance)[es:info/es:version = "1.0" or info/version = "1.0"][TdeContextNoNamespaceEntity]),
    "The expected path in the schema should only grab the 2 TdeContextNoNamespaceEntity instances with version = 1.0"
  ),

  test:assert-equal(1, 
    xdmp:estimate(/(es:envelope|envelope)/(es:instance|instance)[es:info/es:version = "1.0" or info/version = "1.0"][oex:TdeContextNamespacedEntity]),
    "The expected path in the schema should only grab the 1 oex:TdeContextNamespacedEntity instance with version = 1.0"
  )
)

(: Verify that SQL queries on our entity types return the same counts as the estimates above :)
let $no-namespace-results := xdmp:sql("select count(*) from TdeContextNoNamespaceEntity", "map")
let $namespaced-results := xdmp:sql("select count(*) from TdeContextNamespacedEntity", "map")
let $assertions := (
  $assertions,
  test:assert-equal(2, map:get($no-namespace-results, "count(*)")),
  test:assert-equal(1, map:get($namespaced-results, "count(*)"))
)


(: Now verify the actual contents of the TDE templates :)
let $no-namespace-tde := hub-test:get-final-schema('/tde/TdeContextNoNamespaceEntity-1.0.tdex')
let $no-namespace-context := $no-namespace-tde/tde:template/tde:context/fn:string()
let $namespaced-tde := hub-test:get-final-schema('/tde/TdeContextNamespacedEntity-1.0.tdex')
let $namespaced-context := $namespaced-tde/tde:template/tde:context/fn:string()

return (
  $assertions,

  test:assert-equal("/(es:envelope|envelope)/(es:instance|instance)[es:info/es:version = '1.0' or info/version = '1.0'][TdeContextNoNamespaceEntity]", 
    $no-namespace-context,
    "The avoidance of wildcards and the use of 'or' for the version check should avoid false positives and thus unnecessary reindexing of documents"
  ),

  test:assert-equal("/(es:envelope|envelope)/(es:instance|instance)[es:info/es:version = '1.0'][oex:TdeContextNamespacedEntity]", 
    $namespaced-context,
    "The avoidance of wildcards and the use of 'or' for the version check should avoid false positives and thus unnecessary reindexing of documents"
  )
)
