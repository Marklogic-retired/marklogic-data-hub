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

xdmp:document-add-collections("/content/customerForUnmerge1.json",("sm-Mastering-merged")),
xdmp:document-set-metadata("/content/customerForUnmerge1.json",map:entry("datahubCreatedOn", fn:current-dateTime())),
xdmp:document-add-collections("/content/customerForUnmerge2.json",("sm-Mastering-merged")),
xdmp:document-set-metadata("/content/customerForUnmerge2.json",map:entry("datahubCreatedOn", fn:current-dateTime())),
xdmp:document-add-collections("/content/mergedCustomer.json",("sm-Mastering-merged")),
xdmp:document-set-metadata("/content/mergedCustomer.json",map:entry("datahubCreatedOn", fn:current-dateTime()))
