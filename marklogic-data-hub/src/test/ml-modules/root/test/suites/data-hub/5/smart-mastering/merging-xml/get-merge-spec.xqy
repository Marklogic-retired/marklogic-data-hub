xquery version "1.0-ml";

import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace merge = "http://marklogic.com/smart-mastering/merging";

declare option xdmp:mapping "false";

declare variable $merge-options as element(merge:options) := <options xmlns="http://marklogic.com/smart-mastering/merging">
  <property-defs>
    <!-- leaving off namespace to test no namespace -->
    <property localname="IdentificationID" name="ssn"/>
  </property-defs>
  <merging>
    <!-- Define merging strategies that can be referenced by
          merge specifications below. This can cut down on configuration for repeated patterns   -->
    <merge-strategy name="crm-source-weight" algorithm-ref="standard">
      <source-weights>
        <source name="CRM" weight="10"></source>
      </source-weights>
    </merge-strategy>
    <merge property-name="ssn" strategy="crm-source-weight"></merge>
  </merging>
</options>;

let $property-qn := fn:QName("", "IdentificationID")
let $merge-spec := merge-impl:get-merge-spec($merge-options, $property-qn)
return (
  test:assert-equal('ssn', fn:string($merge-spec/@property-name),"Merge spec property name should be 'ssn'"),
  test:assert-equal('CRM', fn:string($merge-spec/merge:source-weights/merge:source/@name),"Merge spec should have source weight for 'CRM'")
)


