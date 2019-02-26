xquery version "1.0-ml";

(: Copyright 2017-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace urimod = "http://marklogic.com/rest-api/models/uris-model";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace sut = "http://marklogic.com/rest-api/lib/search-util"
    at "../lib/search-util.xqy";

import module namespace search = "http://marklogic.com/appservices/search"
    at "/MarkLogic/appservices/search/search.xqy";

import module namespace ast = "http://marklogic.com/appservices/search-ast" 
    at "/MarkLogic/appservices/search/ast.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $urimod:trace-id := "restapi.documents.search";

declare private variable $is-untraced := ();

declare function urimod:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($urimod:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

(: this endpoint is mostly for use with data movement sdk which will paginate through
 : large result sets to get uris, so 1000 is really not a large default :)
declare private variable $DEFAULT_PAGE_LENGTH := 1000;

declare function urimod:get(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map?
) as xs:string*
{
    eput:response-add-host-cookie($headers, $params, $env),
    eput:to-uri-list(urimod:uris-impl($headers,$params,$env))
};

declare function urimod:post(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map?
) as xs:string*
{
    eput:response-add-host-cookie($headers, $params, $env),
    eput:to-uri-list(urimod:uris-impl($headers, $params, $env))
};

declare private function urimod:uris-impl(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map?
) as xs:string*
{
    let $start      := head((map:get($params,"start"),      1))
    let $pageLength := head((map:get($params,"pageLength"), $DEFAULT_PAGE_LENGTH))
    let $getter     := map:get($env,"body-getter")
    let $input      :=
        if (empty($getter)) then ()
        else $getter(eput:get-content-format($headers,$params))/node()
    let $combined-query := sut:make-combined-query($input)
    let $q := head((map:get($params,"q"),""))
    let $options-parameter := map:get($params,"options")[. ne ""]
    let $param-options :=
        if (empty($options-parameter)) then ()
        else sut:options($params)
    let $combined-options := $combined-query/search:options
    let $options :=
        if (exists($param-options) and exists($combined-options))
        then sut:merge-options($param-options,$combined-options,())
        else if (exists($param-options))
        then $param-options
        else if (exists($combined-options))
        then $combined-options
        else <options xmlns="http://marklogic.com/appservices/search"/>
    let $structuredQuery :=
        if (exists($combined-query))
        then $combined-query/search:query
        else if (exists($input))
        then sut:make-structured-query-node($input)
        else sut:make-structured-query-node(map:get($params,"structuredQuery"))
    let $sq := head((
        sut:make-structured-query($structuredQuery,$q,$options,$params),
        <search:query/>
        ))
    let $ctsQuery := 
        typeswitch($sq) 
        case element(search:query) return 
            ast:cts-query(ast:to-query($sq,$options,true()))
        default return
            cts:query($sq)
    let $forest-ids :=
        for $forest-name in map:get($params, "forest-name")
        return xdmp:forest($forest-name)
    let $isFiltered := head((
        for $search-option in $options//search:search-option
        return
            if ($search-option eq "filtered")
            then true()
            else if ($search-option eq "unfiltered")
            then false()
            else (),
        false()
        ))
    return (
        if ($is-untraced or urimod:check-untraced()) then ()
        else lid:log(
            $urimod:trace-id,"uris-impl",
            map:entry("isFiltered",$isFiltered)
            =>map:with("start",$start)=>map:with("pageLength",$pageLength)
            =>map:with("query",$ctsQuery)=>map:with("forest-ids",$forest-ids)
            ),

        if ($isFiltered) then
            (: options and quality optimized for speed :)
            for $doc in subsequence(
                cts:search(collection(),$ctsQuery,("score-zero"),0,$forest-ids),
                $start,
                $pageLength
                )
            return base-uri($doc)
        else subsequence(
            cts:uris((),("score-zero",concat("limit=", $start + $pageLength - 1)),$ctsQuery,0,$forest-ids),
            $start,
            $pageLength
            )
        )
};
