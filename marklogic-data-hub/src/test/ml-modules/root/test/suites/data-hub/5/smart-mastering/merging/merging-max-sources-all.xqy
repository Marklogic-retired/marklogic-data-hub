xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merging-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/standard.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

declare variable $property-qname := xs:QName("property");
declare variable $all-properties := (
  map:entry("name", $property-qname)
    => map:with("values", text {"property1"})
    => map:with("sources", object-node {"docUri": "doc1.json", "name": "source1"}),
  map:entry("name", $property-qname)
    => map:with("values", text {"property2"})
    => map:with("sources", object-node {"docUri": "doc2.json", "name": "source2"})
);
declare variable $merge-rule-all := object-node {
      (: using documentXPath to avoid the need to load an entity  :)
      "documentXPath":"/property",
      "maxSources": "All"
    };
declare variable $merge-rule-one := object-node {
      (: using documentXPath to avoid the need to load an entity  :)
      "documentXPath":"/property",
      "maxSources": 1
    };

let $merged-properties-all := merging-impl:standard($property-qname, $all-properties, $merge-rule-all)
let $merged-properties-one := merging-impl:standard($property-qname, $all-properties, $merge-rule-one)
return (
  test:assert-equal(2, fn:count($merged-properties-all)),
  test:assert-equal(1, fn:count($merged-properties-one))
)
