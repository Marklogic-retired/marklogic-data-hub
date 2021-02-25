xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub();

xquery version "1.0-ml"

;

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
at "/com.marklogic.smart-mastering/matcher.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare option xdmp:mapping "false";

matcher:save-options($lib:OPTIONS-NAME-CUST-ACTION-XQY-MATCH, test:get-test-file("custom-xqy-action-match-options.xml"))

;

(:Separating the merge option saves to avoid conflicting update on dictionary :)
xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare variable $module-permissions := (
  xdmp:permission("rest-extension-user", 'execute'), xdmp:default-permissions(),
  xdmp:permission("data-hub-module-reader", "read"), xdmp:permission("data-hub-module-writer", "update")
);

declare option xdmp:mapping "false";

merging:save-JSON-options($lib:OPTIONS-NAME, test:get-test-file("merge-options.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-CUST-XQY, test:get-test-file("custom-xqy-merge-options.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-CUST-SJS, test:get-test-file("custom-sjs-merge-options.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-CUST-TRIPS-XQY, test:get-test-file("custom-xqy-triples-options.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-CUST-TRIPS-SJS, test:get-test-file("custom-sjs-triples-options.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-PATH, test:get-test-file("path-merge-options.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-WITH-DEFAULT-1, test:get-test-file("merge-options-with-default-1.json")),
merging:save-JSON-options($lib:OPTIONS-NAME-WITH-DEFAULT-2, test:get-test-file("merge-options-with-default-2.json")),
merging:save-JSON-options($lib:ONE-FIRST-OPTIONS, test:get-test-file("one-first-options.json")),
merging:save-JSON-options($lib:TWO-FIRST-OPTIONS, test:get-test-file("two-first-options.json")),
merging:save-JSON-options($lib:NESTED-OPTIONS, test:get-test-file("nested-merge-options.json")),

merging:save-JSON-options($lib:OPTIONS-NAME-CUST-ACTION-XQY-MERGE, test:get-test-file("custom-xqy-action-merge-options.json")),
matcher:save-options($lib:OPTIONS-NAME-CUST-ACTION-SJS-MATCH, test:get-test-file("custom-sjs-action-match-options.xml")),
merging:save-JSON-options($lib:OPTIONS-NAME-CUST-ACTION-SJS-MERGE, test:get-test-file("custom-sjs-action-merge-options.json")),

test:load-test-file("custom-merge-xqy.xqy", xdmp:modules-database(), "/custom-merge-xqy.xqy", $module-permissions),
test:load-test-file("custom-merge-sjs.sjs", xdmp:modules-database(), "/custom-merge-sjs.sjs", $module-permissions),
test:load-test-file("custom-triple-merge-xqy.xqy", xdmp:modules-database(), "/custom-triple-merge-xqy.xqy", $module-permissions),
test:load-test-file("custom-triple-merge-sjs.sjs", xdmp:modules-database(), "/custom-triple-merge-sjs.sjs", $module-permissions),
test:load-test-file("custom-action-xqy.xqy", xdmp:modules-database(), "/custom-action.xqy", $module-permissions),
test:load-test-file("custom-action-sjs.sjs", xdmp:modules-database(), "/custom-action.sjs", $module-permissions),
test:load-test-file("combine.xqy", xdmp:modules-database(), "/combine.xqy", $module-permissions)
