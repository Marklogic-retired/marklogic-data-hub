xquery version "1.0-ml";

import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare option xdmp:mapping "false";

merging:save-options($lib:OPTIONS-NAME, test:get-test-file("merge-options.xml")),
merging:save-options($lib:OPTIONS-NAME-STRATEGIES, test:get-test-file("merge-options-with-strategies.xml")),
merging:save-options($lib:OPTIONS-NAME-COMPLETE, test:get-test-file("merge-options-complete.xml")),
merging:save-options($lib:OPTIONS-NAME-CUST-XQY, test:get-test-file("custom-xqy-merge-options.xml")),
merging:save-options($lib:OPTIONS-NAME-CUST-SJS, test:get-test-file("custom-sjs-merge-options.xml")),
merging:save-options($lib:OPTIONS-NAME-PATH, test:get-test-file("path-merge-options.xml")),
merging:save-options($lib:NESTED-OPTIONS, test:get-test-file("nested-merge-options.json")),

test:load-test-file("custom-merge-xqy.xqy", xdmp:modules-database(), "/custom-merge-xqy.xqy"),
test:load-test-file("custom-merge-sjs.sjs", xdmp:modules-database(), "/custom-merge-sjs.sjs"),
test:load-test-file("combine-json.xqy", xdmp:modules-database(), "/combine-json.xqy")
