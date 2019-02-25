xquery version "1.0-ml";

(: Copyright 2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace docmodqryhead = "http://marklogic.com/rest-api/models/document-model-query-head";

import module namespace docmodcom = "http://marklogic.com/rest-api/models/document-model-common"
    at "../models/document-model-common.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "../lib/db-util.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $docmodqryhead:trace-id := "restapi.documents.query";

declare private variable $is-untraced := ();

declare function docmodqryhead:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($docmodqryhead:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

declare function docmodqryhead:head(
    $headers as map:map,
    $params  as map:map
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    (: Note:  This implementation priorizes speed for the common case over completeness
       and accuracy for edge cases.  In particular, this implementation doesn't
       read the document except to calculate the length of a binary and
       doesn't apply the default transform to get the output format, type, or length. :)
    let $uri               := map:get($params,"uri")
    let $uri-format        := xdmp:uri-format($uri)
    let $accept-type       := head(dbut:tokenize-header(map:get($headers,"accept")))
    let $doc               :=
        if ($uri-format eq "binary")
        then doc($uri)
        else ()
    let $response-format :=
        if (exists($doc))
        then eput:get-document-format($doc)
        else $uri-format
    let $uri-type        :=
        if (exists($accept-type) or empty($uri-format)) then ()
        else eput:uri-content-type($uri)
    let $response-type   :=
        if (exists($accept-type))
        then $accept-type
        else if ($uri-type ne "application/x-unknown-content-type")
        then $uri-type
        else eput:get-format-type($response-format)
    let $skip-etag       := (docmodcom:get-update-policy() = ("merge-metadata","overwrite-metadata"))
    let $version         :=
        if ($skip-etag) then ()
        else xdmp:document-timestamp($uri)
    let $is-available    :=
        if (exists($doc) or exists($version))
        then true()
        else if ($response-format eq "binary")
        then false()
        else doc-available($uri)
    let $timestamp       :=
        if (not($is-available))
        then error((),"RESTAPI-NODOCUMENT",("content",$uri))
        else xdmp:request-timestamp()
    return (
        if ($is-untraced or docmodqryhead:check-untraced()) then ()
        else lid:log(
            $docmodqryhead:trace-id,"head",
            map:entry("uri",$uri)=>map:with("response-format",$response-format)
            ),

        if (empty($timestamp)) then ()
        else eput:add-response-header("ML-Effective-Timestamp",string($timestamp)),

        if (empty($response-format)) then ()
        else eput:add-response-header("vnd.marklogic.document-format",$response-format),

        if (empty($response-type)) then ()
        else if (exists($response-format) and not($response-format eq "binary"))
        then xdmp:set-response-content-type(concat($response-type,"; charset=utf-8"))
        else xdmp:set-response-content-type($response-type),

        if (not($response-format eq "binary")) then ()
        else eput:add-response-header("Content-Length", string(xdmp:binary-size($doc/binary()))),

        if (empty($version)) then ()
        else eput:add-response-header("ETag", concat('"',string($version),'"')),

        if (not(map:contains($params,"txid"))) then ()
        else eput:add-host-cookie(xdmp:host())
        )
};
