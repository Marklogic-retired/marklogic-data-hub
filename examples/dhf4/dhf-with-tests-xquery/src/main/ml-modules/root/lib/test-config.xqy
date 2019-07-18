xquery version "1.0-ml";

module namespace tcfg = "http://example.com/test-config";

import module namespace cfg = "http://example.com/config" at "/lib/config.xqy";
import module namespace test = "http://marklogic.com/test/unit" at "/test/test-helper.xqy";

declare namespace http="xdmp:http";
declare namespace quote="xdmp:quote";
declare namespace es = "http://marklogic.com/entity-services";
declare namespace s = "http://marklogic.com/appservices/search";
declare namespace di="xdmp:document-insert";

declare variable $TEST-HOST as xs:string := "%%mlHost%%";
declare variable $TEST-STAGING-PORT as xs:string := "%%mlTestPort%%";
declare variable $TEST-FINAL-PORT  := xs:string("%%mlFinalPort%%");

declare variable $UNIT-TEST-COLLECTION as xs:string := "UNITTEST";
declare variable $UNIT-TEST-COLLECTION-QUERY as cts:query := cts:collection-query(($UNIT-TEST-COLLECTION));


declare variable $ADDRESS-URL as xs:string := "http://" || $TEST-HOST || ":" || $TEST-FINAL-PORT;
declare variable $EXT-ROOT-DOC-URL as xs:string := $ADDRESS-URL || "/v1/documents";

declare variable $DEFAULT-SEARCH-OPTIONS-NAME as xs:string := "final-entity-options";

declare variable $EXT-ROOT-SCH-URL as xs:string := $ADDRESS-URL || "/v1/search";
declare variable $BASE-URL-SEARCH-GET as xs:string := $EXT-ROOT-SCH-URL || "?start=1&amp;pageLength=10&amp;options=asset-1.0.0-options&amp;transform=enrich-search-results";

declare variable $HTTP-GET as function(item(), item()) as item()+ := xdmp:http-get#2;
declare variable $HTTP-PUT as function(item(), item()) as item()+ := xdmp:http-put#2;
declare variable $HTTP-POST as function(item(), item()) as item()+ := xdmp:http-post#2;

declare variable $HTTP-OK as xs:string := "200";
declare variable $HTTP-CREATED as xs:string := "201";
declare variable $HTTP-UPDATED as xs:string := "204";
declare variable $HTTP-BAD-REQUEST as xs:string := "400";
declare variable $HTTP-INTERNAL-ERROR as xs:string := "500";

declare variable $ACCEPTABLE-MEDIA-TYPE as xs:string := "application/xml";

declare variable $OUTPUT-OPTIONS := <options xmlns="xdmp:quote">
    <indent-untyped>yes</indent-untyped>
    <omit-xml-declaration>yes</omit-xml-declaration>
</options>;


declare function tcfg:exec-http(
        $http-func as function(item(), item()) as item()+,
        $options as element(http:options),
        $url as xs:string
)
{
    let $response := $http-func($url,$options)
    let $_ := xdmp:log(" http url " ||$url )
    let $_ := xdmp:log(" http response[1] " ||xdmp:quote($response[1],  $OUTPUT-OPTIONS ) )
    let $_ := xdmp:log(" http response[2] " ||xdmp:quote($response[2], $OUTPUT-OPTIONS ) )
    return $response
};

declare function tcfg:run-http($http-func as function(item(), item()) as item()+,
        $endpoint as xs:string,
        $options as element(http:options)
) as element(tuple)
{
    let $response := tcfg:exec-http($http-func,
            $options,
            $endpoint)
    return element tuple {
        element code { $response[1]/http:code/fn:string(.) },
        element response { $response[2]}
    }
};

declare function tcfg:get-GET-http-options(
    $accept-type as xs:string?
) as element(http:options)
{
    let $accept-type := fn:head(($accept-type, $ACCEPTABLE-MEDIA-TYPE))
    return
    <options xmlns="xdmp:http">
        <authentication method="digest">
            <username>{$cfg:DATAHUB-USER}</username>
            <password>{$cfg:DATAHUB-USER-PWD}</password>
        </authentication>
        <headers>
            <Accept>{$accept-type}</Accept>
            <x-error-accept>{$cfg:APPLICATION-XML}</x-error-accept>
            <Content-Type>{$accept-type}</Content-Type>
        </headers>
    </options>

};

declare function tcfg:set-PUT-http-options(
        $payload as element(payload)
) as element(http:options)
{
    tcfg:set-PUT-http-options-internal(xdmp:quote($payload/*), "XML")

};

declare function tcfg:set-PUT-http-options-with-json(
        $payload as xs:string
) as element(http:options)
{
    tcfg:set-PUT-http-options-internal($payload, "JSON")
};

declare private function tcfg:set-PUT-http-options-internal(
        $payload as xs:string,
        $format as xs:string
) as element(http:options)
{
    <options xmlns="xdmp:http">
        <authentication method="digest">
            <username>{$cfg:DATAHUB-USER}</username>
            <password>{$cfg:DATAHUB-USER-PWD}</password>
        </authentication>
        <headers>
            <Accept>{$ACCEPTABLE-MEDIA-TYPE}</Accept>
            <Content-Type>{if ($format eq "JSON") then $cfg:APPLICATION-JSON else $ACCEPTABLE-MEDIA-TYPE}</Content-Type>
        </headers>
        <data>{$payload}</data>
    </options>

};


declare function make-asset-search-url(
        $q as xs:string
) as xs:string
{
    make-asset-search-url($q, (), (), ())
};

declare function make-asset-search-url(
        $q as xs:string,
        $options as xs:string?,
        $start as xs:anyAtomicType?,
        $page-length as xs:anyAtomicType?
) as xs:string
{
    fn:concat($EXT-ROOT-SCH-URL,"?q=",xdmp:url-encode($q),
            "&amp;view=all",
            if ($options) then "&amp;options="  || $options else "&amp;options=" || $DEFAULT-SEARCH-OPTIONS-NAME,
            if ($start) then "&amp;start=" || $start else "&amp;start=1",
            if ($page-length) then "&amp;pageLength=" || $page-length else "&amp;pageLength=10"
    )

};

declare function run-test( $endpoint as xs:string ) {
    let $response := tcfg:exec-http($tcfg:HTTP-GET, tcfg:get-GET-http-options(()),$endpoint)
    return element tuple {
        element code { $response[1]/http:code/fn:string(.) },
        element response { $response[2]}
    }
};


declare function run-search-with-checks(
        $qtxt as xs:string,
        $expected-total as xs:unsignedLong,
        $check-snippets as function(element(s:response) ) as item()* *
)
{
    let $tuple := run-test( tcfg:make-asset-search-url( $qtxt ,() ,(),() )  )
    let $code := $tuple/code
    let $response := $tuple/response/s:response
    return (
        test:assert-true( $code eq 200, " unexpected http code "|| $code || " qtxt: " || $qtxt ),
        let $t := $response/@total
        return  test:assert-true( $t/fn:data() eq $expected-total, " unexpected search total  "|| $t || " expected " || $expected-total || " qtxt: " || $qtxt)
        ,
        if (fn:empty($check-snippets)) then () else for $f in $check-snippets return $f($response)

    )

};



declare function get-staging-insert-doc-options(
    $entity-name as xs:string
) as element(di:options)
{
    <options xmlns="xdmp:document-insert">
        <permissions>{$cfg:DATAHUB-DEFAULT-PERMISSIONS}</permissions>
        <collections>{  ($UNIT-TEST-COLLECTION, $entity-name)  ! element collection {.}}</collections>
    </options>
};
