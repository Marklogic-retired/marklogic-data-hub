xquery version "1.0-ml";

(:
 : Verify that merge option names are returned correctly.
 :)

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "/test/suites/data-hub/5/smart-mastering/merging-json/lib/lib.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging" at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants" at "/com.marklogic.smart-mastering/constants.xqy";


let $actual := merging:get-option-names($const:FORMAT-JSON)

return (
  test:assert-same-values(
    ($lib:OPTIONS-NAME, $lib:OPTIONS-NAME-STRATEGIES, $lib:OPTIONS-NAME-COMPLETE, $lib:OPTIONS-NAME-CUST-XQY,
     $lib:OPTIONS-NAME-CUST-SJS, $lib:OPTIONS-NAME-PATH, $lib:NESTED-OPTIONS
    ),
    $actual/node()/fn:string()
  )
)
