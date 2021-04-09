xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub()
;
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
declare option xdmp:mapping "false";

let $schema := test:get-test-file("schema.xsd")
return
  xdmp:invoke-function(function() {
    xdmp:document-insert(
      "/matching/test-schema.xsd",
      $schema,
      map:entry("permissions", (xdmp:permission("data-hub-common", "read", "object"), xdmp:permission("data-hub-common", "update", "object"))))
  }, map:entry("database", xdmp:schema-database()) => map:with("update","true"))
;
xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-artifacts($test:__CALLER_FILE__)

;