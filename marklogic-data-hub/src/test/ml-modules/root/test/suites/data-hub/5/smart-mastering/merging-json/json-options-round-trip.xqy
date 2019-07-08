xquery version "1.0-ml";

(:
 : Merge options are stored in the database as XML, but may be uploaded or
 : downloaded by a client as JSON. Make sure the round-trip transformations
 : are done correctly.
 :)

import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare variable $options := test:get-test-file("merge-options.json")/object-node();
declare variable $strategy-options := test:get-test-file("merge-options-with-strategies.json")/object-node();

(: Save JSON options, which will get them written as XML :)
merging:save-options("json-options", $options),


(: Save JSON options, which will get them written as XML :)
merging:save-options("json-options-with-strategy", $strategy-options)

;

xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace test = "http://marklogic.com/roxy/test-helper" at "/test/test-helper.xqy";

declare variable $options := test:get-test-file("merge-options.json")/node();
declare variable $strategy-options := test:get-test-file("merge-options-with-strategies.json")/node();

(: Retrieve options, requesting JSON format, so they will be converted back to
 : JSON.
 :)
let $actual := merging:get-options("json-options", $const:FORMAT-JSON)
return test:assert-true(fn:deep-equal($options, $actual)),

let $expected := test:get-test-file("merge-options.json")/node()
let $actual := merging:get-options($lib:OPTIONS-NAME-COMPLETE, $const:FORMAT-JSON)
return test:assert-true(fn:deep-equal($options, $actual)),

(: For some reason, the below test needed to convert the JSON to string to determine
 : that they are equal. See https://github.com/marklogic-community/marklogic-unit-test/issues/44
 :)
let $expected := test:get-test-file("merge-options-with-strategies.json")/node()
let $actual := merging:get-options($lib:OPTIONS-NAME-STRATEGIES, $const:FORMAT-JSON)
return test:assert-equal(xdmp:to-json-string($expected), xdmp:to-json-string($actual)),

xdmp:document-delete('/com.marklogic.smart-mastering/options/merging/json-options.xml'),
xdmp:document-delete('/com.marklogic.smart-mastering/options/merging/json-options-with-strategy.xml')
