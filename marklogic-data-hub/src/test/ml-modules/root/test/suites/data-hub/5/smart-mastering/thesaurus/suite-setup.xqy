xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher" at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

matcher:save-options("match-options", test:get-test-file("match-options.json")/node())
