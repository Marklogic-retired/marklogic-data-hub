xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace constants = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace tel = "http://marklogic.com/smart-mastering/telemetry"
  at "/com.marklogic.smart-mastering/telemetry.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

let $telemetry-count := tel:get-usage-count()
let $doc := fn:doc($lib:URI2)
let $actual := matcher:find-document-matches-by-options-name($doc, $lib:MATCH-OPTIONS-NAME)
return (
  let $def-match := $actual/result[@threshold="Definitive Match"]
  return (
    test:assert-same-values(($lib:URI3) ! attribute uri {.}, $def-match/@uri),
    test:assert-equal(1, fn:count($def-match/@threshold[. = "Definitive Match"])),
    test:assert-equal(1, fn:count($def-match/@action[. = $constants:MERGE-ACTION])),
    test:assert-not-exists($def-match/matches),
    test:assert-equal($telemetry-count + 1, tel:get-usage-count())
  ),

  let $likely-match := $actual/result[@threshold="Likely Match"]
  return (
    test:assert-same-values(($lib:URI1) ! attribute uri {.}, $likely-match/@uri),
    test:assert-equal(1, fn:count($likely-match/@threshold[. = "Likely Match"])),
    test:assert-equal(1, fn:count($likely-match/@action[. = $constants:NOTIFY-ACTION])),
    test:assert-not-exists($likely-match/matches)
  )
)
