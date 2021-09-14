xquery version "1.0-ml";

import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging" at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

let $json := merge-impl:build-path-json(
    json:object(),
    (
      map:map() => map:with("path", "/Customer/interactions") => map:with("values", number-node{4}),
      map:map() => map:with("path", "/Customer/active") => map:with("values", boolean-node{fn:true()})
    )
)
return (
  test:assert-equal(xs:QName("xs:integer"),  xdmp:type($json => map:get("Customer") => map:get("interactions")), "Integer type should be preseved on merge"),
  test:assert-equal(xs:QName("xs:boolean"),  xdmp:type($json => map:get("Customer") => map:get("active")), "Boolean type should be preseved on merge")
)