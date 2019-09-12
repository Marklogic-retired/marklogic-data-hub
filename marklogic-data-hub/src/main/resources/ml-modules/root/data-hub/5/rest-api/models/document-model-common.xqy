xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace docmodcom = "http://marklogic.com/rest-api/models/document-model-common";

import module namespace jsonbld = "http://marklogic.com/rest-api/lib/json-build"
    at "/MarkLogic/rest-api/lib/json-build.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
     at "/MarkLogic/json/json.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "/MarkLogic/rest-api/lib/endpoint-util.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "/MarkLogic/rest-api/lib/db-util.xqy";

import module namespace tformod = "http://marklogic.com/rest-api/models/transform-model"
    at "transform-model.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import schema namespace rapi = "http://marklogic.com/rest-api"
    at "restapi.xsd";

declare namespace http       = "xdmp:http";
declare namespace multi      = "xdmp:multipart";
declare namespace json-basic = "http://marklogic.com/xdmp/json/basic";
declare namespace sec        = "http://marklogic.com/xdmp/security";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $docmodcom:trace-id := "restapi.documents";

declare private variable $is-untraced := ();

declare function docmodcom:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced, lid:is-disabled($docmodcom:trace-id, ("restapi"))),

    $is-untraced
};

declare function docmodcom:list-metadata-categories(
) as xs:string*
{
    "collections", "permissions", "properties", "quality", "metadata-values"
};

declare function docmodcom:select-category(
    $params as map:map
) as xs:string*
{
    let $categories := map:get($params,"category")
    return
        if (empty($categories) or (count($categories) eq 1 and $categories = ""))
        then "content"
        else
            for $category in $categories
            order by $category
            return $category
};

declare function docmodcom:parse-metadata(
    $metadata-format as xs:string,
    $metadata-doc    as document-node()?
) as item()?
{
    if (empty($metadata-doc)) then ()
    else if ($metadata-format eq "json")
    then xdmp:from-json($metadata-doc)
    else $metadata-doc/node()
};

declare function docmodcom:parse-collections(
    $uri         as xs:string,
    $meta-parsed as item()?
) as xs:string*
{
    if (empty($meta-parsed)) then ()
    else
        typeswitch($meta-parsed)
        case map:map
        return docmodcom:convert-json-collection($uri,$meta-parsed)
        case element(rapi:metadata)
        return $meta-parsed/rapi:collections/rapi:collection/string(.)
        default return ()
};

declare function docmodcom:parse-permissions(
    $uri         as xs:string,
    $meta-parsed as item()?
) as element(sec:permission)*
{
    if (empty($meta-parsed)) then ()
    else
        typeswitch($meta-parsed)
        case map:map
        return docmodcom:convert-json-permissions($uri,$meta-parsed)
        case element(rapi:metadata)
        return $meta-parsed/rapi:permissions/docmodcom:convert-permissions($uri,rapi:permission)
        default return ()
};

declare function docmodcom:parse-properties(
    $uri         as xs:string,
    $meta-parsed as item()?
) as element()*
{
    if (empty($meta-parsed)) then ()
    else
        typeswitch($meta-parsed)
        case map:map
        return docmodcom:convert-json-properties($uri,$meta-parsed)
        case element(rapi:metadata)
        return $meta-parsed/prop:properties/(* except prop:*)
        default return ()
};

declare function docmodcom:parse-quality(
    $uri         as xs:string,
    $meta-parsed as item()?
) as xs:int?
{
    if (empty($meta-parsed)) then ()
    else
        typeswitch($meta-parsed)
        case map:map
        return docmodcom:convert-json-quality($uri,$meta-parsed)
        case element(rapi:metadata)
        return $meta-parsed/rapi:quality/data(.)
        default return ()
};

declare function docmodcom:parse-metadata-values(
    $uri         as xs:string,
    $meta-parsed as item()?
) as map:map?
{
    if (empty($meta-parsed)) then ()
    else
        typeswitch($meta-parsed)
        case map:map
        return docmodcom:convert-json-metadata-values($uri,$meta-parsed)
        case element(rapi:metadata)
        return docmodcom:convert-metadata-values($uri,$meta-parsed/rapi:metadata-values/rapi:metadata-value)
        default return ()
};

declare function docmodcom:convert-json-collection(
    $uri as xs:string,
    $map as map:map?
) as xs:string*
{
    if (empty($map)) then ()
    else
        let $collections := jsonbld:get-map-sequence($map,"collections")
        return
            if (empty($collections)) then ()
            else if ($collections = "")
            then error((),"RESTAPI-INVALIDCONTENT", "empty collections are not allowed. uri: "||$uri)
            else if ($collections instance of xs:string+)
            then $collections
            else if ($collections instance of xs:untypedAtomic+) then
                for $collection in $collections
                return xs:string($collection)
            else error((),"RESTAPI-INVALIDCONTENT", "collections not strings or untyped atomics. uri: "||$uri)
};

declare function docmodcom:convert-json-permissions(
    $uri as xs:string,
    $map as map:map?
) as element(sec:permission)*
{
    if (empty($map)) then ()
    else
        let $permissions := jsonbld:get-map-sequence($map,"permissions")
        return
            if (empty($permissions)) then ()
            else docmodcom:convert-permissions(
                $uri,
                for $permission in $permissions
                let $role-name := map:get($permission,"role-name")
                return validate strict {
                    <rapi:permission>{
                        <rapi:role-name>{$role-name}</rapi:role-name>,
                        for $capability in jsonbld:get-map-sequence($permission,"capabilities")
                        return <rapi:capability>{$capability}</rapi:capability>
                    }</rapi:permission>
                    }
                )
};

declare function docmodcom:convert-json-properties(
    $uri as xs:string,
    $map as map:map?
) as element()*
{
    if (empty($map)) then ()
    else
        let $props-raw := jsonbld:get-map-sequence($map,"properties")
        let $props-xml :=
            if (empty($props-raw)) then ()
            else if (not($props-raw instance of map:map))
            then error((),"RESTAPI-INVALIDCONTENT",("properties not an object. uri: "||$uri))
            else map:get($props-raw,"$ml.xml")
        let $properties :=
            if (empty($props-xml))
            then $props-raw
            else
                typeswitch($props-xml)
                case xs:string        return xdmp:unquote($props-xml,(),("format-xml"))/element()
                case xs:untypedAtomic return xdmp:unquote($props-xml,(),("format-xml"))/element()
                default return error((),"RESTAPI-INVALIDCONTENT",
                    ("$ml.xml must provide XML properties as a string. uri: "||$uri))
        return
            typeswitch($properties)
            case map:map return (
                let $system-props := map:get($properties,"$ml.prop")
                return
                    if (empty($system-props)) then ()
                    else (
                        for $system-name in map:keys($system-props)
                        where $system-name ne "last-modified"
                        return element {concat("prop:",$system-name)} {
                            map:get($system-props,$system-name)
                            },

                        map:delete($properties,"$ml.prop")
                        ),

                json:transform-from-json($properties, json:config("basic"))/*
                )
            case element(prop:properties) return (
                for $property in $properties/(element() except prop:last-modified)
                return
                    element {node-name($property)} {
                        $property/@*,
                        $property/namespace::*,
                        $property/node()
                        },
                if (exists($properties/rapi:json-serialization)) then ()
                else <rapi:json-serialization as="xml"/>
                )
            case element() return error((),"RESTAPI-INVALIDCONTENT",
                ("$ml.xml must provide XML prop:properties as a string. uri: "||$uri))
            default return ()
};

declare function docmodcom:convert-json-quality(
    $uri as xs:string,
    $map as map:map?
) as xs:integer?
{
    if (empty($map)) then ()
    else
        let $quality := map:get($map,"quality")
        return
            if (empty($quality)) then ()
            else if ($quality instance of xs:integer)
            then $quality
            else if ($quality castable as xs:integer)
            then xs:integer($quality)
            else error((),"RESTAPI-INVALIDCONTENT",("quality not an integer. uri: "||$uri))
};

declare function docmodcom:convert-json-metadata-values(
    $uri as xs:string,
    $map as map:map?
) as map:map
{
    if (empty($map)) then map:new()
    else
        let $values := jsonbld:get-map-sequence($map,"metadataValues")
        return
            if (empty($values)) then map:new()
            else if (not($values instance of map:map))
            then error((),"RESTAPI-INVALIDCONTENT",("metadataValues not an object. uri: "||$uri))
            else $values
};

declare function docmodcom:convert-metadata-values(
    $uri as xs:string,
    $values as element(rapi:metadata-value)*
) as map:map?
{
   if (empty($values)) then ()
   else
       let $metadata := map:map()
       return (
           for $v in $values
           return map:put($metadata,string($v/@key),string($v)),

           $metadata
           )
};

declare function docmodcom:convert-permissions(
    $uri         as xs:string,
    $permissions as element(rapi:permission)*
) as element(sec:permission)*
{
    if (empty($permissions)) then ()
    else
        for $permission in $permissions
        let $capabilities := $permission/rapi:capability
        let $role-name    := $permission/rapi:role-name/string(.)
        let $role-id      := eput:lookup-role-ids($role-name)
        where exists($role-id)
        return
            if (empty($role-id))
            then error((),"RESTAPI-INVALIDCONTENT",("no role id for permissions. uri: "||$uri))
            else $capabilities /
                <sec:permission>{
                    $role-id,
                    <sec:capability>{string(.)}</sec:capability>
                }</sec:permission>
};


declare function docmodcom:make-role-map(
    $permissions as element(sec:permission)*
) as map:map?
{
    if (empty($permissions)) then ()
    else
        let $role-map := map:map()
        return (
            for $permission in $permissions
            let $role-id := $permission/sec:role-id/string(.)
            return map:put(
                $role-map,
                $role-id,
                (map:get($role-map,$role-id), $permission/sec:capability/string(.))
                ),

            $role-map
            )
};

declare function docmodcom:input-format(
    $uri          as xs:string?,
    $content-type as xs:string?,
    $format       as xs:string?
) as xs:string?
{
    if (empty($uri)) then ()
    else
        let $uri-type := eput:uri-content-type($uri)
            [. ne "application/x-unknown-content-type"]
        return
            if (exists($uri-type))
            then docmodcom:get-uri-format($uri)
            else
                let $type :=
                    if (empty($content-type)) then ()
                    else eput:content-type-format($content-type)
                return
                    if (exists($type))
                    then $type
                    else $format
};

(: used when getting request body :)
declare function docmodcom:get-content-format(
    $headers as map:map,
    $params  as map:map
) as xs:string?
{
    let $content-type := head(map:get($headers,"content-type"))
    return
        if (starts-with($content-type,"multipart/"))
        then "binary"
        else
            let $uri      := map:get($params,"uri")
            let $uri-type := eput:uri-content-type($uri)
                [. ne "application/x-unknown-content-type"]
            let $header-format  :=
                if (exists($uri-type))
                then docmodcom:get-uri-format($uri)
                else if (empty($content-type) or $content-type eq "*/*") then ()
                else docmodcom:get-type-format(dbut:tokenize-header($content-type))
            return
                if (exists($header-format))
                then $header-format
                else map:get($params,"format")
};

declare function docmodcom:get-type-format(
    $types as xs:string*,
    $uri   as xs:string?
) as xs:string?
{
    let $type-format := docmodcom:get-type-format($types)
    return
        if (exists($type-format))
        then $type-format
        else docmodcom:get-uri-format($uri)
};

declare function docmodcom:get-type-format(
    $types as xs:string*
) as xs:string?
{
    if (empty($types)) then ()
    else
        let $format := eput:get-outbound-type-format(head($types))
        return
            if (exists($format))
            then $format
            else docmodcom:get-type-format(tail($types))
};

declare function docmodcom:get-uri-format(
    $uri as xs:string?
) as xs:string?
{
    if (empty($uri)) then ()
    else xdmp:uri-format($uri)
};

declare function docmodcom:get-metadata-input-type(
    $headers as map:map,
    $params  as map:map,
    $uri     as xs:string,
    $default as xs:string?
) as xs:string?
{
    let $types := dbut:tokenize-header(map:get($headers,"content-type"))
    let $match-types := $types[. = ("application/xml","text/xml","application/json","text/json")]
    return
    if (exists($match-types))
    then head($match-types)
    else
        let $format := map:get($params,"format")
        return
        if (exists($format)) then
            if ($format = ("json","xml"))
            then concat("application/",$format)
            else error((),"REST-INVALIDPARAM",concat(
                "metadata must be JSON or XML.  Received format: ",$format," for ",$uri
                ))
        (: test types after format because types might be defaulted by tools :)
        else if (exists($types))
        then error((),"RESTAPI-INVALIDMIMETYPE",concat(
            "metadata must match application/json or application/xml. Received mimetype: ",
            string-join($types,", "),
            " for ", $uri
            ))
        else if (exists($default))
        then $default
        else "application/xml"
};

declare function docmodcom:get-metadata-output-type(
    $headers as map:map,
    $params  as map:map,
    $uri     as xs:string,
    $default as xs:string?
) as xs:string?
{
    let $format := map:get($params,"format")
    return
    if (exists($format)) then
        if ($format = ("json","xml"))
        then concat("application/",$format)
        else error((),"REST-INVALIDPARAM",concat(
            "metadata must be JSON or XML.  Received format: ",$format," for ",$uri
            ))
    else
        let $types := eput:get-accept-types($headers)
        let $match-types := $types[. = ("application/xml","text/xml","application/json","text/json")]
        return
        if (exists($types)) then
            if (exists($match-types))
            then head($match-types)
            else error((),"RESTAPI-INVALIDMIMETYPE",concat(
                "metadata must match application/json or application/xml. Received mimetype: ",
                string-join($types,", "),
                " for ", $uri
                ))
        else if (exists($default))
        then $default
        else "application/xml"
};

declare function docmodcom:get-default-transform(
) as xs:string?
{
    let $is-writer      := (xdmp:get-current-roles() = xdmp:role("rest-writer"))
    let $is-transformed :=
        if (not($is-writer)) then true()
        else
            let $transformed :=
                map:get(eput:get-properties-map(),"document-transform-all")
            return
                if (empty($transformed) or not($transformed instance of xs:boolean))
                then true()
                else $transformed
    return
        if (not($is-transformed)) then ()
        else map:get(eput:get-properties-map(),"document-transform-out")[not(. eq "")]
};

declare function docmodcom:check-metadata-provided(
    $uri                  as xs:string,
    $specified-categories as xs:string*,
    $provided-categories  as xs:string*
) as xs:boolean
{
    if (empty($specified-categories) and empty($provided-categories))
    then false()
    else if ($specified-categories = "metadata")
    then exists($provided-categories)
    else if (exists($specified-categories[not(. = $provided-categories)]))
    then error((),"REST-INVALIDPARAM",
        "metadata specified but not provided: "||
        string-join($specified-categories[not(. = $provided-categories)],", ")||
        " for uri: "||$uri
        )
    else if (exists($provided-categories[not(. = $specified-categories)]))
    then error((),"REST-INVALIDPARAM",
        "metadata provided but not specified: "||
        string-join($provided-categories[not(. = $specified-categories)],", ")||
        " for uri: "||$uri
        )
    else true()
};

declare function docmodcom:get-update-policy(
) as xs:string?
{
    let $prop-map      := eput:get-properties-map()
    let $update-policy := map:get($prop-map,"update-policy")
    return
        if (exists($update-policy))
        then $update-policy
        else
            let $content-versions := map:get($prop-map,"content-versions")
            return
                if (empty($content-versions)) then ()
                else
                    switch($content-versions)
                    case "required" return "version-required"
                    case "optional" return "version-optional"
                    case "none"     return "merge-metadata"
                    default         return error((),"RESTAPI-INTERNALERROR", concat(
                        "unknown value of content-versions enumeration: ",
                        $content-versions
                        ))
};

declare function docmodcom:get-etag(
    $headers as map:map,
    $hname   as xs:string,
    $uri     as xs:string
) as xs:integer?
{
    let $etag-raw := map:get($headers,$hname)
    let $etag     :=
        if (empty($etag-raw) or $etag-raw eq "") then ()
        else translate($etag-raw, '"', '')
    return
        if (empty($etag) or $etag eq "") then ()
        else if ($etag castable as xs:integer)
        then xs:integer($etag)
        else error((),"REST-INVALIDPARAM",
            $hname||"header is not an integer: "||$etag-raw||
            " for uri: "||$uri
            )
};

declare function docmodcom:get-multipart-boundary(
    $mime-types as xs:string*
) as xs:string?
{
    if (empty($mime-types))
    then error((),"RESTAPI-INVALIDMIMETYPE",(
            "multipart request must have multipart/mixed instead of empty mime type",
            ()
            ))
    else
        let $multipart-types := $mime-types[starts-with(.,"multipart/mixed")]
        let $boundaries      := $multipart-types!substring-after(.,"boundary=")[. ne ""]
        return
            if (empty($multipart-types))
            then error((),"RESTAPI-INVALIDMIMETYPE",(
                "multipart request must have multipart/mixed mime type instead of: ",
                    string-join($mime-types,", "),
                ()
                ))
            else if (exists($boundaries))
            then replace(head($boundaries), '^\s*"([^"]+)"\s*$', "$1")
            else concat("ML_BOUNDARY_", string(xdmp:random()))
};

declare function docmodcom:bulk-read-documents(
    $params          as map:map,
    $boundary        as xs:string,
    $categories      as xs:string*,
    $metadata-format as xs:string?,
    $uris            as xs:string+
) as document-node()?
{
    let $is-content := (empty($categories) or $categories = "content")
    let $docs       :=
        if (not($is-content)) then ()
        else doc($uris)
    let $docs-uris   :=
        if ($is-content) then ()
        else $uris
    return docmodcom:bulk-read-documents(
        $params,$boundary,$categories,$metadata-format,$docs-uris,$docs,(),()
        )
};

declare function docmodcom:bulk-read-documents(
    $params          as map:map,
    $boundary        as xs:string,
    $categories      as xs:string*,
    $metadata-format as xs:string?,
    $uris            as xs:string*,
    $docs            as document-node()*,
    $first-headers   as element(http:headers)?,
    $first-body      as document-node()?
) as document-node()?
{
    if (exists($first-headers) eq exists($first-body)) then ()
    else error((),"RESTAPI-INTERNALERROR", concat("existence mismatch between ",
        exists($first-headers)," first-headers and ",exists($first-body)," first-body")),

    let $doc-array := json:array()
    let $headers   := docmodcom:make-collection-headers(
        $params,$categories,$metadata-format,$uris,$docs,$doc-array
        )
    return docmodcom:bulk-read-documents(
        $boundary,
        ($first-headers, $headers),
        ($first-body, json:array-values($doc-array))
        )
};

declare function docmodcom:bulk-read-documents(
    $boundary as xs:string,
    $headers  as element(http:headers)*,
    $bodies   as document-node()*
) as document-node()?
{
    let $bodies :=
        if (empty($headers) and empty($bodies))
        then ()
        else $bodies
    return
        document {
            xdmp:multipart-encode(
                $boundary,
                <multi:manifest>{
                    for $header in $headers
                    return <multi:part>{$header}</multi:part>
                }</multi:manifest>,
                $bodies
                )
        }
};

declare private function docmodcom:make-collection-headers(
    $params          as map:map,
    $categories      as xs:string*,
    $metadata-format as xs:string?,
    $uris            as xs:string*,
    $docs            as document-node()*,
    $doc-array       as json:array
) as element(http:headers)*
{
    if (empty($uris) and empty($docs)) then ()
    else (
        if ($is-untraced or docmodcom:check-untraced()) then ()
        else lid:log(
            $docmodcom:trace-id,"make-collection-headers",
            map:entry("params", $params)=>map:with("categories", $categories)
            =>map:with("metadata-format", $metadata-format)=>map:with("uris", $uris)
            =>map:with("doc-count", count($docs))
            ),

        let $is-content   := ($categories = "content")
        let $meta-cat     :=
            if ($is-content)
            then $categories[. ne "content"]
            else $categories
        let $is-meta      := exists($meta-cat)
        let $meta-format  :=
            if (not($is-meta)) then ()
            else head(($metadata-format,"xml"))
        let $meta-type    :=
            if (not($is-meta)) then ()
            else <http:Content-Type>application/{$meta-format}</http:Content-Type>
        let $meta-header  :=
            if (not($is-meta)) then ()
            else concat(
                "category=",string-join($meta-cat,"; category="),"; format=",$meta-format
                )
        let $is-meta-xml  :=
            if (not($is-meta)) then ()
            else ($meta-format eq "xml")
        let $doc-items    :=
            if (not($is-content) or exists($docs))
            then $docs
            else doc($uris)
        let $uri-items    :=
            if (exists($uris) and (not($is-content) or exists($docs)))
            then $uris
            else
                (: $uris order does not affect doc() sequence :)
                for $doc in $docs
                return document-uri($doc)
        let $trans-name   :=
            if (empty($doc-items)) then ()
            else map:get($params,"transform")
        let $trans-items  :=
            if (empty($trans-name)) then ()
            else tformod:apply-transform-all(
                $trans-name,
                tformod:extract-transform-params($params),
                for $doc at $i in $doc-items
                return eput:make-request(subsequence($uri-items,$i,1), $doc)
                )
        for $doc-uri at $i in $uri-items
        let $timestamp      :=
            if (not($is-content)) then ()
            else docmodcom:get-timestamp($doc-uri)
        let $trans-output   :=
            if (empty($trans-items)) then ()
            else subsequence($trans-items,$i,1)
        let $trans-ctxt     :=
            if (empty($trans-output)) then ()
            else map:get($trans-output,"context")
        let $content-doc    :=
            if (empty($doc-items)) then ()
            else if (exists($trans-output))
            then map:get($trans-output,"result")
            else subsequence($doc-items,$i,1)
        let $content-uri    :=
            if (empty($trans-ctxt))
            then $doc-uri
            else head((map:get($trans-ctxt,"uri"),$doc-uri))
        let $content-format :=
            if (not($is-content)) then ()
            else if (exists($content-doc))
            then eput:get-document-format($content-doc)
            else docmodcom:get-uri-format($content-uri)
        let $content-type   :=
            if (not($is-content)) then ()
            else
                let $trans-type :=
                    if (empty($trans-ctxt)) then ()
                    else map:get($trans-ctxt,"output-type")
                return
                    if (exists($trans-type))
                    then $trans-type
                    else
                        let $uri-type := eput:uri-content-type($content-uri)
                        return
                            if (exists($uri-type) and $uri-type ne "application/x-unknown-content-type")
                            then $uri-type
                            else eput:get-format-type($content-format)
        return (
            if (empty($meta-type) or (not($is-content) and not(doc-available($doc-uri))))
            then ()
            else (
                json:array-push($doc-array, document {
                    if ($is-meta-xml)
                    then docmodcom:read-metadata-xml($doc-uri,$meta-cat)
                    else docmodcom:read-metadata-json($doc-uri,$meta-cat)
                    }),

                (: Filename must be double quoted and double quotes must be escaped:
                   http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html and
                   http://www.w3.org/Protocols/rfc2616/rfc2616-sec2.html#sec2.1 :)
                <http:headers>
                    {$meta-type}
                    <http:Content-Disposition>attachment; filename="{
                        docmodcom:escape-quoted($content-uri)
                        }"; {$meta-header
                    }</http:Content-Disposition>
                </http:headers>
                ),

            if (not($is-content)) then ()
            else (
                json:array-push($doc-array,
                    if (exists($content-doc))
                    then $content-doc
                    else document {()}
                    ),
                <http:headers>
                    <http:Content-Type>{$content-type}</http:Content-Type>
                    <http:Content-Disposition>attachment; filename="{
                        docmodcom:escape-quoted($content-uri)
                        }"; category=content; format={$content-format}{
                        if (empty($timestamp)) then ()
                        else concat("; versionId=",string($timestamp))
                    }</http:Content-Disposition>
                </http:headers>
                )
            )
        )
};

(:
    collective metadata functions
 :)
declare function docmodcom:read-metadata-xml(
    $uri        as xs:string,
    $categories as xs:string*
) as element(rapi:metadata)?
{
    if (empty($categories)) then ()
    else
        <rapi:metadata uri="{$uri}">{
            attribute xsi:schemaLocation {"http://marklogic.com/rest-api restapi.xsd"},
            if (not($categories = ("collections","metadata"))) then ()
                else
                    <rapi:collections>{
                        docmodcom:read-collections($uri) ! <rapi:collection>{.}</rapi:collection>
                    }</rapi:collections>,
            if (not($categories = ("permissions","metadata"))) then ()
                else
                    <rapi:permissions>{
                        let $permissions := docmodcom:read-permissions($uri)
                        let $role-map    := docmodcom:make-role-map($permissions)
                        let $role-ids    :=
                            if (empty($role-map)) then ()
                            else map:keys($role-map)[. ne ""]
                        let $role-names  :=
                                for $role-id in $role-ids
                                return xdmp:role-name(xs:unsignedLong($role-id))
                        for $role-id at $i in $role-ids
                        return
                            <rapi:permission>{
                                <rapi:role-name>{subsequence($role-names,$i,1)}</rapi:role-name>,
                                map:get($role-map,$role-id) ! <rapi:capability>{.}</rapi:capability>
                            }</rapi:permission>
                    }</rapi:permissions>,
            if (not($categories = ("properties","metadata"))) then ()
                else
                    let $properties := docmodcom:read-properties($uri)
                    return
                        if (exists($properties))
                        then $properties
                        else <prop:properties/>,
            if (not($categories = ("quality","metadata"))) then ()
                else
                    <rapi:quality>{
                        head((docmodcom:read-quality($uri), 0))
                    }</rapi:quality>,
            if (not($categories = ("metadata-values","metadata"))) then ()
            else <rapi:metadata-values>{
                 let $values := xdmp:document-get-metadata($uri)
                 return
                 if (empty($values)) then ()
                 else
                 for $key in map:keys($values)
                 return <rapi:metadata-value key="{$key}">{map:get($values,$key)}</rapi:metadata-value>
                 }</rapi:metadata-values>
       }</rapi:metadata>
};

declare function docmodcom:read-metadata-json(
    $uri        as xs:string,
    $categories as xs:string*
) as xs:string*
{
    if (empty($categories)) then ()
    else
        jsonbld:object((
            if (not($categories = ("collections","metadata"))) then ()
                else ("collections", jsonbld:array(jsonbld:strings(docmodcom:read-collections($uri)))),
            if (not($categories = ("permissions","metadata"))) then ()
                else (
                    "permissions",
                    jsonbld:array(
                        let $permissions := docmodcom:read-permissions($uri)
                        let $role-map    := docmodcom:make-role-map($permissions)
                        let $role-ids    :=
                            if (empty($role-map)) then ()
                            else map:keys($role-map)[. ne ""]
                        let $role-names  :=
                                for $role-id in $role-ids
                                return xdmp:role-name(xs:unsignedLong($role-id))
                        for $role-id at $i in $role-ids
                        return jsonbld:object((
                            "role-name",    jsonbld:strings(subsequence($role-names,$i,1)),
                            "capabilities", jsonbld:array(jsonbld:strings(map:get($role-map,$role-id)))
                            ))
                        )
                    ),
            if (not($categories = ("properties","metadata"))) then ()
                else (
                    "properties",

                    (: Assumptions:
                     : * basic props occur only with system props
                     : * basic props convert using the basic transform
                     : * system props contain only text and do not repeat
                     :)
                    let $properties  := docmodcom:read-properties($uri)
                    let $json-serial := $properties/rapi:json-serialization
                    return
                        if ($json-serial/@as/string(.) eq "xml")
                        then jsonbld:object((
                            jsonbld:key("$ml.xml"),
                            jsonbld:value(xdmp:quote(
                                $properties,
                                map:entry("method","xml")
                                =>map:with("indent","no")
                                ))
                            ))
                        else
                            let $system-props := $properties/prop:*
                            let $system-pair  :=
                                if (empty($system-props)) then ()
                                else (
                                    jsonbld:key("$ml.prop"),
                                    jsonbld:object(
                                        for $system-prop in $system-props
                                        return (
                                            jsonbld:key(local-name($system-prop)),
                                            jsonbld:value(
                                                if (empty($system-prop/element()))
                                                then data($system-prop)
                                                else xdmp:quote($system-prop)
                                                )
                                            )
                                        )
                                    )
                            let $basic-props  := $properties/json-basic:*
                            let $other-props  :=
                                if (exists($basic-props)) then ()
                                else $properties/* except $system-props
                            let $other-map    :=
                                if (empty($other-props)) then ()
                                else
                                    let $map := map:map()
                                    return (
                                        for $other-prop in $other-props
                                        let $other-name  := local-name($other-prop)
                                        let $other-value :=
                                            if (exists($other-prop/*))
                                            then $other-prop/*
                                            else data($other-prop)
                                        return map:put(
                                            $map,
                                            $other-name,
                                            (map:get($map,$other-name), $other-value)
                                            ),

                                        $map
                                        )
                            return
                                if (exists($basic-props)) then
                                    let $object := json:transform-to-json-string(
                                        <json-basic:json type="object">{
                                            $basic-props
                                        }</json-basic:json>,
                                        json:config("basic")
                                        )
                                    return
                                        if (empty($system-pair))
                                        then $object
                                        else concat(
                                            '{',
                                            (: get the keys from the object :)
                                            substring($object,2,string-length($object)-2), ',',

                                            string-join($system-pair,':'),
                                            '}'
                                            )
                                else jsonbld:object((
                                    if (empty($other-map)) then ()
                                    else
                                        let $full-cfg :=json:config("full")
                                        for $other-name in map:keys($other-map)
                                        let $other-values :=
                                            for $other-value in map:get($other-map,$other-name)
                                            return
                                                if ($other-value instance of element())
                                                then json:transform-to-json-string($other-value,$full-cfg)
                                                else jsonbld:value($other-value)
                                        return (
                                            jsonbld:key($other-name),

                                            if (count($other-values) gt 1 or $other-values instance of element())
                                            then jsonbld:array($other-values)
                                            else $other-values
                                            ),

                                    $system-pair
                                    ))
                    ),
            if (not($categories = ("quality","metadata"))) then ()
               else ("quality", head((docmodcom:read-quality($uri), 0))),
            if (not($categories = ("metadata-values", "metadata"))) then ()
            else ("metadataValues",
                  jsonbld:object(
                     let $values := xdmp:document-get-metadata($uri)
                     return
                     if (empty($values)) then ()
                     else
                     for $key in map:keys($values)
                     return ($key,jsonbld:value(map:get($values,$key))) ))

            ))
};

declare function docmodcom:read-collections(
    $uri as xs:string
) as xs:string*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or docmodcom:check-untraced()) then ()
    else lid:log($docmodcom:trace-id,"read-collections",map:entry("uri",$uri)),

    xdmp:document-get-collections($uri)
};

declare function docmodcom:read-permissions(
    $uri as xs:string
) as element(sec:permission)*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or docmodcom:check-untraced()) then ()
    else lid:log($docmodcom:trace-id,"read-permissions",map:entry("uri",$uri)),

    xdmp:document-get-permissions($uri)
};

declare function docmodcom:read-properties(
    $uri as xs:string
) as element(prop:properties)?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or docmodcom:check-untraced()) then ()
    else lid:log($docmodcom:trace-id,"read-properties",map:entry("uri",$uri)),

    xdmp:document-properties($uri)/*
};

declare function docmodcom:read-quality(
    $uri as xs:string
) as xs:integer?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

    if ($is-untraced or docmodcom:check-untraced()) then ()
    else lid:log($docmodcom:trace-id,"read-quality",map:entry("uri",$uri)),

    xdmp:document-get-quality($uri)
};

declare function docmodcom:get-timestamp(
    $uri as xs:string
) as xs:integer?
{
    if (docmodcom:get-update-policy() = ("merge-metadata","overwrite-metadata"))
    then ()
    else (
        if ($is-untraced or docmodcom:check-untraced()) then ()
        else lid:log($docmodcom:trace-id,"get-timestamp",map:entry("uri",$uri)),

        xdmp:document-timestamp($uri)
        )
};

declare function docmodcom:escape-quoted(
   $uri as xs:string
) as xs:string
{
   replace(replace($uri, '\\', '\\\\'), '"', '\\"')
};
