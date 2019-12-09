xquery version "1.0-ml";

import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";
declare option xdmp:transaction-mode "update";

merge-impl:lock-for-update("/uri1"),
merge-impl:lock-for-update("/uri2"),
merge-impl:lock-for-update("/uri3"),
merge-impl:lock-for-update("/uri4"),

test:assert-true(merge-impl:all-merged(("/uri1"))),
test:assert-true(merge-impl:all-merged(("/uri1", "/uri2"))),
test:assert-false(merge-impl:all-merged(("/uri1", "nope"))),
test:assert-false(merge-impl:all-merged(("nope")))

