xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace docmodqry = "http://marklogic.com/rest-api/models/document-model-query";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
     at "/MarkLogic/json/json.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "/MarkLogic/rest-api/lib/endpoint-util.xqy";

import module namespace transmod = "http://marklogic.com/rest-api/models/transaction-model"
    at "/MarkLogic/rest-api/models/transaction-model.xqy";

import module namespace tformod = "http://marklogic.com/rest-api/models/transform-model"
    at "transform-model.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "/MarkLogic/rest-api/lib/db-util.xqy";

import module namespace docmodcom = "http://marklogic.com/rest-api/models/document-model-common"
    at "document-model-common.xqy";

import schema namespace rapi = "http://marklogic.com/rest-api"
    at "restapi.xsd";

declare namespace http  = "xdmp:http";
declare namespace multi = "xdmp:multipart";
declare namespace prop  = "http://marklogic.com/xdmp/property";
declare namespace sec   = "http://marklogic.com/xdmp/security";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $docmodqry:CONTENT_RETRIEVED  := "CONTENT_RETRIEVED";
declare variable $docmodqry:RANGE_RETRIEVED    := "RANGE_RETRIEVED";
declare variable $docmodqry:CONTENT_UNCHANGED  := "CONTENT_UNCHANGED";
declare variable $docmodqry:METADATA_RETRIEVED := "METADATA_RETRIEVED";

declare variable $docmodqry:trace-id := "restapi.documents.query";

declare private variable $is-untraced := ();

declare function docmodqry:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($docmodqry:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

(:
    high-level request functions
 :)
declare function docmodqry:get(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map?
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    let $uris       := map:get($params,"uri")
    let $categories := docmodcom:select-category($params)
    let $is-content := ($categories = "content")
    let $_ := eput:response-add-host-cookie($headers, $params, $env)
    return
        (: many documents or not a combination of metadata and content and multipart :)
        if (count($uris) gt 1 or (
            not($is-content and count($categories) gt 1) and
            starts-with(map:get($headers,"accept"), "multipart/mixed")))
        then docmodqry:get-bulk-documents($headers,$params,$uris,$categories,true(),$env)
        else if ($is-content)
(: TODO: pass in $uris and check for any callers :)
        then docmodqry:get-conditional-content($headers,$params,$categories,true(),$env)
        else docmodqry:get-metadata($headers,$params,$categories,true(),
            if (empty($env)) then ()
            else map:get($env,"responder"))
};

declare function docmodqry:get-metadata(
    $headers    as map:map,
    $params     as map:map,
    $categories as xs:string+,
    $with-read  as xs:boolean,
    $responder  as function(*)?
) as item()*
{
    let $uri := map:get($params,"uri")
    return
        if (not(doc-available($uri)))
        (: modify if necessary to support naked properties :)
        then error((),"RESTAPI-NODOCUMENT",(string-join($categories,", "),$uri))
        else docmodqry:produce-metadata(
            $headers,$params,$categories,$with-read,$responder,$uri,
            docmodcom:get-metadata-output-type($headers,$params,$uri,()),
            false()
            )
};

declare function docmodqry:produce-metadata(
    $headers       as map:map,
    $params        as map:map,
    $categories    as xs:string+,
    $with-read     as xs:boolean,
    $responder     as function(*)?,
    $uri           as xs:string,
    $response-type as xs:string?,
    $as-document   as xs:boolean
) as item()*
{
    if ($response-type = ("application/xml","text/xml")) then (
        if (empty($responder)) then ()
        else $responder($docmodqry:METADATA_RETRIEVED,$uri,"xml",$response-type,"UTF-8",(),()),

        if (not($with-read)) then ()
        else if (not($as-document))
        then docmodcom:read-metadata-xml($uri,$categories)
        else document{docmodcom:read-metadata-xml($uri,$categories)}
        )
    else if ($response-type = ("application/json","text/json")) then (
        if (empty($responder)) then ()
        else $responder($docmodqry:METADATA_RETRIEVED,$uri,"json",$response-type,"UTF-8",(),()),

        if (not($with-read)) then ()
        else if (not($as-document))
        then docmodcom:read-metadata-json($uri,$categories)
        else document{text{docmodcom:read-metadata-json($uri,$categories)}}
        )
    else error((),"RESTAPI-INVALIDMIMETYPE",(
        "mime type for metadata must be application/json or application/xml",$response-type,$uri
        ))
};

declare function docmodqry:get-conditional-content(
    $headers    as map:map,
    $params     as map:map,
    $categories as xs:string+,
    $with-read  as xs:boolean,
    $env        as map:map?
) as item()*
{
    let $uri           := map:get($params,"uri")
    let $timestamp     := docmodcom:get-timestamp($uri)
    let $if-none-match :=
        if (empty($timestamp)) then ()
        else docmodcom:get-etag($headers,"if-none-match",$uri)
    return
        if (exists($if-none-match) and $if-none-match eq $timestamp)
        then
            let $responder :=
                if (empty($env)) then ()
                else map:get($env,"responder")
            return
                if (empty($responder)) then ()
                else $responder($docmodqry:CONTENT_UNCHANGED,$uri,(),(),(),$timestamp,())
        else docmodqry:get-content($headers,$params,$uri,$categories,$with-read,$timestamp,$env)
};

declare function docmodqry:get-content(
    $headers    as map:map,
    $params     as map:map,
    $uri        as xs:string,
    $categories as xs:string+,
    $with-read  as xs:boolean,
    $timestamp  as xs:integer?,
    $env        as map:map?
) as item()*
{
    let $is-multipart     := count($categories) gt 1
    let $uri-format       := docmodcom:get-uri-format($uri)
    let $uri-type         := eput:uri-content-type($uri)
    let $known-uri-type   := ($uri-type ne "application/x-unknown-content-type")
    let $trans-name       := map:get($params,"transform")
    let $trans-default    := docmodcom:get-default-transform()
    let $has-transform    := (exists($trans-name) or exists($trans-default))
    let $range-header     :=
        let $if-range :=
            if (empty($timestamp)) then ()
            else docmodcom:get-etag($headers,"if-range",$uri)
        return
            if (exists($if-range) and not($if-range eq $timestamp)) then ()
            else map:get($headers,"range")
    let $content          :=
        if ($known-uri-type and empty($range-header) and not($has-transform) and
            ($with-read or $uri-format ne "binary")) then ()
        else docmodqry:read-content($uri)
    let $actual-format    :=
        if (empty($content)) then ()
        else eput:get-document-format($content)
    let $declared-format  :=
        if ($known-uri-type)
        then $uri-format
        else $actual-format
    let $declared-type    :=
        if ($known-uri-type)
        then $uri-type
        else eput:get-format-type($actual-format)
    let $overridable-type := ($declared-type eq "application/x-unknown-content-type")
    let $accept-param     := map:get($headers,"accept")
    let $accept-types     :=
        if (not($is-multipart) and ($has-transform or $overridable-type))
        then dbut:tokenize-header($accept-param)
        else ()
    let $boundary         :=
        if (not($is-multipart)) then ()
        else docmodcom:get-multipart-boundary($accept-param)
    let $request-charset  :=
        let $accept-charsets :=
            if (empty($accept-param)) then ()
            else dbut:tokenize-header(map:get($headers,"accept-charset"))
        return
            if (empty($accept-charsets)) then ()
            else subsequence($accept-charsets,1,1)
    let $param-format     :=
        if (not($is-multipart)) then ()
        else map:get($params,"format")
    let $metadata-format  :=
        if (not($is-multipart)) then ()
        else if (exists($param-format))
        then $param-format
        else if ($declared-format = ("json", "xml"))
        then $declared-format
        else "xml"
    let $metadata-type    :=
        if (not($is-multipart)) then ()
        else eput:get-format-type($metadata-format)
    let $binary-length    :=
        if (empty($range-header)) then ()
        else if (not($actual-format = "binary"))
        then error((),"REST-INVALIDPARAM",
            "range supported only for binary content. Received format: " ||
                $actual-format || " for uri " || $uri
            )
        else xdmp:binary-size($content/binary())
    let $range-list       :=
        if (empty($binary-length)) then ()
        else
            let $list       := eput:parse-byte-range(
                substring-after($range-header,"bytes="),
                $binary-length - 1,
                $uri
                )
            let $list-count := count($list)
            return
                if ($list-count eq 2)
                then $list
                else if ($list-count gt 2)
                then error((),"REST-INVALIDPARAM",
                    "byte range "||$range-header||" with more than one range for " || $uri
                    )
                else error((),"RESTAPI-NORANGEMATCH",
                    "byte range "||$range-header||" not matched for binary " || $uri
                    )
    let $start-range      :=
        if (empty($range-list)) then ()
        else subsequence($range-list,1,1)
    let $end-range        :=
        if (empty($range-list)) then ()
        else subsequence($range-list,2,1)
    let $length-responder :=
        if ($with-read or not($actual-format = "binary") or empty($env) or $has-transform)
        then ()
        else map:get($env,"length-responder")
    let $response        :=
        if (not($with-read) and
            (empty($length-responder) or (exists($start-range) and exists($end-range))))
        then docmodqry:check-document-exists($uri)
        else docmodqry:produce-content($uri,$start-range,$end-range,$content)
    let $context         :=
        if (not($has-transform)) then ()
        else eput:make-context($uri,$declared-type,$accept-types)
    let $trans-params    :=
        if (not($has-transform)) then ()
        else tformod:extract-transform-params($params)
    let $trans-output    :=
        if (empty($response) or not($has-transform)) then ()
        else if (exists($trans-name) and exists($trans-default)) then
            let $default-output := tformod:apply-transform(
                $trans-default,$context,$trans-params,$response
                )
            let $default-ctxt   := map:get($default-output,"context")
            let $default-type   := map:get($default-ctxt,"output-type")
            return (
                if (exists($default-type))
                then map:put($default-ctxt, "input-type", $default-type)
                else (
                    map:put($default-ctxt, "input-type",  $declared-type),
                    map:put($default-ctxt, "output-type", $declared-type)
                    ),

                tformod:apply-transform(
                    $trans-name,$default-ctxt,$trans-params,map:get($default-output,"result")
                    )
                )
        else tformod:apply-transform(
            ($trans-name,$trans-default), $context, $trans-params, $response
            )
    let $trans-ctxt      :=
        if (empty($trans-output)) then ()
        else map:get($trans-output,"context")
    let $output          :=
        if (empty($trans-output))
        then $response
        else map:get($trans-output,"result")
    let $output-uri      :=
        if (empty($trans-ctxt))
        then $uri
        else head((map:get($trans-ctxt,"uri"),$uri))
    let $output-type     :=
        if (empty($trans-ctxt)) then ()
        else map:get($trans-ctxt,"output-type")
    let $response-format :=
        if (empty($trans-ctxt))
        then $declared-format
        else
            let $transform-format := eput:get-document-format($output)
            return
                if (exists($transform-format))
                then $transform-format
                else head((docmodcom:get-type-format($output-type),$declared-format))
    let $response-type   :=
        if (exists($output-type))
        then $output-type
        else if ($overridable-type and exists($accept-types))
        then head($accept-types)
        else $declared-type
    let $responder       :=
        if (empty($env)) then ()
        else map:get($env,"responder")
    return
        if (empty($response-type))
        then error((),"RESTAPI-INTERNALERROR",concat("could not determine response type from ",$response-format," for ",$uri))
        else (
            if (empty($responder)) then ()
            else $responder(
                if (exists($range-list))
                    then $docmodqry:RANGE_RETRIEVED
                    else $docmodqry:CONTENT_RETRIEVED,
                $output-uri,
                $response-format,
                if (empty($boundary))
                    then $response-type
                    else concat("multipart/mixed; boundary=",$boundary),
                if (empty($boundary))
                    then $request-charset
                    else (),
                $timestamp,
                docmodqry:make-content-range-header($start-range,$end-range,$binary-length)
                ),
            if (empty($trans-name)) then ()
            else eput:call-header($env, "vnd.marklogic.document-transform", $trans-name),

            if (not($with-read)) then
                if (empty($length-responder)) then ()
                else if (exists($start-range) and exists($end-range))
                then $length-responder($end-range - $start-range + 1)
                else if (empty($output)) then ()
                else $length-responder(xdmp:binary-size($output/binary()))
            else if (empty($boundary))
            then $output
            else
                xdmp:multipart-encode(
                    $boundary,
                    <multi:manifest>
                        <multi:part>
                            <http:headers>
                                <http:Content-Type>{$metadata-type}</http:Content-Type>
                                <http:Content-Disposition>attachment; filename="{docmodcom:escape-quoted($output-uri)
                                    }"; category={string-join(distinct-values($categories[not(. eq "content")]), "; category=")
                                    }; format={$metadata-format
                                }</http:Content-Disposition>
                            </http:headers>
                        </multi:part>
                        <multi:part>
                            <http:headers>{
                                <http:Content-Type>{$response-type}</http:Content-Type>,
                                <http:Content-Disposition>attachment; filename="{docmodcom:escape-quoted($output-uri)
                                    }"; category=content; format={$response-format}{
                                    if (empty($timestamp)) then ()
                                    else concat("; versionId=",string($timestamp))
                                }</http:Content-Disposition>,
                                if (not($actual-format = "binary") or $has-transform) then ()
                                else
                                    <http:Content-Length>{
                                        if (exists($start-range) and exists($end-range))
                                        then $end-range - $start-range + 1
                                        else xdmp:binary-size($output/binary())
                                    }</http:Content-Length>
                            }</http:headers>
                        </multi:part>
                    </multi:manifest>,
                    (
                        docmodqry:produce-metadata(
                            $headers,$params,$categories,true(),(),$uri,$metadata-type,true()
                            ),
                        if (exists($output))
                        then $output
                        else document {()}
                        )
                    )
            )
};

declare function docmodqry:get-bulk-documents(
    $headers    as map:map,
    $params     as map:map,
    $uris       as xs:string+,
    $categories as xs:string+,
    $with-read  as xs:boolean,
    $env        as map:map?
) as document-node()?
{
    let $boundary        := docmodcom:get-multipart-boundary(map:get($headers,"accept"))
    let $metadata-format := head((map:get($params,"format"), "xml"))
    let $responder       :=
        if (empty($env)) then ()
        else map:get($env,"responder")
    let $trans-name      :=
        if (not($categories = "content")) then ()
        else map:get($params,"transform")
    return (
        if (empty($responder)) then ()
        else $responder(
            $docmodqry:CONTENT_RETRIEVED,
            "bulk read as multipart/mixed",
            (),
            concat("multipart/mixed; boundary=",$boundary),
            (),
            (),
            ()
            ),
        if (empty($trans-name)) then ()
        else eput:call-header($env, "vnd.marklogic.document-transform", $trans-name),

        if (not($with-read)) then ()
        else docmodcom:bulk-read-documents(
            $params,$boundary,$categories,$metadata-format,$uris
            )
        )
};

declare function docmodqry:produce-content(
    $uri         as xs:string,
    $start-range as xs:long?,
    $end-range   as xs:long?,
    $content     as document-node()?
) as document-node()?
{
    if (empty($content))
    then docmodqry:read-content($uri)
    else if (exists($start-range)) then
        document {
            (: HTTP range is zero-based but xdmp:subbinary is one-based :)
            xdmp:subbinary($content/binary(), $start-range + 1, $end-range - $start-range + 1)
            }
    else $content
};

declare function docmodqry:head(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
    let $uris       := map:get($params,"uri")
    let $categories := docmodcom:select-category($params)
    let $is-content := ($categories = "content")
    let $_ := eput:response-add-host-cookie($headers, $params, $env)
    return
        (: many documents or not a combination of metadata and content and multipart :)
        if (count($uris) gt 1 or (
            not($is-content and count($categories) gt 1) and
            starts-with(map:get($headers,"accept"), "multipart/mixed")))
        then docmodqry:get-bulk-documents($headers,$params,$uris,$categories,false(),$env)
        else if ($is-content)
        then docmodqry:get-conditional-content($headers,$params,$categories,false(),$env)
        else docmodqry:get-metadata($headers,$params,$categories,false(),
            if (empty($env)) then ()
            else map:get($env,"responder"))
};

(:
    Low-level functions for document content and metadata
 :)
declare function docmodqry:read-content(
    $uri as xs:string
) as document-node()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or docmodqry:check-untraced()) then ()
    else lid:log($docmodqry:trace-id,"read-content",map:entry("uri",$uri)),

    let $doc := doc($uri)
    return
        if (exists($doc))
        then $doc
        else error((),"RESTAPI-NODOCUMENT",("content",$uri))
};

declare function docmodqry:check-document-exists(
    $uri as xs:string
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or docmodqry:check-untraced()) then ()
    else lid:log($docmodqry:trace-id,"check-document-exists",map:entry("uri",$uri)),

    if (doc-available($uri)) then ()
    else error((),"RESTAPI-NODOCUMENT",("document",$uri))
};

declare private function docmodqry:make-content-range-header(
    $start-range   as xs:long?,
    $end-range     as xs:long?,
    $binary-length as xs:long?
) as xs:string?
{
    if (empty($start-range)) then ()
    else "bytes "||$start-range||"-"||$end-range||"/"||$binary-length
};
