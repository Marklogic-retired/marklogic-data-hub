xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace searchmodu = "http://marklogic.com/rest-api/models/search-model-update"
    at "../models/search-model-update.xqy";

import module namespace sut = "http://marklogic.com/rest-api/lib/search-util"
    at "../lib/search-util.xqy";
  
import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

let $headers     := eput:get-request-headers()
let $accept      := eput:get-accept-types($headers)
let $method      := eput:get-request-method($headers)
let $env         := eput:response-callback-map(eput:response-type-callback#1)
let $params      := map:new()
    =>parameters:query-parameter("format",false(),false(),("json","xml"))
    =>parameters:query-parameter("collection",false(),false())
    =>parameters:query-parameter("directory",false(),false())
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
let $extra-names := parameters:validate-parameter-names($params,())
return (
    if (empty($extra-names)) then ()
    else error((),"REST-UNSUPPORTEDPARAM", concat(
        "invalid parameters: ",string-join($extra-names,", ")
        )),

    lid:enable(map:get($params,"trace")),

    if (searchmodu:check-untraced()) then ()
    else lid:log(
        $searchmodu:trace-id,"list-update-endpoint",
        map:entry("method",$method)=>map:with("headers",$headers)=>map:with("parameters",$params)
        ),

    if ($method eq "DELETE") then
        let $response := searchmodu:search-delete($headers,$params,$env)
        return (xdmp:set-response-code(204,"Deleted"),$response)
    else error((), "REST-UNSUPPORTEDMETHOD",$method)
    )
