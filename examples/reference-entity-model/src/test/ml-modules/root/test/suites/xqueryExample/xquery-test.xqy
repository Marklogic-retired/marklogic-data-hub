(:
Example of a marklogic-unit-test written in XQuery. Note that for reusing libraries such as
flow-api.sjs, https://docs.marklogic.com/xdmp:javascript-eval can be used.
:)

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

test:assert-equal(fn:true(), fn:true())
