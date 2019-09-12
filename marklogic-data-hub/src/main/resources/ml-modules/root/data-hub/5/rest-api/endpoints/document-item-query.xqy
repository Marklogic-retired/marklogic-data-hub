xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace docmodqry = "http://marklogic.com/rest-api/models/document-model-query"
    at "../models/document-model-query.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "/MarkLogic/rest-api/lib/lib/endpoint-util.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "/MarkLogic/rest-api/endpoints/parameters.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

declare private function local:docmod-callback(
    $request-result   as xs:string,
    $uri              as xs:string,
    $response-format  as xs:string?,
    $response-type    as xs:string?,
    $response-charset as xs:string?,
    $response-version as xs:integer?,
    $response-range   as xs:string?
) as empty-sequence()
{
    switch ($request-result)
    case $docmodqry:CONTENT_RETRIEVED return (
        xdmp:set-response-code(200,"OK")
        )
    case $docmodqry:RANGE_RETRIEVED return (
        xdmp:set-response-code(206,"Partial Content")
        )
    case $docmodqry:CONTENT_UNCHANGED return (
        xdmp:set-response-code(304,"Unchanged")
        )
    case $docmodqry:METADATA_RETRIEVED return (
        xdmp:set-response-code(200,"OK")
        )
    default return
        error((),"RESTAPI-INTERNALERROR",concat("unknown result ",$request-result," for ",$uri)),

    if (empty($response-format)) then ()
    else eput:add-response-header("vnd.marklogic.document-format",$response-format),

    if (empty($response-type)) then ()
    else if (exists($response-format) and not($response-format eq "binary") and
        not(starts-with($response-type, "multipart/mixed")))
    then xdmp:set-response-content-type(concat($response-type,"; charset=utf-8"))
    else if (exists($response-charset))
    then xdmp:set-response-content-type(concat($response-type,"; charset=",$response-charset))
    else xdmp:set-response-content-type($response-type),

    if (empty($response-version)) then ()
    else eput:add-response-header("ETag", concat('"',string($response-version),'"')),

    if (empty($response-range)) then ()
    else eput:add-response-header("Content-Range",$response-range),

    let $timestamp := xdmp:request-timestamp()
    return if (exists($timestamp)) then eput:add-response-header("ML-Effective-Timestamp",string($timestamp)) else ()
};

declare function local:length-responder(
    $content-length as xs:int?
) as empty-sequence()
{
    if (empty($content-length)) then ()
    else eput:add-response-header("Content-Length",string($content-length))
};

declare function local:part-type(
    $parts-list as node()*,
    $part-num   as xs:int
) as xs:string?
{
    map:get(xdmp:get-request-part-headers(), "Content-Type")
};

declare function local:part-read(
    $parts-list  as node()*,
    $part-num    as xs:int,
    $part-format as xs:string
) as document-node()?
{
    xdmp:get-request-part-body($part-format)
};

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

let $params  := map:new()
    =>parameters:query-parameter("uri",true(),true())
    =>parameters:query-parameter("category",false(),true(),("content","metadata","collections","permissions","properties","quality","metadata-values"))
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("timestamp",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("format",false(),false(),("binary","json","text","xml"))
    =>parameters:query-parameter("transform",false(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
    =>parameters:query-parameters-passthrough("^trans:")
let $extra-names := parameters:validate-parameter-names($params,())
let $headers := eput:get-request-headers()
let $method  := eput:get-request-method($headers)
return (
    lid:enable(map:get($params,"trace")),

    if (docmodqry:check-untraced()) then ()
    else lid:log(
        $docmodqry:trace-id,"item-query-endpoint",
        map:entry("method",$method)=> map:with("headers",$headers)=> map:with("parameters",$params)
        ),

    if (empty($extra-names)) then ()
    else error((),"REST-UNSUPPORTEDPARAM",
        "invalid parameters: " || string-join($extra-names,", ") || " for " || map:get($params,"uri")
        ),

    switch ($method)
    case "GET" return (
        let $env := map:map()
        return (
            map:put($env,"responder",   local:docmod-callback#7),
            if (empty(map:get($params,"txid"))) then ()
            else map:put($env, "host-cookie-adder", eput:add-host-cookie#1),
            docmodqry:get($headers, $params, $env)
            )
        )
    case "HEAD" return (
        let $env := map:map()
        return (
            map:put($env,"responder",        local:docmod-callback#7),
            map:put($env,"length-responder", local:length-responder#1),
            if (empty(map:get($params,"txid"))) then ()
            else map:put($env, "host-cookie-adder", eput:add-host-cookie#1),
            docmodqry:head($headers, $params, $env)
            )
        )
    default return
        error((), "REST-UNSUPPORTEDMETHOD",$method)
    )
