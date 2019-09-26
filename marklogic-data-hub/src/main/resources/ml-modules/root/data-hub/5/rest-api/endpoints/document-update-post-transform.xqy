xquery version "1.0-ml";

(: Copyright 2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "/MarkLogic/rest-api/endpoints/parameters.xqy";

import module namespace docmodupdtform = "http://marklogic.com/rest-api/models/document-model-update-transform"
    at "../models/document-model-update-transform.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare namespace rest="http://marklogic.com/appservices/rest";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

declare function local:validate-parameters(
) as map:map
{
    let $params :=
        map:new()
        =>parameters:query-parameter("txid",false(),false())
        =>parameters:query-parameter("database",false(),false())
        =>parameters:query-parameter("transform",true(),false())
        =>parameters:query-parameters-passthrough("^trans:")
        =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
    let $extra-names := parameters:validate-parameter-names($params,())
    return (
        if (empty($extra-names)) then ()
        else error((),"REST-UNSUPPORTEDPARAM",  concat(
            "invalid parameters: ",string-join($extra-names,", ")," for bulk write with transform"
            )),

        $params
        )
};

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

let $params := local:validate-parameters()
return (
    lid:enable(map:get($params,"trace")),

    if (docmodupdtform:check-untraced()) then ()
    else lid:log(
        $docmodupdtform:trace-id,"update-transform-endpoint",
        map:entry("method","post")=> map:with("parameters",$params)
        ),

    docmodupdtform:post-bulk-documents($params)
    )
