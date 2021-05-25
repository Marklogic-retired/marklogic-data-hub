xquery version "1.0-ml";

import module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms" at "/com.marklogic.smart-mastering/algorithms/thesaurus.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

(:
Note that if a range index is available the
:)

let $match-step := xdmp:unquote('{
  "targetEntityType": "http://example.org/MasteringTestEntity-0.0.1/MasteringTestEntity",
  "matchRulesets": [{
    "matchRules": [{
      "entityPropertyPath": "name",
      "matchType": "synonym",
      "options": {
        "thesaurusURI": "/test/thesaurus/nicknames.xml"
      }
    }]
  }]
}')/object-node()

let $match-rule := $match-step/matchRulesets/matchRules
let $entries :=
  <entry  xmlns="http://marklogic.com/xdmp/thesaurus">
    <term>robert</term>
    <synonym>
      <term>bob</term>
    </synonym>
    <synonym>
      <term>robbie</term>
    </synonym>
  </entry>

return (
  let $query := algorithms:expand-query(
    $entries,
    $match-rule,
    $match-step
  )
  return (
    test:assert-true($query instance of cts:range-query, "The range query index should be to lookup values"),
    let $values := cts:range-query-value($query)
    return (
      test:assert-equal(3, fn:count($values), "The entry term plus the 2 synonym entries from the thesaurus entry should be used for the query values"),
      test:assert-equal("Robert", $values[1]),
      test:assert-equal("Bob", $values[2]),
      test:assert-equal("Robbie", $values[3])
    )
  )
)
