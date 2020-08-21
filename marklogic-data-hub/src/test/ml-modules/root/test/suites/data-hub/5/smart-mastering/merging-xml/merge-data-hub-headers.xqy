xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace process = "http://marklogic.com/smart-mastering/process-records"
  at "/com.marklogic.smart-mastering/process-records.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";


(: For now, using the most basic merge options :)
declare variable $merge-options as object-node() := xdmp:unquote('
{
  "options": {
    "targetEntity": "http://example.org/Customer-0.0.1/Customer"
  }
}
')/object-node();

declare variable $merge-uri as xs:string := "/merged-hub-doc.xml";

declare variable $match-summary as object-node() := xdmp:unquote('
{
  "matchSummary": {
    "actionDetails": {
      "'|| $merge-uri ||'": {
        "action": "merge",
        "uris": [
          "/hub-data/hub-doc1.xml",
          "/hub-data/hub-doc2.xml"
        ]
      }
    }
  }
}
')/object-node();

let $results := json:array-values(process:build-content-objects-from-match-summary(
    ("/merged-hub-doc.xml"),
    $match-summary,
    $merge-options,
    fn:false()
))
let $merged-doc :=
  for $result in $results
  let $collections := $result => map:get("context") => map:get("collections")
  where $collections = $const:MERGED-COLL
  return map:get($result, "value")
let $headers := $merged-doc/*:headers
let $sources := $headers/sources
return (
  test:assert-equal(2, fn:count($sources),
      "There should be 2 sources in the headers. Headers: "|| xdmp:describe($headers, (),())),
  test:assert-true($sources/name = "Source1", "Sources should have 'Source1'. Sources: " ||xdmp:describe($sources, (),())),
  test:assert-true($sources/name = "Source2", "Sources should have 'Source2'. Sources: " ||xdmp:describe($sources, (),()))
)