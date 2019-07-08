xquery version "1.0-ml";

import module namespace match-impl = "http://marklogic.com/smart-mastering/matcher-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/matcher-impl.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

declare variable $GIVEN-QNAME := xs:QName("given");
declare variable $FAMILY-QNAME := xs:QName("family");
declare variable $NUMBER-QNAME := xs:QName("number");
declare variable $POSTAL-QNAME := xs:QName("postal");
declare variable $STATE-QNAME := xs:QName("state");

(:
 : Each $actual query should have the same element name and text as the corresponding $expected query
 :)
declare function local:verify-group($expected as map:map*, $actual as map:map*)
{
  if (fn:empty($actual)) then ()
  else
  (
    test:assert-equal($expected[1] => map:get("qname"), $actual[1] => map:get("qname")),
    test:assert-equal($expected[1] => map:get("values"), $actual[1] => map:get("values")),

    local:verify-group(fn:subsequence($actual, 2), fn:subsequence($expected, 2))
  )
};

let $given  := map:new((
                map:entry("qname", $GIVEN-QNAME),
                map:entry("values", "LINDSEY"),
                map:entry("weight", 12)
              ))
let $family  := map:new((
                map:entry("qname", $FAMILY-QNAME),
                map:entry("values", "JONES"),
                map:entry("weight", 8)
              ))
let $number  := map:new((
                map:entry("qname", $NUMBER-QNAME),
                map:entry("values", "45"),
                map:entry("weight", 5)
              ))
let $postal  := map:new((
                map:entry("qname", $POSTAL-QNAME),
                map:entry("values", "18505"),
                map:entry("weight", 3)
              ))
let $state  := map:new((
                map:entry("qname", $STATE-QNAME),
                map:entry("values", "PA"),
                map:entry("weight", 1)
              ))
let $remaining-queries := ($given, $family, $number, $postal, $state)
let $threshold := 15
let $actual := match-impl:filter-for-required-queries($remaining-queries, 0, $threshold, ())

let $assertions := (
  (: We should get back four groups of queries :)
  test:assert-equal(4, fn:count($actual)),

  (: Weights for $given + $family = 20 :)
  local:verify-group(($given, $family), $actual[1] => map:get("queries")),

  (: Weights for $given + $number = 17 :)
  local:verify-group(($given, $number), $actual[2] => map:get("queries")),

  (: Weights for $given + $postal = 15 :)
  local:verify-group(($given, $postal), $actual[3] => map:get("queries")),

  (: Weights for $family + $number + $postal = 16 :)
  local:verify-group(($family, $number, $postal), $actual[4] => map:get("queries"))

)

return $assertions
