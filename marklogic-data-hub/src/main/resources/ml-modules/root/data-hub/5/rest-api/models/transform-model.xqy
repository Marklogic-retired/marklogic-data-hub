xquery version "1.0-ml";

(: Copyright 2012-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace tformod = "http://marklogic.com/rest-api/models/transform-model";

import module namespace json="http://marklogic.com/xdmp/json"
    at "/MarkLogic/json/json.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "/MarkLogic/rest-api/lib/db-util.xqy";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "../lib/extensions-util.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare namespace xsl = "http://www.w3.org/1999/XSL/Transform";

declare namespace rapi = "http://marklogic.com/rest-api";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $tformod:TRANSFORM_LISTED    := "TRANSFORM_LISTED";
declare variable $tformod:TRANSFORM_CREATED   := "TRANSFORM_CREATED";
declare variable $tformod:TRANSFORM_UPDATED   := "TRANSFORM_UPDATED";
declare variable $tformod:TRANSFORM_RETRIEVED := "TRANSFORM_RETRIEVED";
declare variable $tformod:TRANSFORM_DELETED   := "TRANSFORM_DELETED";

declare variable $tformod:transform-base-ns := "http://marklogic.com/rest-api/transform/";

declare variable $tformod:transform-list-config :=
    let $config := json:config("custom")
    return (
        map:put($config, "element-namespace",   "http://marklogic.com/rest-api"),
        map:put($config, "element-prefix",      "rapi"),
        map:put($config, "array-element-names", ("transform", "parameter")),
        $config
        );

declare variable $tformod:trace-id := "restapi.extensions.transform";

declare private variable $is-untraced := ();

declare function tformod:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($tformod:trace-id, ("restapi.extensions", "restapi"))
        ),

    $is-untraced
};

declare function tformod:get-list(
    $headers   as map:map,
    $params    as map:map,
    $responder as function(*)?
) as document-node()
{
    tformod:list(
        dbut:get-request-format($headers,$params),
        $params,
        $responder
        )
};

declare function tformod:list(
    $format    as xs:string?,
    $params    as map:map,
    $responder as function(*)?
) as document-node()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if (empty($responder)) then ()
    else $responder(
            $tformod:TRANSFORM_LISTED,
            if (empty($format) or $format = ("","xml"))
            then "application/xml"
            else if ($format eq "json")
            then "application/json"
            else error((),
                "RESTAPI-INTERNALERROR",
                concat("could not determine response type from ",$format)
                )
            ),

    let $xml :=
        document {
            <rapi:transforms>{
                for $transform-metadata in extut:list-extension-metadata(
                    "transform",
                    tformod:get-service-defs(),
                    (map:get($params,"refresh"), true())[1]
                    )/rapi:transform-metadata
                let $transform-name := $transform-metadata/rapi:name/string(.)
                order by $transform-name
                return
                    <rapi:transform>{
                        $transform-metadata ! *,
                        (: TODO: better way of getting version :)
                        <rapi:transform-source>/v1/config/transforms/{$transform-name}</rapi:transform-source>
                    }</rapi:transform>
            }</rapi:transforms>
        }
    return
        if (empty($format) or $format = ("","xml"))
        then $xml
        else if ($format eq "json")
        then document {
            json:transform-to-json-string($xml,$tformod:transform-list-config)
            }
        else error((),"RESTAPI-INVALIDMIMETYPE",(
            "mime type for transform list must be application/json or application/xml",
            $format,
            "/v1/transforms"
            ))
};

declare function tformod:get-item(
    $headers   as map:map,
    $params    as map:map,
    $responder as function(*)?
) as document-node()?
{
    tformod:get(
        extut:get-extension-name("transform",$params),$params,$responder
        )
};

declare function tformod:get(
    $transform-name as xs:string,
    $params         as map:map,
    $responder      as function(*)?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    let $found := extut:get-extension-source(
        "transform",$transform-name,("xslt","javascript","xquery")
        )
    return
        if (empty($found))
        then error((),"RESTAPI-NOTFOUND",concat("transform does not exist: ",$transform-name))
        else (
            if (empty($responder)) then ()
            else
                let $source-format := head($found)
                return $responder($tformod:TRANSFORM_RETRIEVED,
                    $transform-name,
                    switch ($source-format)
                    case "xquery" return "application/xquery"
                    case "xslt"   return "application/xslt+xml"
                    case "javascript"   return "application/javascript"
                    default       return error((),
                        "RESTAPI-INTERNALERROR",
                        concat("could not determine response type from ",$source-format,
                        " for ",$transform-name)
                        )
                    ),

            tail($found)
            )
};

declare function tformod:put-item(
    $headers   as map:map,
    $params    as map:map,
    $document  as document-node(),
    $responder as function(*)?
) as xs:boolean
{
    tformod:put(
        extut:get-extension-name("transform",$params),
        map:get($params,"title"),
        map:get($params,"version"),
        map:get($params,"provider"),
        map:get($params,"description"),
        extut:establish-format($headers,$params,("xquery","xslt","javascript")),
        $params,
        $document,
        $responder
        )
};

declare function tformod:put(
    $transform-name as xs:string,
    $title          as xs:string?,
    $version        as xs:string?,
    $provider       as xs:string?,
    $description    as xs:string?,
    $format         as xs:string,
    $params         as map:map,
    $document       as document-node(),
    $responder      as function(*)?
) as xs:boolean
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    if (empty($responder)) then ()
    else $responder(
        if (extut:extension-exists("transform",$transform-name))
            then $tformod:TRANSFORM_UPDATED
            else $tformod:TRANSFORM_CREATED,
        $transform-name,
        ()
        ),

    let $service-defs    := tformod:get-service-defs()
    let $metadata        := (
            if (empty($title))       then () else <rapi:title>{$title}</rapi:title>,
            if (empty($version))     then () else <rapi:version>{$version}</rapi:version>,
            if (empty($provider))    then () else <rapi:provider-name>{$provider}</rapi:provider-name>,
            if (empty($description)) then () else <rapi:description>{$description}</rapi:description>,
            <rapi:transform-parameters>{
                for $key in map:keys($params)
                return
                    if (not(starts-with($key,"trans:"))) then ()
                    else
                        <rapi:parameter>
                            <rapi:parameter-name>{substring-after($key,"trans:")}</rapi:parameter-name>
                            <rapi:parameter-type>{map:get($params,$key)}</rapi:parameter-type>
                        </rapi:parameter>
            }</rapi:transform-parameters>
            )
    return extut:install-extension(
        "transform",$service-defs,$transform-name,$metadata,$format,$document
        )
};

declare function tformod:delete-item(
    $headers   as map:map,
    $params    as map:map,
    $responder as function(*)?
) as empty-sequence()
{
    tformod:delete(
        extut:get-extension-name("transform",$params),$params,$responder
        )
};

declare private function tformod:delete(
    $transform-name as xs:string,
    $params         as map:map,
    $responder      as function(*)?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    if (empty($responder)) then ()
    else $responder($tformod:TRANSFORM_DELETED,$transform-name,()),

    extut:uninstall-extension("transform",$transform-name,map:get($params,"check"))
};

declare function tformod:extract-transform-params(
    $endpoint-params as map:map
) as map:map
{
    let $map := map:map()
    return (
        for $key in map:keys($endpoint-params)
        return
            if (not(starts-with($key,"trans:"))) then ()
            else map:put(
                $map,substring-after($key,"trans:"),map:get($endpoint-params,$key)
                ),
        $map
        )
};

declare function tformod:apply-transform-all(
    $transform-name as xs:string?,
    $params         as map:map,
    $requests       as map:map*
) as map:map*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $f := extut:get-extension-function("transform-all",$transform-name,"transform")
    return
        if (exists($f))
        then map:get(
            extut:invoke-service(
                $transform-name, "TRANSFORM-ALL", (), $f, map:entry("requests",$requests),
                $params, (), map:contains($params,"txid")
                ),
            "response"
            )
        else if (extut:extension-exists("transform",$transform-name))
        then error((),"RESTAPI-INVALIDREQ",
            "could not find transform function for: "||$transform-name
            )
        else error((),"RESTAPI-INVALIDREQ",
            "transform extension does not exist: "||$transform-name
            )
};

declare function tformod:apply-transform(
    $transform-name as xs:string?,
    $context        as map:map,
    $params         as map:map,
    $content        as document-node()
) as map:map
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $in-txn := map:contains($params,"txid")
    let $f      := extut:get-extension-function("transform",$transform-name,"transform")
    return
        if (exists($f))
        then extut:invoke-service(
            $transform-name,"TRANSFORM",(),$f,$context,$params,$content,$in-txn
            )
        else if (not(extut:extension-exists("transform",$transform-name)))
        then error((),"RESTAPI-INVALIDREQ",
           "transform extension does not exist: "||$transform-name
           )
        else
            (: create wrapper as fallback for backward compatibility
               can possibly delete this fallback at this point :)
            let $found  := extut:get-extension-source(
                "transform",$transform-name,("xslt","xquery","javascript")
                )
            let $format := head($found)
            let $f2     :=
                if ($format ne "xslt") then ()
                else
                    let $transform := tail($found)
                    let $success   := extut:execute-transform($transform,$context,$params,$content)
                    return
                        if (not($success)) then ()
                        else extut:get-extension-function("transform",$transform-name,"transform")
            return
                if (exists($f2))
                then extut:invoke-service(
                    $transform-name,"TRANSFORM",(),$f2,$context,$params,$content,$in-txn
                    )
                else error((),"RESTAPI-INVALIDREQ",
                    "could not find transform function for: "||$transform-name
                    )
};

declare function tformod:get-service-defs(
) as map:map
{
    let $service-defs := map:map()
    return (
        map:put($service-defs, "transform",
            ("document-node()?", "map:map", "map:map", "document-node()")
            ),
        $service-defs
        )
};
