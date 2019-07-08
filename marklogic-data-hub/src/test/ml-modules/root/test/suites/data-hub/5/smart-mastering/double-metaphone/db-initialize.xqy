xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

(:import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";:)
import module namespace test = "http://marklogic.com/roxy/test-helper" at "/test/test-helper.xqy";

declare namespace spell = "http://marklogic.com/xdmp/spell";

declare option xdmp:mapping "false";

(: Verify that the dictionaries were set up correctly. :)

let $actual-first := fn:doc("first-name-dictionary.xml")
let $actual-last := fn:doc("last-name-dictionary.xml")
return (
  test:assert-true(fn:exists($actual-first)),
  test:assert-true(fn:exists($actual-last)),
  test:assert-same-values(("David", "Dave"), $actual-first/spell:dictionary/spell:word/fn:string()),
  test:assert-same-values(("Smith", "Smyth"), $actual-last/spell:dictionary/spell:word/fn:string())
)
