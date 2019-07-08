xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare option xdmp:mapping "false";

merging:save-options($lib:OPTIONS-NAME, test:get-test-file("merge-options.xml")),
merging:save-options($lib:OPTIONS-NAME-CUST-XQY, test:get-test-file("custom-xqy-merge-options.xml")),
merging:save-options($lib:OPTIONS-NAME-CUST-SJS, test:get-test-file("custom-sjs-merge-options.xml")),
merging:save-options($lib:OPTIONS-NAME-CUST-TRIPS-XQY, test:get-test-file("custom-xqy-triples-options.xml")),
merging:save-options($lib:OPTIONS-NAME-CUST-TRIPS-SJS, test:get-test-file("custom-sjs-triples-options.xml")),
merging:save-options($lib:OPTIONS-NAME-PATH, test:get-test-file("path-merge-options.xml")),
merging:save-options($lib:OPTIONS-NAME-WITH-DEFAULT-1, test:get-test-file("merge-options-with-default-1.xml")),
merging:save-options($lib:OPTIONS-NAME-WITH-DEFAULT-2, test:get-test-file("merge-options-with-default-2.xml")),
merging:save-options($lib:ONE-FIRST-OPTIONS, test:get-test-file("one-first-options.xml")),
merging:save-options($lib:TWO-FIRST-OPTIONS, test:get-test-file("two-first-options.xml")),
merging:save-options($lib:NESTED-OPTIONS, test:get-test-file("nested-merge-options.xml")),

matcher:save-options($lib:OPTIONS-NAME-CUST-ACTION-XQY-MATCH, test:get-test-file("custom-xqy-action-match-options.xml")),
merging:save-options($lib:OPTIONS-NAME-CUST-ACTION-XQY-MERGE, test:get-test-file("custom-xqy-action-merge-options.xml")),
matcher:save-options($lib:OPTIONS-NAME-CUST-ACTION-SJS-MATCH, test:get-test-file("custom-sjs-action-match-options.xml")),
merging:save-options($lib:OPTIONS-NAME-CUST-ACTION-SJS-MERGE, test:get-test-file("custom-sjs-action-merge-options.xml")),

test:load-test-file("custom-merge-xqy.xqy", xdmp:modules-database(), "/custom-merge-xqy.xqy"),
test:load-test-file("custom-merge-sjs.sjs", xdmp:modules-database(), "/custom-merge-sjs.sjs"),
test:load-test-file("custom-triple-merge-xqy.xqy", xdmp:modules-database(), "/custom-triple-merge-xqy.xqy"),
test:load-test-file("custom-triple-merge-sjs.sjs", xdmp:modules-database(), "/custom-triple-merge-sjs.sjs"),
test:load-test-file("custom-action-xqy.xqy", xdmp:modules-database(), "/custom-action.xqy"),
test:load-test-file("custom-action-sjs.sjs", xdmp:modules-database(), "/custom-action.sjs"),
test:load-test-file("combine.xqy", xdmp:modules-database(), "/combine.xqy")
