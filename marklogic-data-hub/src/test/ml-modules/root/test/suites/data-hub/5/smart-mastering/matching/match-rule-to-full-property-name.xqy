xquery version "1.0-ml";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace opt-impl = "http://marklogic.com/smart-mastering/options-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/options-impl.xqy";

let $hc-entity-property-path-rule := object-node { "entityPropertyPath": "address" }
let $hc-document-xpath-rule := object-node { "documentXPath": "/envelope/instance/Customer/address" }
let $qs-exact-json-rule := object-node { "propertyName": "address" }
let $qs-reduce-json-rule := object-node { "allMatch": object-node{ "property": array-node {"address.street", "address.city"} } }
return (
  test:assert-equal("address", opt-impl:full-property-name-from-rule($hc-entity-property-path-rule, fn:true())),
  test:assert-equal("/envelope/instance/Customer/address", opt-impl:full-property-name-from-rule($hc-document-xpath-rule, fn:true())),
  test:assert-equal("address", opt-impl:full-property-name-from-rule($qs-exact-json-rule, fn:false())),
  test:assert-equal("address.street, address.city", opt-impl:full-property-name-from-rule($qs-reduce-json-rule, fn:false()))
)
