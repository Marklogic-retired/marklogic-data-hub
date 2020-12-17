xquery version "1.0-ml";

import module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms" at "/com.marklogic.smart-mastering/algorithms/thesaurus.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace match = "http://marklogic.com/smart-mastering/matcher";

(:
Note that if a weight attribute is included, then the child query returned below will be an or-query on two
cts:json-property-value-query's, as the second one will have the weight defined by the attribute.
:)
let $expand-xml :=
  <match:expand property-name="FirstName">
    <match:thesaurus>/test/thesaurus/nicknames.xml</match:thesaurus>
  </match:expand>

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
    cts:json-property-scope-query("Person", cts:json-property-value-query("FirstName", "robert")),
    $entries, $expand-xml
  )

  let $child-query := cts:json-property-scope-query-query($query)

  return (
    test:assert-true($child-query instance of cts:json-property-value-query),

    let $values := cts:json-property-value-query-value($child-query)
    return (
      test:assert-equal(3, fn:count($values),
        "Because thsr:expand does not work properly yet on a json-property-value-query, the expand-query function is " ||
        "expected to grab the child query and run it through thsr:expand instead. This should result in the original value " ||
        "and the two synonyms being included in the child query"
      ),
      test:assert-equal("robert", $values[1]),
      test:assert-equal("bob", $values[2]),
      test:assert-equal("robbie", $values[3])
    )
  ),

  (: thsr:expand works properly already on cts:element-query, but including this test just to be certain :)
  let $query := algorithms:expand-query(
    cts:element-query(xs:QName("Person"), cts:element-value-query(xs:QName("FirstName"), "robert")),
    $entries, $expand-xml
  )

  let $child-query := cts:element-query-query($query)

  return (
    test:assert-true($child-query instance of cts:element-value-query),

    let $values := cts:element-value-query-text($child-query)
    return (
      test:assert-equal(3, fn:count($values), "Expecting 3 values"),
      test:assert-equal("robert", $values[1]),
      test:assert-equal("bob", $values[2]),
      test:assert-equal("robbie", $values[3])
    )
  )
)
