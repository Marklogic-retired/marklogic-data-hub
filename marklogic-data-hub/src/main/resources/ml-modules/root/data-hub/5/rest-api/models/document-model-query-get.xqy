xquery version "1.0-ml";

(: Copyright 2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace docmodqryget = "http://marklogic.com/rest-api/models/document-model-query-get";

import module namespace docmodcom = "http://marklogic.com/rest-api/models/document-model-common"
    at "../models/document-model-common.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "../lib/db-util.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace tformod = "http://marklogic.com/rest-api/models/transform-model"
    at "../models/transform-model.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $docmodqryget:trace-id := "restapi.documents.query";

declare private variable $is-untraced := ();

declare function docmodqryget:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($docmodqryget:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

declare function docmodqryget:get(
    $headers as map:map,
    $params  as map:map
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    let $uri               := map:get($params,"uri")
    let $doc               := doc($uri)
    let $declared-format   :=
        if (empty($doc))
        then error((),"RESTAPI-NODOCUMENT",("content",$uri))
        else eput:get-document-format($doc)
    let $accept-types      := dbut:tokenize-header(map:get($headers,"accept"))
    let $uri-type          := eput:uri-content-type($uri)
    let $declared-type     :=
        if ($uri-type ne "application/x-unknown-content-type")
        then $uri-type
        else eput:get-format-type($declared-format)
    let $default-transform := docmodcom:get-default-transform()
    let $trans-output      :=
        if (empty($doc) or empty($default-transform)) then ()
        else tformod:apply-transform(
            $default-transform,
            eput:make-context($uri,$declared-type,$accept-types),
            tformod:extract-transform-params($params),
            $doc
            )
    let $trans-ctxt        :=
        if (empty($trans-output)) then ()
        else map:get($trans-output,"context")
    let $response-doc      :=
        if (empty($trans-output))
        then $doc
        else map:get($trans-output,"result")
    let $response-format   :=
        if (empty($trans-output))
        then $declared-format
        else eput:get-document-format($response-doc)
    let $response-type     := head((
        if (empty($trans-ctxt)) then ()
        else map:get($trans-ctxt,"output-type"),

        if ($declared-type eq "application/x-unknown-content-type")
        then $accept-types
        else $declared-type
        ))
    let $version           :=
        if (docmodcom:get-update-policy() = ("merge-metadata","overwrite-metadata"))
        then ()
        else xdmp:document-timestamp($uri)
    let $timestamp         := xdmp:request-timestamp()
    return (
        if ($is-untraced or docmodqryget:check-untraced()) then ()
        else lid:log(
            $docmodqryget:trace-id,"get",
            map:entry("uri",$uri)=>map:with("response-format",$response-format)
            =>map:with("default-transform",$default-transform),
            map:entry("doc",$response-doc)
            ),

        if (empty($timestamp)) then ()
        else eput:add-response-header("ML-Effective-Timestamp",string($timestamp)),

        if (empty($response-format)) then ()
        else eput:add-response-header("vnd.marklogic.document-format",$response-format),

        if (empty($response-type)) then ()
        else if (exists($response-format) and not($response-format eq "binary"))
        then xdmp:set-response-content-type(concat($response-type,"; charset=utf-8"))
        else xdmp:set-response-content-type($response-type),

        if (empty($version)) then ()
        else eput:add-response-header("ETag", concat('"',string($version),'"')),

        if (not(map:contains($params,"txid"))) then ()
        else eput:add-host-cookie(xdmp:host()),

        $response-doc
        )
};
