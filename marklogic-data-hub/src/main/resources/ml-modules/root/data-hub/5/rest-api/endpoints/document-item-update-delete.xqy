xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
    at "../endpoints/parameters.xqy";

import module namespace docmoddel = "http://marklogic.com/rest-api/models/document-model-update-delete"
    at "../models/document-model-update-delete.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare option xdmp:transaction-mode "auto";

declare private function local:validate-parameters(
    $params as map:map
) as map:map
{
   let $extra-names := parameters:validate-parameter-names($params,())
   return 
      if (exists($extra-names))
      then error((),"REST-UNSUPPORTEDPARAM", "invalid parameters: " || string-join($extra-names,", ") || " for " || map:get($params,"uri") )
      else $params
};

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

let $params := map:new()
    =>parameters:query-parameter("category",false(),true(),
        ("content","metadata","collections","permissions","properties","quality","metadata-values")
        )
    =>parameters:query-parameter("txid",false(),false())
    =>parameters:query-parameter("database",false(),false())
    =>parameters:query-parameter("uri",true(),true())
    =>parameters:query-parameter("check",false(),false(), ("exists","none"))
    =>parameters:query-parameter("trace",false(),true(),(),"http://marklogic.com/xdmp/privileges/rest-tracer")
    =>local:validate-parameters()
return (
    lid:enable(map:get($params,"trace")),

    if (docmoddel:check-untraced()) then ()
    else lid:log(
        $docmoddel:trace-id,"item-update-delete-endpoint",map:entry("parameters",$params)
        ),

    docmoddel:delete($params),

    xdmp:set-response-code(204,"Content Deleted")
    )
