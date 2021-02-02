(:
  Copyright (c) 2021 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
:)
xquery version "1.0-ml";

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : This library contains functions that are shared accross matching/merging
 :)

module namespace util-impl = "http://marklogic.com/smart-mastering/util-impl";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace es-helper = "http://marklogic.com/smart-mastering/entity-services"
  at "/com.marklogic.smart-mastering/sm-entity-services.xqy";
import module namespace httputils="http://marklogic.com/data-hub/http-utils"
at "/data-hub/5/impl/http-utils.xqy";

declare namespace es = "http://marklogic.com/entity-services";

declare variable $write-objects-by-uri as map:map := map:map();

declare function util-impl:add-all-write-objects(
  $write-objects as map:map*)
  as map:map?
{
  for $write-object in $write-objects
  return map:put($write-objects-by-uri, $write-object => map:get("uri"), $write-object),
  $write-objects-by-uri
};

declare function util-impl:retrieve-write-object(
  $uri as xs:string)
  as map:map?
{
  if (map:contains($write-objects-by-uri, $uri)) then
    $write-objects-by-uri
    => map:get($uri)
  else
    let $write-obj := util-impl:build-write-object-for-doc(fn:doc($uri))
    return (
      map:put($write-objects-by-uri, $uri, $write-obj),
      $write-obj
    )
};

declare function util-impl:build-write-object-for-doc($doc as document-node())
  as map:map
{
  map:new((
    map:entry("uri", xdmp:node-uri($doc)),
    map:entry("value", $doc),
    map:entry("context", map:new((
      map:entry("collections", xdmp:node-collections($doc)),
      map:entry("metadata", xdmp:node-metadata($doc)),
      map:entry("permissions", xdmp:node-permissions($doc, "objects"))
    )))
  ))
};

declare function util-impl:adjust-collections-on-document(
  $uri as xs:string,
  $collection-function as function(map:map) as xs:string*)
{
  let $write-object := util-impl:retrieve-write-object($uri)
  let $write-context := $write-object => map:get("context")
  let $current-collections := $write-context => map:get("collections")
  let $new-collections := $collection-function(map:entry($uri, $current-collections))
  let $_set-collections := $write-context => map:put("collections", $new-collections)
  return (
    if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
      xdmp:trace($const:TRACE-MERGE-RESULTS, "Setting collections to URI '"|| $uri ||"': " || fn:string-join($new-collections, ","))
    else (),
    $write-object
  )
};

declare function util-impl:combine-maps($base-map as map:map, $maps as map:map*)
  as map:map
{
  fn:fold-left(function($map1,$map2) {
    $map1 + $map2
  }, $base-map, $maps)
};

(: Given a set of rules and the  :)
declare function util-impl:properties-to-values-functions(
    $rules as node()*,
    $property-definitions as node()?,
    $entity-type-iri as xs:string?,
    $return-all-properties as xs:boolean,
    $message-output as map:map?)
    as map:map
{
  let $xpath-namespaces :=
    if (fn:exists($property-definitions/namespaces)) then
      xdmp:from-json($property-definitions/namespaces)
    else
      map:new(
        for $ns in $property-definitions/namespace::node()
        let $localname := fn:local-name($ns)
        where $localname ne ""
        return map:entry($localname, fn:string($ns))
      )
  let $entity-property-info :=
    if (fn:exists($entity-type-iri)) then
      es-helper:get-entity-property-info($entity-type-iri)
    else
      map:map()
  let $distinct-properties :=
    fn:distinct-values((
      $property-definitions/(*:property|*:properties)/(@name|name) ! fn:string(.),
      if ($return-all-properties) then
        map:keys($entity-property-info)
      else (
        $rules/(@property-name|propertyName),
        $rules/entityPropertyPath
      ),
      $rules/documentXPath
    ))
  return map:new(
    for $property-name in $distinct-properties
    let $entity-property-info := $entity-property-info => map:get($property-name)
    let $property-definition := $property-definitions/(*:property|properties)[(@name|name) = $property-name]
    let $document-xpath-rule := fn:head(($property-definition[@path|path], $rules[documentXPath eq $property-name]))
    let $function :=
      if (fn:exists($entity-property-info)) then
        (: optimization for top-level properties :)
        if (fn:contains($property-name, ".")) then
          let $xpath := fn:substring-after($entity-property-info => map:get("pathExpression"), "/(es:envelope|envelope)/(es:instance|instance)/")
          let $namespaces := $entity-property-info => map:get("namespaces")
          return
            function($document) {
              xdmp:unpath($xpath, $namespaces, $document/(es:envelope|envelope)/(es:instance|instance))
            }
        else
          let $property-title := $entity-property-info => map:get("propertyTitle")
          let $namespace := $entity-property-info => map:get("namespace")
          let $qname := fn:QName(fn:string($namespace), fn:string($property-title))
          return
            function($document) {
              $document/(es:envelope|envelope)/(es:instance|instance)/*/*[fn:node-name(.) eq $qname]
            }
      else if (fn:exists($document-xpath-rule)) then
        let $xpath := fn:head(($document-xpath-rule/(@path|path),$property-name))
        let $namespaces := fn:head(($document-xpath-rule/namespaces ! xdmp:from-json(.), $xpath-namespaces))
        return
          function($document) {
            xdmp:unpath($xpath, $namespaces, $document)
          }
      else if (fn:exists($property-definition)) then
          let $qname := fn:QName(fn:string($property-definition/(@namespace|namespace)), fn:string($property-definition/(@localname|localname)))
          return
            function($document) {
              $document/(es:envelope|envelope)/(es:instance|instance)//*[fn:node-name(.) eq $qname]
            }
      else
        util-impl:handle-option-messages("error", "Property information for '" || $property-name || "'" || (if (fn:exists($entity-type-iri)) then " entity <"||$entity-type-iri ||">" else "") || " not found!", $message-output)
    let $property-name := fn:head(($document-xpath-rule/(@path|path) ! fn:string(.),$property-name))
    return
      map:entry($property-name, $function)
  )
};

declare function util-impl:handle-option-messages($type as xs:string, $message as xs:string, $messages-output as map:map?)
  as empty-sequence()
{
  if (fn:exists($messages-output)) then (
    map:put($messages-output, $type, (map:get($messages-output, $type),$message))
  ) else if ($type eq "error") then
    httputils:throw-bad-request((), $message)
  else
    xdmp:log($message, $type)
};

(:
 :
 : @param $options as node()? match or merge options as object-node() or element()
 : @return map:map {
 :  "targetEntityType" The reference to the entity type in the options, either IRI or title
 :  "targetEntityTypeDefinition" Object with entity type defintion information
 :  "targetEntityTypeIRI" The full IRI for the entity type
 : }
 :)
declare function util-impl:get-entity-type-information($options as node()?) {
  let $target-entity-type := fn:head(($options/targetEntityType,$options/(*:target-entity|targetEntity))) ! fn:string(.)
  let $target-entity-type-def := es-helper:get-entity-def($target-entity-type)
  let $target-entity-type-iri := $target-entity-type-def/entityIRI ! fn:string(.)
  return
    map:entry("targetEntityType", $target-entity-type)
      => map:with("targetEntityTypeDefinition", $target-entity-type-def)
      => map:with("targetEntityTypeIRI", $target-entity-type-iri)
};

(:
 : @param $node as node()
 : @param $is-hub-central-format as xs:boolean
 : @param $is-function-javascript as xs:boolean
 : @param $conversion-to-json-function as xs:boolean
 : @param $conversion-to-xml-function as xs:boolean
 : @return item()
 :)
declare function util-impl:convert-node-for-function(
  $node as node()?,
  $is-hub-central-format as xs:boolean,
  $is-function-javascript as xs:boolean,
  $conversion-to-json-function as function(item()) as item()*,
  $conversion-to-xml-function as function(item()) as item()*
) as item()? {
  if (fn:empty($node)) then
    ()
  else if ($is-hub-central-format) then
    if ($is-function-javascript) then
      xdmp:from-json($node)
    else
      $node
  else
    if ($is-function-javascript) then
      typeswitch($node)
      case element() return
        $conversion-to-json-function($node)
      case object-node() return
        xdmp:from-json($node)
      default return
        ()
    else
      typeswitch($node)
        case element() return
          $node
        case object-node() return
          $conversion-to-xml-function(xdmp:from-json($node))
        default return
          ()
};

(:
 : Determines if a function is JavaScript
 : @param $fun as xdmp:function
 : @return xs:boolean
 :)
declare function util-impl:function-is-javascript(
  $fun as xdmp:function?
) as xs:boolean {
  fn:exists($fun) and fn:ends-with(xdmp:function-module($fun), "js")
};