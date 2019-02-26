xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace docmodupdput = "http://marklogic.com/rest-api/models/document-model-update-put"
    at "../models/document-model-update-put.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare namespace rest="http://marklogic.com/appservices/rest";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

declare function local:validate-parameters(
    $params as map:map
) as map:map
{
    let $extra-names := parameters:validate-parameter-names(
        $params, "^(perm:|prop:|value:)"
        )
    return
        if (empty($extra-names)) then ()
        else error((),"REST-UNSUPPORTEDPARAM",  concat(
            "invalid parameters: ",string-join($extra-names,", ")," for ",map:get($params,"uri")
            )),

    $params
};

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

let $params := map:new()
    =>parameters:query-parameter("uri",true(),false())
    =>parameters:query-parameter("collection",false(),true())
    =>parameters:query-parameter("quality",false(),false(),(),(),xs:int#1)
    =>parameters:query-parameter("forest-name",false(),false())
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
    =>map:with("metadata",parameters:prefixed-query-parameter("value:"))
    =>map:with("permissions",parameters:prefixed-query-parameter("perm:"))
    =>map:with("properties",parameters:prefixed-query-parameter("prop:"))
    =>local:validate-parameters()
return (
    lid:enable(map:get($params,"trace")),

    if (docmodupdput:check-untraced()) then ()
    else lid:log(
        $docmodupdput:trace-id,"item-update-put-endpoint",map:entry("parameters",$params)
        ),

    docmodupdput:put($params)
    )
