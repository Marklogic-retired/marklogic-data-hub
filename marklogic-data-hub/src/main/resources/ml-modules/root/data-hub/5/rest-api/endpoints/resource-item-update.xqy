xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace rsrcmodupd = "http://marklogic.com/rest-api/models/resource-model-update"
    at "../models/resource-model-update.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "../lib/extensions-util.xqy";

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
    case $rsrcmodupd:RESOURCE_SERVICES_CREATED return (
        xdmp:set-response-code(204,"Created")
        )
    case $rsrcmodupd:RESOURCE_SERVICES_UPDATED return (
        xdmp:set-response-code(204,"Updated")
        )
    case $rsrcmodupd:RESOURCE_SERVICES_DELETED return (
        xdmp:set-response-code(204,"Deleted")
        )
    default return
        error((),"RESTAPI-INTERNALERROR",
            concat("unknown result ",$request-result," for ",$plugin-name)),

    if (empty($response-type)) then ()
    else xdmp:set-response-content-type($response-type)
};

xdmp:set-transaction-mode("auto") (: reset for next request :),

let $headers     := eput:get-request-headers()
let $method      := xdmp:get-request-method()
let $params      := map:new()
    =>parameters:query-parameter("name",true(),false())
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
let $extra-names := parameters:validate-parameter-names(
    switch ($method)
    case "PUT" return $params
        =>parameters:query-parameter("title",false(),false())
        =>parameters:query-parameter("version",false(),false())
        =>parameters:query-parameter("provider",false(),false())
        =>parameters:query-parameter("description",false(),false())
        =>parameters:query-parameter("method",false(),true(),("delete","get","post","put"),(),fn:lower-case#1)
        =>parameters:query-parameters-passthrough("^delete:")
        =>parameters:query-parameters-passthrough("^get:")
        =>parameters:query-parameters-passthrough("^post:")
        =>parameters:query-parameters-passthrough("^put:")
    case "DELETE" return $params
        =>parameters:query-parameter("check",false(),false(),("exists","none"))
    default return $params,
    ()
    )
let $body        :=
    if (not($method = ("PUT"))) then ()
    else xdmp:get-request-body(
        extut:get-parse-format(
            extut:establish-format($headers,$params,("xquery","javascript"))))
return (
    if (empty($extra-names)) then ()
    else error((),"REST-UNSUPPORTEDPARAM", concat(
        "invalid parameters: ",string-join($extra-names,", ")," for ",map:get($params,"name")
        )),

    lid:enable(map:get($params,"trace")),

    if (rsrcmodupd:check-untraced()) then ()
    else lid:log($rsrcmodupd:trace-id,"item-update-endpoint",
        map:entry("method",$method)=>map:with("headers",$headers)=>map:with("parameters",$params)
        ),

    switch ($method)
    case "PUT" return (
        xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),
        rsrcmodupd:put-item($headers,$params,$body,local:rsrcmod-callback#3)
            [not(xdmp:get-response-code()[1] eq 204)]
        )
    case "DELETE" return (
        xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),
        rsrcmodupd:delete-item($headers,$params,local:rsrcmod-callback#3)
            [not(xdmp:get-response-code()[1] eq 204)]
        )
    default return error((),"REST-UNSUPPORTEDMETHOD",$method),

    xdmp:commit()
    )
