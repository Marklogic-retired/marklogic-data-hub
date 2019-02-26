xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace searchmodu = "http://marklogic.com/rest-api/models/search-model-update";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace sut = "http://marklogic.com/rest-api/lib/search-util"
    at "../lib/search-util.xqy";
    
import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";
    
import module namespace transmod = "http://marklogic.com/rest-api/models/transaction-model"
    at "transaction-model.xqy";
    
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $searchmodu:trace-id := "restapi.documents.search";

declare private variable $is-untraced := ();

declare function searchmodu:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($searchmodu:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

(: entry point for DELETE on search :)
declare function searchmodu:search-delete(
    $headers as map:map,
    $params  as map:map,
    $env as map:map
) as document-node()?
{
    eput:response-add-host-cookie($headers, $params, $env),
    searchmodu:delete($params)
};

declare function searchmodu:delete(
    $params as map:map
) as empty-sequence()
{
    let $collection := map:get($params,"collection")
    let $directory := map:get($params,"directory")
    return (
        if ($is-untraced or searchmodu:check-untraced()) then ()
        else lid:log($searchmodu:trace-id,"delete",map:entry("params",$params)),

        if (exists($collection) and exists($directory))
            then error((),"REST-INVALIDPARAM","supplying both 'collection' and 'directory' parameters is not allowed")
        else if ($collection eq "")
            then error((),"REST-INVALIDPARAM","an empty 'collection' parameter is not allowed")
        else if ($directory eq "")
            then error((),"REST-INVALIDPARAM","an empty 'directory' parameter is not allowed")
        else if (exists($collection))
            then xdmp:collection-delete($collection)
        else if (exists($directory))
            then xdmp:directory-delete($directory)
        else if (xdmp:has-privilege("http://marklogic.com/xdmp/privileges/rest-admin", "execute"))
            then searchmodu:clear()
        else error((),"REST-INVALIDPARAM",
                "either the 'collection' or 'directory' parameter and the rest-writer role or the rest-admin role is required"
                )
        )
};

declare function searchmodu:clear()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),   
    for $forest in xdmp:database-forests(xdmp:database()) (: not setting replicas flag :)
    return xdmp:forest-clear($forest)
};

