xquery version "1.0-ml";
import module namespace config = "http://marklogic.com/data-hub/config" at "/com.marklogic.hub/config.xqy";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";

hub-test:clear-jobs-database(),
hub-test:clear-provenance-records($config:FINAL-DATABASE),
hub-test:clear-provenance-records($config:STAGING-DATABASE)
;

import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

hub-test:load-jobs($test:__CALLER_FILE__);