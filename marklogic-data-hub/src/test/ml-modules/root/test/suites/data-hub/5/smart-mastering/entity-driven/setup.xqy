xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub();

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-entities($test:__CALLER_FILE__);

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-artifacts($test:__CALLER_FILE__);

xdmp:document-add-collections("/content/customerMatchSummary.json",("datahubMasteringMatchSummary","datahubMasteringMatchSummary-http://example.org/Customer-0.0.1/Customer")),
xdmp:document-set-metadata("/content/customerMatchSummary.json",map:entry("datahubCreatedOn", fn:current-dateTime())),
xdmp:document-add-collections("/content/namespacedCustomerMatchSummary.json",("datahubMasteringMatchSummary","datahubMasteringMatchSummary-http://example.org/NamespacedCustomer-0.0.1/NamespacedCustomer")),
xdmp:document-set-metadata("/content/namespacedCustomerMatchSummary.json",map:entry("datahubCreatedOn", fn:current-dateTime()))
