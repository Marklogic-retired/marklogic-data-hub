xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace docmodupd = "http://marklogic.com/rest-api/models/document-model-update"
    at "../models/document-model-update.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "/MarkLogic/rest-api/lib/endpoint-util.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "/MarkLogic/rest-api/endpoints/parameters.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

declare private function local:validate-put-params(
    $params  as map:map
) as empty-sequence()
{
    ($params
        =>parameters:query-parameter("uri",true(),false())
        =>parameters:query-parameter("temporal-document",false(),false())
        =>parameters:query-parameter("format",false(),false(),("binary","json","text","xml"))
        =>parameters:query-parameter("transform",false(),false())
        =>parameters:query-parameter("repair",false(),false(),("full","none"))
        =>parameters:query-parameter("extract",false(),false(),("properties","document"))
        =>parameters:query-parameter("collection",false(),true())
        =>parameters:query-parameter("quality",false(),false(),(),(),xs:int#1)
        =>parameters:query-parameter("forest-name",false(),true())
        =>parameters:query-parameters-passthrough("^(perm:|prop:|trans:|value:)")
        )[false()],

    if (count((map:get($params,"extract"),map:get($params,"repair"))) le 1) then ()
    else error((),"RESTAPI-INVALIDREQ",(
            "cannot combine extract and repair parameters",map:get($params,"uri")
            )),

    if (empty(map:get($params,"forest-name"))) then ()
    else
        let $category := map:get($params,"category")
        return
            if (empty($category) or $category = ("content","")) then ()
            else error((),"RESTAPI-INVALIDREQ",(
                "forest-name parameter invalid for metadata",map:get($params,"uri")
                )),

    let $extra-names := parameters:validate-parameter-names($params,())
    return
       if (empty($extra-names)) then ()
       else error((),"REST-UNSUPPORTEDPARAM", "invalid parameters: " || string-join($extra-names,", ") || " for " || map:get($params,"uri") )
};

declare private function local:validate-patch-params(
    $params  as map:map
) as empty-sequence()
{
    ($params
        =>parameters:query-parameter("uri",true(),false())
        =>parameters:query-parameter("temporal-document",false(),false())
        =>parameters:query-parameter("source-document",false(),false())
        =>parameters:query-parameter("format",false(),false(),("json","xml"))
        =>parameters:query-parameter("forest-name",false(),true())
        )[false()],

    if (empty(map:get($params,"forest-name"))) then ()
    else
        let $category := map:get($params,"category")
        return
            if (empty($category) or $category = ("content","")) then ()
            else error((),"RESTAPI-INVALIDREQ",(
                "forest-name parameter invalid for metadata",map:get($params,"uri")
                )),

    let $extra-names := parameters:validate-parameter-names($params,())
    return
       if (empty($extra-names)) then ()
       else error((),"REST-UNSUPPORTEDPARAM", "invalid parameters: " || string-join($extra-names,", ") || " for " || map:get($params,"uri") )
};

declare private function local:validate-server-uri-params(
    $params  as map:map
) as empty-sequence()
{
    ($params
        =>parameters:query-parameter("directory",false(),false())
        =>parameters:query-parameter("temporal-document",false(),false())
        =>parameters:query-parameter("format",false(),false(),("binary","json","text","xml"))
        =>parameters:query-parameter("transform",false(),false())
        =>parameters:query-parameter("repair",false(),false(),("full","none"))
        =>parameters:query-parameter("extract",false(),false(),("properties","document"))
        =>parameters:query-parameter("collection",false(),true())
        =>parameters:query-parameter("quality",false(),false(),(),(),xs:int#1)
        =>parameters:query-parameter("forest-name",false(),true())
        =>parameters:query-parameters-passthrough("^(perm:|prop:|trans:|value:)")
        )[false()],

    if (count((map:get($params,"extract"),
        map:get($params,"repair"))) le 1) then ()
    else error((),"RESTAPI-INVALIDREQ",
        "cannot combine extract and repair parameters"),

    if (empty(map:get($params,"forest-name"))) then ()
    else
        let $category := map:get($params,"category")
        return
            if (empty($category) or $category = ("content","")) then ()
            else error((),"RESTAPI-INVALIDREQ",
                "forest-name parameter invalid for metadata"
                ),

    let $extra-names := parameters:validate-parameter-names($params,())
    return
        if (empty($extra-names)) then ()
        else error((),"REST-UNSUPPORTEDPARAM", "invalid parameters: " || string-join($extra-names,", ") || " for " || map:get($params,"uri") )
};

declare private function local:validate-bulk-write-params(
    $params  as map:map
) as empty-sequence()
{
    ($params
        =>parameters:query-parameter("transform",false(),false())
        =>parameters:query-parameters-passthrough("^trans:")
        )[false()],

    let $extra-names := parameters:validate-parameter-names($params,())
    return
        if (empty($extra-names)) then ()
        else error((),"REST-UNSUPPORTEDPARAM",  concat(
            "invalid parameters: ",string-join($extra-names,", ")," for bulk write with transform"
            ))
};

declare private function local:validate-delete-params(
    $params  as map:map
) as empty-sequence()
{
    ($params
        =>parameters:query-parameter("uri",true(),true())
        =>parameters:query-parameter("result",false(),false())
        =>parameters:query-parameter("check",false(),false(), ("exists","none"))
        )[false()],

    let $extra-names := parameters:validate-parameter-names($params,())
    return
        if (empty($extra-names)) then ()
        else error((),"REST-UNSUPPORTEDPARAM", "invalid parameters: " || string-join($extra-names,", ") || " for " || map:get($params,"uri") )
};

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
    case $docmodupd:DOCUMENT_CREATED return (
        xdmp:set-response-code(201,"Created"),
        eput:add-response-header("Location","/v1/documents?uri="||$uri)
        )
    case $docmodupd:CONTENT_UPDATED return (
        xdmp:set-response-code(204,"Content Updated")
        )
    case $docmodupd:METADATA_UPDATED return (
        xdmp:set-response-code(204,"Metadata Updated")
        )
    case $docmodupd:UNCHANGED_PATCH return (
        xdmp:set-response-code(204,"Unchanged")
        )
    case $docmodupd:DOCUMENT_DELETED return (
        xdmp:set-response-code(204,"Document Deleted")
        )
    case $docmodupd:METADATA_DELETED return (
        xdmp:set-response-code(204,"Metadata Reset")
        )
    case $docmodupd:BULK_CHANGE_WRITTEN return (
        xdmp:set-response-code(200,"Bulk Change Written")
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

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

let $method  := xdmp:get-request-method()
let $headers := eput:get-request-headers()
let $params  := map:new()
    =>parameters:query-parameter("category",false(),true(),("content","metadata","collections","permissions","properties","quality","metadata-values"))
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("temporal-collection",false(),false())
    =>parameters:query-parameter("system-time",false(),false(),(),(),xs:dateTime#1)
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
let $env     := map:map()
return (
    lid:enable(map:get($params,"trace")),

    if (docmodupd:check-untraced()) then ()
    else lid:log(
        $docmodupd:trace-id,"item-update-endpoint",
        map:entry("method",$method)=> map:with("headers",$headers)=> map:with("parameters",$params)
        ),

    switch ($method)
    case "PUT" return (
        map:put($env,"body-getter", eput:get-request-body#1),
        map:put($env,"responder",   local:docmod-callback#8),
        map:put($env,"part-typer",  local:part-type#2),
        map:put($env,"part-reader", local:part-read#3),

        if (empty(map:get($params,"txid"))) then ()
        else map:put($env, "host-cookie-adder", eput:add-host-cookie#1),

        local:validate-put-params($params),

        docmodupd:put($headers,$params,$env)
        )
    case "POST" return (
        map:put($env,"body-getter", eput:get-request-body#1),
        map:put($env,"responder",   local:docmod-callback#8),
        if (empty(map:get($params,"txid"))) then ()
        else map:put($env, "host-cookie-adder", eput:add-host-cookie#1),

        if (upper-case(map:get($headers,"x-http-method-override")) eq "PATCH") then (
            local:validate-patch-params($params),

            docmodupd:patch($headers,$params,$env)
            )
        else (
            ($params
                =>parameters:query-parameter("extension",false(),false())
                )[false()],

            if (map:contains($params,"extension")) then (
                map:put($env,"part-typer",  local:part-type#2),
                map:put($env,"part-reader", local:part-read#3),

                local:validate-server-uri-params($params),

                docmodupd:post($headers,$params,$env)
                )
            else if (starts-with(head(map:get($headers,"content-type")), "multipart/mixed")) then (
                map:put($env,"header-getter", xdmp:get-request-part-headers#0),
                map:put($env,"body-getter",   xdmp:get-request-part-body#1),

                local:validate-bulk-write-params($params),

                docmodupd:post-bulk-documents($headers, $params, $env)
                )
            else error((),"RESTAPI-INVALIDREQ",
                "POST not determinable as PATCH, bulk or server-assigned document URI request")
            )
        )
    case "PATCH" return (
        map:put($env,"body-getter", eput:get-request-body#1),
        map:put($env,"responder",   local:docmod-callback#8),

        if (empty(map:get($params,"txid"))) then ()
        else map:put($env, "host-cookie-adder", eput:add-host-cookie#1),

        (: fake the header to provide the code path with a method-independent environment :)
        map:put($headers,"x-http-method-override","PATCH"),

        local:validate-patch-params($params),

        docmodupd:patch($headers,$params,$env)
        )
    case "DELETE" return (
        map:put($env, "responder", local:docmod-callback#8),

        if (empty(map:get($params,"txid"))) then ()
        else map:put($env, "host-cookie-adder", eput:add-host-cookie#1),

        local:validate-delete-params($params),

        docmodupd:delete($headers,$params,$env)
        )
    default return error((), "REST-UNSUPPORTEDMETHOD",$method)
    )
