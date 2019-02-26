xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace docmodupd = "http://marklogic.com/rest-api/models/document-model-update"
    at "../models/document-model-update.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

declare private function local:docmod-callback(
    $request-result   as xs:string,
    $uri              as xs:string?,
    $response-format  as xs:string?,
    $response-type    as xs:string?,
    $response-charset as xs:string?,
    $response-version as xs:integer?,
    $response-range   as xs:string?,
    $system-time      as xs:dateTime?
) as empty-sequence()
{
    switch ($request-result)
    case $docmodupd:DOCUMENT_PROTECTED return (
        xdmp:set-response-code(204,"Document Protected")
        )
    default return
        error((),"RESTAPI-INTERNALERROR",concat("unknown result ",$request-result," for ",$uri)),

    if (empty($response-format)) then ()
    else eput:add-response-header("vnd.marklogic.document-format",$response-format),

    if (empty($response-type)) then ()
    else if (exists($response-format) and not($response-format eq "binary"))
    then xdmp:set-response-content-type(concat($response-type,"; charset=utf-8"))
    else if (exists($response-charset))
    then xdmp:set-response-content-type(concat($response-type,"; charset=",$response-charset))
    else xdmp:set-response-content-type($response-type),

    if (empty($response-version)) then ()
    else eput:add-response-header("ETag", concat('"',string($response-version),'"')),

    if (empty($response-range)) then ()
    else error((),"RESTAPI-INTERNALERROR",concat("no update range for ",$uri)),

    if (empty($system-time)) then ()
    else eput:add-response-header("x-marklogic-system-time", string($system-time))
};

let $method      := xdmp:get-request-method()
let $headers     := eput:get-request-headers()
let $params      := map:new()
    =>parameters:query-parameter("uri",true(),true())
    =>parameters:query-parameter("temporal-collection",true(),false())
    =>parameters:query-parameter("level",false(),false(),("noDelete","noWipe","noUpdate"))
    =>parameters:query-parameter("system-time",false(),false(),(),(),xs:dateTime#1)
    =>parameters:query-parameter("duration",false(),false())
    =>parameters:query-parameter("expireTime",false(),false())
    =>parameters:query-parameter("archivePath",false(),false())
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
let $extra-names := parameters:validate-parameter-names($params,())
return (
    lid:enable(map:get($params,"trace")),

    if (docmodupd:check-untraced()) then ()
    else lid:log(
        $docmodupd:trace-id,"document-item-protection-endpoint",
        map:entry("method",$method)=>map:with("headers",$headers)=>map:with("parameters",$params)
        ),

    if (empty($extra-names)) then ()
    else error((),"REST-UNSUPPORTEDPARAM", concat(
        "invalid parameters: ",string-join($extra-names,", ")," for ",string-join(map:get($params,"uri"),", ")
        )),

    if (not(map:contains($params,"duration")) or not(map:contains($params,"expireTime"))) then ()
    else error((),"RESTAPI-INVALIDREQ",
        "The duration and expireTime parameters may not be specified at the same time."
        ),

    switch ($method)
    case "POST" return (
        xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

        docmodupd:post-protection(
            $headers,
            $params,
            map:entry("body-getter", eput:get-request-body#1)=>map:with("responder", local:docmod-callback#8)
            )
        )
    default return
        error((), "REST-UNSUPPORTEDMETHOD",$method)
    )
