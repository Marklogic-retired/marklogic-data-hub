xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace docmodqryget = "http://marklogic.com/rest-api/models/document-model-query-get"
    at "../models/document-model-query-get.xqy";
    
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

let $headers     := eput:get-request-headers()
let $params      := map:new()
    =>parameters:query-parameter("category",false(),true(),(
        "content","metadata","collections","permissions","properties","quality","metadata-values"
        ))
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("timestamp",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("uri",true(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
    =>parameters:query-parameters-passthrough("^trans:")
let $extra-names := parameters:validate-parameter-names($params,())
return (
    lid:enable(map:get($params,"trace")),

    if (docmodqryget:check-untraced()) then ()
    else lid:log($docmodqryget:trace-id,"item-query-get-endpoint",
        map:entry("headers",$headers)=>map:with("parameters",$params)
        ),

    if (exists($extra-names))
    then error((),"REST-UNSUPPORTEDPARAM", concat(
        "invalid parameters: ",string-join($extra-names,", ")," for ",map:get($params,"uri")
        ))
    else docmodqryget:get($headers,$params)
    )
