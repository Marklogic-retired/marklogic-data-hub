xquery version "1.0-ml";

(:
 : Verify that match option names are returned correctly.
 :)

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "/test/suites/data-hub/5/smart-mastering/matching/lib/lib.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher" at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants" at "/com.marklogic.smart-mastering/constants.xqy";


let $actual := matcher:get-option-names($const:FORMAT-JSON)

return (
  test:assert-same-values(
    ($lib:MATCH-OPTIONS-NAME, $lib:SCORE-OPTIONS-NAME, $lib:SCORE-OPTIONS-NAME2, $lib:NAMESPACED-MATCH-OPTIONS-NAME),
    $actual/node()/fn:string()
  )
)

