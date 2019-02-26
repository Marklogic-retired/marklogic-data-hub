xquery version "1.0-ml";

(: Copyright 2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace docmodupdput = "http://marklogic.com/rest-api/models/document-model-update-put";

import module namespace cook = "http://parthcomp.com/cookies"
    at "/MarkLogic/cookies.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
    at "/MarkLogic/appservices/utils/log-id.xqy";

(: TODO: factor out dependency functions from docmodcom into granular libraries :)
import module namespace docmodcom = "http://marklogic.com/rest-api/models/document-model-common"
    at "../models/document-model-common.xqy";

import module namespace strict = "http://marklogic.com/rest-api/lib/strict-util"
    at "../lib/strict-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $docmodupdput:trace-id := "restapi.documents.update";

declare private variable $is-untraced := ();

declare function docmodupdput:check-untraced() as xs:boolean {
    if (exists($is-untraced)) then ()
    else xdmp:set($is-untraced,
        lid:is-disabled($docmodupdput:trace-id, ("restapi.documents", "restapi"))
        ),

    $is-untraced
};

declare function docmodupdput:forest-ids($names as xs:string*) as xs:unsignedLong*
{
   try {
      for $forest-name in $names
      return xdmp:forest($forest-name)
   } catch ($e) {
      if ($e/error:code = "XDMP-NOSUCHFOREST")
      then error((), "REST-INVALIDPARAM", "No such forest: "||$e/error:data/error:datum/string(.))
      else xdmp:rethrow()
   }
};

declare function docmodupdput:security-permissions($permissions as map:map?) as map:map*
{
   try{
      for $key in
          if (empty($permissions)) then ()
          else map:keys($permissions)
      let $id := xdmp:role($key)
      for $capability in map:get($permissions,$key)
      return map:entry("roleId",$id)
          =>map:with("capability",$capability)
    } catch ($e) {
        if ($e/error:code/string(.) eq "SEC-ROLEDNE")
        then error((), "REST-INVALIDPARAM", "Role "||$e/error:data/error:datum[last()]/string(.)|| " does not exist")
        else xdmp:rethrow()
    }
};

declare function docmodupdput:merge-permissions($new-permissions as map:map*, $base-permissions as map:map*) as map:map*
{
    if (empty($new-permissions))
    then $base-permissions
    else if (empty($base-permissions))
    then $new-permissions
    else (
        $new-permissions,

        let $new-roles := fold-left(
            function($new-roles as map:map, $new-permission as map:map) {
                map:with(
                    $new-roles,
                    string(map:get($new-permission, "roleId")),
                    true()
                    )
                },
            map:map(),
            $new-permissions
            )
        for $base-permission in $base-permissions
        return
            if (map:contains($new-roles, string(map:get($base-permission,"roleId")))) then ()
            else $base-permission
        )
};

declare function docmodupdput:is-uri(
    $uri as xs:string?
) as xs:boolean
{
    if (empty($uri) or string-length($uri) eq 0)
    then false()
    else
        try {
            strict:is-uri($uri)
        } catch($e) {
            false()
        }
};

declare function docmodupdput:write-property-values(
   $uri as xs:string,
   $properties as map:map,
   $overwrite as xs:boolean
) as empty-sequence()
{
    if ($is-untraced or docmodupdput:check-untraced()) then ()
    else lid:log(
        $docmodupdput:trace-id,"write-property-values",map:entry("properties",$properties)
        ),

    let $elements :=
      for $prop-name in map:keys($properties)
      return 
          if ($prop-name castable as xs:NCName)
          then element {$prop-name} {map:get($properties,$prop-name)}
          else error((),"REST-INVALIDPARAM",
              "Property name must be a valid XML NCName: "||$prop-name
              )
   return
      if ($overwrite)
      then xdmp:document-set-properties($uri,$elements)
      else (
         xdmp:document-remove-properties($uri,$elements/node-name(.)),
         xdmp:document-add-properties($uri,$elements)
         )
};

declare function docmodupdput:put($params as map:map) {
   xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),
   let $uri := map:get($params,"uri")
   let $created := not(doc-available($uri))
   let $update-policy := docmodcom:get-update-policy()
   let $options := map:map()
   return (
      (: We only need to check if the version is required because if-match is handled elsewhere :)
      if (not($created) and $update-policy = ("version-required"))
      then error((), "RESTAPI-CONTENTNOVERSION", "uri "|| $uri)
      else (),
      
      if (not($created) or docmodupdput:is-uri($uri)) then ()
      else error((), "REST-INVALIDPARAM", "invalid uri: "||$uri),
      
      xdmp:lock-for-update($uri),

      map:put($options, "uri", $uri),

      let $collections :=
         let $param-collections := map:get($params,"collection")
         return
            if (exists($param-collections))
            then $param-collections
            else if ($created)
            then xdmp:default-collections($uri)
            else if ($update-policy eq "overwrite-metadata")
            then ()
            else xdmp:document-get-collections($uri)
      return
         if (empty($collections)) then ()
         else map:put($options,"collections",$collections),

      let $permissions := docmodupdput:merge-permissions(
         docmodupdput:security-permissions(map:get($params,"permissions")),
         if ($created or $update-policy eq "overwrite-metadata")
            then xdmp:default-permissions($uri,"objects")
            else xdmp:document-get-permissions($uri,"objects")
         )
      return
          if (empty($permissions)) then ()
          else map:put($options,"permissions",$permissions),

      let $metadata :=
          let $param-metadata := map:get($params,"metadata")
          return
              if (exists($param-metadata))
              then $param-metadata
              else if ($created or $update-policy eq "overwrite-metadata")
              then ()
              else xdmp:document-get-metadata($uri)
      return
          if (empty($metadata)) then ()
          else map:put($options,"metadata",$metadata),

      let $quality :=
          let $param-quality := map:get($params,"quality")
          return
              if (exists($param-quality))
              then xs:integer($param-quality)
              else if ($created or $update-policy eq "overwrite-metadata")
              then ()
              else xdmp:document-get-quality($uri)
      return
          if (empty($quality)) then ()
          else map:put($options,"quality",$quality),

      let $forest-ids := docmodupdput:forest-ids(map:get($params,"forest-name"))
      return
          if (empty($forest-ids)) then ()
          else map:put($options,"forests",$forest-ids),

      if ($is-untraced or docmodupdput:check-untraced()) then ()
      else lid:log(
          $docmodupdput:trace-id,"put",map:entry("options",$options)
          ),

      xdmp:document-load("rest::",$options),
      
      let $properties := map:get($params,"properties")
      return 
         if (empty($properties)) then ()
         else docmodupdput:write-property-values($uri,$properties,$update-policy eq "overwrite-metadata"),
      
      if (not(map:contains($params,"txid"))) then ()
      else cook:add-cookie("HostId", xs:string(xdmp:host()), (),(),(),false()),
      
      if ($created) then (
         xdmp:set-response-code(201,"Created"),
         xdmp:add-response-header("Location","/v1/documents?uri="||$uri)
         )
      else xdmp:set-response-code(204,"Content Updated")
   )
};
