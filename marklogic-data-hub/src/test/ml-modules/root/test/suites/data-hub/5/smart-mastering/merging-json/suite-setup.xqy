xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub()

;

xquery version "1.0-ml";

import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare option xdmp:mapping "false";

merging:save-JSON-options($lib:OPTIONS-NAME, test:get-test-file("merge-options.json")),
merging:save-JSON-options($lib:OPTIONS-NAME2, test:get-test-file("merge-options2.json"))

;

(: Separating the merge option saves to avoid conflicting update on dictionary :)
xquery version "1.0-ml";

import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare variable $module-permissions := (
  xdmp:permission("rest-extension-user", 'execute'), xdmp:default-permissions(),
  xdmp:permission("data-hub-module-reader", "read"), xdmp:permission("data-hub-module-writer", "update")
);

declare option xdmp:mapping "false";

merging:save-JSON-options($lib:OPTIONS-NAME-STRATEGIES, test:get-test-file("merge-options-with-strategies.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-COMPLETE, test:get-test-file("merge-options-complete.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-CUST-XQY, test:get-test-file("custom-xqy-merge-options.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-CUST-SJS, test:get-test-file("custom-sjs-merge-options.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-PATH, test:get-test-file("path-merge-options.json")),
merging:save-JSON-options($lib:NESTED-OPTIONS, test:get-test-file("nested-merge-options.json"))
