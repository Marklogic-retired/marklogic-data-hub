xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace rsrcmodqry = "http://marklogic.com/rest-api/models/resource-model-query"
    at "../models/resource-model-query.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "query";

declare private function local:rsrcmod-callback(
    $request-result as xs:string,
    $plugin-name    as xs:string,
    $response-type  as xs:string?
) as empty-sequence()
{
    switch ($request-result)
    case $rsrcmodqry:RESOURCE_SERVICES_RETRIEVED return (
        xdmp:set-response-code(200,"OK")
        )
    default return
        error((),"RESTAPI-INTERNALERROR",
            concat("unknown result ",$request-result," for ",$plugin-name)),
                xdmp:set-response-content-type(
                    ($response-type, "application/xquery")[1]
                )
};

xdmp:set-transaction-mode("auto") (: reset for next request :),

let $headers     := eput:get-request-headers()
let $method      := eput:get-request-method($headers)
let $params      := map:new()
    =>parameters:query-parameter("name",true(),false())
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
let $extra-names := parameters:validate-parameter-names($params,())
return (
    if (empty($extra-names)) then ()
    else error((),"REST-UNSUPPORTEDPARAM", concat(
        "invalid parameters: ",string-join($extra-names,", ")," for ",map:get($params,"name")
        )),

    lid:enable(map:get($params,"trace")),

    if (rsrcmodqry:check-untraced()) then ()
    else lid:log($rsrcmodqry:trace-id,"item-query-endpoint",
        map:entry("method",$method)=>map:with("headers",$headers)=>map:with("parameters",$params)
        ),

    switch ($method)
    case "GET" return (
        xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),
        rsrcmodqry:get-item($headers,$params,local:rsrcmod-callback#3)
        )
    default return error((),"REST-UNSUPPORTEDMETHOD",$method),

    xdmp:commit()
)
