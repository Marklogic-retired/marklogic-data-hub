xquery version "1.0-ml";

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

declare option xdmp:mapping "false";

debug:dump-env(),
hul:run-in-modules(function() {
  fn:doc("/trace-ui" || xdmp:get-request-field("uri"))
})
