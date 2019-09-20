xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "/MarkLogic/rest-api/endpoints/parameters.xqy";

import module namespace rsrcmodcom = "http://marklogic.com/rest-api/models/resource-model-common"
    at "/MarkLogic/rest-api/models/resource-model-common.xqy";

import module namespace rsrcmodupd = "http://marklogic.com/rest-api/models/resource-model-update"
    at "../models/resource-model-update.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "/MarkLogic/rest-api/lib/endpoint-util.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

declare private function local:rsrcmod-callback(
    $request-result   as xs:string,
    $plugin-name      as xs:string,
    $has-content      as xs:boolean,
    $response-type    as xs:string?,
    $response-status  as xs:anyAtomicType*,
    $response-headers as item()*
) as empty-sequence()
{
    if ($request-result = ($rsrcmodupd:RESOURCE_WRITTEN, $rsrcmodupd:RESOURCE_DELETED))
    then ()
    else error((),"RESTAPI-INTERNALERROR",
        concat("unknown result ",$request-result," for ",$plugin-name)),

    rsrcmodcom:environment(
        $plugin-name,$has-content,$response-type,$response-status,$response-headers
    )
};

let $method      := xdmp:get-request-method()
let $headers     := eput:get-request-headers()
let $body        :=
    if (not($method = ("PUT"))) then ()
    else xdmp:get-request-body()
let $params      := map:new()
    =>parameters:query-parameter("name",true(),false())
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
    =>parameters:query-parameters-passthrough("^rs:")
let $extra-names := parameters:validate-parameter-names($params,())
return (
    if (empty($extra-names)) then ()
    else error((),"REST-UNSUPPORTEDPARAM", concat(
        "invalid parameters: ",string-join($extra-names,", ")," for ",map:get($params,"name")
        )),

    lid:enable(map:get($params,"trace")),

    if (rsrcmodupd:check-untraced()) then ()
    else lid:log($rsrcmodupd:trace-id,"service-update-endpoint",
        map:entry("method",$method)=>map:with("headers",$headers)=>map:with("parameters",$params)
        ),

    switch ($method)
    case "PUT" return (
        xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
        rsrcmodupd:exec-put($headers,$params,$body,local:rsrcmod-callback#6)
            [not(xdmp:get-response-code()[1] eq 204)]
        )
    case "DELETE" return (
        xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
        rsrcmodupd:exec-delete($headers,$params,local:rsrcmod-callback#6)
            [not(xdmp:get-response-code()[1] eq 204)]
        )
    default return (
        error((),"RESTAPI-INVALIDREQ",
            concat("unsupported method ",$method," for ",map:get($params,"name"))
            )
        )
    )
