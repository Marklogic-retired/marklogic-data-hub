xquery version "1.0-ml";

(: Copyright 2012-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace rsrcmodupd = "http://marklogic.com/rest-api/models/resource-model-update";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "/MarkLogic/rest-api/lib/db-util.xqy";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "../lib/extensions-util.xqy";

import module namespace transmod = "http://marklogic.com/rest-api/models/transaction-model"
    at "/MarkLogic/rest-api/models/transaction-model.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "/MarkLogic/rest-api/lib/endpoint-util.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace rsrcmodcom = "http://marklogic.com/rest-api/models/resource-model-common"
    at "/MarkLogic/rest-api/models/resource-model-common.xqy";

declare namespace rapi  = "http://marklogic.com/rest-api";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $rsrcmodupd:trace-id := "restapi.extensions.resource";

declare private variable $is-untraced := ();

declare function rsrcmodupd:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($rsrcmodupd:trace-id, ("restapi.extensions", "restapi"))
        ),

    $is-untraced
};

declare variable $rsrcmodupd:RESOURCE_SERVICES_CREATED   := "RESOURCE_SERVICES_CREATED";
declare variable $rsrcmodupd:RESOURCE_SERVICES_UPDATED   := "RESOURCE_SERVICES_UPDATED";
declare variable $rsrcmodupd:RESOURCE_SERVICES_DELETED   := "RESOURCE_SERVICES_DELETED";

declare variable $rsrcmodupd:RESOURCE_WRITTEN := "RESOURCE_WRITTEN";
declare variable $rsrcmodupd:RESOURCE_DELETED := "RESOURCE_DELETED";

declare function rsrcmodupd:put-item(
    $headers   as map:map,
    $params    as map:map,
    $document  as document-node(),
    $responder as function(*)?
) as xs:boolean
{
    let $content-type  := eput:get-inbound-content-type($params,$headers)
    let $method-list   := ("delete", "get", "post", "put")
    let $method-params :=
        let $map := map:map()
        return (
            for $method in map:get($params,"method")[. = $method-list]
            return map:put($map,$method,map:map()),
            $map
            )
    let $methods       := (
        (: collect the parameters for each method :)
        for $key in map:keys($params)[contains(.,":")]
        let $method := substring-before($key,":")
        return
            if (not($method = $method-list)) then ()
            else
                let $method-map   :=
                    let $map := map:get($method-params,$method)
                    return
                        if (exists($map))
                        then $map
                        else
                            let $m := map:map()
                            return (
                                map:put($method-params, $method, $m),
                                $m
                                )
                let $method-param := substring($key, string-length($method) + 2)[. ne ""]
                return
                    if (empty($method-param)) then ()
                    else map:put(
                        $method-map,
                        $method-param,
                        (map:get($method-map,$method-param), map:get($params,$key))
                        ),

        map:keys($method-params)
        )
    return (
        rsrcmodupd:put-source(
            extut:get-extension-name("resource",$params),
            map:get($params,"title"),
            map:get($params,"version"),
            map:get($params,"provider"),
            map:get($params,"description"),
            $params,
            $methods,
            $method-params,
            $content-type,
            $document,
            $responder
            )
        )
};


declare function rsrcmodupd:put-source(
    $resource-name as xs:string,
    $title         as xs:string?,
    $version       as xs:string?,
    $provider      as xs:string?,
    $description   as xs:string?,
    $params        as map:map,
    $methods       as xs:string*,
    $method-params as map:map,
    $content-type  as xs:string?,
    $document      as document-node(),
    $responder     as function(*)?
) as xs:boolean
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    if (empty($content-type) or
        $content-type = ("application/xquery","application/vnd.marklogic-xdmp",
         "application/javascript", "application/vnd.marklogic-javascript") )
    then ()
    else error((),"RESTAPI-INVALIDMIMETYPE",
    "mime type must be application/javascript, application/vnd.marklogic-javascript, application/xquery or application/vnd.marklogic-xdmp: "||$content-type||" for "||
            $resource-name
        ),

    if (empty($responder)) then ()
    else $responder(
        if (extut:extension-exists("resource",$resource-name))
            then $rsrcmodupd:RESOURCE_SERVICES_UPDATED
            else $rsrcmodupd:RESOURCE_SERVICES_CREATED,
        $resource-name,
        ()
        ),

    let $service-defs    := rsrcmodcom:get-service-defs()
    let $metadata        := (
            if (empty($title))       then () else <rapi:title>{$title}</rapi:title>,
            if (empty($version))     then () else <rapi:version>{$version}</rapi:version>,
            if (empty($provider))    then () else <rapi:provider-name>{$provider}</rapi:provider-name>,
            if (empty($description)) then () else <rapi:description>{$description}</rapi:description>,
            <rapi:methods>{
                for $method in $methods
                return
                    <rapi:method>{
                        <rapi:method-name>{$method}</rapi:method-name>,
                        let $method-map := map:get($method-params,$method)
                        for $key in map:keys($method-map)
                        return
                            <rapi:parameter>
                                <rapi:parameter-name>{$key}</rapi:parameter-name>
                                <rapi:parameter-type>{map:get($method-map,$key)}</rapi:parameter-type>
                            </rapi:parameter>
                    }</rapi:method>
            }</rapi:methods>
            )
    let $source-format :=
        if (contains($content-type, "javascript"))
        then "javascript"
        else "xquery"
    return extut:install-extension(
        "resource",$service-defs,$resource-name,$metadata,$source-format,$document
        )
};

declare function rsrcmodupd:delete-item(
    $headers   as map:map,
    $params    as map:map,
    $responder as function(*)?
) as empty-sequence()
{
    rsrcmodupd:delete-source(
        extut:get-extension-name("resource",$params),$params,$responder
        )
};

declare private function rsrcmodupd:delete-source(
    $resource-name as xs:string,
    $params        as map:map,
    $responder     as function(*)?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    if (empty($responder)) then ()
    else $responder($rsrcmodupd:RESOURCE_SERVICES_DELETED,$resource-name,()),

    extut:uninstall-extension("resource",$resource-name,map:get($params,"check"))
};

declare function rsrcmodupd:exec-put(
    $headers         as map:map,
    $endpoint-params as map:map,
    $input           as document-node()?,
    $responder       as function(*)?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    rsrcmodupd:resource-put(
        extut:get-extension-name("resource",$endpoint-params),
        rsrcmodcom:make-context($headers,$endpoint-params),
        rsrcmodcom:make-resource-params($headers,$endpoint-params),
        $input,
        map:contains($endpoint-params,"txid"),
        $responder
        )
};

declare function rsrcmodupd:resource-put(
    $resource-name   as xs:string,
    $context         as map:map,
    $resource-params as map:map,
    $input           as document-node()?,
    $in-txn          as xs:boolean,
    $responder       as function(*)?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    let $service :=
        let $serv := extut:get-extension-function("resource",$resource-name,"put")
        return
            if (exists($serv))
            then $serv
            else if (extut:extension-exists("resource",$resource-name))
            then error((),"RESTAPI-INVALIDREQ",
                concat("could not find PUT method for resource: ",$resource-name)
                )
            else error((),"RESTAPI-INVALIDREQ",
                concat("resource extension does not exist: ",$resource-name)
                )
    let $output  := extut:invoke-service(
        $resource-name,"PUT","update",$service,$context,$resource-params,
        rsrcmodcom:extract-documents($context,$input),
        $in-txn
        )
    let $result  := map:get($output,"result")
    let $context := map:get($output,"context")
    return (
        if (empty($responder)) then ()
        else $responder(
            $rsrcmodupd:RESOURCE_WRITTEN,
            $resource-name,
            exists($result),
            map:get($context,"output-types"),
            map:get($context,"output-status"),
            map:get($context,"output-headers")
            ),

        $result
        )
};

declare function rsrcmodupd:exec-delete(
    $headers         as map:map,
    $endpoint-params as map:map,
    $responder       as function(*)?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    rsrcmodupd:resource-delete(
        extut:get-extension-name("resource",$endpoint-params),
        rsrcmodcom:make-context($headers,$endpoint-params),
        rsrcmodcom:make-resource-params($headers,$endpoint-params),
        map:contains($endpoint-params,"txid"),
        $responder
        )
};

declare function rsrcmodupd:resource-delete(
    $resource-name   as xs:string,
    $context         as map:map,
    $resource-params as map:map,
    $in-txn          as xs:boolean,
    $responder       as function(*)?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    let $service :=
        let $serv := extut:get-extension-function("resource",$resource-name,"delete")
        return
            if (exists($serv))
            then $serv
            else if (extut:extension-exists("resource",$resource-name))
            then error((),"RESTAPI-INVALIDREQ",
                concat("could not find DELETE method for resource: ",$resource-name)
                )
            else error((),"RESTAPI-INVALIDREQ",
                concat("resource extension does not exist: ",$resource-name)
                )
    let $output  := extut:invoke-service(
        $resource-name,"DELETE","update",$service,$context,$resource-params,(),$in-txn
        )
    let $result  := map:get($output,"result")
    let $context := map:get($output,"context")
    return (
        if (empty($responder)) then ()
        else $responder(
            $rsrcmodupd:RESOURCE_DELETED,
            $resource-name,
            exists($result),
            map:get($context,"output-types"),
            map:get($context,"output-status"),
            map:get($context,"output-headers")
            ),

        $result
        )
};
