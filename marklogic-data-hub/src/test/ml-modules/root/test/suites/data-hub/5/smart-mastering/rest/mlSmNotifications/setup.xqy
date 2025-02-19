xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub()

;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-artifacts($test:__CALLER_FILE__)

;

xquery version "1.0-ml";
xdmp:document-insert("/config/hubCentral.json", xdmp:unquote('{"modeling":{"entities":{"Customer":{"label":"firstname"}}}}'),
map:map() => map:with("collections", ("http://marklogic.com/hub-central/ui-config"))
=> map:with("permissions", (xdmp:permission("data-hub-common", "update", "object"),
xdmp:permission("data-hub-common", "read", "object"))))

;

xdmp:document-add-collections("/content/customer1.json",("sm-Mastering-mastered")),
xdmp:document-set-metadata("/content/customer1.json",map:entry("datahubCreatedOn", fn:current-dateTime())),
xdmp:document-add-collections("/content/customer2.json",("sm-Mastering-mastered")),
xdmp:document-set-metadata("/content/customer2.json",map:entry("datahubCreatedOn", fn:current-dateTime())),
xdmp:document-add-collections("/content/notification1.xml",("sm-Mastering-notification")),
xdmp:document-set-metadata("/content/notification1.xml",map:entry("datahubCreatedOn", fn:current-dateTime())),
xdmp:document-add-collections("/content/notification2.xml",("sm-Mastering-notification")),
xdmp:document-set-metadata("/content/notification2.xml",map:entry("datahubCreatedOn", fn:current-dateTime()))
