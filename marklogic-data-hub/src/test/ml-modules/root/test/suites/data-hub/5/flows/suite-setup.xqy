xquery version "1.0-ml";

import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

hub-test:load-entities($test:__CALLER_FILE__);


xquery version "1.0-ml";

import module namespace lib = "http://marklogic.com/datahub/test" at "lib/lib.xqy";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

hub-test:load-non-entities($test:__CALLER_FILE__),

xdmp:invoke-function(function() {
  xdmp:document-insert(
    "/test/custom-null-step/main.sjs",
    test:get-test-file("nullStep.sjs"),
    (xdmp:default-permissions(), xdmp:permission("flow-operator-role", "execute"), xdmp:permission("flow-developer-role", "execute")),
    ()
  )
},
  map:entry("database", xdmp:modules-database())
),

for $uri in map:keys($lib:TEST-DATA)
let $doc := test:get-test-file(map:get($lib:TEST-DATA, $uri))
return
  xdmp:document-insert(
    $uri,
    $doc,
    xdmp:default-permissions(),
    "test-data"
  )
