xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace constants = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

declare function local:assert-match($match-details, $ruleset-name, $expected-weight) {
  let $match-detail := $match-details/match[rulesetName = $ruleset-name]
  let $weight := fn:number($match-detail/@weight)
  return (
    test:assert-true(fn:exists($match-detail), "Ruleset with name '" || $ruleset-name || "' not found in " || xdmp:describe($match-details, (), ())),
    test:assert-equal($expected-weight, $weight, "Wrong weight for ruleset '" || $ruleset-name || "'.")
  )
};

let $doc := fn:doc($lib:URI2)
let $actual := matcher:find-document-matches-by-options-name($doc, $lib:MATCH-OPTIONS-NAME, fn:true(), cts:true-query())
return (
  let $def-match := $actual/result[@threshold="Definitive Match"]
  let $match-details := $def-match/matches
  return (
    test:assert-same-values(($lib:URI3) ! attribute uri {.}, $def-match/@uri),
    test:assert-equal(1, fn:count($def-match/@threshold[. = "Definitive Match"])),
    test:assert-equal(1, fn:count($def-match/@action[. = $constants:MERGE-ACTION])),
    test:assert-exists($def-match/matches),
    test:assert-equal(8, fn:count($match-details/match), "Expected 8 matches. Got: " || xdmp:describe($def-match, (), ()) ),
    test:assert-equal(76.0, fn:number($def-match/@score), "Unexpected score"),
    local:assert-match($match-details, "ssn - add", 50.0),
    local:assert-match($match-details, "first-name - add", 12.0),
    local:assert-match($match-details, "last-name - add", 8.0),
    local:assert-match($match-details, "addr1 - add", 5.0),
    local:assert-match($match-details, "zip - add", 3.0),
    local:assert-match($match-details, "state - add", 1.0),
    local:assert-match($match-details, "case-amount - add", 1.0),
    local:assert-match($match-details, "last-name, addr1 - reduce", -4.0)
  ),

  let $likely-match := $actual/result[@threshold="Likely Match"]
  return (
    test:assert-same-values(($lib:URI1) ! attribute uri {.}, $likely-match/@uri),
    test:assert-equal(1, fn:count($likely-match/@threshold[. = "Likely Match"])),
    test:assert-equal(1, fn:count($likely-match/@action[. = $constants:NOTIFY-ACTION])),
    test:assert-exists($likely-match/matches),
    test:assert-equal(4, fn:count($likely-match/matches/match), "Expected 4 matches. Got: " || xdmp:describe($likely-match/matches/match, (),()))
  )
)
