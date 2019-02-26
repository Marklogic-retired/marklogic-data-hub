xquery version "1.0-ml";

(: Copyright 2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

(: converts from text/uri-list to a sequence of uri strings :)
declare function local:from-uri-list(
    $text   as xs:string,
    $result as xs:string
) as xs:string*
{
    for $line in tokenize($text,"\n")
    let $uri := normalize-space($line)
    where $uri ne '' and not(starts-with($uri,'#'))
    return
        if ($result ne "replace")
        then $uri
        else (
            xdmp:lock-for-update($uri),
            $uri
            )
};

(: applies a transform to a sequence of uris and applies the semantics of result :)
declare function local:apply-all(
    $uris   as xs:string*,
    $params as map:map,
    $result as xs:string
) as xs:string*
{
    let $trans-name := map:get($params,"transform")
    let $requests   :=
        for $doc in doc($uris)
        return eput:make-request(document-uri($doc), $doc)
    return
        if (empty($requests)) then ()
        else
            for $response at $i in eput:apply-document-transform-all(
                $trans-name,$params,$requests
                )
            let $request := subsequence($requests,$i,1)
            return
                if ($result ne "replace")
                then map:get($request,"uri")
                (: TODO: handle the case where the transform changes the uri :)
                else local:replace(
                    map:get($request,"uri"), map:get($request,"input"), map:get($response,"result")
                    )
};
(: performs the replace operation on the original document :)
declare function local:replace(
    $uri      as xs:string,
    $original as document-node(),
    $result   as document-node()?
) as xs:string?
{
   if (exists($result))
   then (xdmp:node-replace($original,$result),$uri)
   else ()
};

(: the main request processing :)
xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

xdmp:set-response-content-type("text/uri-list"),

let $parameters  := map:new()
    =>parameters:query-parameter("transform",true(),false())
    =>parameters:query-parameter("result",false(),false(),("replace","ignore"))
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
    =>parameters:query-parameters-passthrough("^trans:")
let $extra-names := parameters:validate-parameter-names($parameters,())
let $result      := head((map:get($parameters,"result"), "replace"))
let $uris        := local:from-uri-list(xdmp:get-request-body("text"), $result)
let $trace-id    := "restapi.documents.apply"
return (
    lid:enable(map:get($parameters,"trace")),

    if (lid:is-disabled($trace-id, ("restapi.documents", "restapi"))) then ()
    else lid:log(
        $trace-id,"apply-endpoint",map:entry("parameters",$parameters)=>map:with("uris",$uris)
        ),

    if (empty($extra-names)) then ()
    else error((),"REST-UNSUPPORTEDPARAM", concat(
        "invalid parameters: ",string-join($extra-names,", ")," for ",string-join($uris,", ")
        )),

    eput:to-uri-list(local:apply-all($uris,$parameters,$result))
    )
