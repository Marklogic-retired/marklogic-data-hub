xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub()

;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-entities($test:__CALLER_FILE__)

;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-artifacts($test:__CALLER_FILE__)

;

xquery version "1.0-ml";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
for $uri in ("/dictionary/last-names.xml", "/thesaurus/nicknames.xml")
let $doc := test:get-test-file($uri)
return
  xdmp:document-insert(
    $uri,
    $doc,
    (xdmp:default-permissions(), xdmp:permission('data-hub-common', 'read'), xdmp:permission('data-hub-common', 'update')),
    $const:CONTENT-COLL
  )


;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:wait-for-indexes();