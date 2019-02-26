xquery version "1.0-ml";

(: Copyright 2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace docmoddel = "http://marklogic.com/rest-api/models/document-model-update-delete";

import module namespace cook = "http://parthcomp.com/cookies"
    at "/MarkLogic/cookies.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

(: TODO: factor out dependency functions from docmodcom and docmodupd into granular libraries :)
import module namespace docmodcom = "http://marklogic.com/rest-api/models/document-model-common"
    at "../models/document-model-common.xqy";
import module namespace docmodupd = "http://marklogic.com/rest-api/models/document-model-update"
    at "../models/document-model-update.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $docmoddel:trace-id := "restapi.documents.update";

declare private variable $is-untraced := ();

declare function docmoddel:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($docmoddel:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

declare function docmoddel:delete(
    $params as map:map
)
{
   xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

   if ( docmodcom:get-update-policy() eq "version-required" )
   then error((), "RESTAPI-CONTENTNOVERSION", "uri "|| string-join(map:get($params, "uri"), ","))
   else (),

   if (map:contains($params,"txid"))
   then cook:add-cookie("HostId", xs:string(xdmp:host()), (),(),(),false())
   else (),

   if ($is-untraced or docmoddel:check-untraced()) then ()
   else lid:log(
       $docmoddel:trace-id,"delete",map:entry("params",$params)
       ),

   let $options := map:entry(
       "ifNotExists",
       if (not(map:get($params, "check") = "exists")) then "allow" else "error"
       )
   for $uri in map:get($params, "uri")
   for $doc-uri in ($uri, docmodupd:get-metadata-document($uri,true()))
   return xdmp:document-delete($doc-uri, $options)
};
