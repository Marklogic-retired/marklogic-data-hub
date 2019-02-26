xquery version "1.0-ml";

(: Copyright 2017-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace urimod = "http://marklogic.com/rest-api/models/uris-model"
    at "../models/internal-uris-model.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "../lib/db-util.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:transaction-mode "auto";

declare function local:send-response($response) {
    let $timestamp := xdmp:request-timestamp()
    return
        if (empty($timestamp)) then ()
        else eput:add-response-header("ML-Effective-Timestamp",string($timestamp)),

    if (empty($response) or "" = $response)
    then xdmp:set-response-code(404,"Not Found")
    else xdmp:set-response-content-type("text/uri-list"),

    $response
};

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

let $headers     := eput:get-request-headers()
let $method      := eput:get-request-method($headers)
let $params      := map:new()
    =>parameters:query-parameter("q",false(),false())
    =>parameters:query-parameter("collection",false(),true())
    =>parameters:query-parameter("directory",false(),false())
    =>parameters:query-parameter("qbe",false(),false())
    =>parameters:query-parameter("options",false(),false())
    =>parameters:query-parameter("start",false(),false(),(),(),xs:unsignedLong#1)
    =>parameters:query-parameter("pageLength",false(),false(),(),(),xs:unsignedLong#1)
    =>parameters:query-parameter("timestamp",false(),false())
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("forest-name",false(),true())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
let $type        := dbut:tokenize-header(map:get($headers, "content-type"))
let $extra-names := parameters:validate-parameter-names(
    if ($method = ("GET", "HEAD"))
        then parameters:query-parameter($params,"structuredQuery",false(),false())
        else $params,
    ()
    )
return (
    lid:enable(map:get($params,"trace")),

    if (urimod:check-untraced()) then ()
    else lid:log(
        $urimod:trace-id,"internal-uris-endpoint",
        map:entry("method",$method)=>map:with("headers",$headers)=>map:with("parameters",$params)
        ),

    if (empty($extra-names)) then ()
    else error((),"REST-UNSUPPORTEDPARAM", concat("invalid parameters: ",string-join($extra-names,", "))),

    switch($method)
    case "GET"  return local:send-response(
        urimod:get($headers,$params,map:map())
        )
    case "POST" return
        if (not($type = ("application/xml", "application/json", "text/xml", "text/json")))
        then error((), "RESTAPI-INVALIDCONTENT", 'Unsuported content-type: "' || $type || '"')
        else local:send-response(
            urimod:post($headers,$params,map:entry("body-getter",eput:get-request-body#1))
            )
    default return error((),"REST-UNSUPPORTEDMETHOD",$method)
    )
