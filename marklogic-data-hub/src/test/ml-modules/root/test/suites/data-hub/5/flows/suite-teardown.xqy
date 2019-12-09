xquery version "1.0-ml";

import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

xdmp:invoke-function(function() {
  xdmp:document-delete(
    "/test/custom-null-step/main.sjs"
  )
},
  map:entry("database", xdmp:modules-database())
),

hub-test:delete-artifacts($test:__CALLER_FILE__)
