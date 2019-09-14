xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace docmodupd = "http://marklogic.com/rest-api/models/document-model-update";

import module namespace isys-filter = "http://marklogic.com/isys-filter"
       at "/MarkLogic/conversion/isys-filter.xqy";

import module namespace lnk = "http://marklogic.com/cpf/links"
   at "/MarkLogic/cpf/links.xqy";

import module namespace json = "http://marklogic.com/xdmp/json"
    at "/MarkLogic/json/json.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "/MarkLogic/rest-api/lib/endpoint-util.xqy";

import module namespace transmod = "http://marklogic.com/rest-api/models/transaction-model"
    at "/MarkLogic/rest-api/models/transaction-model.xqy";

import module namespace tformod = "http://marklogic.com/rest-api/models/transform-model"
    at "transform-model.xqy";

import module namespace dbut = "http://marklogic.com/rest-api/lib/db-util"
    at "/MarkLogic/rest-api/lib/db-util.xqy";

import module namespace json-path = "http://marklogic.com/appservices/json-path"
    at "/MarkLogic/appservices/utils/json-path.xqy";

import module namespace replib = "http://marklogic.com/rest-api/lib/replace-lib"
    at "/MarkLogic/rest-api/lib/replace-lib.xqy";

import schema namespace rapi = "http://marklogic.com/rest-api"
    at "restapi.xsd";

import module namespace docmodcom = "http://marklogic.com/rest-api/models/document-model-common"
    at "document-model-common.xqy";

(: needed for patch :)
import module namespace docmodqry = "http://marklogic.com/rest-api/models/document-model-query"
    at "document-model-query.xqy";

import module namespace temporal = "http://marklogic.com/xdmp/temporal" at "/MarkLogic/temporal.xqy";

declare namespace prop      = "http://marklogic.com/xdmp/property";
declare namespace sec       = "http://marklogic.com/xdmp/security";
declare namespace xhtml     = "http://www.w3.org/1999/xhtml";
declare namespace protect   = "temporal:document-protect";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $docmodupd:trace-id := "restapi.documents.update";

declare private variable $is-untraced := ();

declare function docmodupd:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($docmodupd:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

declare variable $docmodupd:DOCUMENT_CREATED    := "DOCUMENT_CREATED";
declare variable $docmodupd:CONTENT_UPDATED     := "CONTENT_UPDATED";
declare variable $docmodupd:METADATA_UPDATED    := "METADATA_UPDATED";
declare variable $docmodupd:DOCUMENT_DELETED    := "DOCUMENT_DELETED";
declare variable $docmodupd:METADATA_DELETED    := "METADATA_DELETED";
declare variable $docmodupd:UNCHANGED_PATCH     := "UNCHANGED_PATCH";
declare variable $docmodupd:BULK_CHANGE_WRITTEN := "BULK_CHANGE_WRITTEN";
declare variable $docmodupd:DOCUMENT_PROTECTED  := "DOCUMENT_PROTECTED";
declare variable $insert-ns                     := "xdmp:document-insert";
declare variable $temporal-insert-ns            := "xdmp:document-insert";
declare variable $load-ns                       := "xdmp:document-load";
declare variable $temporal-load-ns              := "temporal:document-load";


(:
    high-level request functions
 :)
declare function docmodupd:patch(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    let $uri              := map:get($params,"uri")
    let $categories       := docmodcom:select-category($params)
    let $is-content       := ($categories = "content")
    let $meta-cat         :=
        if ($is-content)
        then $categories[. ne "content"]
        else $categories
    let $error-list       := json:array()
    let $patch-type       := eput:get-inbound-content-type($params,$headers)
    let $patch-format     := substring-after($patch-type,"/")
    let $patch-content    :=
        if ($patch-format ne "json") then ()
        else map:map()
    let $temporal-collection := map:get($params,"temporal-collection")
    let $temporal-document-uri := map:get($params,"temporal-document")
    let $source-document-uri := map:get($params,"source-document")
    let $_ := if (empty($temporal-collection) and exists($temporal-document-uri))
              then error((),"RESTAPI-INVALIDREQ","The temporal-collection parameter must be specified with the temporal-document parameter.")
              else ()
    let $_ := if (empty($temporal-document-uri) and exists($source-document-uri))
              then error((),"RESTAPI-INVALIDREQ","The temporal-document parameter must be specified with the source-document parameter.")
              else ()
    let $patch-uri :=  docmodupd:lock-uris(if (empty($source-document-uri)) then $uri else $source-document-uri)
    let $patch            :=
        let $raw-patch       :=
            map:get($env,"body-getter")($patch-format)/node()
        let $converted-patch :=
            if (empty($raw-patch))
            then error((),"RESTAPI-INVALIDREQ","empty patch for uri: "||$patch-uri)
            else docmodupd:convert-patch($patch-uri,$raw-patch,$patch-content,$error-list)
        return
            if (json:array-size($error-list) eq 0)
            then $converted-patch
            else error((),"RESTAPI-INVALIDREQ",concat(
                "invalid patch for uri ",$patch-uri,": ",
                string-join(json:array-values($error-list,true()), "; ")
                ))
    let $get-headers      :=
        let $map := map:map()
        return (
            map:put($map,"accept",$patch-type),
            $map
            )
    let $get-params       :=
        let $map := map:map()
        return (
            map:put($map, "uri",    $patch-uri),
            map:put($map, "format", $patch-format),
            $map
            )
    let $metadata-in      :=
        if (empty($meta-cat)) then ()
        else
            let $metadata-raw := docmodqry:produce-metadata(
                $get-headers,$get-params,$categories,true(),(),$patch-uri,$patch-type,true()
                )
            return
                if (exists($metadata-raw/rapi:metadata))
                then $metadata-raw
                else if (exists($metadata-raw/text()))
                then $metadata-raw/text()/xdmp:unquote(string(.))
                else error((),"RESTAPI-INTERNALERROR","could not convert metadata")
    let $content-in       :=
        if (not($is-content)) then ()
        else (
            docmodupd:check-content-version($headers,$patch-uri),

            let $content-raw := docmodqry:get-conditional-content(
                $get-headers,$get-params,"content",true(),()
                )
            let $content-format :=
                typeswitch($content-raw/node())
                case object-node() return "json"
                case array-node()  return "json"
                case element()     return "xml"
                default return error((),"RESTAPI-INVALIDCONTENT",
                    "can only apply patch to JSON or XML content: "||$patch-uri)
            return
                if ($content-format eq $patch-format)
                then $content-raw
                else error((),"RESTAPI-INVALIDCONTENT",concat(
                    "format mismatch for ",$patch-format," patch and ",$content-format," content: ",$patch-uri
                    ))
            )
    let $function-structs :=
        let $fstructs := docmodupd:make-apply-function-structs($patch,$error-list)
        return
            if (json:array-size($error-list) gt 0)
                then error((),"RESTAPI-INVALIDREQ",concat(
                    "invalid replace apply operations for uri ",$patch-uri,": ",
                    string-join(json:array-values($error-list,true()), ", ")
                    ))
            else $fstructs
    let $xqy-function-map :=
        let $xqy-functions := head($function-structs)
        return
            if (empty($xqy-functions) or map:count($xqy-functions) eq 0) then ()
            else $xqy-functions
    let $sjs-apply-array :=
        if (empty($function-structs)) then ()
        else tail($function-structs)
    let $metadata-deltas  :=
        if (empty($metadata-in)) then ()
        else map:map()
    let $metadata-out     :=
        if (empty($metadata-in)) then ()
        else
            let $metadata-raw := docmodupd:apply-metadata-patch(
                $metadata-in,$patch-format,$patch,$patch-content,
                $xqy-function-map,$sjs-apply-array,$error-list
                )
            return
                if (json:array-size($error-list) gt 0)
                then error((),"RESTAPI-INVALIDREQ",concat(
                    "invalid metadata patch operations for uri ",$patch-uri,": ",
                    string-join(json:array-values($error-list,true()), ", ")
                    ))
                else if (empty($metadata-raw)) then ()
                else
                    if ($metadata-raw instance of element(rapi:metadata))
                    then docmodupd:modifiable-xml-metadata($metadata-raw, $metadata-deltas)
                    else docmodupd:modifiable-json-metadata($metadata-raw, $metadata-deltas)
    let $is-content-patched :=
        if (empty($content-in)) then ()
        else (
            if (exists($temporal-collection) and exists($temporal-document-uri))
            then temporal:statement-set-document-version-uri($temporal-document-uri,$uri)
            else (),
            let $is-patched := docmodupd:apply-content-patch(
                $temporal-collection,$content-in,$patch-format,$patch,$patch-content,
                $xqy-function-map,$sjs-apply-array,$error-list
                )
            return
                if (json:array-size($error-list) gt 0)
                then error((),"RESTAPI-INVALIDREQ",concat(
                    "invalid content patch operations for uri ",$patch-uri,": ",
                    string-join(json:array-values($error-list,true()), ", ")
                    ))
                else $is-patched
            )
    return
        if (empty($metadata-out) and not($is-content-patched)) then (
            if (not(doc-available($patch-uri)))
            then error((),"RESTAPI-NODOCUMENT",("document patch",$patch-uri))
            else
                let $responder as function(*)? := map:get($env,"responder")
                return
                    if (empty($responder)) then ()
                    else $responder(
                        $docmodupd:UNCHANGED_PATCH,$patch-uri,(),(),(),(),(),()
                        )
            )
        else (
            if (empty($metadata-out)) then ()
            else
                let $is-xml             := ($patch-format eq "xml")
                let $updated-categories := map:get($metadata-deltas,"updated")
                let $deleted-categories := map:get($metadata-deltas,"deleted")
                let $has-no-updates     := empty($updated-categories)
                let $has-no-deletes     := empty($deleted-categories)
                let $patched-params     :=
                    let $map := map:map()
                    return (
                        map:put($map, "uri",      $patch-uri),
                        map:put($map, "format",   $patch-format),
                        $map
                        )
                return
                   if (exists($temporal-collection))
                   then
                      if ($has-no-updates and $has-no-deletes)
                      then ()
                      else docmodupd:patch-temporal-metadata($temporal-collection,$patch-uri,$updated-categories,$deleted-categories,$metadata-out)
                   else
                   (
                    if ($has-no-updates) then ()
                    else (
                        map:put($patched-params, "category", $updated-categories),
                        docmodupd:put-metadata(
                            $headers,$patched-params,$patch-uri,$updated-categories,
                            $metadata-out,
                            ()
                            )
                        ),

                    if ($has-no-deletes) then ()
                    else docmodupd:delete-metadata($patch-uri,$deleted-categories)
                    ),

            let $responder as function(*)? := map:get($env,"responder")
            return
                if (empty($responder)) then ()
                else if ($is-content-patched)
                then $responder(
                    $docmodupd:CONTENT_UPDATED,$patch-uri,(),(),(),(),(),()
                    )
                else $responder(
                    $docmodupd:METADATA_UPDATED,$patch-uri,(),(),(),(),(),()
                    )
            )
};

declare function docmodupd:modifiable-xml-metadata(
    $in     as element(rapi:metadata),
    $deltas as map:map?
) as element(rapi:metadata)
{
    <rapi:metadata>{
        let $collections := $in/rapi:collections
        return
            if (empty($collections)) then ()
            else if (empty($collections/*)) then
                if (empty($deltas)) then ()
                else map:put($deltas,"deleted","collections")
            else (
                if (empty($deltas)) then ()
                else map:put($deltas,"updated","collections"),

                $collections
                ),

        let $permissions := $in/rapi:permissions/<rapi:permissions>{
            rapi:permission/<rapi:permission>{
                    rapi:role-name,
                    for $capability in rapi:capability
                    order by string($capability)
                    return $capability
                }</rapi:permission>
        }</rapi:permissions>
        return
            if (empty($permissions)) then ()
            else if (empty($permissions/*)) then
                if (empty($deltas)) then ()
                else map:put($deltas, "deleted", (map:get($deltas,"deleted"),"permissions"))
            else (
                if (empty($deltas)) then ()
                else map:put($deltas, "updated", (map:get($deltas,"updated"),"permissions")),

                $permissions
                ),

        let $properties := $in/prop:properties/<prop:properties>{
            * except prop:last-modified
        }</prop:properties>
        return
            if (empty($properties)) then ()
            else if (empty($properties/*)) then
                if (empty($deltas)) then ()
                else map:put($deltas, "deleted", (map:get($deltas,"deleted"),"properties"))
            else (
                if (empty($deltas)) then ()
                else map:put($deltas, "updated", (map:get($deltas,"updated"),"properties")),

                $properties
                ),

        let $quality := $in/rapi:quality
        return
            if (empty($quality)) then ()
            else (
                if (empty($deltas)) then ()
                else map:put($deltas, "updated", (map:get($deltas,"updated"),"quality")),

                $quality
         ),

        let $values := $in/rapi:metadata-values/<rapi:metadata-values>{
           for $value in rapi:metadata-value
           return if (string-length($value/@key)>0) then <rapi:metadata-value key="{$value/@key}">{$value/text()}</rapi:metadata-value> else ()
        }</rapi:metadata-values>
        return
            if (empty($values)) then ()
            else (
                if (empty($deltas)) then ()
                else map:put($deltas, "updated", (map:get($deltas,"updated"),"metadata-values")),

                $values
                )

    }</rapi:metadata>
};

declare function docmodupd:modifiable-json-metadata(
    $in     as json:object,
    $deltas as map:map?
) as object-node()
{
    if (empty($deltas)) then ()
    else
        let $collections := map:get($in,"collections")
        return
            if (empty($collections)) then ()
            else if (json:array-size($collections) lt 1)
            then map:put($deltas,"deleted","collections")
            else map:put($deltas,"updated","collections"),

    let $permissions-in := map:get($in,"permissions")
    let $perm-in-size   :=
        if (empty($permissions-in)) then ()
        else json:array-size($permissions-in)
    return
        if (empty($permissions-in)) then ()
        else if ($perm-in-size = 0) then
            if (empty($deltas)) then ()
            else map:put($deltas, "deleted",
                (map:get($deltas,"deleted"),"permissions"))
        else
            let $permissions-out := json:array()
            return (
                for $permission in json:array-values($permissions-in)
                let $role-name := map:get($permission, "role-name")
                return json:array-push($permissions-out, $permission),

                let $perm-out-size := json:array-size($permissions-out)
                return
                    if ($perm-out-size eq 0) then (
                         if (empty($deltas)) then ()
                         else map:put($deltas, "deleted",
                             (map:get($deltas,"deleted"),"permissions")),
                         map:delete($in,"permissions")
                        )
                    else (
                         if (empty($deltas)) then ()
                         else map:put($deltas, "updated",
                             (map:get($deltas,"updated"),"permissions")),
                        if ($perm-in-size eq $perm-out-size) then ()
                        else map:put($in,"permissions",$permissions-out)
                        )
                ),

    let $properties := map:get($in,"properties")
    return
        if (empty($properties)) then ()
        else if (map:count($properties) eq 0) then
            if (empty($deltas)) then ()
            else map:put($deltas, "deleted",
                (map:get($deltas,"deleted"),"properties"))
        else if (not(map:contains($properties,"$ml.prop"))) then
            if (empty($deltas)) then ()
            else map:put($deltas, "updated",
                (map:get($deltas,"updated"),"properties"))
        else (
            map:delete($properties, "$ml.prop"),

            if (map:count($properties) gt 0) then
                if (empty($deltas)) then ()
                else map:put($deltas, "updated",
                    (map:get($deltas,"updated"),"properties"))
            else (
                if (empty($deltas)) then ()
                else map:put($deltas, "deleted",
                    (map:get($deltas,"deleted"),"properties")),
                map:delete($in,"properties")
                )
            ),

    if (empty($deltas) or not(map:contains($in,"quality"))) then ()
    else map:put($deltas, "updated",
        (map:get($deltas,"updated"),"quality")),

    if (empty($deltas) or not(map:contains($in,"metadataValues"))) then ()
    else map:put($deltas, "updated",
       (map:get($deltas,"updated"),"metadata-values")),

    xdmp:to-json($in)/object-node()
};

declare function docmodupd:patch-temporal-metadata(
   $temporal-collection as xs:string,
   $uri as xs:string,
   $updated as xs:string*,
   $deleted as xs:string*,
   $content as node()?
) as empty-sequence()
{
   xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
   if (empty($updated) or $content instance of element(rapi:metadata)) then
       let $validated := if (exists($updated)) then validate strict {$content} else ()
       let $collections :=
          if ($updated = "collections")
          then $validated/rapi:collections/rapi:collection/string(.)
          else if ($deleted = "deleted") then ()
          else xdmp:document-get-collections($uri)
       let $permissions :=
          if ($updated = "permissions")
          then $validated/rapi:permissions/docmodcom:convert-permissions($uri,rapi:permission)
          else if ($deleted = "permissions") then ()
          else xdmp:document-get-permissions($uri)
       let $properties :=
          if ($updated = "properties") then $validated/prop:properties/(* except prop:*)
          else ()
       let $quality :=
          if ($updated = "quality") then $validated/rapi:quality/data()
          else if ($deleted = "quality") then ()
          else xdmp:document-get-quality($uri)
       let $metadata-values :=
          if ($updated = "metadata-values")
          then $validated/rapi:metadata-values/docmodcom:convert-metadata-values($uri,rapi:metadata-value)
          else if ($deleted = "metadata-values") then ()
          else xdmp:document-get-metadata($uri)
       let $options := docmodupd:temporal-options(
          $temporal-collection,$uri,$collections,$permissions,$quality,$metadata-values
          )
       return (
          if ($is-untraced or docmodupd:check-untraced()) then ()
          else lid:log(
             $docmodupd:trace-id,"patch-temporal-metadata#insert1",
             map:entry("temporal-collection", $temporal-collection)
             => map:with("uri",$uri)=> map:with("options",$options),
             map:entry("doc",doc($uri))
             ),

          temporal:document-insert($temporal-collection,$uri,doc($uri),$options),

          if (not("properties" = ($updated,$deleted))) then ()
          else (
              if ($is-untraced or docmodupd:check-untraced()) then ()
              else lid:log(
                 $docmodupd:trace-id,"patch-temporal-metadata#set-properties1",
                 map:entry("uri",$uri)=> map:with("properties",properties)
                 ),
              xdmp:document-set-properties($uri,$properties)
              )
           )
   else if ($content instance of object-node()) then
       let $map := xdmp:from-json($content)
       let $collections :=
          if ($updated = "collections") then docmodcom:convert-json-collection($uri,$map)
          else if ($deleted = "collections") then ()
          else xdmp:document-get-collections($uri)
       let $permissions :=
          if ($updated = "permissions") then docmodcom:convert-json-permissions($uri,$map)
          else if ($deleted = "permissions") then ()
          else xdmp:document-get-permissions($uri)
       let $properties :=
          if ($updated = "properties") then docmodcom:convert-json-properties($uri,$map)
          else ()
       let $quality :=
          if ($updated = "quality") then docmodcom:convert-json-quality($uri,$map)
          else if ($deleted = "quality") then ()
          else xdmp:document-get-quality($uri)
       let $metadata-values :=
          if ($updated = "metadata-values") then docmodcom:convert-json-metadata-values($uri,$map)
          else if ($deleted = "metadata-values") then ()
          else xdmp:document-get-metadata($uri)
       let $options := docmodupd:temporal-options(
          $temporal-collection,$uri,$collections,$permissions,$quality,$metadata-values
          )
       return (
          if ($is-untraced or docmodupd:check-untraced()) then ()
          else lid:log(
             $docmodupd:trace-id,"patch-temporal-metadata#insert2",
             map:entry("temporal-collection", $temporal-collection)
             => map:with("uri",$uri)=> map:with("options",$options),
             map:entry("doc",doc($uri))
             ),

          temporal:document-insert($temporal-collection,$uri,doc($uri),$options),

          if (not("properties" = ($updated,$deleted))) then ()
          else (
              if ($is-untraced or docmodupd:check-untraced()) then ()
              else lid:log(
                 $docmodupd:trace-id,"patch-temporal-metadata#set-properties2",
                 map:entry("uri",$uri)=> map:with("properties",properties)
                 ),

              xdmp:document-set-properties($uri,$properties)
              )
          )
   else error((),"REST-INVALIDPARAM","The content for the metdata is neither metadata XML or JSON data.")
};

declare function docmodupd:post(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    eput:response-add-host-cookie($headers, $params, $env),
    let $categories := docmodcom:select-category($params)
    return
        if (not($categories = "content"))
        then error((),"REST-INVALIDPARAM",
            "Must provide content when creating a document"
            )
        else
            let $uri := docmodupd:make-document-uri($params)
            return (
                if (exists($uri)) then ()
                else error((),"REST-REQUIREDPARAM",
                    "missing required extension parameter"
                    ),

                map:put($params,"uri",$uri),

                docmodupd:put-content(
                    $headers,$params,$uri,$categories,docmodcom:get-update-policy(),
                    $env,map:get($env,"responder")
                    )
                )
};

declare function docmodupd:post-bulk-documents(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map
) as item()*
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    eput:response-add-host-cookie($headers, $params, $env),
    let $header-getter as function(*)? := map:get($env,"header-getter")
    let $body-getter   as function(*)? := map:get($env,"body-getter")
    return (
        if (exists($header-getter)) then ()
            else error((),"RESTAPI-INTERNALERROR","no function to get header"),
        if (exists($body-getter)) then ()
            else error((),"RESTAPI-INTERNALERROR","no function to get body"),

        let $response-type :=
            docmodcom:get-metadata-output-type($headers,$params,"bulk POST request",())
        let $results       :=
            docmodupd:write-bulk-documents($params,$header-getter,$body-getter)
        let $responder as function(*)? := map:get($env,"responder")
        return (
            if (empty($responder)) then ()
            else $responder(
                $docmodupd:BULK_CHANGE_WRITTEN,(),
                substring-after($response-type,"application/"),
                $response-type,(),(),(),
                let $temporal-collection := map:get($params,"temporal-collection")
                return
                    if (empty($temporal-collection)) then ()
                    else
                        let $system-timestamp := map:get($params,"system-time")
                        return
                            if (exists($system-timestamp))
                            then $system-timestamp
                            else temporal:statement-get-system-time()
                ),

            if ($response-type eq "application/json")
            then concat('{"documents":[', string-join(
                for $result in $results
                return concat(
                    '{"uri":"',$result/rapi:uri/string(.),
                    '", "mime-type":"',$result/rapi:mime-type/string(.),
                    '", "category":["',
                        string-join($result/rapi:category/string(.),'", "'),'"]}'
                    ),
                ", "
                ), ']}')
            else <rapi:documents>{$results}</rapi:documents>
            )
        )
};

declare function docmodupd:put(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    eput:response-add-host-cookie($headers, $params, $env),
    let $categories := docmodcom:select-category($params)
    let $uri        := docmodupd:lock-uris(map:get($params,"uri"))
    return
        if ($categories = "content")
        then docmodupd:put-conditional-content($headers,$params,$uri,$categories,$env)
        else if (not(doc-available($uri)))
        (: modify if necessary to support naked properties :)
        then error((),"RESTAPI-NODOCUMENT",(string-join($categories,", "),$uri))
        else
            let $meta-format :=
                let $meta-type := docmodcom:get-metadata-input-type($headers,$params,$uri,())
                return
                    if ($meta-type = ("application/json","text/json"))
                    then "json"
                    else if ($meta-type = ("application/xml","text/xml"))
                    then "xml"
                    else error((),"RESTAPI-INTERNALERROR",
                            concat("unknown metadata type ",$meta-type," for ",$uri)
                            )
            let $meta-body   :=
                if (map:get($env,"contains-body") eq "true")
                then map:get($env,"metadata-body")/node()
                else map:get($env,"body-getter")($meta-format)/node()
            let $_ := if ($meta-format = "json" or node-name($meta-body) = QName("http://marklogic.com/rest-api","metadata")) then ()
                      else error((),"RESTAPI-INVALIDREQ",("document element {" || namespace-uri($meta-body) || "}" || local-name($meta-body) || " not allowed"))
            return docmodupd:put-metadata(
                $headers,$params,$uri,$categories,$meta-body,map:get($env,"responder")
                )
};

declare function docmodupd:put-metadata(
    $headers    as map:map,
    $params     as map:map,
    $uri        as xs:string,
    $categories as xs:string+,
    $content    as node()?,
    $responder  as function(*)?
) as empty-sequence()
{
    if (empty($content))
    then error((),"RESTAPI-INVALIDREQ",(
        "cannot update metadata from empty request for uri: "||$uri
        ))
    else
        let $param-names := map:keys($params)
        return
            if ($param-names = "collection" or
                exists($param-names[starts-with(.,"perm:")]) or
                exists($param-names[starts-with(.,"prop:")]) or
                $param-names = "quality"
                )
            then error((),"REST-INVALIDPARAM",
                "Cannot combine metadata parameters with meta content for "||$uri
                )
            else (),

    let $meta-uri  := docmodupd:get-metadata-document($uri,false())
    let $meta-type :=
        docmodcom:get-metadata-input-type($headers,$params,$uri,())
    return
        if ($meta-type = ("application/xml","text/xml")) then (
            if (empty($responder)) then ()
            else $responder($docmodupd:METADATA_UPDATED,$uri,(),(),(),(),(),()),

            docmodupd:write-metadata-xml($uri, $meta-uri, $categories, validate strict {$content})
            )
        else if ($meta-type = ("application/json","text/json")) then (
            if (empty($responder)) then ()
            else $responder($docmodupd:METADATA_UPDATED,$uri,(),(),(),(),(),()),

            docmodupd:write-metadata-json($uri,$meta-uri,$categories,$content)
            )
        else error((),"RESTAPI-INVALIDMIMETYPE",(
            "mime type for metadata must be application/json or application/xml",$meta-type,$uri
            ))
};

declare function docmodupd:put-conditional-content(
    $headers    as map:map,
    $params     as map:map,
    $uri        as xs:string,
    $categories as xs:string+,
    $env        as map:map
) as empty-sequence()
{
    let $update-policy := docmodcom:get-update-policy()
    return (
        docmodupd:check-content-version($headers,$uri,$update-policy),

        docmodupd:put-content(
            $headers,$params,$uri,$categories,$update-policy,$env,map:get($env,"responder")
            )
        )
};

(: metadata can be supplied via URI params, HTTP body (processed in docmodupd:put-metadata()),
       first multipart, or $env map
   content can be supplied via HTTP body, second multipart, or $env map and is streamed
       (using xdmp:document-load("rest::") when possible) when not extracting metadata
       from a binary, repairing XML, or converting JSON
   format and mime type can be specified by format URI parameter, HTTP Content-Type header,
       multipart Content-Type header, or the server mapping for the extension
   format for parsing JSON is text
 :)
declare function docmodupd:put-content(
    $headers       as map:map,
    $params        as map:map,
    $uri           as xs:string,
    $categories    as xs:string+,
    $update-policy as xs:string?,
    $env           as map:map,
    $responder     as function(*)?
) as empty-sequence()
{
    let $with-overwrite := ($update-policy eq "overwrite-metadata")
    let $env-body       := (map:get($env,"contains-body") = "true")
    let $trans-name     := map:get($params,"transform")
    let $body-getter as function(*)? :=
        if ($env-body) then ()
        else map:get($env,"body-getter")
    let $forest-id      := docmodupd:get-forest-id(map:get($params,"forest-name"))
    let $temporal-collection := map:get($params,"temporal-collection")
    let $system-timestamp := map:get($params,"system-time")
    let $is-multipart   :=
        if ($env-body) then false()
        else count($categories) gt 1
    let $input-type     :=
        if ($is-multipart)
        then map:get($headers,"content-type")
        else head(dbut:tokenize-header(map:get($headers,"content-type")))
    let $parts-list     :=
        if (not($is-multipart)) then ()
        else
            let $parts-lister as function(*)? := map:get($env,"parts-lister")
            return
                if (empty($parts-lister)) then ()
                else $parts-lister($input-type,$body-getter("binary"))
    let $part-typer as function(*)? :=
        if (not($is-multipart)) then ()
        else map:get($env,"part-typer")
    let $param-format   := map:get($params,"format")
    (: must always get part headers before part content :)
    let $meta-part-type :=
        if (not($is-multipart)) then ()
        else head(dbut:tokenize-header($part-typer($parts-list,1)))
    let $meta-parse     :=
        if (not($is-multipart)) then ()
        else if ($meta-part-type = (
            "application/json", "text/json", "application/xml", "text/xml"
            ))
        then substring-after($meta-part-type,"/")
        else if ($param-format = ("json","xml"))
        then $param-format
        else if (exists($meta-part-type))
        then error((),"REST-INVALIDTYPE",
            "mime type for meta must be application/xml or application/json: "||$meta-part-type
            )
        else if (exists($param-format))
        then error((),"REST-INVALIDPARAM",
            "Format parameter must be xml or json for meta: "||$param-format
            )
        else "text"
    let $part-reader as function(*)? :=
        if (not($is-multipart)) then ()
        else map:get($env,"part-reader")
    let $metadata-part  :=
        if ($env-body)
        then map:get($env,"metadata-body")
        else if (not($is-multipart)) then ()
        else $part-reader(
            $parts-list,
            1,
            if ($meta-parse eq "xml") then "xml" else "json"
            )
    let $con-part-type  :=
        if (not($is-multipart)) then ()
        else head(dbut:tokenize-header($part-typer($parts-list,2)))
    let $content-kind   := docmodupd:content-kind(
        $uri,$env,$env-body,$trans-name,$is-multipart,$input-type,$param-format,$con-part-type
        )
    let $content-type   := head($content-kind)
    let $content-format := tail($content-kind)
    let $meta-format    :=
        if ($env-body)
        then map:get($env,"metadata-format")
        else if (not($is-multipart)) then ()
        else if ($meta-parse eq "json" or
            ($meta-parse eq "text" and $content-type = ("application/json","text/json")))
        then "json"
        else "xml"
    let $metadata       :=
        if (empty($metadata-part)) then ()
        else
            let $param-names := map:keys($params)
            return
                if ($param-names = "collection" or
                    exists($param-names[starts-with(.,"perm:")]) or
                    exists($param-names[starts-with(.,"prop:")]) or
                    $param-names = "quality"
                    )
                then error((),"REST-INVALIDPARAM",
                    "Cannot combine metadata parameters with meta content for "||$uri
                    )
                else docmodcom:parse-metadata($meta-format, $metadata-part)
    let $collections    :=
        if (empty($metadata))
        then map:get($params,"collection")
        else docmodcom:parse-collections($uri,$metadata)
    let $permissions    :=
        if (exists($metadata)) then ()
        else map:map()
    let $properties     :=
        if (exists($metadata)) then ()
        else map:map()
    let $quality        :=
        if (empty($metadata))
        then map:get($params,"quality")
        else docmodcom:parse-quality($uri,$metadata)
    let $metadata-values :=
        if (empty($metadata))
        then
            let $key-names := for $param-name in map:keys($params) return if (starts-with($param-name,"value:")) then substring-after($param-name,"value:") else ()
            let $map := map:new()
            let $_ := for $key in $key-names return map:put($map,$key,map:get($params,"value:" || $key))
            return $map
        else docmodcom:parse-metadata-values($uri,$metadata)
    let $role-names     :=
        if (exists($metadata)) then ()
        else (
            for $param-name in map:keys($params)
            return
                if (starts-with($param-name,"perm:")) then
                    let $role-name := substring-after($param-name,"perm:")
                    return map:put($permissions,$role-name,map:get($params,$param-name))
                else if (starts-with($param-name,"prop:"))
                then map:put($properties,substring-after($param-name,"prop:"),map:get($params,$param-name))
                else (),

            if (empty($permissions)) then ()
            else map:keys($permissions)
            )
    let $role-ids       :=
        if (empty($role-names)) then ()
        else eput:lookup-role-ids(
            if (count($role-names) eq 1)
            then $role-names
            else json:to-array($role-names)
            )
    let $perms          :=
        if (empty($metadata)) then
            if (empty($role-names)) then ()
            else
                for $role-name at $i in $role-names
                for $capability in map:get($permissions,$role-name)
                return
                    <sec:permission>
                        {subsequence($role-ids,$i,1)}
                        <sec:capability>{$capability}</sec:capability>
                    </sec:permission>
        else docmodcom:parse-permissions($uri,$metadata)
    let $rids           :=
        if (empty($role-ids)) then ()
        else $role-ids/data(.)
    let $prop-names     :=
        if (empty($properties)) then ()
        else map:keys($properties)
    let $props          :=
        if (empty($metadata)) then
            if (empty($prop-names)) then ()
            else
                for $prop-name in $prop-names
                return
                    if ($prop-name castable as xs:NCName)
                    then element {$prop-name} {map:get($properties,$prop-name)}
                    else error((),"REST-INVALIDPARAM",
                        "Property name must be a valid XML NCName: "||$prop-name
                        )
        else docmodcom:parse-properties($uri,$metadata)
    let $prop-qnames    :=
        if (exists($metadata)) then ()
        else if (exists($prop-names))
        then $prop-names ! xs:QName(.)
        else $props/node-name(.)
    let $context        :=
        if (empty($trans-name)) then ()
        else eput:make-context($uri,$content-type,())
    let $extract        := map:get($params,"extract")
    let $repair         := map:get($params,"repair")
    let $content-parse  :=
        if ((exists($repair) and $content-format eq "xml"))
        then "text"
        else $content-format
    let $content        :=
        (: conditions under which content is not streamed :)
        if ($env-body)
        then map:get($env,"content-body")
        else
            if (exists($extract) or map:get($env,"buffer") eq "true" or
                exists($trans-name) or exists($repair))
            then
                if ($is-multipart)
                then $part-reader($parts-list,2,$content-parse)
                else $body-getter($content-parse)
            else ()
    let $input          :=
        if (empty($content)) then ()
        else docmodupd:convert-document(
            $uri,$content-format,$content-type,$content,$repair
            )
    let $trans-output   :=
        if (empty($trans-name)) then ()
        else tformod:apply-transform(
            $trans-name,$context,tformod:extract-transform-params($params),$input
            )
    let $trans-ctxt     :=
        if (empty($trans-name)) then ()
        else map:get($trans-output,"context")
    let $output         :=
        if (empty($trans-name))
        then $input
        else map:get($trans-output,"result")
    let $output-uri     :=
        if (empty($trans-ctxt))
        then $uri
        else head((map:get($trans-ctxt,"uri"),$uri))
    let $output-type    :=
        if (empty($trans-ctxt))
        then $content-type
        else map:get($trans-ctxt,"output-type")
    let $output-format  :=
        if (empty($trans-ctxt))
        then $content-format
        else
            let $transform-format := eput:get-document-format($output)
            return
                if (exists($transform-format))
                then $transform-format
                else head((docmodcom:get-type-format($output-type),$content-format))
    let $temporal-document-uri := map:get($params,"temporal-document")
    let $version-uri := if (empty($temporal-document-uri)) then () else $output-uri
    let $output-uri  := if (empty($temporal-document-uri)) then $output-uri else $temporal-document-uri
    return (
        if (exists($output-type)) then ()
        else error((),"RESTAPI-INVALIDMIMETYPE",(
            "mime type must be declared for content","NONE",$uri
            )),

        if (empty($extract) or $output-format eq "binary") then ()
        else error((),"RESTAPI-INVALIDMIMETYPE",(
            "metadata extracted only from binary content",$output-type,$uri
            )),

        if (exists($extract)) then (
            docmodupd:write-content(
                $output-uri,$version-uri,$output,$collections,$rids,$perms,$quality,$metadata-values,
                $forest-id,$with-overwrite,$responder,
                $temporal-collection,$system-timestamp
                ),

            docmodupd:extract-binary-metadata(
                $output-uri,$extract,$output-type,$output,$collections,$rids,$perms,
                $quality,$metadata-values,$forest-id,$with-overwrite,
                $temporal-collection,$system-timestamp
                )
            )
        else if (exists($output)) then
            docmodupd:write-content(
                $output-uri,$version-uri,$output,$collections,$rids,$perms,$quality,$metadata-values,$forest-id,
                $with-overwrite,$responder,$temporal-collection,$system-timestamp
                )
(: TODO: $encoding :)
        else docmodupd:load-content(
            $output-uri,$version-uri,$output-format,$collections,$rids,$perms,$quality,$metadata-values,
            $repair,$forest-id,(),$with-overwrite,$responder,
            $temporal-collection,$system-timestamp
            ),

        if (exists($extract) or empty($props)) then ()
        else if ($with-overwrite)
        then docmodupd:write-properties($output-uri,$props)
        else docmodupd:write-properties(
            $output-uri,
            docmodupd:get-metadata-document($output-uri,false()),
            $prop-qnames,
            $props
            )
        )
};

declare private function docmodupd:convert-document(
    $uri      as xs:string,
    $format   as xs:string,
    $mimetype as xs:string?,
    $content  as document-node()?,
    $repair   as xs:string?
) as document-node()
{
    if (empty($repair))
    then $content
    else (
        if (not($repair = ("full","none")))
        then error((),"RESTAPI-INTERNALERROR",
            concat("unknown repair type ",$repair," for ",$uri)
            )
        else if (not($format eq "xml"))
        then error((),"RESTAPI-INVALIDMIMETYPE",(
            "repair parameter supported only for xml content",$mimetype,$uri
            ))
        else (),

        let $docs    := xdmp:unquote(
            string($content),
            (),
            (
                if (empty($repair)) then ()
                else concat("repair-",$repair),

                concat("format-",$format)
                )
            )
        let $doc-num := count($docs)
        return
            if ($doc-num eq 1)
            then $docs
            else error((),"RESTAPI-INVALIDRESULT",(
                concat("repair produced ",$doc-num," documents"),$uri
                ))
        )
};

declare private function docmodupd:extract-binary-metadata(
    $uri            as xs:string,
    $extract        as xs:string,
    $output-type    as xs:string,
    $document       as document-node(),
    $collections    as xs:string*,
    $rids           as xs:unsignedLong*,
    $permissions    as element(sec:permission)*,
    $quality        as xs:integer?,
    $metadata-values as map:map?,
    $forest-id      as xs:unsignedLong?,
    $with-overwrite as xs:boolean,
    $temporal-collection as xs:string?,
    $system-timestamp as xs:dateTime?
) as empty-sequence()
{
    let $meta-doc := xdmp:document-filter($document)
    return (
        if ($extract eq "properties") then
            let $meta-props := isys-filter:extract-isys-meta-data($meta-doc)
            return docmodupd:write-properties($uri,$meta-props)
        else if ($extract eq "document") then
            if (ends-with($uri,".xhtml"))
            then error((),"RESTAPI-INVALIDREQ",(
                "cannot extract metadata as document for document with XHTML extension.  Output-type: "||$output-type|| " for uri: " || $uri
                ))
            else
                let $meta-uri := if(matches($uri,"^.*\.[^\\]+$"))
                    then replace($uri,"\.[^/.]+$",".xhtml")
                    else concat($uri,".xhtml")
                return (
                    docmodupd:write-content(
                        $meta-uri,
                        document{
                            <xhtml:html>{
                            <xhtml:head>{
                                $meta-doc/xhtml:html/xhtml:head/*,
                                <xhtml:meta name="MarkLogic_Binary_Source" content="{$uri}"/>
                            }</xhtml:head>,
                            $meta-doc/xhtml:html/xhtml:body
                            }</xhtml:html>
                        },
                        $collections,
                        $rids,
                        $permissions,
                        $quality,
                        $metadata-values,
                        $forest-id,
                        true(),
                        (),
                        $temporal-collection,
                        $system-timestamp
                        ),

                        (: as in /MarkLogic/filter/actions/filter-xhtml-action.xqy :)
                        if (not(docmodupd:cpf-installed())) then ()
                        else lnk:create(
                            $meta-uri,$uri,"source","filter","strong"
                            )
                        )
        else error((),"RESTAPI-INTERNALERROR",concat("unknown extraction type ",$extract," for ",$uri))
        )
};

declare function docmodupd:delete(
    $headers as map:map,
    $params  as map:map,
    $env     as map:map?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    eput:response-add-host-cookie($headers, $params, $env),
    let $uris       := docmodupd:lock-uris(map:get($params,"uri"))
    let $categories := docmodcom:select-category($params)
    let $responder as function(*)? :=
        if (empty($env)) then ()
        else map:get($env,"responder")
    return
        if ($categories = "content")
        then docmodupd:delete-conditional-document(
            $headers,$params,$uris,$responder
            )
        else (
            if (empty($responder)) then ()
            else $responder($docmodupd:METADATA_DELETED,(),(),(),(),(),(),()),

            docmodupd:delete-metadata($uris,$categories)
            )
};

declare function docmodupd:delete-conditional-document(
    $headers   as map:map,
    $params    as map:map,
    $uris      as xs:string+,
    $responder as function(*)?
) as empty-sequence()
{
    if (count($uris) eq 1)
    then docmodupd:check-content-version($headers,$uris)
    else
        let $update-policy := docmodcom:get-update-policy()
        return
            if ($update-policy = ("merge-metadata","overwrite-metadata") or
                ($update-policy eq "version-optional" and
                    empty(map:get($headers,"if-match")[. ne ""]))
                ) then ()
            else error((), "RESTAPI-INVALIDREQ",
                "cannot delete multiple documents with optimistic locking"),

    docmodupd:delete-document-responder($uris,$responder,
        map:get($params,"temporal-collection"),
        map:get($params,"system-time"),
        map:get($params,"result") = "wiped",
        map:get($params,"check")
        )
};

declare function docmodupd:delete-document-responder(
    $uris                as xs:string+,
    $responder           as function(*)?,
    $temporal-collection as xs:string?,
    $system-timestamp    as xs:dateTime?,
    $wipe                as xs:boolean,
    $check               as xs:string?
) as empty-sequence()
{
    if (empty($responder)) then ()
    else $responder($docmodupd:DOCUMENT_DELETED,(),(),(),(),(),(),
        if (empty($temporal-collection)) then ()
        else if (exists($system-timestamp))
        then $system-timestamp
        else temporal:statement-get-system-time()
        ),

    docmodupd:delete-document($uris,$temporal-collection,$system-timestamp,$wipe,$check)
};

(:
    collective metadata functions
 :)
declare function docmodupd:write-metadata-xml(
    $uri        as xs:string,
    $meta-uri   as xs:string?,
    $categories as xs:string+,
    $metadata   as element(rapi:metadata)?
) as empty-sequence()
{
    let $provided-categories := $metadata/*/local-name(.)
    return
        if (not(docmodcom:check-metadata-provided($uri,$categories,$provided-categories)))
        then ()
        else (
            if (not("collections" = $provided-categories)) then ()
            else $metadata/rapi:collections/docmodupd:write-collections(
                $uri, $meta-uri, rapi:collection/string(.)
                ),

            if (not("permissions" = $provided-categories)) then ()
            else $metadata/rapi:permissions/docmodupd:write-permissions(
                $uri, $meta-uri, docmodcom:convert-permissions($uri,rapi:permission)
                ),

            if (not("properties" = $provided-categories)) then ()
            else
               let $properties := $metadata/prop:properties/(* except prop:*)
               let $localized-properties :=
                  for $prop in $properties
                  return element {node-name($prop)} {
                      $prop/namespace::*[. != "http://marklogic.com/rest-api"],
                      $prop/@*,
                      $prop/node()
                  }
               return docmodupd:write-properties(
                  $uri, $meta-uri, $localized-properties
               ),
            if (not("quality" = $provided-categories)) then ()
            else $metadata/rapi:quality/docmodupd:write-quality(
                $uri, $meta-uri, data(.)
                ),

            if (not("metadata-values" = $provided-categories)) then ()
            else $metadata/rapi:metadata-values/docmodupd:write-metadata-values(
                $uri, $meta-uri, docmodcom:convert-metadata-values($uri,rapi:metadata-value)
                )
            )
};

declare function docmodupd:write-metadata-json(
    $uri        as xs:string,
    $meta-uri   as xs:string?,
    $categories as xs:string+,
    $metadata   as node()
) as empty-sequence()
{
    (: depends on json:array for nested arrays :)
    let $map :=
        typeswitch($metadata)
        case object-node() return xdmp:from-json($metadata)
        case text() return
            let $meta-text := string($metadata)
            return
                if (empty($meta-text)) then ()
                else xdmp:from-json(xdmp:unquote($meta-text))
        default return error(
            (),"RESTAPI-INTERNALERROR","could not parse JSON metadata for uri: "||$uri
            )
   let $provided-categories :=
        if (empty($map)) then ()
        (: Note: a bit of fixup for names in JSON being camel case ... :)
        else for $key in map:keys($map) return if ($key = "metadataValues") then "metadata-values" else $key
    return
        if (not(docmodcom:check-metadata-provided($uri,$categories,$provided-categories)))
        then ()
        else if (exists($provided-categories[not(. = ("collections","permissions","properties","quality","metadata-values"))]))
        then error((),"RESTAPI-INVALIDCONTENT",
            "provided key for unknown metadata category: "||
            string-join(
                $provided-categories[not(. = ("collections","permissions","properties","quality","metadata-values"))],
                ", "
                )||
            " for uri: "||$uri
            )
        else
            let $collections          :=
                if (not("collections" = $provided-categories)) then ()
                else docmodcom:convert-json-collection($uri,$map)
            let $permissions          :=
                if (not("permissions" = $provided-categories)) then ()
                else docmodcom:convert-json-permissions($uri,$map)
            let $properties           :=
                if (not("properties" = $provided-categories)) then ()
                else docmodcom:convert-json-properties($uri,$map)
            let $quality              :=
                if (not("quality" = $provided-categories)) then ()
                else docmodcom:convert-json-quality($uri,$map)
            let $values               :=
                if (not("metadata-values" = $provided-categories)) then ()
                else docmodcom:convert-json-metadata-values($uri,$map)
            return (
                if (empty($collections)) then ()
                else docmodupd:write-collections($uri,$meta-uri,$collections),

                if (empty($permissions)) then ()
                else docmodupd:write-permissions($uri,$meta-uri,$permissions),

                if (empty($properties)) then ()
                else docmodupd:write-properties($uri,$meta-uri,$properties),

                if (empty($quality)) then ()
                else docmodupd:write-quality($uri,$meta-uri,$quality),

                if (empty($values)) then ()
                else docmodupd:write-metadata-values($uri,$meta-uri,$values)
                )
};

declare function docmodupd:delete-metadata(
    $uris       as xs:string+,
    $categories as xs:string*
) as empty-sequence()
{
    if (empty($categories)) then ()
    else
        for $uri in $uris
        let $has-doc  := doc-available($uri)
        let $meta-uri := docmodupd:get-metadata-document($uri,false())
        return (
            if (not($has-doc)) then ()
            else (
                if (not($categories = ("collections","metadata"))) then ()
                else docmodupd:reset-collections($uri,$meta-uri),

                if (not($categories = ("permissions","metadata"))) then ()
                else docmodupd:reset-permissions($uri,$meta-uri),

                if (not($categories = ("quality","metadata"))) then ()
                else docmodupd:reset-quality($uri,$meta-uri),

                if (not($categories = ("metadata-values","metadata"))) then ()
                else docmodupd:reset-metadata-values($uri,$meta-uri)
                ),

            if (not($categories = ("properties","metadata"))) then ()
            else docmodupd:remove-properties($uri,$meta-uri,$has-doc)
            )
};

(:
    Low-level functions for document content and metadata
 :)

declare function docmodupd:delete-document(
    $uris                as xs:string+,
    $temporal-collection as xs:string?,
    $system-timestamp    as xs:dateTime?,
    $wipe                as xs:boolean,
    $check               as xs:string?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    if (empty($system-timestamp)) then ()
    else temporal:statement-set-system-time($system-timestamp),

    let $options := map:entry(
        "ifNotExists",
        if (not($check = "exists")) then "allow" else "error"
        )
    return (
        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"delete-document",
             map:entry("temporal-collection", $temporal-collection)
             => map:with("uris",$uris)=> map:with("options",$options)
            ),

        for $uri in $uris
        for $doc-uri in ($uri, docmodupd:get-metadata-document($uri,true()))
        return
            if (empty($temporal-collection))
            then xdmp:document-delete($doc-uri,$options)
            (: idempotent so okay to execute on deleted document :)
            else if ($wipe) then
                try {temporal:document-wipe($temporal-collection,$doc-uri)}
                catch($e) {
                    if ($e/error:code/string(.) eq "XDMP-DOCNOTFOUND") then ()
                    else xdmp:rethrow()
                }
            else temporal:document-delete($temporal-collection,$doc-uri,$options)
        )
};

declare function docmodupd:get-metadata-document(
    $uri       as xs:string,
    $check-cpf as xs:boolean?
) as xs:string?
{
    if (ends-with($uri,".xhtml") or not(xdmp:uri-format($uri) eq "binary")) then ()
    else
        let $mod-uri  := replace($uri,"\.[^/.]+$",".xhtml")
        let $meta-uri :=
            if (ends-with($mod-uri,".xhtml"))
            then $mod-uri
            else concat($uri,".xhtml")
        return
            if (not(doc-available($meta-uri))) then ()
            (: linked metadata is deleted by CPF :)
            else if ($check-cpf and docmodupd:cpf-installed()) then ()
            else if (not(doc($meta-uri)
            /xhtml:html/xhtml:head/xhtml:meta
                    [string(@name)="MarkLogic_Binary_Source"]/@content/string(.) = $uri)
                ) then ()
            else $meta-uri
};

declare function docmodupd:write-content(
    $uri            as xs:string,
    $document       as document-node(),
    $collections    as xs:string*,
    $rids           as xs:unsignedLong*,
    $permissions    as element(sec:permission)*,
    $quality        as xs:integer?,
    $metadata-values as map:map?,
    $forest-id      as xs:unsignedLong?,
    $with-overwrite as xs:boolean,
    $responder      as function(*)?,
    $temporal-collection as xs:string?,
    $system-timestamp as xs:dateTime?
) as empty-sequence()
{
   docmodupd:write-content(
      $uri,
      (),
      $document,
      $collections,
      $rids,
      $permissions,
      $quality,
      $metadata-values,
      $forest-id,
      $with-overwrite,
      $responder,
      $temporal-collection,
      $system-timestamp
   )
};

declare function docmodupd:write-content(
    $uri            as xs:string,
    $version-uri    as xs:string?,
    $document       as document-node(),
    $collections    as xs:string*,
    $rids           as xs:unsignedLong*,
    $permissions    as element(sec:permission)*,
    $quality        as xs:integer?,
    $metadata-values as map:map?,
    $forest-id      as xs:unsignedLong?,
    $with-overwrite as xs:boolean,
    $responder      as function(*)?,
    $temporal-collection as xs:string?,
    $system-timestamp as xs:dateTime?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    if (empty($document)) then ()
    else
        let $must-insert     := exists($forest-id) or exists($temporal-collection) or
            exists($collections) or exists($permissions) or exists($quality) or exists($metadata-values)
        let $old-doc         :=
            if ($with-overwrite or $must-insert) then ()
            else doc($uri)
        let $old-collections :=
            if (not($must-insert) or exists($collections)) then ()
            else xdmp:document-get-collections($uri)
        let $old-permissions :=
            if (not($must-insert) or (exists($permissions) and empty($rids)))
            then ()
            else xdmp:document-get-permissions($uri)
        let $old-quality     :=
            if (not($must-insert) or exists($quality)) then ()
            else xdmp:document-get-quality($uri)
        let $old-metadata-values     :=
            if (not($must-insert) or exists($metadata-values)) then ()
            else xdmp:document-get-metadata($uri)
        let $document-exists :=
            if ($with-overwrite)
            then false()
            else if ($must-insert)
            then (exists($old-collections) or exists($old-permissions) or
                exists($old-quality) or doc-available($uri))
            else exists($old-doc)
        return (
            if ($document-exists or dbut:is-uri($uri)) then ()
            else error((), "REST-INVALIDPARAM", "invalid uri: "||$uri),

            if (empty($responder)) then ()
            else $responder(
                if ($with-overwrite or $document-exists)
                    then $docmodupd:CONTENT_UPDATED
                    else $docmodupd:DOCUMENT_CREATED,
                $uri,(),(),(),(),(),
                if (empty($temporal-collection)) then ()
                else if (exists($system-timestamp))
                then $system-timestamp
                else temporal:statement-get-system-time()
                ),

            if ($must-insert)
            then docmodupd:write-content(
                $uri,
                $version-uri,
                $document,
                if (exists($collections))
                    then $collections
                    else if ($document-exists)
                    then $old-collections
                    else xdmp:default-collections($uri),
                if (exists($permissions)) then (
                    $permissions | (
                        if (empty($rids) or not($document-exists))
                        then xdmp:default-permissions($uri)
                        else $old-permissions[not(sec:role-id/data(.) = $rids)]
                        )
                    )
                    else if ($document-exists)
                    then $old-permissions
                    else xdmp:default-permissions($uri),
                if (exists($quality))
                    then $quality
                    else if ($document-exists)
                    then $old-quality
                    else 0,
                if (exists($metadata-values))
                    then $metadata-values
                    else if ($document-exists)
                    then $old-metadata-values
                    else (),
                $forest-id,
                $temporal-collection,
                $system-timestamp
                )
            else if ($document-exists) then (
                if ($is-untraced or docmodupd:check-untraced()) then ()
                else lid:log(
                    $docmodupd:trace-id,"write-content#node-replace",
                    map:entry("uri",$uri),
                    map:entry("old-doc",$old-doc)=> map:with("document",$document)
                    ),

                xdmp:node-replace($old-doc,$document)
                )
            else (
                if ($is-untraced or docmodupd:check-untraced()) then ()
                else lid:log(
                    $docmodupd:trace-id,"write-content#document-insert",
                    map:entry("uri",$uri),
                    map:entry("document",$document)
                    ),

                xdmp:document-insert($uri,$document)
                )
            )
};

declare function docmodupd:write-content(
    $uri         as xs:string,
    $document    as document-node(),
    $collections as xs:string*,
    $permissions as element(sec:permission)*,
    $quality     as xs:integer?,
    $metadata-values as map:map?,
    $forest-id   as xs:unsignedLong?,
    $temporal-collection as xs:string?,
    $system-timestamp as xs:dateTime?
) as empty-sequence()
{
   docmodupd:write-content(
      $uri,
      (),
      $document,
      $collections,
      $permissions,
      $quality,
      $metadata-values,
      $forest-id,
      $temporal-collection,
      $system-timestamp
   )
};

declare function docmodupd:write-content(
    $uri         as xs:string,
    $version-uri as xs:string?,
    $document    as document-node(),
    $collections as xs:string*,
    $permissions as element(sec:permission)*,
    $quality     as xs:integer?,
    $metadata-values as map:map?,
    $forest-id   as xs:unsignedLong?,
    $temporal-collection as xs:string?,
    $system-timestamp as xs:dateTime?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    let $ns :=
        if (exists($temporal-collection))
        then $temporal-insert-ns
        else $insert-ns
    let $options := element { QName($ns,"options")} {

        (: filter out collections maintained by temporal implementation :)

        let $collection-set := if (empty($temporal-collection)) then $collections else $collections[not(. = ($temporal-collection, "latest", $uri))]
        return
        if (empty($collection-set)) then ()
        else element {QName($ns,"collections")} {
            for $collection in $collection-set
            return element {QName($ns,"collection")} {$collection}
        },

        (: Note: xdmp:default-permissions() are for the amped user :)
        element {QName($ns,"permissions")} {
            if (empty($permissions))
            then xdmp:default-permissions($uri)
            else
                let $default-perms := xdmp:default-permissions($uri)
                let $default-check := $default-perms/concat(string(sec:capability),string(sec:role-id))
                return (
                    $permissions[not(concat(string(sec:capability),string(sec:role-id)) = $default-check)],

                    $default-perms
                    )
        },

        if (empty($quality))
        then ()
        else element {QName($ns,"quality")} {$quality},

        if (empty($metadata-values))
        then ()
        else element {QName($ns,"metadata")} { $metadata-values },


        if (empty($forest-id)) then ()
        else element {QName($ns,"forests")} {
            element {QName($ns,"forest")} {$forest-id}
        }
    }
    return
    if (empty($temporal-collection)) then (
        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"write-content#document",
            map:entry("uri",$uri)=>map:with("options",$options),
            map:entry("document",$document)
            ),

        xdmp:document-insert($uri,$document,$options)
        )
    else (
        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"write-content#temporal",
            map:entry("uri",$uri)=>map:with("options",$options)=>map:with("temporal-collection",$temporal-collection)
            =>map:with("version-uri",$version-uri)=>map:with("system-timestamp",$system-timestamp),
            map:entry("document",$document)
            ),

        if (empty($system-timestamp)) then ()
        else temporal:statement-set-system-time($system-timestamp),

        if (empty($version-uri)) then ()
        else temporal:statement-set-document-version-uri($uri,$version-uri),

        temporal:document-insert(
            $temporal-collection,
            $uri,
            $document,
            $options)
        )
};

declare function docmodupd:load-content(
    $uri            as xs:string,
    $format         as xs:string,
    $collections    as xs:string*,
    $rids           as xs:unsignedLong*,
    $permissions    as element(sec:permission)*,
    $quality        as xs:integer?,
    $metadata-values as map:map?,
    $repair         as xs:string?,
    $forest-id      as xs:unsignedLong?,
    $encoding       as xs:string?,
    $with-overwrite as xs:boolean,
    $responder      as function(*)?,
    $temporal-collection as xs:string?,
    $system-timestamp as xs:dateTime?
) as empty-sequence()
{
   docmodupd:load-content(
      $uri,
      (),
      $format,
      $collections,
      $rids,
      $permissions,
      $quality,
      $metadata-values,
      $repair,
      $forest-id,
      $encoding,
      $with-overwrite,
      $responder,
      $temporal-collection,
      $system-timestamp
   )
};

declare function docmodupd:load-content(
    $uri            as xs:string,
    $version-uri    as xs:string?,
    $format         as xs:string,
    $collections    as xs:string*,
    $rids           as xs:unsignedLong*,
    $permissions    as element(sec:permission)*,
    $quality        as xs:integer?,
    $metadata-values as map:map?,
    $repair         as xs:string?,
    $forest-id      as xs:unsignedLong?,
    $encoding       as xs:string?,
    $with-overwrite as xs:boolean,
    $responder      as function(*)?,
    $temporal-collection as xs:string?,
    $system-timestamp as xs:dateTime?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    let $ns :=
        if (exists($temporal-collection))
        then $temporal-load-ns
        else $load-ns
    let $old-collections :=
        if (exists($collections)) then ()
        else xdmp:document-get-collections($uri)
    let $old-permissions :=
        if (exists($permissions) and empty($rids)) then ()
        else xdmp:document-get-permissions($uri)
    let $old-quality     :=
        if (exists($quality)) then ()
        else xdmp:document-get-quality($uri)
    let $document-exists :=
        if ($with-overwrite)
        then false()
        else (exists($old-collections) or exists($old-permissions) or
            exists($old-quality) or doc-available($uri))
    let $options :=
        element { QName($ns,"options")} {
            element {QName($ns,"uri")}{$uri},

            if (exists($collections)) then
                element {QName($ns,"collections")} {
                    for $collection in $collections
                    return element {QName($ns,"collection")} {$collection}
                }
            else if ($document-exists) then
                element {QName($ns,"collections")} {
                    for $collection in $old-collections
                    (: filter out collections maintained by temporal implementation :)
                    where not($collection = ($temporal-collection, "latest", $uri))
                    return element {QName($ns,"collection")} {$collection}
                }
            else element {QName($ns,"collections")} {
                    for $collection in xdmp:default-collections($uri)
                    return element {QName($ns,"collection")} {$collection}
                },

            (: Note: xdmp:default-permissions() are for the amped user :)
            element {QName($ns,"permissions")} {
                if (exists($permissions)) then (
                    $permissions | (
                        if (empty($rids) or not($document-exists))
                        then xdmp:default-permissions($uri)
                        else $old-permissions[not(sec:role-id/data(.) = $rids)]
                        )
                    )
                else if ($document-exists)
                then $old-permissions
                else xdmp:default-permissions($uri)
            },

            if (exists($quality))
            then element {QName($ns,"quality")} {$quality}
            else if ($document-exists)
            then element {QName($ns,"quality")} {$old-quality}
            else (),

            let $values := if (exists($metadata-values)) then $metadata-values else xdmp:document-get-metadata($uri)
            return element {QName($ns,"metadata")} { $metadata-values },

            if ($format ne "xml" or empty($repair)) then ()
            else element {QName($ns,"repair")} {$repair},

            element {QName($ns,"format")} {$format},

            if (empty($forest-id)) then ()
            else
                element {QName($ns,"forests")} {
                    element {QName($ns,"forest")} {$forest-id}
                },

            if (empty($encoding)) then ()
            else element {QName($ns,"encoding")} {$encoding}
            }
    return (
        if ($document-exists or dbut:is-uri($uri)) then ()
        else error((), "REST-INVALIDPARAM", "invalid uri: "||$uri),

        if (empty($responder)) then ()
        else $responder(
            if ($with-overwrite or $document-exists)
                then $docmodupd:CONTENT_UPDATED
                else $docmodupd:DOCUMENT_CREATED,
            $uri,(),(),(),(),(),
            if (empty($temporal-collection)) then ()
            else if (exists($system-timestamp))
            then $system-timestamp
            else temporal:statement-get-system-time()
            ),

        if (empty($temporal-collection)) then (
            if ($is-untraced or docmodupd:check-untraced()) then ()
            else lid:log($docmodupd:trace-id,"load-content#document",map:entry("options",$options)),

            xdmp:document-load("rest::",$options)
            )
        else (
            if ($is-untraced or docmodupd:check-untraced()) then ()
            else lid:log(
                $docmodupd:trace-id,"load-content#temporal",
                map:entry("options",$options)=>map:with("temporal-collection",$temporal-collection)
                =>map:with("version-uri",$version-uri)=>map:with("system-timestamp",$system-timestamp)
                ),

            if (empty($system-timestamp)) then ()
            else temporal:statement-set-system-time($system-timestamp),

            if (empty($version-uri)) then ()
            else temporal:statement-set-document-version-uri($uri,$version-uri),

            temporal:document-load($temporal-collection,"rest::",$options)
            )
        )
};

declare function docmodupd:write-collections(
    $uri         as xs:string,
    $meta-uri    as xs:string?,
    $collections as xs:string*
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    if (empty($collections)) then ()
    else (
        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"write-collections",
            map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)=>map:with("collections",$collections)
            ),

        for $doc-uri in ($uri, $meta-uri)
        return xdmp:document-set-collections($doc-uri,$collections)
        )
};

declare function docmodupd:write-permissions(
    $uri         as xs:string,
    $meta-uri    as xs:string?,
    $permissions as element(sec:permission)*
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    if (empty($permissions)) then ()
    else
        let $perms := ($permissions|xdmp:default-permissions($uri))
        return (
            if ($is-untraced or docmodupd:check-untraced()) then ()
            else lid:log(
                $docmodupd:trace-id,"write-permissions",
                map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)=>map:with("perms",$perms)
                ),

            for $doc-uri in ($uri, $meta-uri)
            return xdmp:document-set-permissions($doc-uri, $perms)
            )
};

(: overwrite or merge :)
declare function docmodupd:write-properties(
    $uri         as xs:string,
    $meta-uri    as xs:string?,
    $prop-qnames as xs:QName*,
    $properties  as element()*
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    if (empty($properties)) then ()
    else if (empty($prop-qnames))
    then docmodupd:write-properties($uri,$meta-uri,$properties)
    else (
        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"write-properties#add",
            map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)
            =>map:with("prop-qnames",$prop-qnames)=>map:with("properties",$properties)
            ),

        for $doc-uri in ($uri, $meta-uri)
        return (
            xdmp:document-remove-properties($doc-uri,$prop-qnames),
            xdmp:document-add-properties($doc-uri,$properties)
            )
        )
};

(: overwrite :)
declare function docmodupd:write-properties(
    $uri        as xs:string,
    $meta-uri   as xs:string?,
    $properties as element()*
) as empty-sequence()
{
    if (empty($properties)) then ()
    else
        for $doc-uri in ($uri, $meta-uri)
        return docmodupd:write-properties($doc-uri,$properties)
};

declare private function docmodupd:write-properties(
    $uri        as xs:string,
    $properties as element()*
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    if (empty($properties)) then ()
    else (
        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"write-properties#set",
            map:entry("uri",$uri)=>map:with("properties",$properties)
            ),

        xdmp:document-set-properties($uri,$properties)
        )
};

declare function docmodupd:write-quality(
    $uri      as xs:string,
    $meta-uri as xs:string?,
    $quality  as xs:integer?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    if (empty($quality)) then ()
    else (
        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"write-quality",
            map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)=>map:with("quality",$quality)
            ),

        for $doc-uri in ($uri, $meta-uri)
        return xdmp:document-set-quality($doc-uri,$quality)
        )
};

declare function docmodupd:write-metadata-values(
    $uri      as xs:string,
    $meta-uri as xs:string?,
    $values   as map:map?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    if (empty($values)) then ()
    else (
        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"write-metadata-values",
            map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)=>map:with("values",$values)
            ),

        for $doc-uri in ($uri, $meta-uri)
        return xdmp:document-set-metadata($doc-uri,$values)
        )
};

declare function docmodupd:reset-collections(
    $uri      as xs:string,
    $meta-uri as xs:string?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    if ($is-untraced or docmodupd:check-untraced()) then ()
    else lid:log(
        $docmodupd:trace-id,"reset-collections",
        map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)
        ),

    for $doc-uri in ($uri, $meta-uri)
    return xdmp:document-set-collections($doc-uri, xdmp:default-collections($doc-uri))
};

declare function docmodupd:reset-permissions(
    $uri      as xs:string,
    $meta-uri as xs:string?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    if ($is-untraced or docmodupd:check-untraced()) then ()
    else lid:log(
        $docmodupd:trace-id,"reset-permissions",
        map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)
        ),

    let $perms := xdmp:default-permissions($uri)
    for $doc-uri in ($uri, $meta-uri)
    (: xdmp:document-remove-permissions() is problematic because
       a document must always have at least one update permission and
       the REST API must be able to read and write documents :)
    return xdmp:document-set-permissions($doc-uri, $perms)
};

declare function docmodupd:remove-properties(
    $uri      as xs:string,
    $meta-uri as xs:string?,
    $has-doc  as xs:boolean
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    (: for naked properties, delete the document :)
    if (not($has-doc))
    then xdmp:document-delete($uri)
    else (
        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"remove-properties",
            map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)
            ),

        for $doc-uri in ($uri, $meta-uri)
        return xdmp:document-remove-properties(
            $doc-uri,
            xdmp:document-properties($doc-uri)/prop:properties/(* except prop:*)/node-name(.)
            )
        )
};

declare function docmodupd:reset-quality(
    $uri      as xs:string,
    $meta-uri as xs:string?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    if ($is-untraced or docmodupd:check-untraced()) then ()
    else lid:log(
        $docmodupd:trace-id,"reset-quality",
        map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)
        ),

    for $doc-uri in ($uri, $meta-uri)
    return xdmp:document-set-quality($doc-uri, 0)
};

declare function docmodupd:reset-metadata-values(
    $uri      as xs:string,
    $meta-uri as xs:string?
) as empty-sequence()
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

    if ($is-untraced or docmodupd:check-untraced()) then ()
    else lid:log(
        $docmodupd:trace-id,"reset-metadata-values",
        map:entry("uri",$uri)=>map:with("meta-uri",$meta-uri)
        ),

    for $doc-uri in ($uri, $meta-uri)
    return xdmp:document-set-metadata($doc-uri,map:new())
};

declare private function docmodupd:get-forest-id(
    $forest-name as xs:string?
) as xs:unsignedLong?
{
    if (empty($forest-name)) then ()
    else
        try {
            xdmp:forest($forest-name)
        } catch ($e) {
            if ($e/error:code eq "XDMP-NOSUCHFOREST")
            then error((), "REST-INVALIDPARAM", "No such forest: "||$forest-name)
            else xdmp:rethrow()
        }
};

(:
    patch functions
 :)
declare function docmodupd:convert-patch(
    $uri           as xs:string,
    $raw-patch     as node(),
    $patch-content as map:map?,
    $error-list    as json:array?
) as element(rapi:patch)
{
    if ($raw-patch instance of element(rapi:patch))
    then docmodupd:convert-xml-patch($raw-patch,$error-list)
    else if ($raw-patch instance of object-node()) then
       if (exists($patch-content))
       then docmodupd:convert-json-patch($raw-patch,$patch-content,$error-list)
       else error((),"RESTAPI-INTERNALERROR","JSON patch without patch content map for uri: "||$uri)
    else error((),"RESTAPI-INVALIDREQ","patch is not <rapi:patch> or JSON patch object for uri: "||$uri)
};

declare function docmodupd:convert-xml-patch(
    $raw-patch  as element(rapi:patch),
    $error-list as json:array?
) as element(rapi:patch)
{
    <rapi:patch>{
        $raw-patch/@*,
        docmodupd:make-namespaces(eput:collect-bindings($raw-patch)),

        (: safe and absolute operation paths :)
        for $node in $raw-patch/node()
        let $node-bindings := eput:collect-bindings($node)
        return
            typeswitch($node)
            case element(rapi:delete) return (
                let $select-okay     :=
                    if (exists($node/@select))
                    then true()
                    else docmodupd:push-error($error-list,"delete without select path")
                let $cardinality-okay := docmodupd:has-valid-cardinality(
                    $node/@cardinality!string(.), $error-list
                    )
                return
                    if (not($select-okay or $cardinality-okay)) then ()
                    else docmodupd:convert-xml-operation($node,$node-bindings,$node/@select,$error-list)
                )
            case element(rapi:insert) return (
                let $context-okay     :=
                    if (exists($node/@context))
                    then true()
                    else docmodupd:push-error($error-list,"insert without context path")
                let $position-okay    := docmodupd:is-insert-position-valid(
                    docmodupd:node-insert-position($node), $error-list
                    )
                let $cardinality-okay := docmodupd:has-valid-cardinality(
                    $node/@cardinality!string(.), $error-list
                    )
                let $content-okay     :=
                    if (exists($node/node()))
                    then true()
                    else docmodupd:push-error($error-list,"insert without content: "||string($node/@context))
                return
                    if (not($context-okay or $position-okay or $cardinality-okay or $content-okay))
                    then ()
                    else docmodupd:convert-xml-operation($node,$node-bindings,$node/@context,$error-list)
                )
            case element(rapi:replace) return (
                let $select-okay     :=
                    if (exists($node/@select))
                    then true()
                    else docmodupd:push-error($error-list,"replace without select path")
                let $cardinality-okay := docmodupd:has-valid-cardinality(
                    $node/@cardinality!string(.), $error-list
                    )
                let $content-okay     :=
                    if (exists($node/node()) or exists($node/@apply))
                    then true()
                    else docmodupd:push-error($error-list,"replace without apply or content: "||string($node/@select))
                return
                    if (not($select-okay or $cardinality-okay or $content-okay)) then ()
                    else docmodupd:convert-xml-operation($node,$node-bindings,$node/@select,$error-list)
                )
            case element(rapi:replace-insert) return (
                let $select-okay     :=
                    if (exists($node/@select))
                    then true()
                    else docmodupd:push-error($error-list,"replace-insert without select path")
                let $context          :=
                    $node/@context ! docmodupd:get-full-path($node-bindings,string(.),$error-list)
                let $context-okay     :=
                    if (exists($context))
                    then true()
                    else docmodupd:push-error($error-list,"replace-insert without context path")
                let $position-okay    := docmodupd:is-insert-position-valid(
                    docmodupd:node-insert-position($node), $error-list
                    )
                let $cardinality-okay := docmodupd:has-valid-cardinality(
                    $node/@cardinality!string(.), $error-list
                    )
                let $content          := $node/node()
                let $content-okay     :=
                    if (exists($content) or exists($node/@apply))
                    then true()
                    else docmodupd:push-error($error-list,"replace-insert without apply or content: "||string($node/@context))
                return
                    if (not($select-okay or $context-okay or $position-okay or $cardinality-okay or $content-okay))
                    then ()
                    else
                    <rapi:replace-insert>{
                        $node/(@* except (@context|@select)),
                        attribute context {$context},
                        attribute select {
                            docmodupd:get-context-select-path(
                                $node-bindings,$context,$node/@select/string(.),$error-list
                                )
                            },
                        docmodupd:make-namespaces($node-bindings),

                        if (empty($content)) then ()
                        else $content
                    }</rapi:replace-insert>
                )
            default return $node
    }</rapi:patch>
};

declare function docmodupd:convert-xml-operation(
    $operation     as element(),
    $node-bindings as map:map?,
    $path-att      as attribute(),
    $error-list    as json:array?
) as element()
{
    element {node-name($operation)} {
        $operation/(@* except $path-att),
        attribute {node-name($path-att)} {
            docmodupd:get-full-path($node-bindings,string($path-att),$error-list)
            },
        docmodupd:make-namespaces($node-bindings),
        $operation/node()
        }
};

declare private function docmodupd:make-namespaces(
    $bindings as map:map?
)
{
    if (empty($bindings)) then ()
    else
        for $prefix in map:keys($bindings)
        return namespace {$prefix} {map:get($bindings,$prefix)}
};

declare function docmodupd:convert-json-patch(
    $raw-patch     as object-node(),
    $patch-content as map:map,
    $error-list    as json:array?
) as element(rapi:patch)
{
    <rapi:patch>{
        let $pathlang        := $raw-patch/pathlang!string(.)
        let $is-jsonpath     := ($pathlang eq 'jsonpath')
        let $jsonpath-parser :=
            if (not($is-jsonpath)) then ()
            else
                let $parser := json-path:make-parser()
                return (
                    json-path:set-parse-policy($parser,"strict"),
                    $parser
                    )
        let $ops := $raw-patch/patch
        return (
            for $replaceLibrary in $ops/node("replace-library")
            let $ns := $replaceLibrary/ns!string(.)
            let $at := $replaceLibrary/at!string(.)
            return
                if (exists($at)) then
                    <rapi:replace-library at="{$at}">{
                        if (empty($ns)) then ()
                        else attribute ns {$ns}
                    }</rapi:replace-library>
                else docmodupd:push-error($error-list,
                    "replace library without at ("||$at||")"),

            for $delete-op in $ops/delete
            let $select-in   := $delete-op/select!string(.)
            let $select      :=
                if ($is-jsonpath)
                then json-path:parse($jsonpath-parser, $select-in)
                else $select-in
            let $cardinality := $delete-op/cardinality!string(.)
            return
                <rapi:delete>{
                    if (empty($select))
                    then docmodupd:push-error($error-list,"delete without select path")
                    else (
                        if (not($is-jsonpath)) then ()
                        else attribute original-select {$select-in},
                        attribute select {docmodupd:get-full-path((),$select,$error-list)}
                        ),

                    if (not(
                        docmodupd:has-valid-cardinality($cardinality, $error-list)
                        )) then ()
                    else attribute cardinality {$cardinality}
                }</rapi:delete>,

            for $insert-op in $ops/insert
            let $context-in  := $insert-op/context!string(.)
            let $context     :=
                if ($is-jsonpath)
                then json-path:parse($jsonpath-parser, $context-in)
                else $context-in
            let $position    := docmodupd:json-node-insert-position($insert-op)
            let $cardinality := $insert-op/cardinality!string(.)
            let $content     := docmodupd:detach-content($insert-op,$error-list)
            let $contentKey  :=
                if (exists($content))
                then string(xdmp:random(1000000))
                else docmodupd:push-error($error-list,
                    "insert without content: "||$context-in)
            let $contentType :=
                typeswitch($content)
                case text() return "string"
                case node() return xdmp:node-kind($content)
                default     return "atomic"
            return
                <rapi:insert type="{$contentType}">{
                    if (empty($context))
                    then docmodupd:push-error($error-list,"insert without context path")
                    else (
                        if (not($is-jsonpath)) then ()
                        else attribute original-context {$context-in},
                        attribute context {docmodupd:get-full-path((),$context,$error-list)}
                        ),

                    if (not(
                        docmodupd:is-insert-position-valid($position, $error-list)
                        )) then ()
                    else attribute position {$position},

                    if (not(
                        docmodupd:has-valid-cardinality($cardinality, $error-list)
                        )) then ()
                    else attribute cardinality {$cardinality},

                    attribute contentKey {$contentKey},

                    if (empty($content))
                    then docmodupd:push-error($error-list,"insert without content")
                    else map:put($patch-content,$contentKey,$content)
                }</rapi:insert>,

            for $replace-op in $ops/replace
            let $select-in   := $replace-op/select ! string(.)
            let $select      :=
                if ($is-jsonpath)
                then json-path:parse($jsonpath-parser, $select-in)
                else $select-in
            let $cardinality := $replace-op/cardinality!string(.)
            let $apply       := $replace-op/apply!string(.)
            let $content     := docmodupd:detach-content($replace-op,$error-list)
            let $contentKey  :=
                if (exists($content))
                then string(xdmp:random(1000000))
                else if (exists($apply)) then ()
                else docmodupd:push-error($error-list,
                    "replace without apply or content: "||$select-in)
            let $contentType :=
                typeswitch($content)
                case text() return "string"
                case node() return xdmp:node-kind($content)
                default     return "atomic"
            return
                <rapi:replace type="{$contentType}">{
                    if (empty($select))
                    then docmodupd:push-error($error-list,"replace without select path")
                    else (
                        if (not($is-jsonpath)) then ()
                        else attribute original-select {$select-in},
                        attribute select {docmodupd:get-full-path((),$select,$error-list)}
                        ),

                    if (not(
                        docmodupd:has-valid-cardinality($cardinality, $error-list)
                        )) then ()
                    else attribute cardinality {$cardinality},

                    if (empty($apply)) then ()
                    else attribute apply {$apply},

                    if (empty($contentKey)) then ()
                    else (
                        attribute contentKey {$contentKey},

                        if (empty($content))
                        then docmodupd:push-error($error-list,"replace without content")
                        else map:put($patch-content,$contentKey,$content)
                        )
                }</rapi:replace>,

            for $replace-insert-op in $ops/replace-insert
            let $select-in   := $replace-insert-op/select!string(.)
            let $select      :=
                if ($is-jsonpath)
                then json-path:parse($jsonpath-parser, $select-in)
                else $select-in
            let $context-in  := $replace-insert-op/context!string(.)
            let $context     := (
                if ($is-jsonpath)
                then json-path:parse($jsonpath-parser, $context-in)
                else $context-in
                ) ! docmodupd:get-full-path((), ., $error-list)
            let $position    := docmodupd:json-node-insert-position($replace-insert-op)
            let $cardinality := $replace-insert-op/cardinality!string(.)
            let $apply       := $replace-insert-op/apply!string(.)
            let $content     := docmodupd:detach-content($replace-insert-op,$error-list)
            let $contentKey  :=
                if (exists($content))
                then string(xdmp:random(1000000))
                else if (exists($apply)) then ()
                else docmodupd:push-error($error-list,
                    "replace-insert without apply or content: "||$select-in)
            let $contentType :=
                typeswitch($content)
                case text() return "string"
                case node() return xdmp:node-kind($content)
                default     return "atomic"
            return
                <rapi:replace-insert type="{$contentType}">{
                    if (empty($select))
                    then docmodupd:push-error($error-list,"replace-insert without select path")
                    else (
                        if (not($is-jsonpath)) then ()
                        else attribute original-select {$select-in},
                        attribute select {
                            docmodupd:get-context-select-path((),$context,$select,$error-list)
                            }
                        ),

                    if (empty($context))
                    then docmodupd:push-error($error-list,"replace-insert without context path")
                    else (
                        if (not($is-jsonpath)) then ()
                        else attribute original-context {$context-in},
                        attribute context {docmodupd:get-full-path((),$context,$error-list)}
                        ),

                    if (not(
                        docmodupd:is-insert-position-valid($position, $error-list)
                        )) then ()
                    else attribute position {$position},

                    if (not(
                        docmodupd:has-valid-cardinality($cardinality, $error-list)
                        )) then ()
                    else attribute cardinality {$cardinality},

                    if (empty($apply)) then ()
                    else attribute apply {$apply},

                    if (empty($contentKey)) then ()
                    else (
                        attribute contentKey {$contentKey},

                        if (empty($content))
                        then docmodupd:push-error($error-list,"replace-insert without content")
                        else map:put($patch-content,$contentKey,$content)
                        )
                }</rapi:replace-insert>
            )
    }</rapi:patch>
};

declare function docmodupd:get-full-path(
    $bindings   as map:map?,
    $raw-path   as xs:string,
    $error-list as json:array?
) as xs:string?
{
    docmodupd:check-path(
        $bindings,
        if (starts-with($raw-path,"/"))
            then $raw-path
            else concat("//",$raw-path),
        $error-list
        )
};
declare private function docmodupd:get-context-select-path(
    $bindings   as map:map?,
    $context    as xs:string,
    $select     as xs:string,
    $error-list as json:array?
) as xs:string?
{
    docmodupd:check-path(
        $bindings,
        if (starts-with($select,"/"))
            then $select
            else concat($context,"/",$select),
        $error-list
        )
};
declare private function docmodupd:check-path(
    $bindings   as map:map?,
    $path       as xs:string,
    $error-list as json:array?
) as xs:string?
{
    if (docmodupd:is-valid-patch-path($bindings,$path))
    then $path
    else docmodupd:push-error($error-list,"invalid path: "||$path)
};
declare private function docmodupd:is-valid-patch-path(
    $bindings as map:map?,
    $path     as xs:string
) as xs:boolean
{
    if (exists($bindings))
    then cts:valid-document-patch-path($path,$bindings)
    else cts:valid-document-patch-path($path)
};

declare private function docmodupd:is-insert-position-valid(
    $position   as xs:string?,
    $error-list as json:array?
) as xs:boolean
{
    if ($position = ("before","after","last-child"))
    then true()
    else (
        if (exists($position))
        then docmodupd:push-error($error-list,"insert with unknown position: "||$position)
        else docmodupd:push-error($error-list,"insert without position"),

        false()
        )
};

declare function docmodupd:has-valid-cardinality(
    $cardinality as xs:string?,
    $error-list  as json:array?
) as xs:boolean
{
    if (empty($cardinality))
    then false()
    else if ($cardinality = ("?", ".", "*", "+"))
    then true()
    else (
        docmodupd:push-error($error-list,"unknown cardinality: "||$cardinality),

        false()
        )
};

declare function docmodupd:apply-content-patch(
    $temporal-collection as xs:string?,
    $document         as document-node(),
    $document-format  as xs:string,
    $patch            as element(rapi:patch),
    $patch-content    as map:map?,
    $xqy-function-map as map:map?,
    $sjs-apply-array  as json:array?,
    $error-list       as json:array?
) as xs:boolean
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    let $string2literal      := function($s as xs:string?) as xs:string { if (empty($s)) then "()" else "'" || string-join(tokenize($s,"'"),"&amp;apos;") || "'" }
    let $is-xml             := ($document-format eq "xml")
    let $delete-ops         := $patch/rapi:delete
    let $replace-ops        := $patch/rapi:replace
    let $replace-insert-ops := $patch/rapi:replace-insert
    let $insert-ops         := $patch/rapi:insert
    let $expression         := concat(
        "let $sjs-result-map := ",docmodupd:sjs-apply-expression($sjs-apply-array),
        "return ( ",string-join((

        for $delete-op at $i in $delete-ops
        let $path := $delete-op/@select/string(.)
        return
            if (empty($path)) then ()
            else concat(
                "docmodupd:node-delete-operation($is-xml, ",
                    "$error-list, ",
                    "subsequence($delete-ops,",$i,",1), ",
                    "'",string-join(tokenize($path,"'"),"&amp;apos;"),"', ",
                    $string2literal($temporal-collection), ", ",
                    $path,
                    ")"
                ),

        for $replace-op at $i in $replace-ops
        let $path := $replace-op/@select/string(.)
        return
            if (empty($path)) then ()
            else concat(
                "docmodupd:node-replace-operation($is-xml, ",
                    "$patch-content, $xqy-function-map, $sjs-result-map, $error-list, ",
                    "subsequence($replace-ops,",$i,",1), ",
                    "'",string-join(tokenize($path,"'"),"&amp;apos;"),"', ",
                    $string2literal($temporal-collection), ", ",
                    $path,
                    ")"
                ),

        for $replace-insert-op at $i in $replace-insert-ops
        let $replace-path := $replace-insert-op/@select/string(.)
        let $insert-path  := $replace-insert-op/@context/string(.)
        let $position     := docmodupd:node-insert-position($replace-insert-op)
        return
            if (empty($replace-path) or empty($insert-path)) then ()
            else concat(
                "let $replace-nodes := ",$replace-path,
                " return ",
                    "if (exists($replace-nodes)) ",
                    "then docmodupd:node-replace-operation($is-xml, ",
                        "$patch-content, $xqy-function-map, $sjs-result-map, $error-list, ",
                        "subsequence($replace-insert-ops,",$i,",1), ",
                        "'",string-join(tokenize($replace-path,"'"),"&amp;apos;"),"', ",
                        $string2literal($temporal-collection), ", ",
                        "$replace-nodes",
                        ")",
                    "else docmodupd:node-insert-",$position,"-operation($is-xml, ",
                        "$patch-content, $xqy-function-map, $sjs-result-map, $error-list, ",
                        "subsequence($replace-insert-ops,",$i,",1), ",
                        "'",string-join(tokenize($insert-path,"'"),"&amp;apos;"),"', ",
                        $string2literal($temporal-collection), ", ",
                        $insert-path,
                        ")"
                ),

        for $insert-op at $i in $insert-ops
        let $position := docmodupd:node-insert-position($insert-op)
        let $path     := $insert-op/@context/string(.)
        return
            if (empty($path)) then ()
            else concat(
                "docmodupd:node-insert-",$position,"-operation($is-xml, ",
                    "$patch-content, $xqy-function-map, $sjs-result-map, $error-list, ",
                    "subsequence($insert-ops,",$i,",1), ",
                    "'",string-join(tokenize($path,"'"),"&amp;apos;"),"', ",
                    $string2literal($temporal-collection), ", ",
                    $path,
                    ")"
                )

        ),", "),
    " )")
    let $ns-bindings     :=
        for $prefix in in-scope-prefixes($patch)
        let $ns-uri := namespace-uri-for-prefix($prefix,$patch)
        where $prefix ne "xml"
        return
            if ($ns-uri = ("http://marklogic.com/rest-api")) then ()
            else ($prefix, $ns-uri)
    return
        try {
            exists(
                if (empty($ns-bindings))
                then $document/xdmp:value($expression)
                else xdmp:with-namespaces(
                    $ns-bindings,
                    $document/xdmp:value($expression)
                    )
                )
        } catch($e) {
            if ($is-untraced or docmodupd:check-untraced()) then ()
            else lid:log(
               $docmodupd:trace-id,"apply-content-patch#catch",
               map:entry("error-code",$e/error:code)
               =>map:with("expression",$expression)=>map:with("ns-bindings",$ns-bindings),
               map:entry("document",$document)
               ),

            if ($e/error:code eq "XDMP-UNEXPECTED")
            then error((), "RESTAPI-INVALIDCONTENT",
                concat("Invalid content patch (maybe missing pathlang property?) or replacement library"))
            else xdmp:rethrow()
        }
};

declare function docmodupd:apply-sjs-operations(
    $is-xml          as xs:boolean,
    $patch           as element(rapi:patch),
    $patch-content   as map:map?,
    $sjs-apply-array as json:array?,
    $error-list      as json:array?,
    $matchdefs       as map:map*
) as map:map?
{
    if (empty($matchdefs)) then ()
    else (
        if ($is-untraced or docmodupd:check-untraced()) then ()
            else lid:log(
                $docmodupd:trace-id,"apply-sjs-operations",
                map:entry("matchdefs",$matchdefs)
                ),

        let $result := xdmp:apply(
            xdmp:function(xs:QName("applyOperations"),
                "/MarkLogic/rest-api/models/document-model-update.sjs"),

            $is-xml,

            string($patch/rapi:replace-library/@at),

            json:to-array(
                for $matchdef in $matchdefs
                let $operation := map:get($matchdef,"operation")
                let $fname-raw := $operation/@apply/string(.)
                let $fname     :=
                    if ($fname-raw castable as xs:NMTOKEN)
                    then xs:NMTOKEN($fname-raw)
                    else docmodupd:push-error(
                        $error-list, "cannot apply empty JavaScript function: "||xdmp:quote($operation)
                        )
                return
                    if (empty($fname)) then ()
                    else $matchdef
                        =>map:with("fname",   $fname)
                        =>map:with("content", docmodupd:prepare-content(
                            $is-xml,$patch-content,$operation,true()
                            ))
                )
            )
        return
            if (not($result instance of json:array))
            then $result
            else if (empty($error-list))
            then $result
            else
                for $i in 1 to json:array-size($result)
                return json:array-push($error-list, $result[$i])
        )
};

declare function docmodupd:node-delete-operation(
    $is-xml     as xs:boolean,
    $error-list as json:array?,
    $operation  as element(),
    $path       as xs:string,
    $temporal-collection as xs:string?,
    $nodes      as node()*
) as xs:int?
{
    if (docmodupd:skip-nodes($error-list,$operation,$path,$nodes)) then ()
    else (
        1,

        if ($is-untraced or docmodupd:check-untraced()) then ()
        else lid:log(
            $docmodupd:trace-id,"node-delete-operation",
            map:entry("operation",$operation)=>map:with("path",$path)
            =>map:with("temporal-collection",$temporal-collection)=>map:with("nodes",$nodes)
            ),

        for $node in $nodes
        return
            if (exists($temporal-collection))
            then temporal:node-delete($temporal-collection,$node)
            else xdmp:node-delete($node)
        )
};

declare function docmodupd:node-replace-operation(
    $is-xml           as xs:boolean,
    $patch-content    as map:map?,
    $xqy-function-map as map:map?,
    $sjs-result-map   as map:map?,
    $error-list       as json:array?,
    $operation        as element(),
    $path             as xs:string,
    $temporal-collection as xs:string?,
    $nodes            as node()*
) as xs:int?
{
    if (docmodupd:skip-nodes($error-list,$operation,$path,$nodes)) then ()
    else (
        1,

        for $node in $nodes
        let $parent   := $node/..
        let $addition := docmodupd:produce-content(
            $is-xml,true(),$error-list,$patch-content,$xqy-function-map,$sjs-result-map,$parent,$node,$operation
            )
        return (
            if ($is-untraced or docmodupd:check-untraced()) then ()
            else lid:log(
                $docmodupd:trace-id,"node-replace-operation",
                map:entry("operation",$operation)=>map:with("path",$path)
                =>map:with("temporal-collection",$temporal-collection)
                =>map:with("node",$node)=>map:with("addition",$addition)
                ),

            if (exists($temporal-collection))
            then temporal:node-replace($temporal-collection,$node,$addition)
            else xdmp:node-replace($node,$addition)
            )
        )
};

declare function docmodupd:node-insert-before-operation(
    $is-xml           as xs:boolean,
    $patch-content    as map:map?,
    $xqy-function-map as map:map?,
    $sjs-result-map   as map:map?,
    $error-list       as json:array?,
    $operation        as element(),
    $path             as xs:string,
    $temporal-collection as xs:string?,
    $nodes            as node()*
) as xs:int?
{
    if (docmodupd:skip-nodes($error-list,$operation,$path,$nodes)) then ()
    else (
        1,

        for $node in $nodes
        for $addition in docmodupd:produce-content(
            $is-xml,false(),$error-list,$patch-content,$xqy-function-map,$sjs-result-map,$node/..,(),$operation
            )
        return (
            if ($is-untraced or docmodupd:check-untraced()) then ()
            else lid:log(
                $docmodupd:trace-id,"node-insert-before-operation",
                map:entry("operation",$operation)=>map:with("path",$path)
                =>map:with("temporal-collection",$temporal-collection)
                =>map:with("node",$node)=>map:with("addition",$addition)
                ),

            if (exists($temporal-collection))
            then temporal:node-insert-before($temporal-collection,$node,$addition)
            else xdmp:node-insert-before($node, $addition)
            )
        )
};

declare function docmodupd:node-insert-after-operation(
    $is-xml           as xs:boolean,
    $patch-content    as map:map?,
    $xqy-function-map as map:map?,
    $sjs-result-map   as map:map?,
    $error-list       as json:array?,
    $operation        as element(),
    $path             as xs:string,
    $temporal-collection as xs:string?,
    $nodes            as node()*
) as xs:int?
{
    if (docmodupd:skip-nodes($error-list,$operation,$path,$nodes)) then ()
    else (
        1,

        for $node in $nodes
        for $addition in docmodupd:produce-content(
            $is-xml,false(),$error-list,$patch-content,$xqy-function-map,$sjs-result-map,$node/..,(),$operation
            )
        return (
            if ($is-untraced or docmodupd:check-untraced()) then ()
            else lid:log(
                $docmodupd:trace-id,"node-insert-after-operation",
                map:entry("operation",$operation)=>map:with("path",$path)
                =>map:with("temporal-collection",$temporal-collection)
                =>map:with("node",$node)=>map:with("addition",$addition)
                ),

            if (exists($temporal-collection))
            then temporal:node-insert-after($temporal-collection,$node,$addition)
            else xdmp:node-insert-after($node,$addition)
            )
        )
};

declare function docmodupd:node-insert-last-child-operation(
    $is-xml           as xs:boolean,
    $patch-content    as map:map?,
    $xqy-function-map as map:map?,
    $sjs-result-map   as map:map?,
    $error-list       as json:array?,
    $operation        as element(),
    $path             as xs:string,
    $temporal-collection as xs:string?,
    $nodes            as node()*
) as xs:int?
{
    if (docmodupd:skip-nodes($error-list,$operation,$path,$nodes)) then ()
    else (
        1,

        for $node in $nodes
        return
            if ($is-xml and $node instance of element()) then
                for $addition in docmodupd:produce-content(
                    $is-xml,false(),$error-list,$patch-content,$xqy-function-map,$sjs-result-map,$node,(),$operation
                    )
                return if (exists($temporal-collection))
                       then temporal:node-insert-child($temporal-collection,$node,$addition)
                       else xdmp:node-insert-child($node,$addition)
            else if (not($is-xml) and ($node instance of object-node() or
                    $node instance of array-node())) then
                for $addition in docmodupd:produce-content(
                    $is-xml,false(),$error-list,$patch-content,$xqy-function-map,$sjs-result-map,$node,(),$operation
                    )
                return (
                    if ($is-untraced or docmodupd:check-untraced()) then ()
                    else lid:log(
                        $docmodupd:trace-id,"node-replace-insert-last-child",
                        map:entry("operation",$operation)=>map:with("path",$path)
                        =>map:with("temporal-collection",$temporal-collection)
                        =>map:with("node",$node)=>map:with("addition",$addition)
                        ),

                    if (exists($temporal-collection))
                    then temporal:node-insert-child($temporal-collection,$node,$addition)
                    else xdmp:node-insert-child($node,$addition)
                    )
            else docmodupd:push-error(
                $error-list,"cannot insert last child for "||xdmp:node-kind($node)||" node: "||
                    string($operation!(@original-context,@context)[1])
                )
        )
};

declare function docmodupd:skip-nodes(
    $error-list as json:array?,
    $operation  as element(),
    $path       as xs:string,
    $nodes      as node()*
) as xs:boolean
{
    let $node-count := count($nodes)
    return
        (: never skip 1 node, which is always a valid cardinality :)
        if ($node-count eq 1)
        then false()
        else
            let $cardinality := $operation/@cardinality ! string(.)
            return
                (: with permissive cardinality, skip if no nodes :)
                if (empty($cardinality) or $cardinality eq "*")
                then $node-count eq 0
                (: with invalid cardinality, skip with error :)
                else if (
                        ($cardinality ne "?" and $node-count eq 0) or
                        ($cardinality ne "+" and $node-count > 1)
                        ) then (
                    docmodupd:push-error($error-list,concat(
                            "invalid cardinality of ",string($node-count),
                            " nodes for: ",$path
                        )),
                    true()
                    )
                (: with valid cardinality, skip if no nodes :)
                else $node-count eq 0
};

declare function docmodupd:apply-metadata-patch(
    $document         as document-node(),
    $document-format  as xs:string,
    $patch            as element(rapi:patch),
    $patch-content    as map:map?,
    $xqy-function-map as map:map?,
    $sjs-apply-array  as json:array?,
    $error-list       as json:array?
) as item()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    let $is-xml         := ($document-format eq "xml")
    let $operations     := $patch/(rapi:delete|rapi:replace|rapi:replace-insert|rapi:insert)
    let $change-map     := map:map()
    let $insert-map     := map:map()
    let $sjs-result-map := ()
    let $expression     := concat(
        "let $sjs-local-map := ",docmodupd:sjs-apply-expression($sjs-apply-array),
        "return ( ",

        "if (empty($sjs-local-map)) then () ",
        "else xdmp:set($sjs-result-map,$sjs-local-map), ",
        string-join((
        for $operation at $i in $operations
        let $select-path  := $operation/@select/string(.)
        let $context-path := $operation/@context/string(.)
        return
            if (empty($select-path) and empty($context-path))
            then docmodupd:push-error(
                $error-list,"operation without context or select path"
                )
            else if (empty($context-path))
            then concat(
                "docmodupd:match-operation(",
                    "$is-xml, $change-map, $error-list, ",
                    "subsequence($operations,",$i,",1), ",
                    "'",string-join(tokenize($select-path,"'"),"&amp;apos;"),"', ",
                    $select-path,
                    ")"
                )
            else if (empty($select-path))
            then concat(
                "docmodupd:match-operation(",
                    "$is-xml, $insert-map, $error-list, ",
                    "subsequence($operations,",$i,",1), ",
                    "'",string-join(tokenize($context-path,"'"),"&amp;apos;"),"', ",
                    $context-path,
                    ")"
                )
            else concat(
                "(let $select-nodes := ",$select-path,
                " return ",
                    "if (exists($select-nodes)) ",
                    "then ",
                        "docmodupd:match-operation(",
                            "$is-xml, $change-map, $error-list, ",
                            "subsequence($operations,",$i,",1), ",
                            "'",string-join(tokenize($select-path,"'"),"&amp;apos;"),"', ",
                            "$select-nodes",
                            ") ",
                    "else ",
                        "docmodupd:match-operation(",
                            "$is-xml, $insert-map, $error-list, ",
                            "subsequence($operations,",$i,",1), ",
                            "'",string-join(tokenize($context-path,"'"),"&amp;apos;"),"', ",
                            $context-path,
                            "))"
                )
        ),"|"),
    " )")
    let $ns-bindings :=
        if (not($is-xml)) then ()
        else
            for $prefix in in-scope-prefixes($patch)
            let $ns-uri := namespace-uri-for-prefix($prefix,$patch)
            where $prefix ne "xml"
            return
                if ($ns-uri = ("http://marklogic.com/rest-api")) then ()
                else ($prefix, $ns-uri)
    let $root-node      := $document/node()
    let $quality-node   :=
        if ($is-xml)
        then $root-node/rapi:quality
        else $root-node/quality
    let $category-nodes := try {
        if (not($is-xml))
        then ($root-node/object-node()|$root-node/array-node()|$quality-node)
            intersect $document/xdmp:value($expression)/(
                ancestor-or-self::object-node()|ancestor-or-self::array-node()|
                self::number-node()
                )
        else $root-node/* intersect (
            if (empty($ns-bindings))
            then $document/xdmp:value($expression)/ancestor-or-self::*
            else xdmp:with-namespaces(
                $ns-bindings,
                $document/xdmp:value($expression)/ancestor-or-self::*
                )
            )
        } catch($e) {
            if ($is-untraced or docmodupd:check-untraced()) then ()
            else lid:log(
               $docmodupd:trace-id,"apply-metadata-patch#catch",
               map:entry("error-code",$e/error:code)=>map:with("expression",$expression)
               =>map:with("ns-bindings",$ns-bindings),
               map:entry("document",$document)
               ),

            if ($e/error:code eq "XDMP-UNEXPECTED")
            then error((), "RESTAPI-INVALIDCONTENT",
                concat("Invalid metadata patch (maybe missing pathlang property?)"))
            else xdmp:rethrow()
        }
    let $match-map := ($change-map + $insert-map)
    return
        if (empty($category-nodes)) then ()
        else if (not($is-xml)) then
            let $root-map := json:object()
            return (
                for $category-node in $category-nodes
                let $is-quality     := ($category-node is $quality-node)
                let $category-name  := string(node-name($category-node))
                let $is-object      := (not($is-quality) and $category-node instance of object-node())
                let $new-category   :=
                    if ($is-quality) then ()
                    else if ($is-object)
                    then json:object()
                    else json:array()
                let $category-value :=
                    if ($is-quality) then
                        let $quality-id := generate-id($category-node)
                        let $change-op  := map:get($change-map,$quality-id)
                        return
                            if (exists(map:get($insert-map,$quality-id)))
                            then docmodupd:push-error($error-list,"cannot insert relative to document quality")
                            else if (empty($change-op)) then ()
                            else if (exists($change-op/self::rapi:delete))
                            then docmodupd:push-error($error-list,"cannot delete document quality")
                            else docmodupd:produce-content(
                                $is-xml,true(),$error-list,$patch-content,$xqy-function-map,$sjs-result-map,
                                $root-node,$category-node,$change-op
                                )!data(.)
                    else (
                        for $child in $category-node/node()
                        let $child-id := generate-id($child)
                        return (
                            if (not(map:contains($match-map,$child-id))) then
                                if (not($is-object))
                                then json:array-push($new-category, data($child))
                                else map:put($new-category, name($child), data($child))
                            else (
                                let $change-op  := map:get($change-map,$child-id)
                                let $insert-ops := map:get($insert-map,$child-id)
                                return (
                                    if (exists($change-op)) then
                                        if (exists($insert-ops))
                                        then docmodupd:push-error($error-list,
                                            "cannot insert relative to changed node: "||xdmp:quote($child)
                                            )
                                        else if (count($change-op) gt 1)
                                        then docmodupd:push-error($error-list,
                                            "cannot make multiple changes on node: "||xdmp:quote($child)
                                            )
                                        else if (exists($change-op/self::rapi:delete))
                                        then ()
                                        else
                                            let $replace-value := docmodupd:produce-content(
                                                $is-xml,true(),$error-list,$patch-content,$xqy-function-map,
                                                $sjs-result-map,$category-node,$child,$change-op
                                                )!data(.)
                                            return
                                                if (empty($replace-value))
                                                then ()
                                                else if (not($is-object))
                                                then json:array-push($new-category, $replace-value)
                                                else map:put($new-category, name($child), $replace-value)
                                    else if (exists($insert-ops[empty(@position) or @position eq "last-child"]))
                                    then docmodupd:push-error($error-list,
                                        "cannot insert last child in metadata item: "||xdmp:quote($child)
                                        )
                                    else
                                        let $before := $insert-ops[@position eq "before"]/docmodupd:produce-content(
                                            $is-xml,false(),$error-list,$patch-content,$xqy-function-map,
                                            $sjs-result-map,$category-node,(),.
                                            )
                                        let $after  := $insert-ops[@position eq "after"]/docmodupd:produce-content(
                                            $is-xml,false(),$error-list,$patch-content,$xqy-function-map,
                                            $sjs-result-map,$category-node,(),.
                                            )
                                        return
                                            if (not($is-object)) then (
                                                for $before-value in $before!data(.)
                                                return json:array-push($new-category, $before-value),

                                                json:array-push($new-category, data($child)),

                                                for $after-value in $after!data(.)
                                                return json:array-push($new-category, $after-value)
                                                )
                                            else
                                                for $addition in ($before,$child,$after)
                                                let $addition-name := name($addition)
                                                return
                                                    if (empty($addition-name) or $addition-name eq "")
                                                    then docmodupd:push-error($error-list,
                                                        "can only a insert key values relative to: "||name($child)
                                                        )
                                                    else map:put($new-category, $addition-name, $addition!data(.))
                                    )
                                )
                            ),

                        let $append-ops := map:get($insert-map,generate-id($category-node))
                        for $append-node in
                            if (exists($append-ops[empty(@position) or @position ne "last-child"]))
                            then docmodupd:push-error($error-list,
                                "cannot insert before or after metadata category: "||xdmp:quote($category-node)
                                )
                            else $append-ops/docmodupd:produce-content(
                                $is-xml,false(),$error-list,$patch-content,$xqy-function-map,$sjs-result-map,
                                $category-node,(),.
                                )
                        let $append-value := $append-node!data(.)
                        let $append-name  :=
                            if (empty($append-value)) then ()
                            else name($append-node)
                        return
                            if (empty($append-value)) then ()
                            else if (not($is-object))
                            then json:array-push($new-category, $append-value)
                            else if (empty($append-name))
                            then docmodupd:push-error($error-list,
                                "can only append key values to "||$category-name
                                )
                            else map:put($new-category, $append-name, $append-value),

                        $new-category
                        )
                return
                    if (empty($category-value)) then ()
                    else map:put($root-map, $category-name, $category-value),

                $root-map
                )
        else element {node-name($root-node)} {
            $root-node/@*,
            for $category-node in $category-nodes
            return
                if ($category-node is $quality-node) then
                    let $quality-id := generate-id($category-node)
                    let $change-op  := map:get($change-map,$quality-id)
                    return
                        if (exists(map:get($insert-map,$quality-id)))
                        then docmodupd:push-error($error-list,"cannot insert relative to document quality")
                        else if (empty($change-op)) then ()
                        else if (exists($change-op/self::rapi:delete))
                        then docmodupd:push-error($error-list,"cannot delete document quality")
                        else docmodupd:produce-content(
                            $is-xml,true(),$error-list,$patch-content,$xqy-function-map,$sjs-result-map,
                            $root-node,$category-node,$change-op
                            )
                else element {node-name($category-node)} {
                    $category-node/@*,
                    for $child in $category-node/node()
                    let $child-id := generate-id($child)
                    return (
                        if (not(map:contains($match-map,$child-id)))
                        then $child
                        else (
                            let $change-op  := map:get($change-map,$child-id)
                            let $insert-ops := map:get($insert-map,$child-id)
                            return (
                                if (exists($change-op)) then
                                    if (exists($insert-ops))
                                    then docmodupd:push-error($error-list,
                                        "cannot insert relative to changed node: "||xdmp:quote($child)
                                        )
                                    else if (count($change-op) gt 1)
                                    then docmodupd:push-error($error-list,
                                        "cannot make multiple changes on node: "||xdmp:quote($child)
                                        )
                                    else if (exists($change-op/self::rapi:delete))
                                    then ()
                                    else docmodupd:produce-content(
                                        $is-xml,true(),$error-list,$patch-content,$xqy-function-map,
                                        $sjs-result-map,$category-node,$child,$change-op
                                        )
                                else if (exists($insert-ops[empty(@position) or @position eq "last-child"]))
                                then docmodupd:push-error($error-list,
                                    "cannot insert last child in metadata item: "||xdmp:quote($child)
                                    )
                                else (
                                    $insert-ops[@position eq "before"]/docmodupd:produce-content(
                                        $is-xml,false(),$error-list,$patch-content,$xqy-function-map,
                                        $sjs-result-map,$category-node,(),.
                                        ),
                                    $child,
                                    $insert-ops[@position eq "after"]/docmodupd:produce-content(
                                        $is-xml,false(),$error-list,$patch-content,$xqy-function-map,
                                        $sjs-result-map,$category-node,(),.
                                        )
                                    )
                                )
                            )
                        ),

                        let $append-ops := map:get($insert-map,generate-id($category-node))
                        return
                            if (exists($append-ops[empty(@position) or @position ne "last-child"]))
                            then docmodupd:push-error($error-list,
                                "cannot insert before or after metadata category: "||xdmp:quote($category-node)
                                )
                            else $append-ops/docmodupd:produce-content(
                                $is-xml,false(),$error-list,$patch-content,$xqy-function-map,
                                $sjs-result-map,$category-node,(),.
                                )
                    }
                }
};

declare private function docmodupd:sjs-apply-expression(
    $sjs-apply-array as json:array?
) as xs:string
{
    if (empty($sjs-apply-array) or json:array-size($sjs-apply-array) eq 0)
    then "() "
    else concat(
        "docmodupd:apply-sjs-operations(",
        "$is-xml, $patch, $patch-content, $sjs-apply-array, $error-list, (",

        string-join(
            for $sjs-apply-op at $i in json:array-values($sjs-apply-array)
            let $replace-path := $sjs-apply-op/@select/string(.)
            let $insert-path  :=
                if ($sjs-apply-op instance of element(rapi:replace)) then ()
                else $sjs-apply-op/@context/string(.)
            return
                if (empty($replace-path)) then ()
                else concat(
                    "let $operation    := $sjs-apply-array[",string($i),"] ",
                    "let $replace-path := '",string-join(tokenize($replace-path,"'"), "&amp;apos;"),"'",
                    "let $matchdef     := map:map()",
                        "=>map:with('operation', $operation)",
                        "=>map:with('replace-path', $replace-path) ",
                    "let $nodes        := ",$replace-path," ",
                    "let $contexts     := ",
                        if (empty($insert-path))
                        then "()"
                        else concat("if (exists($nodes)) then () else ",$insert-path," "),
                    "return ",
                    "if (docmodupd:skip-nodes($error-list,$operation,$replace-path,$nodes)) then () ",
                    "else if (exists($nodes)) ",
                    "then $matchdef",
                        "=>map:with('nodes', json:to-array($nodes)) ",
                    "else if (exists($contexts)) ",
                    "then $matchdef",
                        "=>map:with('insert-path','", string-join(tokenize($insert-path,"'"), "&amp;apos;"),"')",
                        "=>map:with('contexts', json:to-array($contexts)) ",
                    "else ()"
                        ),
            ", "
            ),
        ")) "
        )
};

declare private function docmodupd:match-operation(
    $is-xml     as xs:boolean,
    $map        as map:map,
    $error-list as json:array?,
    $operation  as element(),
    $path       as xs:string,
    $nodes      as node()*
) as node()*
{
    if (docmodupd:skip-nodes($error-list,$operation,$path,$nodes)) then ()
    else
        for $node in $nodes
        let $node-id := generate-id($node)
        return (
            map:put($map, $node-id, (map:get($map,$node-id), $operation)),

            $node
            )
};

declare function docmodupd:make-apply-function-structs(
    $patch      as element(rapi:patch),
    $error-list as json:array?
) as item()*
{
    let $applies := $patch/(rapi:replace|rapi:replace-insert)[exists(@apply)]
    return
        if (empty($applies)) then ()
        else
            let $built-ns := "http://marklogic.com/rest-api/lib/replace-lib"
            let $lib-def  := $patch/rapi:replace-library
            let $lib-at   := $lib-def/@at/string(.)
            let $lib-ns   := $lib-def/@ns/string(.)
            let $lib-type :=
                switch (count($lib-def))
                case 0 return ()
                case 1 return
                    if (empty($lib-ns))
                    then "javascript"
                    else "xquery"
                default return docmodupd:push-error(
                    $error-list, "multiple library declarations"
                    )
            let $xq-apply := map:map()
            let $js-apply :=
                if (not($lib-type eq "javascript")) then ()
                else json:array()
            return (
                for $apply in $applies
                let $fname-raw := $apply/@apply/string(.)
                let $fname     :=
                    if ($fname-raw castable as xs:NMTOKEN)
                    then xs:NMTOKEN($fname-raw)
                    else docmodupd:push-error(
                        $error-list, "cannot apply empty function name: "||xdmp:quote($apply)
                        )
                let $function  :=
                    if (empty($fname)) then ()
                    else if (starts-with($fname,"ml.")) then
                        if ($fname = $replib:export)
                        then xdmp:function(QName($built-ns,$fname))
                        else docmodupd:push-error(
                            $error-list, "not a built-in function: "||$fname
                            )
                    else if (empty($lib-at))
                    then docmodupd:push-error(
                        $error-list, "missing or incomplete library declaration for: "||$fname
                        )
                    else if ($lib-type eq "javascript") then ()
                    else xdmp:function(QName($lib-ns,$fname), $lib-at)
                return
                    if (empty($fname)) then ()
                    else if (exists($function))
                    then map:put($xq-apply, $fname, $function)
                    else if ($lib-type eq "javascript")
                    then json:array-push($js-apply, $apply)
                    else docmodupd:push-error(
                        $error-list, "could not find function for: "||$fname
                        ),

                $xq-apply,

                if (empty($js-apply) or json:array-size($js-apply) eq 0) then ()
                else $js-apply
                )
};

declare private function docmodupd:node-insert-position(
    $operation as element()
) as xs:string
{
    let $position := $operation/@position/string(.)
    return
        if (empty($position))
        then "last-child"
        else $position
};

declare private function docmodupd:json-node-insert-position(
    $operation as object-node()
) as xs:string
{
    let $position := $operation/position!string(.)
    return
        if (empty($position))
        then "last-child"
        else $position
};

declare private function docmodupd:produce-content(
    $is-xml           as xs:boolean,
    $is-replace       as xs:boolean,
    $error-list       as json:array?,
    $patch-content    as map:map?,
    $xqy-function-map as map:map?,
    $sjs-result-map   as map:map?,
    $context          as node()?,
    $node             as node()?,
    $operation        as element()?
)
{
    if (empty($operation)) then ()
    else
        let $function-name :=
            if (empty($xqy-function-map)) then ()
            else
                let $fname-raw := $operation/@apply/string(.)
                return
                    if (not($fname-raw castable as xs:NMTOKEN)) then ()
                    else xs:NMTOKEN($fname-raw)
        let $function      :=
            if (empty($function-name)) then ()
            else map:get($xqy-function-map,$function-name)
        let $sjs-result    :=
            if (empty($sjs-result-map) or exists($function)) then ()
            else if (exists($node))
            then map:get($sjs-result-map,generate-id($node))
            else if (exists($context))
            then map:get($sjs-result-map,generate-id($context))
            else ()
        let $content       :=
            if (exists($sjs-result)) then ()
            else docmodupd:prepare-content($is-xml,$patch-content,$operation,exists($function))
        let $attribute     :=
            if (not($is-xml) or exists($function) or exists($sjs-result)) then ()
            else $content/self::rapi:attribute-list/(@* except @xsi:type)
        let $output       :=
            if (exists($function))
            then xdmp:apply($function,$node,$content)
            else if (exists($sjs-result))
            then $sjs-result
            else if (exists($function-name))
            then error((),"RESTAPI-INVALIDREQ","produce function not found: "||$function-name)
            else if (not($is-xml)) then
                if ($is-replace)
                then $content
                else
                    typeswitch($context)
                    case object-node() return
                        typeswitch($node)
                        case array-node()  return $content
                        case object-node() return
                            typeswitch($content)
                            case object-node() return $content/node()
                            default            return $content
                        default return
                            typeswitch($content)
                            case object-node() return $content/node()
                            default            return $content
                    default return $content
            else if (exists($attribute))
            then $attribute
            else if ($context instance of attribute() and exists($node))
            then docmodupd:push-error(
                $error-list,
                concat(
                    "attribute operation without attribute list: ",
                    $operation ! (
                        if ($is-replace)
                        then (@original-select,  @select  )[1]
                        else (@original-context, @context )[1]
                        ) ! string(.)
                    )
                )
            else if (not($is-replace))
            then $content
            else
                typeswitch($node)
                case attribute() return
                    attribute {node-name($node)} {string-join($content/string(.),'')}
                case element()   return
                    let $child-elem := $content/self::element()
                    return
                        typeswitch($child-elem)
                        case element(rapi:text) return $child-elem/text()
                        case element()          return $child-elem
                        default                 return element {node-name($node)} {
                            $node/@*,
                            $content/self::text()
                            }
                default          return $content
        return
            if (not($is-xml) and (
                $output instance of element() or
                $output instance of attribute() or
                $output instance of processing-instruction() or
                $output instance of comment()
                ))
            then error((),"RESTAPI-INVALIDREQ",
                head(($function-name,"patch"))||" returned XML to patch JSON")
            else if ($is-xml and (
                $output instance of object-node() or
                $output instance of array-node() or
                $output instance of number-node() or
                $output instance of boolean-node() or
                $output instance of null-node()
                ))
            then error((),"RESTAPI-INVALIDREQ",
                head(($function-name,"patch"))||" returned JSON to patch XML")
            else $output
};

declare private function docmodupd:prepare-content(
    $is-xml         as xs:boolean,
    $patch-content  as map:map?,
    $operation      as element()?,
    $is-apply-input as xs:boolean
)
{
    let $contentKey :=
        if (empty($patch-content)) then ()
        else $operation/@contentKey!string(.)
    (: $patch-content has the original parsed content nodes for a JSON patch payload :)
    let $content    :=
        if (exists($contentKey))
        then map:get($patch-content,$contentKey)
        else $operation/node()
   return
        if (not($is-apply-input))
            then $content
        else if (not($is-xml)) then
            for $item in (
                if ($content instance of array-node())
                then $content/node()
                else $content
                )
            let $value    := $item/node("$value")
            let $datatype :=
                if (empty($value)) then ()
                else $item/node("$datatype")
            return
                if (empty($value)) then
                    typeswitch($item)
                    case object-node() return $item
                    case array-node()  return $item
                    default            return data($item)
                else if (empty($datatype))
                then data($value)
                else replib:cast-value($datatype,data($value))
        else
            let $content-elements := $content[. instance of element()]
            return
                if (exists($content-elements)) then
                    for $elem in $content-elements
                    return
                        if ($elem instance of element(rapi:value))
                        then $elem/data(.)
                        else $elem
                else if (count($content[. instance of text()]) eq 1)
                then data($content/..)
                else ()
};

declare private function docmodupd:check-content-version(
    $headers as map:map,
    $uri     as xs:string
) as empty-sequence()
{
    docmodupd:check-content-version($headers, $uri, docmodcom:get-update-policy())
};

declare private function docmodupd:check-content-version(
    $headers       as map:map,
    $uri           as xs:string,
    $update-policy as xs:string?
) as empty-sequence()
{
    docmodupd:check-content-version(
        $headers, "if-match", $uri, $update-policy
        )
};

declare private function docmodupd:check-content-version(
    $map           as map:map,
    $key           as xs:string,
    $uri           as xs:string,
    $update-policy as xs:string?
) as empty-sequence()
{
(: TODO:
 policy on error toleration and reporting (append to array)?
 payload with per-uri timestamp
 :)
    if ($update-policy = ("merge-metadata","overwrite-metadata")) then ()
    else
        let $if-match  := docmodcom:get-etag($map,$key,$uri)
        let $timestamp := xdmp:document-timestamp($uri)
        return
            (: document must have specified version or must exist with no version :)
            if ($if-match gt 0 and (
                $if-match ne $timestamp or
                (empty($timestamp) and not(doc-available($uri)))
                ))
            then error((), "RESTAPI-CONTENTWRONGVERSION", concat(
                "uri ",$uri,
                if (empty($timestamp)) then ()
                else concat(" has current version ",$timestamp," that"),
                " doesn't match ", $key, ": ",$if-match
                ))
            (: document must not exist or etag must be optional and not exist :)
            else if (exists($timestamp) and (
                $if-match eq 0 or
                (empty($if-match) and $update-policy eq "version-required")
                ))
            then error((), "RESTAPI-CONTENTNOVERSION", "uri "|| $uri)
            else if ($if-match lt 0)
            then error((), "RESTAPI-CONTENTWRONGVERSION", concat(
                "uri ",$uri,
                if (empty($timestamp)) then ()
                else concat(" has current version ",$timestamp," that"),
                " doesn't match ", $key, ": ",$if-match
                ))
            else ()
};

declare function docmodupd:push-error(
    $error-list as json:array?,
    $error-msg  as xs:string
) as empty-sequence()
{
    if (exists($error-list))
    then json:array-push($error-list,$error-msg)
    else error((),"RESTAPI-INVALIDREQ",$error-msg)
};

(:
    utility functions
 :)
(: TODO: move to a cpf model? :)
declare function docmodupd:cpf-installed(
) as xs:boolean
{
    exists(docmodupd:cpf-config(xdmp:database()))
};

(: slightly refined from Apps/infostudio/models/cpf-model.xqy#cpf-config() :)
declare private function docmodupd:cpf-config(
    $dbid as xs:unsignedLong
) as element()?
{
    xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
    let $trigger-dbid := xdmp:triggers-database($dbid)
    return
        if ($trigger-dbid eq 0) then ()
        else xdmp:eval(
            '
                import module namespace dom="http://marklogic.com/cpf/domains"
                    at "/MarkLogic/cpf/domains.xqy";

                try{
                    dom:configuration-get()
                }
                catch ($e) {
                    () (: Returning empty sequence to indicate that configuration does not exist :)
                }
            ',
            (),
            <options xmlns="xdmp:eval">
                <database>{$trigger-dbid}</database>
            </options>
        )
};

declare function docmodupd:write-bulk-documents(
    $params        as map:map,
    $header-getter as function(*),
    $body-getter   as function(*)
) as element(rapi:document)*
{
    let $trans-name   := map:get($params,"transform")
    let $trans-params :=
        if (empty($trans-name)) then ()
        else tformod:extract-transform-params($params)
    let $temporal-collection := map:get($params,"temporal-collection")
    let $system-timestamp :=
        if (empty($temporal-collection)) then ()
        else map:get($params,"system-time")
    return (
        if (empty($system-timestamp)) then ()
        else temporal:statement-set-system-time($system-timestamp),

        docmodupd:write-bulk-documents(
            $header-getter,$body-getter,$trans-name,$trans-params,
            docmodupd:get-forest-id(map:get($params,"forest-name")),
            map:map(),(),
            $temporal-collection
            )
        )
};

declare private function docmodupd:write-bulk-documents(
    $header-getter     as function(*),
    $body-getter       as function(*),
    $trans-name        as xs:string?,
    $trans-params      as map:map?,
    $forest-id         as xs:unsignedLong?,
    $default-metadata  as map:map,
    $document-metadata as map:map?,
    $temporal-collection as xs:string?
) (: NOTE: really return as element(rapi:document)*
     but untyped for the sake of tail recursion optimization :)
{
    let $headers := $header-getter()
    return
        if (empty($headers)) then (
            if (empty($document-metadata)) then ()
            else
                let $meta-uri := map:get($document-metadata, "uri")
                return
                    if (empty($meta-uri)) then ()
                    else (
                        docmodupd:write-bulk-metadata($temporal-collection,$meta-uri,$document-metadata),

                        <rapi:document>
                            <rapi:uri>{$meta-uri}</rapi:uri>
                            <rapi:category>metadata</rapi:category>
                        </rapi:document>
                        )
            )
        else
            let $header-keys     := map:keys($headers)
            let $type-key        := $header-keys[lower-case(.) eq "content-type"]
            let $disposition-key := $header-keys[lower-case(.) eq "content-disposition"]
            let $content-type    :=
                if (empty($type-key)) then ()
                else head(dbut:tokenize-header(map:get($headers,$type-key)))
            let $document-params :=
                if (empty($disposition-key)) then ()
                else docmodupd:disposition-map(map:get($headers,$disposition-key))
            let $categories      :=
                if (empty($document-params)) then ()
                else
                    let $category-params := map:get($document-params,"category")
                    return
                        if (exists($category-params))
                        then $category-params
                        else "content"
            let $is-metadata     := not($categories = "content")
            let $curr-uri        :=
                let $uri :=
                    if (empty($document-params)) then ()
                    else docmodupd:lock-uris(map:get($document-params,"uri"))
                return
                    if (exists($uri))
                    then $uri
                    else if ($is-metadata) then ()
                    else docmodupd:make-document-uri($document-params)
            let $content-type :=
               if (exists($content-type) or $is-metadata)
               then $content-type
               else eput:uri-content-type($curr-uri)
            let $part-type       :=
                if (empty($curr-uri))
                then "default-metadata"
                else if ($is-metadata)
                then "document-metadata"
                else "document-content"
            let $meta-uri        :=
                if (empty($document-metadata)) then ()
                else map:get($document-metadata, "uri")
            let $content-format  :=
                if ($is-metadata)
                then docmodcom:get-type-format($content-type)
                else docmodupd:content-format(
                    $curr-uri,
                    $trans-name,
                    eput:uri-content-type($curr-uri)
                        [. ne "application/x-unknown-content-type"],
                    $content-type,
                    ()
                    )
            let $repair          :=
                if ($content-format ne "xml" or empty($document-params)) then ()
                else map:get($document-params,"repair")
            let $extract         :=
                if ($content-format ne "binary" or empty($document-params)) then ()
                else map:get($document-params,"extract")
            let $body            := $body-getter(
                if (exists($repair))
                then "text"
                else $content-format
                )
            let $default-next    :=
                if ($part-type ne "default-metadata")
                then $default-metadata
                else docmodupd:parse-metadata-map("DEFAULT",$content-type,$body)
            let $document-next   :=
                if ($part-type ne "document-metadata") then ()
                else docmodupd:parse-metadata-map($curr-uri,$content-type,$body)
            let $metadata        :=
                if ($part-type ne "document-content") then ()
                else if ($meta-uri eq $curr-uri)
                then $document-metadata
                else $default-metadata
            return (
                if (empty($document-metadata) or $meta-uri eq $curr-uri) then ()
                else (
                    docmodupd:write-bulk-metadata($temporal-collection,$meta-uri,$document-metadata),

                    <rapi:document>
                        <rapi:uri>{$meta-uri}</rapi:uri>
                        <rapi:category>metadata</rapi:category>
                    </rapi:document>
                    ),

                if ($part-type ne "document-content") then ()
                else (
                    (: TODO: policy on whether to report or throw errors :)
                    if (empty($document-params) or $is-metadata) then ()
                    else docmodupd:check-content-version(
                        $document-params,
                        "versionId",
                        $curr-uri,
                        docmodcom:get-update-policy()
                        ),

                    let $doc-input    :=
                        docmodupd:convert-document(
                            $curr-uri,$content-format,$content-type,$body,$repair
                        )
                    let $trans-output :=
                        if (empty($trans-name)) then ()
                        else tformod:apply-transform(
                            $trans-name, eput:make-context($curr-uri,$content-type,$content-type), $trans-params, $doc-input
                        )
                    let $trans-ctxt   :=
                        if (empty($trans-name)) then ()
                        else map:get($trans-output,"context")
                    let $curr-doc     :=
                        if (empty($trans-name))
                        then $doc-input
                        else map:get($trans-output,"result")
                    let $doc-uri      :=
                        if (empty($trans-name))
                        then $curr-uri
                        else head((map:get($trans-ctxt,"uri"),$curr-uri))
                    let $curr-type    :=
                        if (empty($trans-name))
                        then $content-type
                        else head((map:get($trans-ctxt,"output-type"),$content-type))
                    let $temporal-document-uri  := map:get($document-params,"temporal-document")
                    let $version-uri  := if (empty($temporal-document-uri)) then () else $doc-uri
                    let $doc-uri      := if (empty($temporal-document-uri)) then $doc-uri else $temporal-document-uri
                    let $collections  := map:get($metadata,"collections")
                    let $permissions  := map:get($metadata,"permissions")
                    let $quality      := map:get($metadata,"quality")
                    let $metadata-values := map:get($metadata,"metadata-values")
                    return (
                        docmodupd:write-content(
                            $doc-uri,
                            $version-uri,
                            $curr-doc,
                            if (exists($collections)) then $collections
                                else xdmp:default-collections(),
                            $permissions,
                            $quality,
                            $metadata-values,
                            $forest-id,
                            $temporal-collection,
                            ()
                            ),

                        let $properties := map:get($metadata,"properties")
                        return
                            if (empty($properties)) then ()
                            else docmodupd:write-properties($doc-uri,$properties),

                        if (empty($extract)) then ()
                        else docmodupd:extract-binary-metadata(
                            $doc-uri,$extract,$curr-type,$curr-doc,
                            $collections,(),$permissions,$quality,$metadata-values,$forest-id,true(),
                            $temporal-collection,()
                            ),

                        <rapi:document>
                            <rapi:uri>{$curr-uri}</rapi:uri>
                            <rapi:category>metadata</rapi:category>
                            <rapi:category>content</rapi:category>
                            <rapi:mime-type>{$curr-type}</rapi:mime-type>
                        </rapi:document>
                        )
                    ),

                docmodupd:write-bulk-documents(
                    $header-getter,$body-getter,$trans-name,$trans-params,$forest-id,
                    $default-next,$document-next,$temporal-collection
                    )
                )
};

declare private function docmodupd:make-document-uri(
    $params as map:map?
) as xs:string?
{
    if (empty($params)) then ()
    else

    let $extension-raw  := map:get($params,"extension")
    return
    if (empty($extension-raw)) then ()
    else

    let $extension :=
        let $has-separator  := starts-with(head($extension-raw),".")
        let $extension-test :=
            if ($has-separator)
            then substring($extension-raw,2)
            else $extension-raw
        return
            if (matches($extension-test,"\W"))
            then error((),"REST-INVALIDPARAM",
                "Extension may contain only word characters after initial period: "||
                $extension-raw
                )
            else if ($has-separator)
            then $extension-raw
            else concat(".", $extension-raw)
    return docmodupd:lock-uris(concat(
        map:get($params,"directory"),
        string(xdmp:random()),
        $extension
        ))
};

declare private function docmodupd:detach-content(
    $operation  as object-node(),
    $error-list as json:array?
) as node()?
{
    let $content := $operation/node("content")
    return
        switch(count($content))
        case 0 return ()
        case 1 return
            typeswitch($content)
            case array-node()   return xdmp:to-json(data($content))/array-node()
            case boolean-node() return boolean-node{data($content)}
            case object-node()  return xdmp:to-json(data($content))/object-node()
            case number-node()  return number-node{data($content)}
            case null-node()    return null-node{}
            case text()         return text{string($content)}
            default             return docmodupd:push-error($error-list,
                "content type not supported for operation: "||xdmp:describe($content)
                )
        default return
            let $array := json:array()
            return (
                for $node in $content
                return json:array-push($array,$node),

                xdmp:to-json($array)/array-node()
                )
};

declare %private function docmodupd:temporal-options(
   $temporal-collection as xs:string,
   $uri as xs:string,
   $collections as xs:string*,
   $permissions as element(sec:permission)*,
   $quality as xs:integer?,
   $metadata-values as map:map?
) as element()
{
   let $ns := $temporal-insert-ns
   return
   element { QName($ns,"options")} {

       (: filter out collections maintained by temporal implementation :)

       let $collection-set := $collections[not(. = ($temporal-collection, "latest", $uri))]
       return
       if (empty($collection-set)) then ()
       else element {QName($ns,"collections")} {
           for $collection in $collection-set
           return element {QName($ns,"collection")} {$collection}
       },

       element {QName($ns,"permissions")} {
           $permissions
       },

       if (empty($quality))
       then ()
       else element {QName($ns,"quality")} {$quality},

       if (empty($metadata-values))
       then ()
       else element {QName($ns,"metadata")} { $metadata-values }
   }

};

declare private function docmodupd:write-bulk-metadata(
    $temporal-collection as xs:string?,
    $uri                 as xs:string,
    $metadata            as map:map
) as empty-sequence()
{
    let $properties := map:get($metadata,"properties")
    return
        if (empty($properties)) then ()
        else docmodupd:write-properties($uri,$properties),

    if (empty($temporal-collection)) then (
        docmodupd:write-collections($uri,     (), map:get($metadata,"collections")),
        docmodupd:write-permissions($uri,     (), map:get($metadata,"permissions")),
        docmodupd:write-quality($uri,         (), map:get($metadata,"quality")),
        docmodupd:write-metadata-values($uri, (), map:get($metadata,"metadata-values"))
        )
    else
        let $collections-specified     := map:get($metadata,"collections")
        let $permissions-specified     := map:get($metadata,"permissions")
        let $quality-specified         := map:get($metadata,"quality")
        let $metadata-values-specified := map:get($metadata,"metadata-values")
        return
            if (empty((
               $collections-specified,$permissions-specified,$quality-specified,$metadata-values-specified
               )))
            then ()
            else
                let $collections     :=
                    if (exists($collections-specified))     then $collections-specified
                    else xdmp:document-get-collections($uri)
                let $permissions     :=
                    if (exists($permissions-specified))     then $permissions-specified
                    else xdmp:document-get-permissions($uri)
                let $quality         :=
                    if (exists($quality-specified))         then $quality-specified
                    else xdmp:document-get-quality($uri)
                let $metadata-values :=
                    if (exists($metadata-values-specified)) then $metadata-values-specified
                    else xdmp:document-get-metadata($uri)
                let $ns              := $temporal-insert-ns
                let $options         := docmodupd:temporal-options(
                    $temporal-collection,$uri,$collections,$permissions,$quality,$metadata-values
                    )
                return (
                    if ($is-untraced or docmodupd:check-untraced()) then ()
                    else lid:log(
                        $docmodupd:trace-id,"write-bulk-metadata#temporal",
                        map:entry("temporal-collection",$temporal-collection)
                        =>map:with("uri",$uri)=>map:with("options",$options),
                        map:entry("doc",doc($uri))
                        ),

                    temporal:document-insert(
                        $temporal-collection,$uri,doc($uri),$options
                        )
                    )
};

declare private function docmodupd:parse-metadata-map(
    $uri       as xs:string,
    $meta-type as xs:string,
    $meta-doc  as document-node()?
) as map:map?
{
    let $meta-format :=
        if ($meta-type = ("application/json","text/json"))
        then "json"
        else if ($meta-type = ("application/xml","text/xml"))
        then "xml"
        else error((),"RESTAPI-INVALIDMIMETYPE", concat(
                "received metadata type ",$meta-type,
                " instead of application/json or application/xml for ",$uri
                ))
    let $meta-parsed := docmodcom:parse-metadata($meta-format,$meta-doc)
    let $collections := docmodcom:parse-collections($uri, $meta-parsed)
    let $permissions := docmodcom:parse-permissions($uri, $meta-parsed)
    let $properties  := docmodcom:parse-properties($uri, $meta-parsed)
    let $quality     := docmodcom:parse-quality($uri, $meta-parsed)
    let $metadata-values := docmodcom:parse-metadata-values($uri, $meta-parsed)
    let $meta-map    := map:map()
    return (
        map:put($meta-map, "uri", $uri),

        if (empty($collections)) then ()
            else map:put($meta-map, "collections", $collections),
        if (empty($permissions)) then ()
            else map:put($meta-map, "permissions", $permissions),
        if (empty($properties)) then ()
            else map:put($meta-map, "properties", $properties),
        if (empty($quality)) then ()
            else map:put($meta-map, "quality", $quality),
        if (empty($metadata-values)) then ()
            else map:put($meta-map, "metadata-values", $metadata-values),
        $meta-map
        )
};

declare function docmodupd:default-metadata-map(
) as map:map
{
    let $meta-map := map:map()
    return (
        map:put($meta-map, "collections", xdmp:default-collections()),
        map:put($meta-map, "permissions", xdmp:default-permissions()),
        map:put($meta-map, "quality",     0),

        $meta-map
        )
};

declare function docmodupd:disposition-map(
    $content-disposition as xs:string?
) as map:map?
{
    let $tokens :=
        if (empty($content-disposition) or string-length($content-disposition) eq 0) then ()
        else tokenize($content-disposition, ";")
    let $params :=
        if (empty($tokens)) then()
        else map:map()
    return (
        if (empty($params)) then()
        else docmodupd:collect-params($params, json:to-array($tokens), 1),

        $params
        )
};
declare private function docmodupd:collect-params(
    $params as map:map,
    $tokens as json:array,
    $next   as xs:int
) (: untyped for tail recursion :)
{
    if ($next gt json:array-size($tokens)) then ()
    else
        let $first := $tokens[$next]
        let $pos   := xdmp:position("=", $first)
        let $name  := normalize-space(
            if ($pos eq 0)
            then $first
            else substring($first, 1, $pos - 1)
            )
        return
            if ($pos eq 0 and string-length($name) eq 0)
            then docmodupd:collect-params($params, $tokens, $next + 1)
            else
                let $rawval   :=
                    if (string-length($name) eq 0)
                    then error((),"REST-INVALIDPARAM", concat(
                        "Could not determine name of param for content disposition: ",
                        string-join(json:array-values($tokens), ";")
                        ))
                    else if ($pos gt 0)
                    then substring($first, $pos + 1)
                    else if (not($name = ("attachment","inline")))
                    then error((),"REST-INVALIDPARAM", concat(
                        $name," parameter without value for content disposition: ",
                        string-join(json:array-values($tokens), ";")
                        ))
                    else ()
                let $normval  :=
                    if ($pos eq 0) then ()
                    else normalize-space($rawval)
                let $is-quote :=
                    if ($pos eq 0)
                    then false()
                    else if (string-length($normval) gt 0)
                    then starts-with($normval,'"')
                    else error((),"REST-INVALIDPARAM", concat(
                        $name," parameter with empty value for content disposition: ",
                        string-join(json:array-values($tokens), ";")
                        ))
                let $is-apos  := ($pos gt 0) and not($is-quote) and starts-with($normval,"'")
                let $extratok :=
                    (: reassemble a quoted string with one or more embedded semicolons :)
                    if ($pos eq 0) then ()
                    else if ($is-quote) then
                        if (ends-with($normval,'"')) then ()
                        else docmodupd:find-quote-end($tokens, $next + 1)
                    else if ($is-apos) then
                        if (ends-with($normval,"'")) then ()
                        else docmodupd:find-apos-end($tokens, $next + 1)
                    else ()
                let $extracnt := count($extratok)
                let $paramval :=
                    if ($pos eq 0) then ()
                    else if ($is-quote or $is-apos) then
                        let $delimitval :=
                            if ($extracnt eq 0)
                            then $normval
                            else normalize-space(string-join(($rawval, $extratok), ";"))
                        (: remove preceding backslash on escapes :)
                        return replace(
                            (: strip leading and trailing delimiter :)
                            substring($delimitval, 2, string-length($delimitval) - 2),
                            "\\(\\|.)",
                            "$1"
                            )
                    else $normval
                return (
                    switch($name)
                    case "attachment"        return map:put($params, "type",              "attachment")
                    case "inline"            return map:put($params, "type",              "inline")
                    case "filename"          return map:put($params, "uri",               $paramval)
                    case "temporal-document" return map:put($params, "temporal-document", $paramval)
                    default                  return map:put($params, $name,
                        (map:get($params,$name), $paramval)
                        ),

                    docmodupd:collect-params($params, $tokens, $next + 1 + $extracnt)
                    )
};
declare private function docmodupd:find-quote-end(
    $tokens as json:array,
    $next   as xs:int
) (: untyped for tail recursion :)
{
    if ($next le json:array-size($tokens)) then ()
    else error((),"REST-INVALIDPARAM", concat(
        "Unclosed quote for content disposition: ",
        string-join(json:array-values($tokens), ";")
        )),

    let $val := $tokens[$next]
    return (
        $val,

        (: found the end of the quoted string :)
        if (matches($val, '^(\\.|[^"\\])*"\s*$')) then ()
        else docmodupd:find-quote-end($tokens, $next + 1)
        )
};
declare private function docmodupd:find-apos-end(
    $tokens as json:array,
    $next   as xs:int
) (: untyped for tail recursion :)
{
    if ($next le json:array-size($tokens)) then ()
    else error((),"REST-INVALIDPARAM", concat(
        "Unclosed apostrophe quote for content disposition: ",
        string-join(json:array-values($tokens), ";")
        )),

    let $val := $tokens[$next]
    return (
        $val,

        (: found the end of an apostrophe quoted string :)
        if (matches($val, "^(\\.|[^'\\])*'\s*$")) then ()
        else docmodupd:find-apos-end($tokens, $next + 1)
        )
};

declare private function docmodupd:content-kind(
    $uri           as xs:string,
    $env           as map:map?,
    $env-body      as xs:boolean?,
    $trans-name    as xs:string?,
    $is-multipart  as xs:boolean,
    $input-type    as xs:string?,
    $param-format  as xs:string?,
    $con-part-type as xs:string?
) as xs:string*
{
    let $uri-type := eput:uri-content-type($uri)
        [. ne "application/x-unknown-content-type"]
    let $content-type :=
        if ($env-body)
        then map:get($env,"content-mimetype")
        else
            if (empty($trans-name) and exists($uri-type))
            then $uri-type
            else if ($is-multipart and exists($con-part-type))
            then $con-part-type
            else if (not($is-multipart) and exists($input-type))
            then $input-type
            else if (exists($uri-type))
            then $uri-type
            else "application/x-unknown-content-type"
    return (
        $content-type,

        if ($env-body)
        then map:get($env,"content-format")
        else docmodupd:content-format($uri,$trans-name,$uri-type,$content-type,$param-format)
        )
};

declare private function docmodupd:content-format(
    $uri           as xs:string,
    $trans-name    as xs:string?,
    $uri-type      as xs:string?,
    $content-type  as xs:string?,
    $param-format  as xs:string?
) as xs:string?
{
    let $uri-format :=
        if (empty($uri-type)) then ()
        else docmodcom:get-uri-format($uri)
    let $content-format :=
        if (empty($trans-name) and exists($uri-format))
        then $uri-format
        else eput:content-type-format($content-type)
    return
        if (exists($content-format))
        then $content-format
        else if (exists($uri-format))
        then $uri-format
        else if (exists($param-format))
        then $param-format
        else "binary"
};

declare private function docmodupd:lock-uris(
    $uris as xs:string*
) as xs:string*
{
    if (empty($uris)) then ()
    else
        for $uri in $uris
        return xdmp:lock-for-update($uri),
    $uris
};

declare function docmodupd:convert-protection-to-map(
   $content as node()
) as map:map
{
   typeswitch($content)
   case object-node()
   return let $level := $content/level
          let $duration := $content/duration
          let $expireTime := $content/expireTime
          let $archivePath := $content/archivePath
          let $m := map:new()
          return (
             if (exists($level)) then map:put($m,"level",$level) else (),
             if (exists($duration)) then map:put($m,"duration",$duration) else (),
             if (exists($expireTime)) then map:put($m,"expire-time",$expireTime) else (),
             if (exists($archivePath)) then map:put($m,"archive-path",$archivePath) else (),
             $m
          )
   case element()
   return let $level := $content/protect:level
          let $duration := $content/protect:duration
          let $expireTime := $content/protect:expire-time
          let $archivePath := $content/protect:archive-path
          let $m := map:new()
          return (
             if (exists($level)) then map:put($m,"level",string-join($level/text(),'')) else (),
             if (exists($duration)) then map:put($m,"duration",string-join($duration/text(),'')) else (),
             if (exists($expireTime)) then map:put($m,"expire-time",string-join($expireTime/text(),'')) else (),
             if (exists($archivePath)) then map:put($m,"archive-path",string-join($archivePath/text(),'')) else (),
             $m
          )
   default return error((),"RESTAPI-INVALIDCONTENT","Unrecognized content for protection description.")

};

declare function docmodupd:post-protection(
   $headers as map:map,
   $params  as map:map,
   $env     as map:map
) as empty-sequence()
{
   xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
   eput:response-add-host-cookie($headers, $params, $env),
   let $names := ("level:level","duration:duration","expireTime:expire-time","archivePath:archive-path")
   let $content-type := head(dbut:tokenize-header(map:get($headers,"content-type")))
   let $format :=
      if ($content-type = ("application/json","text/json"))
      then "json"
      else if ($content-type = ("application/xml","text/xml"))
      then "xml"
      else if ($content-type = ("application/x-www-form-urlencoded"))
      then "form"
      else "parameters"
   let $content :=
      if ($format = ("xml","json"))
      then let $node := map:get($env,"body-getter")($format)/node()
           return if (exists($node)) then docmodupd:convert-protection-to-map(map:get($env,"body-getter")($format)/node())
                  else error((),"RESTAPI-INVALIDCONTENT", "Unable to parse content type " || $content-type)
      else if ($format = "parameters")
      then let $m := map:new()
           return (
              for $k in $names
              return map:put($m,substring-after($k,":"),map:get($params,substring-before($k,":"))),
              $m
           )
      else let $m := map:new()
           let $_ := for $k in $names
                     let $v := xdmp:get-request-field(substring-before($k,":"))
                     return if (exists($v)) then map:put($m,substring-after($k,":"),$v) else ()
           return $m
   let $_ :=
      if (exists(map:get($content,"duration")) and exists(map:get($content,"expireTime")))
      then error((),"RESTAPI-INVALIDCONTENT","The duration and expire time can not both be specified.")
      else ()
   let $options := <options xmlns="temporal:document-protect">{
      for $k in $names
      let $name := substring-after($k,":")
      let $v := map:get($content,$name)
      return if (exists($v)) then element { "protect:" || $name } { $v } else ()
   }</options>
   let $responder as function(*)? := map:get($env,"responder")
   return (
      docmodupd:document-protection(map:get($params,"temporal-collection"),map:get($params,"uri"),$options),
      $responder($docmodupd:DOCUMENT_PROTECTED,"",(),(),(),(),(),())
   )
};

declare function docmodupd:document-protection(
   $temporal-collection as xs:string,
   $uris as xs:string+,
   $options as element(protect:options)
) as empty-sequence()
{
   for $uri in $uris
   return temporal:document-protect($temporal-collection,$uri,$options)
};
