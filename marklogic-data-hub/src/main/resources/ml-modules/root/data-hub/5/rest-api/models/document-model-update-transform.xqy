xquery version "1.0-ml";

(: Copyright 2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace docmodupdtform = "http://marklogic.com/rest-api/models/document-model-update-transform";

import module namespace json="http://marklogic.com/xdmp/json"
at "/MarkLogic/json/json.xqy";

import module namespace cook = "http://parthcomp.com/cookies"
at "/MarkLogic/cookies.xqy";

import module namespace lid = "http://marklogic.com/util/log-id"
at "/MarkLogic/appservices/utils/log-id.xqy";

(: used only for get-properties-map() :)
import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
at "../lib/endpoint-util.xqy";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
at "../lib/extensions-util.xqy";

import module namespace metadefault = "http://marklogic.com/rest-api/lib/metadata-defaulter"
at "/MarkLogic/rest-api/lib/metadata-defaulter.xqy";

declare namespace http  = "xdmp:http";
declare namespace mt    = "http://marklogic.com/xdmp/mimetypes";
declare namespace multi = "xdmp:multipart";
declare namespace rapi  = "http://marklogic.com/rest-api";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $docmodupdtform:trace-id := "restapi.documents.update.transform";

declare private variable $is-untraced := ();

declare function docmodupdtform:check-untraced() as xs:boolean {
  if (exists($is-untraced)) then ()
  else xdmp:set($is-untraced,
    lid:is-disabled($docmodupdtform:trace-id, ("restapi.documents", "restapi"))
  ),

  $is-untraced
};

declare function docmodupdtform:post-bulk-documents(
  $params as map:map
) as item()*
{
  xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-writer", "execute"),

  if (not(map:contains($params,"txid"))) then ()
  else cook:add-cookie("HostId", xs:string(xdmp:host()), (),(),(),false()),

  let $update-policy    := docmodupdtform:get-update-policy()
  let $transform-name   := map:get($params,"transform")
  let $transform-params := docmodupdtform:extract-transform-params($params)
  let $transform-func   := extut:get-extension-function("transform-all",$transform-name,"transform")
  let $forest-name      := map:get($params,"forest-name")
  (: TODO: get and use forest-id :)
  let $boundary         := docmodupdtform:get-multipart-boundary(xdmp:get-request-header("content-type"))
  let $response-type    := docmodupdtform:get-structured-response-type(head(xdmp:get-request-header("accept")))
  let $response-format  := substring-after($response-type,"application/")
  let $multipart-body   := xdmp:get-request-body("binary")/binary()
  let $parts-raw        :=
    if (exists($multipart-body))
    then xdmp:multipart-decode($boundary, $multipart-body)
    else error((), "RESTAPI-INVALIDCONTENT", "Request without multipart body")
  let $part-headers     := json:to-array(head($parts-raw)/*:part/*:headers)
  let $parts            := tail($parts-raw)
  let $requests         := json:array()
  let $inputs           := (
    if (json:array-size($part-headers) gt 0 and exists($parts)) then ()
    else error((), "RESTAPI-INVALIDCONTENT", "Empty multipart body"),

    let $default-meta  := map:entry("hasContent", true())
    for $part at $i in $parts
    let $headers         := $part-headers[$i]
    let $mime-type       := docmodupdtform:normalize-mime-type(head(docmodupdtform:tokenize-mime-types($headers/*:Content-Type/string(.))))
    let $document-params := docmodupdtform:disposition-params($headers/*:Content-Disposition/string(.))
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
        else map:get($document-params,"uri")
      return
        if (exists($uri))
        then $uri
        else if ($is-metadata) then ()
        else docmodupdtform:make-document-uri($document-params)
    let $content-format  := head((
      let $part-format := docmodupdtform:document-format($part)
      return
        if (exists($part-format))
        then $part-format
        else if (exists($curr-uri))
        then xdmp:uri-format($curr-uri)
        else (),
      "binary"
    ))
    let $content-type    :=
      if (exists($mime-type))
      then $mime-type
      else
        let $uri-type :=
          if (empty($curr-uri) or $is-metadata) then ()
          else docmodupdtform:uri-content-type($curr-uri)
        return
          if (exists($uri-type))
          then $uri-type
          else docmodupdtform:format-type($content-format)
    return
      if (empty($curr-uri))
      then xdmp:set($default-meta,
        docmodupdtform:prepare-metadata($content-format,$part)
        =>map:with("hasContent", true())
      )
      else if ($is-metadata) then (
        xdmp:lock-for-update($curr-uri),

        json:array-push($requests,
          docmodupdtform:prepare-metadata($content-format,$part)
          =>map:with("uri",$curr-uri)
        )
      )
      else (
          let $request-size := json:array-size($requests)
          let $last-request :=
            if ($request-size eq 0) then ()
            else $requests[$request-size]
          let $request      :=
            if (exists($last-request) and map:get($last-request,"uri") eq $curr-uri)
            then map:with($last-request,"hasContent", true())
            else
              let $new-request :=
                map:new($default-meta)
                =>map:with("uri",$curr-uri)
              return (
                xdmp:lock-for-update($curr-uri),
                json:array-push($requests,$new-request),
                $new-request
              )

          (: TODO:  must introduce backward incompatiblity, so need an opt out or opt in - via match-execute-privilege
    for rewriter dispatch?
    :)

          let $extract         :=
            if ($content-format ne "binary" or empty($document-params)) then ()
            else map:get($document-params,"extract")
          return (
            map:put($request, "contentType", $content-type),
            map:put($request, "params",      $document-params),

            if (empty($extract)) then ()
            else map:put($request,"extract",$extract),

            map:entry("uri",$curr-uri)
            => map:with("input",   $part)
            => map:with("context",
              map:entry("uri",$curr-uri)
              => map:with("input-type",   $content-type)
              => map:with("accept-types", $content-type)
              => map:with("output-type",  $content-type)
            )
          )
        )
  )

  let $outputs as json:array := json:to-array(map:get(
    extut:invoke-service(
      $transform-name, "TRANSFORM-ALL", (), $transform-func, map:entry("requests",$inputs),
      $transform-params, (), false()
    ),
    "response"
  ))
  let $responses :=
    let $outputCount as xs:int := json:array-size($outputs)
    let $nextOutput  as xs:int := 1
    return (
      for $request in json:array-values($requests)
      let $prepared-metadata := map:get($request,"metadata")
      let $properties        := map:get($request,"properties")
      let $request-uri       := map:get($request,"uri")
      return
        if (not(map:contains($request,"hasContent"))) then (
          docmodupdtform:apply-metadata($request-uri,$prepared-metadata),
          if ($response-format eq "json") then
            map:entry("uri",$request-uri)
            =>map:with("category","metadata")
          else
            <rapi:document>
              <rapi:uri>{$request-uri}</rapi:uri>
              <rapi:category>metadata</rapi:category>
            </rapi:document>
        )
        else if ($nextOutput gt $outputCount)
        then error((),"RESTAPI-INTERNALERROR", "more requests with content than transform output")
        else (
            let $currOutput := $nextOutput
            let $output     := $outputs[$currOutput]
            let $context    := map:get($output,"context")
            let $content    := map:get($output,"result")
            let $extract    := map:get($request,"extract")
            let $result-uri := head((map:get($context,"uri"), $request-uri))
            return (
              if ($result-uri eq $request-uri) then ()
              else xdmp:lock-for-update($result-uri),

              if (not($update-policy = ("version-required", "version-optional"))) then ()
              else docmodupdtform:check-content-version(
                $update-policy, map:get($request,"params"), $request-uri, $result-uri
              ),

              xdmp:set($nextOutput, $currOutput + 1),

              xdmp:document-insert(
                $result-uri,
                $content,
                if (exists($prepared-metadata))
                then metadefault:finish-metadata($result-uri,$prepared-metadata)
                else metadefault:create-metadata($result-uri)
              ),

              if (empty($properties)) then ()
              else xdmp:document-set-properties($result-uri,$properties),

              if (empty($extract)) then ()
              else if (empty($content/binary()))
              then error((), "RESTAPI-INVALIDCONTENT", concat(
                  "transform cannot perform binary extraction on: ",xdmp:quote($content)
                ))
              (: deliberately in a separate module to avoid including when not needed :)
              else xdmp:invoke("/MarkLogic/rest-api/lib/binary-extracter.xqy",
                  map:entry("uri", $result-uri)
                  =>map:with("extract",           $extract)
                  =>map:with("document",          $content)
                  =>map:with("prepared-metadata", $prepared-metadata),
                  map:entry("isolation", "same-statement")
                ),

              if ($response-format eq "json") then
                map:entry("uri",$request-uri)
                =>map:with("mime-type", map:get($request,"contentType"))
                =>map:with("category",  json:to-array((
                  if (empty($prepared-metadata)) then () else "metadata",
                  "content"
                )))
              else
                <rapi:document>
                  <rapi:uri>{$request-uri}</rapi:uri>
                  {if (empty($prepared-metadata)) then ()
                  else <rapi:category>metadata</rapi:category>}
                  <rapi:category>content</rapi:category>
                  <rapi:mime-type>{map:get($request,"contentType")}</rapi:mime-type>
                </rapi:document>
            )
          ),

      let $lastOutput := $nextOutput - 1
      return
        if ($lastOutput eq $outputCount) then ()
        else error((),"RESTAPI-INTERNALERROR",
          "count mismatch for requests with content and transform output"
        )
    )
  return (
    xdmp:set-response-code(200,"Bulk Change Written"),
    xdmp:add-response-header("vnd.marklogic.document-format",$response-format),
    xdmp:set-response-content-type(concat($response-type,"; charset=utf-8")),

    if ($response-format eq "json")
    then xdmp:to-json(map:entry("documents",json:to-array($responses)))
    else <rapi:documents>{$responses}</rapi:documents>
  )

};

(: TODO: move into granular reusable libraries :)
declare function docmodupdtform:disposition-params(
  $content-disposition as xs:string?
) as map:map?
{
  if (empty($content-disposition)) then ()
  else
    let $params := map:map()
    return (
      let $NAME      := 1
      let $ASSIGN    := 2
      let $VALUE     := 3
      let $QUOTE_END := 4
      let $APOS_END  := 5
      let $TERMINATE := 6
      let $goal      := $NAME
      let $name      := ()
      let $value    := json:array()
      for $token in (
        cts:tokenize($content-disposition, "http://marklogic.com/collation/"),
        if (ends-with($content-disposition,";")) then ()
        else cts:tokenize(";", "http://marklogic.com/collation/")
      )
      return (
        switch($goal)
          case $NAME return
            typeswitch ($token)
              case $token as cts:word return (
                xdmp:set($name,$token),
                xdmp:set($goal,$ASSIGN)
              )
              case $token as cts:punctuation return
                if ($token eq ";") then ()
                else error((),"REST-INVALIDPARAM", concat(
                  "Expected param name instead of ",$token," for content disposition: ",
                  $content-disposition
                ))
              case $token as cts:space return ()
              default return error((),"RESTAPI-INTERNALERROR", concat(
                "Unknown type for token ",$token," in content disposition: ",
                $content-disposition
              ))
          case $ASSIGN return
            typeswitch ($token)
              case $token as cts:word return
                xdmp:set($name, concat($name," ",$token))
              case $token as cts:punctuation return
                switch($token)
                  case "=" return
                    xdmp:set($goal,$VALUE)
                  case ";" return (
                    switch($name)
                      case "attachment" return map:put($params,"type",$name)
                      case "inline"     return map:put($params,"type",$name)
                      default return
                        if (map:contains($params,$name)) then ()
                        else map:put($params,$name,""),

                    (: reset :)
                    xdmp:set($name,()),
                    xdmp:set($goal,$NAME)
                  )
                  default return error((),"REST-INVALIDPARAM", concat(
                    "Expected param assignment instead of ",$token," for content disposition: ",
                    $content-disposition
                  ))
              case $token as cts:space return ()
              default return error((),"RESTAPI-INTERNALERROR", concat(
                "Unknown type for token ",$token," in content disposition: ",
                $content-disposition
              ))
          case $VALUE return
            typeswitch ($token)
              case $token as cts:word return (
                json:array-push($value, $token),
                xdmp:set($goal,$TERMINATE)
              )
              case $token as cts:punctuation return
                switch($token)
                  case '"' return
                    xdmp:set($goal,$QUOTE_END)
                  case "'" return
                    xdmp:set($goal,$APOS_END)
                  case ";" return (
                    switch($name)
                      case "attachment" return map:put($params,"type",$name)
                      case "inline"     return map:put($params,"type",$name)
                      default return
                        if (map:contains($params,$name)) then ()
                        else map:put($params,$name,""),

                    (: reset :)
                    xdmp:set($name,()),
                    xdmp:set($goal,$NAME)
                  )
                  default return (
                    json:array-push($value, $token),
                    xdmp:set($goal,$TERMINATE)
                  )
              case $token as cts:space return ()
              default return error((),"RESTAPI-INTERNALERROR", concat(
                "Unknown type for token ",$token," in content disposition: ",
                $content-disposition
              ))
          case $QUOTE_END return
            if ($token instance of cts:punctuation and $token eq '"')
            then xdmp:set($goal,$TERMINATE)
            else json:array-push($value,$token)
          case $APOS_END return
            if ($token instance of cts:punctuation and $token eq "'")
            then xdmp:set($goal,$TERMINATE)
            else json:array-push($value,$token)
          case $TERMINATE return
            typeswitch ($token)
              case $token as cts:word return
                json:array-push($value, $token)
              case $token as cts:punctuation return
                switch($token)
                  case ";" return (
                    let $tokenCount := json:array-size($value)
                    let $newval     :=
                      if ($tokenCount eq 0) then ""
                      else (
                        if ($value[$tokenCount] ne " ") then ()
                        else json:array-resize($value, $tokenCount - 1),
                        string-join(json:array-values($value), "")
                      )
                    return
                      switch($name)
                        case "attachment" return map:put($params,"type",$name)
                        case "inline"     return map:put($params,"type",$name)
                        case "filename"   return map:put($params,"uri",$newval)
                        default return
                          let $oldvals := map:get($params,$name)
                          return
                            if (empty($oldvals))
                            then map:put($params,$name,$newval)
                            else if (string-length($newval) eq 0) then
                              if (exists($oldvals)) then ()
                              else map:put($params,$name,"")
                            else if ($oldvals = "")
                              then map:put($params,$name,$newval)
                              else map:put($params, $name, ($oldvals,$newval)),

                    (: reset :)
                    xdmp:set($name,()),
                    json:array-resize($value,0),
                    xdmp:set($goal,$NAME)
                  )
                  default return
                    json:array-push($value, $token)
              case $token as cts:space return
                let $tokenCount := json:array-size($value)
                return
                  if ($tokenCount eq 0 or $value[$tokenCount] eq " ") then ()
                  else json:array-push($value, " ")
              default return error((),"RESTAPI-INTERNALERROR", concat(
                "Unknown type for token ",$token," in content disposition: ",
                $content-disposition
              ))
          default return error((),"RESTAPI-INTERNALERROR", concat(
            "Unknown parse goal ",$goal," for token ",$token," in content disposition: ",
            $content-disposition
          ))
      )[false()],

      if (map:count($params) eq 0) then ()
      else $params
    )
};
declare private function docmodupdtform:get-update-policy(
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
declare private function docmodupdtform:check-content-version(
  $update-policy as xs:string,
  $params        as map:map,
  $request-uri   as xs:string,
  $result-uri    as xs:string
) as empty-sequence()
{
  let $etag-raw := map:get($params,"versionId")
  let $etag     :=
    if (empty($etag-raw) or $etag-raw eq "") then ()
    else translate($etag-raw, '"', '')
  let $oldtime  :=
    if (empty($etag) or $etag eq "") then ()
    else if ($etag castable as xs:integer)
    then xs:integer($etag)
    else error((),"REST-INVALIDPARAM",concat(
        "versionId parameter is not an integer: ",$etag-raw,
        " for uri: ",$request-uri
      ))
  let $newtime  := xdmp:document-timestamp($result-uri)
  return
    if (exists($oldtime) and $oldtime ne 0) then
    (: document hasn't changed since the old timestamp :)
      if ($oldtime eq $newtime)
      then ()
      else error((), "RESTAPI-CONTENTWRONGVERSION", concat(
        "uri ",$request-uri,
        if (empty($newtime)) then ()
        else concat(" has current version ",$newtime," that"),
        " doesn't match versionId: ",$oldtime
      ))
    (: document doesn't exist :)
    else if (empty($newtime) or ($update-policy ne "version-required"))
    then ()
    else error((), "RESTAPI-CONTENTNOVERSION", concat("uri ",$request-uri))
};
declare private function docmodupdtform:apply-metadata(
  $uri      as xs:string,
  $prepared as map:map
) as empty-sequence()
{
  let $collections     := (
    map:get($prepared,"collections"),
    metadefault:default-collections($uri, map:get($prepared,"collNames"))
  )
  let $permissions     := (
    map:get($prepared,"permissions"),
    metadefault:default-permissions($uri, map:get($prepared,"permRoleIds"))
  )
  let $metadata-values := map:get($prepared,"metadata")
  let $quality         := map:get($prepared,"quality")
  return (
    if (empty($collections)) then ()
    else xdmp:document-set-collections($uri,$collections),

    if (empty($permissions)) then ()
    else xdmp:document-set-permissions($uri,$permissions),

    if (empty($metadata-values)) then ()
    else xdmp:document-set-metadata($uri,$metadata-values),

    if (empty($quality)) then ()
    else xdmp:document-set-quality($uri,$quality)
  )
};
declare private function docmodupdtform:prepare-metadata(
  $metadata-format as xs:string,
  $metadata-doc    as document-node()
) as map:map
{
  if ($metadata-format eq "json")
  then docmodupdtform:prepare-metadata-json(xdmp:from-json($metadata-doc))
  else if ($metadata-format eq "xml")
  then docmodupdtform:prepare-metadata-xml($metadata-doc/rapi:metadata)
  else error((),"RESTAPI-INTERNALERROR", concat(
      "Unsupported format ",$metadata-format," for metadata: ",
      xdmp:quote($metadata-doc)
    ))
};
declare private function docmodupdtform:prepare-metadata-json(
  $input as map:map
) as map:map
{
  let $coll-fields := docmodupdtform:prepare-collections(
    docmodupdtform:get-map-sequence($input,"collections")
  )
  let $perm-fields := docmodupdtform:prepare-permissions-json(
    docmodupdtform:get-map-sequence($input,"permissions")
  )
  let $properties  := docmodupdtform:prepare-properties-json(
    docmodupdtform:get-map-sequence($input,"properties")
  )
  let $metadata    := map:entry("metadata",
    docmodupdtform:prepared-metadata(
      head($coll-fields),
      tail($coll-fields),
      head($perm-fields),
      tail($perm-fields),
      map:get($input,"metadata"),
      map:get($input,"quality")!xs:double(.)
    ))
  return
    if (empty($properties))
    then $metadata
    else $metadata=>map:with("properties",$properties)
};
declare private function docmodupdtform:prepare-metadata-xml(
  $input as element(rapi:metadata)
) as map:map
{
  let $coll-fields := docmodupdtform:prepare-collections(
    $input/rapi:collections/rapi:collection/string(.)
  )
  let $perm-fields := docmodupdtform:prepare-permissions-xml(
    $input/rapi:permissions/rapi:permission
  )
  let $properties  := $input/prop:properties/(* except prop:*)
  let $metadata    := map:entry("metadata",
    docmodupdtform:prepared-metadata(
      head($coll-fields),
      tail($coll-fields),
      head($perm-fields),
      tail($perm-fields),
      docmodupdtform:prepare-metadata-values-xml(
        $input/rapi:metadata-values/rapi:metadata-value
      ),
      $input/rapi:quality/data(.)
    ))
  return
    if (empty($properties))
    then $metadata
    else $metadata=>map:with("properties",$properties)
};
declare private function docmodupdtform:prepared-metadata(
  $coll-names      as map:map?,
  $collections     as xs:string*,
  $perm-roleIds    as map:map?,
  $permissions     as json:object*,
  $metadata-values as map:map?,
  $quality         as xs:double?
) as map:map
{
  let $prepared := map:map()
  return (
    if (empty($coll-names)) then ()
    else (
      map:put($prepared,"collNames",$coll-names),
      map:put($prepared,"collections",$collections)
    ),

    if (empty($perm-roleIds)) then ()
    else (
      map:put($prepared,"permRoleIds",$perm-roleIds),
      map:put($prepared,"permissions",$permissions)
    ),

    if (empty($metadata-values)) then ()
    else map:put($prepared,"metadata",$metadata-values),

    if (empty($quality)) then ()
    else map:put($prepared,"quality",$quality),

    $prepared
  )
};
declare private function docmodupdtform:prepare-metadata-values-xml(
  $values as element(rapi:metadata-value)*
) as map:map?
{
  if (empty($values)) then ()
  else
    let $metadata-values := map:map()
    return (
      for $value in $values
      return map:put($metadata-values,string($value/@key),string($value)),

      $metadata-values
    )
};
declare private function docmodupdtform:prepare-collections(
  $collections as xs:string*
) as item()* (: map:map, xs:string+ :)
{
  if (empty($collections)) then ()
  else
    let $coll-names := map:map()
    return (
      for $collection in $collections
      return
        if ($collection eq "")
        then error((),"RESTAPI-INVALIDCONTENT", concat(
          "empty collections are not allowed: <", string-join($collections,">, <"),">"
        ))
        else map:put($coll-names,$collection,true()),

      $coll-names,
      $collections
    )
};
declare private function docmodupdtform:prepare-permissions-json(
  $rest-perms as map:map*
) as map:map*
{
  if (empty($rest-perms)) then ()
  else
    let $perm-roleIds := map:map()
    let $permissions :=
      try {
        for $permission in $rest-perms
        let $role-name := map:get($permission,"role-name")
        let $role-id   := xdmp:role($role-name)
        for $capability in docmodupdtform:get-map-sequence($permission,"capabilities")
        return
          if (not($capability = ("execute", "insert", "read", "update")))
          then error((), "RESTAPI-INVALIDCONTENT", concat(
            "permission metadata with invalid capability: ",$capability
          ))
          else (
            map:put($perm-roleIds, string($role-id), true()),
            xdmp:permission($role-id, $capability, "object")
          )
      } catch ($e) {
        if ($e/error:code/string(.) eq "SEC-ROLEDNE")
        then error((), "REST-INVALIDPARAM", "Role "||$e/error:data/error:datum[last()]/string(.)|| " does not exist")
        else xdmp:rethrow()
      }
    return ($perm-roleIds, $permissions)
};
declare private function docmodupdtform:prepare-permissions-xml(
  $rest-perms as element(rapi:permission)*
) as map:map*
{
  if (empty($rest-perms)) then ()
  else
    let $perm-roleIds := map:map()
    let $permissions :=
      try {
        for $permission in $rest-perms
        let $role-name := $permission/rapi:role-name/string(.)
        let $role-id   := xdmp:role($role-name)
        for $capability in $permission/rapi:capability/string(.)
        return
          if (not($capability = ("execute", "insert", "read", "update")))
          then error((), "RESTAPI-INVALIDCONTENT", concat(
            "permission metadata with invalid capability: ",$capability
          ))
          else (
            map:put($perm-roleIds, string($role-id), true()),
            xdmp:permission($role-id, $capability, "object")
          )
      } catch ($e) {
        if ($e/error:code/string(.) eq "SEC-ROLEDNE")
        then error((), "REST-INVALIDPARAM", "Role "||$e/error:data/error:datum[last()]/string(.)|| " does not exist")
        else xdmp:rethrow()
      }
    return ($perm-roleIds, $permissions)
};
declare private function docmodupdtform:prepare-properties-json(
  $properties as map:map?
) as element()*
{
  if (empty($properties)) then ()
  else if (not($properties instance of map:map))
  then error((),"RESTAPI-INVALIDCONTENT","properties not an object.")
  else (
      let $system-props := map:get($properties,"$ml.prop")
      return
        if (empty($system-props)) then ()
        else map:delete($properties,"$ml.prop"),

      (: TODO: invoke? :)
      json:transform-from-json($properties, json:config("basic"))/*
    )
};
declare private function docmodupdtform:get-map-sequence(
  $map as map:map,
  $key as xs:string
) as item()*
{
  let $value := map:get($map,$key)
  return
    if (empty($value)) then ()
    else if ($value instance of json:array)
    then json:array-values($value)
    else $value
};
declare private function docmodupdtform:document-format(
  $document as document-node()?
) as xs:string?
{
  if (empty($document)) then ()
  else if (exists($document/(array-node()|boolean-node()|null-node()|number-node()|object-node())))
  then "json"
  else if (exists($document/(comment()|element()|processing-instruction())))
    then "xml"
    else if (exists($document/binary()))
      then "binary"
      else if (exists($document/text()))
        then "text"
        else ()
};
declare private function docmodupdtform:format-type(
  $format as xs:string?
) as xs:string?
{
  if (empty($format)) then ()
  else if ($format eq "json")   then "application/json"
  else if ($format eq "xml")    then "application/xml"
    else if ($format eq "text")   then "text/plain"
      else if ($format eq "binary") then "application/x-unknown-content-type" (: OR application/octet-stream ? :)
        else error((),"RESTAPI-INTERNALERROR","unknown format "||$format)
};
declare private function docmodupdtform:get-known-type-format(
  $type as xs:string?
) as xs:string?
{
  if (empty($type)) then ()
  else
    let $tokens     := cts:tokenize($type, "http://marklogic.com/collation/")
    let $firstToken := subsequence($tokens,1)
    let $lastToken  := subsequence($tokens,count($tokens))
    return
      if (($lastToken eq "json" and $firstToken = ("application","text")) or
        ($lastToken eq "xml"  and $firstToken = ("application","image","text")))
      then $lastToken
      else if ($firstToken eq "text")
      then $firstToken
      else if (($firstToken = ("audio","image","video")) or
          ($firstToken eq "application" and $lastToken = ("x-unknown-content-type","octet-stream")))
        then "binary"
        else docmodupdtform:get-mimetypes()[mt:name/string(.) = $type]/mt:format/string(.)
};
declare private function docmodupdtform:get-mimetypes(
) as element(mt:mimetype)*
{
  xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),
  xdmp:mimetypes()
};
declare private function docmodupdtform:uri-content-type(
  $uri as xs:string?
) as xs:string?
{
  if (empty($uri)) then ()
  else
    let $uri-type  := xdmp:uri-content-type($uri)
    return
      if (exists($uri-type[. ne "application/x-unknown-content-type"]))
      then
        if ($uri-type eq "text/xml")
        then "application/xml"
        else $uri-type
      else if (ends-with($uri,".json"))
      then "application/json"
      else if (ends-with($uri,".xml"))
        then "application/xml"
        else if (ends-with($uri,".txt"))
          then "text/plain"
          else $uri-type
};
declare private function docmodupdtform:make-document-uri(
  $params as map:map?
) as xs:string?
{
  let $extension-raw :=
    if (empty($params)) then ()
    else map:get($params,"extension")
  let $extension :=
    if (empty($extension-raw))
    then error((),"REST-INVALIDPARAM",
      "Extension required when generating document URI"
    )
    else if (not(matches($extension-raw,"^\.?\w+$")))
    then error((),"REST-INVALIDPARAM",
        "Extension may contain only word characters after initial period: "||
        $extension-raw
      )
    else if (starts-with(head($extension-raw),"."))
      then $extension-raw
      else concat(".", $extension-raw)
  return concat(
    map:get($params,"directory"),
    string(xdmp:random()),
    $extension
  )
};
declare private function docmodupdtform:extract-transform-params(
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
declare private function docmodupdtform:tokenize-mime-types(
  $header as xs:string?
) as xs:string*
{
  for $token in tokenize($header,"\s*,\s*")
  return
    if (starts-with($token,"*/*")) then ()
    else $token
};
declare private function docmodupdtform:normalize-mime-type(
  $raw-mime-type as xs:string?
) as xs:string?
{
  if (empty($raw-mime-type)) then ()
  else normalize-space(
    if (contains($raw-mime-type,";"))
    then substring-before($raw-mime-type,";")
    else $raw-mime-type
  )
};
declare private function docmodupdtform:get-multipart-boundary(
  $content-type as xs:string
) as xs:string
{
  let $boundary-raw := substring-after($content-type,"boundary=")
  let $boundary     :=
    if (empty($boundary-raw)) then ()
    else replace($boundary-raw, '^\s*"([^"]+)"\s*$', "$1")
  return
    if (exists($boundary))
    then $boundary
    else error((),"RESTAPI-INVALIDMIMETYPE",(
      "multipart/mixed must specify boundary",
      $content-type
    ))
};
declare private function docmodupdtform:get-structured-response-type(
  $accept-raw as xs:string?
) as xs:string
{
  let $accept-type := docmodupdtform:normalize-mime-type($accept-raw)
  let $match-type  := $accept-type[. = ("application/xml","text/xml","application/json","text/json")]
  return
    if (exists($match-type))
    then $match-type
    else if (exists($accept-type))
    then error((),"RESTAPI-INVALIDMIMETYPE",(
        "must match application/json or application/xml. Received mimetype",
        $accept-raw
      ))
    else "application/xml"
};
