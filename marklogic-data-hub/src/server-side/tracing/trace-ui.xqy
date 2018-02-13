xquery version "1.0-ml";

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/MarkLogic/data-hub-framework/impl/hub-utils-lib.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/MarkLogic/data-hub-framework/impl/debug-lib.xqy";

declare option xdmp:mapping "false";

debug:dump-env(),
hul:run-in-modules(function() {
  fn:doc("/trace-ui" || xdmp:get-request-field("uri"))
})
