xquery version "1.0-ml";

(: Copyright 2012-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace rsrcmodcom = "http://marklogic.com/rest-api/models/resource-model-common";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "../lib/extensions-util.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "../lib/db-util.xqy";

declare namespace http  = "xdmp:http";
declare namespace multi = "xdmp:multipart";
declare namespace rapi  = "http://marklogic.com/rest-api";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $rsrcmodcom:resource-base-ns := "http://marklogic.com/rest-api/resource/";

declare function rsrcmodcom:make-context(
    $headers as map:map,
    $params  as map:map
) as map:map
{
    let $input-type             := map:get($headers,"content-type")
    let $accept-types           := map:get($headers,"accept")
    let $tokenized-input-type   := dbut:tokenize-header($input-type)
    let $tokenized-accept-types := dbut:tokenize-header($accept-types)
    let $first-accept-type      := head($accept-types)
    let $context                := map:map()
    return (
        if (empty($input-type)) then ()
        else if (not(matches($input-type,"^multipart/mixed;\s*boundary=")))
        then map:put($context, "input-types", $tokenized-input-type)
        else map:put($context, "input-boundary", replace(
            substring-after($input-type,"boundary="),
            '^\s*"([^"]+)"\s*$', "$1")),
        if (empty($accept-types)) then ()
        else if (not(matches($first-accept-type,"^multipart/mixed;\s*boundary=")))
        then map:put($context, "accept-types", $tokenized-accept-types)
        else (
            map:put($context, "output-boundary", replace(
                substring-after($first-accept-type,"boundary="),
                '^\s*"([^"]+)"\s*$', "$1")),
            map:put($context, "accept-types", $tokenized-accept-types)
            ),

        $context
        )
};

declare function rsrcmodcom:make-resource-params(
    $headers         as map:map,
    $endpoint-params as map:map
) as map:map
{
    let $resource-params := map:map()
    return (
        for $key in map:keys($endpoint-params)
        return
            if (not(starts-with($key,"rs:"))) then ()
            else map:put(
                $resource-params,
                substring-after($key,"rs:"),
                map:get($endpoint-params,$key)
                ),
        $resource-params
        )
};

declare function rsrcmodcom:collect-documents(
    $resource-name as xs:string,
    $method        as xs:string,
    $context       as map:map,
    $results       as item()*
) as document-node()?
{
    let $result-count := count($results)
    let $output-types := map:get($context,"output-types")
    let $output-types := 
        let $types := map:get($context,"output-types")
        return
            if (exists($types) or empty($results))
            then $types
            else
                for $result in $results
                return
                    if (xdmp:to-json($result)/object-node() or xdmp:to-json($result)/array-node())
                    then "application/json"
                    else if (exists($result/element()))
                    then "application/xml"
                    else if (exists($result/text()))
                    then "text/plain"
                    else "application/x-unknown-content-type"
    let $output-count := count($output-types)
    let $boundary     :=
        let $declared-boundary := map:get($context,"output-boundary")
        return
            if ($declared-boundary)
            then $declared-boundary
            else if ($result-count lt 2) then ()
            else concat($resource-name,"-get-result")
    return (
        if ($result-count = $output-count) then ()
        else error((),"RESTAPI-INVALIDRESULT",concat(
            $method," extension produced ",$result-count," results and ",$output-count,
                " mime types: ",$resource-name
            )),

        if (empty($boundary))
        then $results
        else (
            if (empty($boundary))
            then $output-types
            else map:put(
                $context,"output-types",concat("multipart/mixed; boundary=",$boundary)
                ),

            document {
                xdmp:multipart-encode(
                    $boundary,
                    <multi:manifest>{
                        for $output-type in $output-types
                        return
                            <multi:part>
                                <http:headers>
                                    <http:Content-Type>{$output-type}</http:Content-Type>
                                </http:headers>
                            </multi:part>
                    }</multi:manifest>,
                    $results
                    )
                }
            )
        )
};

declare function rsrcmodcom:get-service-defs(
) as map:map
{
    map:entry( "get",    ("document-node()*", "map:map", "map:map"))
    =>map:with("put",    ("document-node()?", "map:map", "map:map", "document-node()*"))
    =>map:with("post",   ("document-node()*", "map:map", "map:map", "document-node()*"))
    =>map:with("delete", ("document-node()?", "map:map", "map:map"))
};

declare function rsrcmodcom:extract-documents(
    $context as map:map,
    $input   as document-node()?
) as document-node()*
{
    let $boundary := map:get($context,"input-boundary")
    let $parts    :=
        if (empty($boundary)) then ()
        else xdmp:multipart-decode($boundary,$input/node())
    let $input-types :=
        if (empty($parts)) then ()
        else subsequence($parts,1,1)/part/headers/Content-Type/(
            dbut:tokenize-header(string(.))[1]
            )
    return (
        if (empty($input-types)) then ()
        else map:put($context,"input-types",$input-types),

        if (empty($parts))
        then $input
        else subsequence($parts,2)
        )
};

declare function rsrcmodcom:environment(
    $plugin-name      as xs:string,
    $has-content      as xs:boolean,
    $response-type    as xs:string?,
    $response-status  as xs:anyAtomicType*,
    $response-headers as item()*
) as empty-sequence()
{
    if (empty($response-type)) then ()
    else xdmp:set-response-content-type($response-type),

    if (count($response-status) eq 2)
    then xdmp:set-response-code(xs:int(head($response-status)), string(tail($response-status)))
    else if (exists($response-status))
    then error((), "RESTAPI-INVALIDREQ", concat(
        "invalid output status for ",$plugin-name,": ",
        string-join($response-status!string(.),", ")
        ))
    else if ($has-content)
    then xdmp:set-response-code(200,"OK")
    else xdmp:set-response-code(204,"No Content"),

    if (empty($response-headers)) then ()
    else
        let $header-count := count($response-headers)
        return
            if (($header-count mod 2) eq 0) then
                for $i in 1 to ($header-count idiv 2)
                let $pos := $i * 2
                return eput:add-response-header(
                    string(subsequence($response-headers, $pos - 1, 1)),
                    string(subsequence($response-headers, $pos,     1))
                    )
            else if ($header-count eq 1 and $response-headers instance of map:map) then
                for $key in map:keys($response-headers)
                let $value := map:get($response-headers,$key)
                return
                    if (count($value) eq 1)
                    then eput:add-response-header($key, string($value))
                    else error((), "RESTAPI-INVALIDREQ", concat(
                        "invalid output header for ",$plugin-name,": ",$key,
                        " key has ",string-join($value!string(.),", ")," values"
                        ))
            else error((), "RESTAPI-INVALIDREQ", concat(
                "invalid output headers for ",$plugin-name,": ",
                xdmp:quote($response-headers)
                ))
};
