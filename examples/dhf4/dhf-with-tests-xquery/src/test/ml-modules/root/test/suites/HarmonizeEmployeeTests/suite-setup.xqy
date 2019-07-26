xquery version "1.0-ml";

import module namespace cfg = "http://example.com/config" at "/lib/config.xqy";
import module namespace tf = "http://example.com/test-flows-lib" at "/lib/test-flows-lib.xqy";
import module namespace th="http://marklogic.com/test/unit" at "/test/test-helper.xqy";
import module namespace tcfg = "http://example.com/test-config" at "/lib/test-config.xqy";



xdmp:log("Harmonize Employee Suite Setup STARTING....")
,

try {(

  (:insert documents into STAGING-TEST :)
  for $f in ("32920.xml", "34324.xml")
  let $doc := th:get-test-file($f,"xml")
  let $uri := $cfg:STAGING-PREFIX  || $f
  return xdmp:document-insert($uri, $doc, tcfg:get-staging-insert-doc-options("Employee"))


)} catch  ($ex) {
    xdmp:log("ERROR inserting test docs to STAGING","error"),
    xdmp:log(xdmp:quote($ex),"error")
}

,
try {(

    (:process content into the db:)
    tf:run-harmonize-employees()

)} catch  ($ex) {
    xdmp:log("ERROR harmonising test documents", "error"),
    xdmp:log(xdmp:quote($ex),"error")
}
,
xdmp:log("Harmonize Employee Suite Setup COMPLETE....")
