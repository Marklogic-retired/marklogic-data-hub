xquery version "1.0-ml";

(: Copyright 2012-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace rsrcmodqry = "http://marklogic.com/rest-api/models/resource-model-query";

import module namespace json="http://marklogic.com/xdmp/json"
    at "/MarkLogic/json/json.xqy";

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

declare variable $rsrcmodqry:RESOURCE_SERVICES_LISTED    := "RESOURCE_SERVICES_LISTED";
declare variable $rsrcmodqry:RESOURCE_SERVICES_RETRIEVED := "RESOURCE_SERVICES_RETRIEVED";
declare variable $rsrcmodqry:RESOURCE_APPLIED            := "RESOURCE_APPLIED";

declare variable $rsrcmodqry:RESOURCE_READ := "RESOURCE_READ";

declare variable $rsrcmodqry:trace-id := "restapi.extensions.resource";

declare private variable $is-untraced := ();

declare function rsrcmodqry:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($rsrcmodqry:trace-id, ("restapi.extensions", "restapi"))
        ),

    $is-untraced
};

declare variable $rsrcmodqry:transform-list-config :=
    let $config := json:config("custom")
    return (
        map:put($config, "element-namespace",   "http://marklogic.com/rest-api"),
        map:put($config, "element-prefix",      "rapi"),
        map:put($config, "array-element-names", ("resource", "method", "parameter")),
        $config
        );

declare function rsrcmodqry:get-list(
    $headers   as map:map,
    $params    as map:map,
    $responder as function(*)?
) as document-node()
{
    rsrcmodqry:list-sources(
        dbut:get-request-format($headers,$params),
        (map:get($params,"refresh"), true())[1],
        $responder
        )
};

declare function rsrcmodqry:list-sources(
    $format    as xs:string?,
    $responder as function(*)?
) as document-node()
{
    rsrcmodqry:list-sources($format,false(),$responder)
};

declare function rsrcmodqry:list-sources(
    $format    as xs:string?,
    $refresh   as xs:boolean,
    $responder as function(*)?
) as document-node()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if (empty($responder)) then ()
    else $responder(
            $rsrcmodqry:RESOURCE_SERVICES_LISTED,
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
            <rapi:resources>{
                for $resource-metadata in extut:list-extension-metadata(
                    "resource", rsrcmodcom:get-service-defs(), $refresh
                    )/rapi:resource-metadata
                let $resource-name := $resource-metadata/rapi:name/string(.)
                order by $resource-name
                return
                    <rapi:resource>{
                        $resource-metadata ! *,
                        (: TODO: better way to get version :)
                        <rapi:resource-source>/v1/resources/{$resource-name}</rapi:resource-source>
                    }</rapi:resource>
            }</rapi:resources>
        }
    return
        if (empty($format) or $format = ("","xml"))
        then $xml
        else if ($format eq "json")
        then document {
            json:transform-to-json-string($xml,$rsrcmodqry:transform-list-config)
            }
        else error((),"RESTAPI-INVALIDMIMETYPE",
            "mime type for resources list must be application/json or application/xml: "||$format
            )
};

declare function rsrcmodqry:get-item(
    $headers   as map:map,
    $params    as map:map,
    $responder as function(*)?
) as document-node()?
{
    rsrcmodqry:get-source(
        extut:get-extension-name("resource",$params),
        $responder,
        head(dbut:tokenize-header(map:get($headers,"accept"))[
            matches(.,"(xquery|javascript)$")
            ])
        )
};

declare function rsrcmodqry:get-source(
    $resource-name as xs:string,
    $responder     as function(*)?
) as document-node()?
{
    rsrcmodqry:get-source($resource-name, $responder, "application/xquery")
};

declare function rsrcmodqry:get-source(
    $resource-name as xs:string,
    $responder     as function(*)?,
    $accept-type as xs:string?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-admin", "execute"),

    if (empty($responder)) then ()
    else $responder($rsrcmodqry:RESOURCE_SERVICES_RETRIEVED,$resource-name,$accept-type),

    extut:get-extension-source-document("resource",$resource-name,("javascript","xquery"))
};

declare function rsrcmodqry:exec-get(
    $headers         as map:map,
    $endpoint-params as map:map,
    $responder       as function(*)?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    rsrcmodqry:resource-get(
        extut:get-extension-name("resource",$endpoint-params),
        rsrcmodcom:make-context($headers,$endpoint-params),
        rsrcmodcom:make-resource-params($headers,$endpoint-params),
        map:contains($endpoint-params,"txid"),
        $responder
        )
};

declare function rsrcmodqry:resource-get(
    $resource-name   as xs:string,
    $context         as map:map,
    $resource-params as map:map,
    $in-txn          as xs:boolean,
    $responder       as function(*)?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $service :=
        let $serv := extut:get-extension-function("resource",$resource-name,"get")
        return
            if (exists($serv))
            then $serv
            else if (extut:extension-exists("resource",$resource-name))
            then error((),"RESTAPI-INVALIDREQ",
                concat("could not find GET method for resource: ",$resource-name)
                )
            else error((),"RESTAPI-INVALIDREQ",
                concat("resource extension does not exist: ",$resource-name)
                )
    let $output  := extut:invoke-service(
        $resource-name,"GET","query",$service,$context,$resource-params,(),$in-txn
        )
    let $context := map:get($output,"context")
    let $result  := rsrcmodcom:collect-documents(
        $resource-name,"GET",$context,map:get($output,"result")
        )
    return (
        if (empty($responder)) then ()
        else $responder(
            $rsrcmodqry:RESOURCE_READ,
            $resource-name,
            exists($result),
            map:get($context,"output-types"),
            map:get($context,"output-status"),
            map:get($context,"output-headers")
            ),

        $result
        )
};

declare function rsrcmodqry:exec-post(
    $headers         as map:map,
    $endpoint-params as map:map,
    $input           as document-node()?,
    $responder       as function(*)?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    rsrcmodqry:resource-post(
        extut:get-extension-name("resource",$endpoint-params),
        rsrcmodcom:make-context($headers,$endpoint-params),
        rsrcmodcom:make-resource-params($headers,$endpoint-params),
        $input,
        map:contains($endpoint-params,"txid"),
        $responder
        )
};

declare function rsrcmodqry:resource-post(
    $resource-name   as xs:string,
    $context         as map:map,
    $resource-params as map:map,
    $input           as document-node()?,
    $in-txn          as xs:boolean,
    $responder       as function(*)?
) as document-node()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $service :=
        let $serv := extut:get-extension-function("resource",$resource-name,"post")
        return
            if (exists($serv))
            then $serv
            else if (extut:extension-exists("resource",$resource-name))
            then error((),"RESTAPI-INVALIDREQ",
                concat("could not find POST method for resource: ",$resource-name)
                )
            else error((),"RESTAPI-INVALIDREQ",
                concat("resource extension does not exist: ",$resource-name)
                )
    let $output  := extut:invoke-service(
        $resource-name,"POST","query",$service,$context,$resource-params,
        rsrcmodcom:extract-documents($context,$input),$in-txn
        )
    let $context := map:get($output,"context")
    let $result  := rsrcmodcom:collect-documents(
        "POST",$resource-name,$context,map:get($output,"result")
        )
    return (
        if (empty($responder)) then ()
        else $responder(
            $rsrcmodqry:RESOURCE_APPLIED,
            $resource-name,
            exists($result),
            map:get($context,"output-types"),
            map:get($context,"output-status"),
            map:get($context,"output-headers")
            ),

        $result
        )
};
