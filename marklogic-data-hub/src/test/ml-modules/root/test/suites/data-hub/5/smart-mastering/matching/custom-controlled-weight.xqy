xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace match-impl = "http://marklogic.com/smart-mastering/matcher-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/matcher-impl.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

(
  test:assert-equal(1, match-impl:score-from-cts-query(document { element test{"exists"} }, cts:word-query("exists")), "The match score should be 1"),
  test:assert-equal(0, match-impl:score-from-cts-query(document { element test{"exists"} }, cts:word-query("doesn't exist")), "The match score should be 0"),
  test:assert-equal(2.5, match-impl:score-from-cts-query(document { element test{"specific score"} }, cts:word-query("specific score", (), 2.5)), "The match score should be 0")
),
(: test that score is used in matching :)
let $doc := fn:doc($lib:URI-DOB1)
let $options := test:get-test-file($lib:MATCH-OPTIONS-CUST-ALG-CUST-WEIGHT || ".json")
let $actual := matcher:find-document-matches-by-options($doc, $options, 1, 10, 0, fn:true(), cts:true-query())
return
  (
    test:assert-exists($actual, "There should be a result returned"),
    test:assert-equal("1", fn:string($actual/@total), "The match count should be 1"),
    test:assert-equal("/source/5/dob2.json", fn:string($actual/result/@uri), "The matching document should be dob2.json")
  )

