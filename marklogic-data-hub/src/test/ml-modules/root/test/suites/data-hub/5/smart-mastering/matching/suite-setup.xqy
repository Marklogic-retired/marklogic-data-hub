xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub();

xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";
matcher:save-options($lib:MATCH-OPTIONS-NAME, test:get-test-file("match-options.xml"));
(:Separating the merge option saves to avoid conflicting update on dictionary :)
xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare variable $module-permissions := (
  xdmp:permission("rest-extension-user", 'execute'), xdmp:default-permissions(),
  xdmp:permission("data-hub-module-reader", "read"), xdmp:permission("data-hub-module-writer", "update")
);

declare option xdmp:mapping "false";

matcher:save-options($lib:NAMESPACED-MATCH-OPTIONS-NAME, test:get-test-file("namespaced-match-options.xml")),
matcher:save-options($lib:SCORE-OPTIONS-NAME, test:get-test-file("scoring-options.xml")),
matcher:save-options($lib:SCORE-OPTIONS-NAME2, test:get-test-file("scoring-options2.xml")),

for $uri in map:keys($lib:TEST-DATA)
let $doc := test:get-test-file(map:get($lib:TEST-DATA, $uri))
return
  xdmp:document-insert(
    $uri,
    $doc,
    xdmp:default-permissions(),
    $const:CONTENT-COLL
  )

,
test:load-test-file("custom-xqy-matching-algo-dob.xqy", xdmp:modules-database(), "/custom-xqy-matching-algo-dob.xqy", $module-permissions)
