xquery version "1.0-ml";

(: Copyright 2011-2018 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace lid = "http://marklogic.com/util/log-id"
at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
at "/MarkLogic/rest-api/endpoints/parameters.xqy";

import module namespace searchmodq = "http://marklogic.com/rest-api/models/search-model-query"
at "../models/search-model-query.xqy";

import module namespace sut = "http://marklogic.com/rest-api/lib/search-util"
at "/MarkLogic/rest-api/lib/search-util.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
at "/MarkLogic/rest-api/lib/endpoint-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

declare function local:response-callback(
  $response-type as xs:string?
) as empty-sequence()
{
  eput:response-type-callback($response-type),

  let $timestamp := xdmp:request-timestamp()
  return if (exists($timestamp)) then eput:add-response-header("ML-Effective-Timestamp",string($timestamp)) else ()

};

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

let $headers   := eput:get-request-headers()
let $accept    := eput:get-accept-types($headers)
let $method    := eput:get-request-method($headers)
let $env       := eput:response-callback-map(local:response-callback#1)
let $params    := map:new()
=>parameters:query-parameter("q",false(),false())
=>parameters:query-parameter("category",false(),true(),("content","metadata","collections","permissions","properties","quality","metadata-values"))
=>parameters:query-parameter("format",false(),false(),("json","xml"))
=>parameters:query-parameter("start",false(),false(),(),(),xs:unsignedLong#1)
=>parameters:query-parameter("pageLength",false(),false(),(),(),xs:unsignedLong#1)
=>parameters:query-parameter("options",false(),false())
=>parameters:query-parameter("collection",false(),true())
=>parameters:query-parameter("directory",false(),false())
=>parameters:query-parameter("view",false(),true(),("none","results","metadata","facets","all"))
=>parameters:query-parameter("txid",false(),false())
=>parameters:query-parameter("database",false(),false())
=>parameters:query-parameter("forest-name",false(),true())
=>parameters:query-parameter("transform",false(),false())
=>parameters:query-parameter("timestamp",false(),false())
=>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
=>parameters:query-parameters-passthrough("^trans:")
let $extra-names := parameters:validate-parameter-names(
  if ($method = ("GET", "HEAD"))
  then parameters:query-parameter($params,"structuredQuery",false(),false())
  else $params,
  ()
)
return (
  if (empty($extra-names)) then ()
  else error((),"REST-UNSUPPORTEDPARAM", concat(
    "invalid parameters: ",string-join($extra-names,", ")
  )),

  lid:enable(map:get($params,"trace")),

  if (searchmodq:check-untraced()) then ()
  else lid:log(
    $searchmodq:trace-id,"list-query-endpoint",
    map:entry("method",$method)=> map:with("headers",$headers)=> map:with("parameters",$params)
  ),

  if (empty($accept)) then ()
  else if ($accept = ("application/json", "text/json", "application/xml", "text/xml")) then
    if (map:contains($params,"category"))
    then error((),"REST-UNSUPPORTEDPARAM",
      "Can use the 'category' parameter only with multipart/mixed accept")
    else
      let $view := map:get($params,"view")
      return
        if (not($view eq "none")) then ()
        else error((),"REST-UNSUPPORTEDPARAM",
          "Can use the 'none' value for the 'view' parameter only with multipart/mixed accept")
  else if (starts-with(head($accept),"multipart/mixed"))
    then map:put($env,"add-header",eput:add-response-header#2)
    else error((), "REST-UNACCEPTABLETYPE", string-join($accept,", ")),

  switch($method)
    case "GET" return
      let $response :=  searchmodq:search-get($headers,$params,$env)
      let $has-matches := map:get($env, "has-matches")
      return
        if (exists($response)) then $response
        else if ($has-matches) then ()
        else xdmp:set-response-code(404,"Not Found")
    case "POST" return
      let $format := eput:get-content-format($headers,$params)
      let $response := (
        if (empty($format) or $format = ("json","xml")) then ()
        else error((), "REST-INVALIDMIMETYPE", concat(
          "content type can only be JSON or XML: ",map:get($headers,"content-type")
        )),
        searchmodq:search-post(
          $headers,$params,$env,xdmp:get-request-body($format)
        )
      )
      let $has-matches := map:get($env, "has-matches")
      return
        if (exists($response)) then $response
        else if ($has-matches) then ()
        else xdmp:set-response-code(404,"Not Found")
    default return error((), "REST-UNSUPPORTEDMETHOD",$method)
)
