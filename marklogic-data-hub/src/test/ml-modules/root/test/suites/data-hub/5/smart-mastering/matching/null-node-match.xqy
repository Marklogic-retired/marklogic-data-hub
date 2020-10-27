xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace constants = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

let $doc := fn:doc($lib:URI9)
let $actual := matcher:find-document-matches-by-options-name($doc, $lib:MATCH-OPTIONS-NAME, fn:true(), cts:true-query())
return
    (: Testing a bug fix in the case of a crash when a match property was a JSON null-node.
       If $actual exists, it did not crash :)
    test:assert-exists($actual)

