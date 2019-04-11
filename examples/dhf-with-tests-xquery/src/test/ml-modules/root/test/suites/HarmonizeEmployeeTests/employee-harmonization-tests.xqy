xquery version "1.0-ml";

import module namespace cfg = "http://example.com/config" at "/lib/config.xqy";
import module namespace test = "http://marklogic.com/test/unit" at "/test/test-helper.xqy";
import module namespace tcfg = "http://example.com/test-config" at "/lib/test-config.xqy";

declare namespace s="http://marklogic.com/appservices/search";

declare function local:check-snippet(
    $response as element(s:response),
    $index as xs:unsignedLong,
    $expected-number-of-matches as xs:unsignedLong
)
{
    let $matches := $response/s:result[$index]/s:snippet/s:match
    let $number-of-matches := fn:count($matches)
    return test:assert-true($number-of-matches eq $expected-number-of-matches,
                            " unexpected number of snippet matches found " || $number-of-matches
                            || " expected " || $expected-number-of-matches
                            || " response " || xdmp:quote($response))
};



(:~
    Test Description:
:)

xdmp:log("Harmonize Employee Tests BEGINNING.....")
,
(:define all the tests to be run in the following anon function which will be executed in the correct context
at the end:)
let $author-name-tests := function() {

    (:check number of documents in final:)
    (cts:uri-match("/content/*") => fn:count()) ! test:assert-true( . eq 2, " wrong number of final docs found "||.  )
    ,
    (:search through the newly harmonised documents - use partial functions to check snippets and facets:)
    (:..run search, check total documents is 1, check number of snippets matches in the first search result:)
    tcfg:run-search-with-checks("Henckle",1,local:check-snippet(?, 1, 1) )


}
return
    xdmp:invoke-function(
        $author-name-tests,
        <options xmlns="xdmp:eval">
            <database>{xdmp:database($cfg:FINAL-DB)}</database>
        </options>
    )

,
xdmp:log("Harmonize Employee Tests ENDING.....")
