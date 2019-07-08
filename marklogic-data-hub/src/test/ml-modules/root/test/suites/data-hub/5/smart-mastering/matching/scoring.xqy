xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

let $doc := fn:doc($lib:URI2)
let $options := matcher:get-options($lib:SCORE-OPTIONS-NAME, $const:FORMAT-XML)
let $max-score := fn:sum($options//*:add/@weight)
let $actual := matcher:find-document-matches-by-options-name($doc, $lib:SCORE-OPTIONS-NAME)
let $score := $actual//result[@uri="/source/3/doc3.xml"]/@score/xs:int(.)
return (
  test:assert-equal($max-score, $score)
),

let $doc := fn:doc($lib:URI2)
let $options := matcher:get-options($lib:SCORE-OPTIONS-NAME2, $const:FORMAT-XML)
let $max-score := fn:sum($options//*:add/@weight)
let $actual := matcher:find-document-matches-by-options-name($doc, $lib:SCORE-OPTIONS-NAME2)
let $score := $actual//result[@uri="/source/3/doc3.xml"]/@score/xs:int(.)
return (
  test:assert-equal($max-score, $score)
)
