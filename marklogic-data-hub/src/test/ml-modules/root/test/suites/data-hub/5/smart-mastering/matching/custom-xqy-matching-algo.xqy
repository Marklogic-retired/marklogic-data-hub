xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace constants = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

let $doc := fn:doc($lib:URI-DOB1)
let $options := test:get-test-file($lib:MATCH-OPTIONS-CUST-XQY-DOB || ".json")
let $actual := matcher:find-document-matches-by-options($doc, $options, fn:true(), cts:true-query())
return
(
  test:assert-exists($actual, "There should be a result returned"),
  test:assert-equal("1", fn:string($actual/@total), "The match count should be 1"),
  test:assert-equal("/source/5/dob2.json", fn:string($actual/result/@uri), "The matching document should be dob2.json")
)

