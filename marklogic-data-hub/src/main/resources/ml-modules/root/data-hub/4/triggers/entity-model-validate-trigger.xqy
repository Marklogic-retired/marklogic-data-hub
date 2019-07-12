xquery version '1.0-ml';

import module namespace es = "http://marklogic.com/entity-services"
  at "/MarkLogic/entity-services/entity-services.xqy";
import module namespace hent = "http://marklogic.com/data-hub/hub-entities" at "/data-hub/5/impl/hub-entities.xqy";
import module namespace tde = "http://marklogic.com/xdmp/tde"
        at "/MarkLogic/tde.xqy";
import module namespace trgr = 'http://marklogic.com/xdmp/triggers' at '/MarkLogic/triggers.xqy';

declare variable $ENTITY-MODEL-COLLECTION as xs:string := "http://marklogic.com/entity-services/models";

declare variable $trgr:uri as xs:string external;

let $entity-def := fn:doc($trgr:uri)/object-node()
(: Create map version so we can update $ref to external links if we have to :)
let $entity-def-map as map:map := $entity-def
let $entity-base-uri := $entity-def/info/baseUri
let $entity-title := $entity-def/info/title
let $entity-version := $entity-def/info/version
let $validate-base-uri := try {
    xdmp:json-validate-node($entity-def/info, xdmp:unquote('{type: "object", properties: {"baseUri":{type:"string", format:"uri"}}, required: ["baseUri"]}'), "strict")
  } catch ($ex) {
    if(($ex/error:code eq "XDMP-JSVALIDATEINVFORMAT" or $ex/error:code eq "XDMP-JSVALIDATEMISSING") and fn:contains($ex/error:format-string/text(), "baseUri")) then (
      fn:error(fn:QName("error","XDMP-JSVALIDATEINVFORMAT"),fn:concat("A valid Base URI is required (e.g. http://example.org/) for entity: ", $entity-title, "."), fn:concat("Error Message: ", $ex/error:format-string/text()))
    )
    else xdmp:rethrow()
  }
let $definitions := $entity-def-map => map:get("definitions")
(: Find definition references :)
let $properties-with-refs :=
  for $definition-type in map:keys($definitions)
  let $definition-properties := $definitions => map:get($definition-type) => map:get("properties")
  for $property-name in map:keys($definition-properties)
  let $property := $definition-properties => map:get($property-name)
  let $property-items := $property => map:get("items")
  return
    (: references can be in the property or in items for arrays :)
    if ($property => map:contains("$ref")) then
      $property
    else if ($property-items instance of map:map and $property-items => map:contains("$ref")) then
      $property-items
    else ()
(: Search for supporting entities for uber model :)
let $supporting-entity-defs :=
  for $prop in $properties-with-refs
  let $ref := $prop => map:get("$ref")
  (: build external URI for refenced entity :)
  let $entity-uri :=
    if (fn:starts-with($ref, "#/definitions/")) then
      let $definiton-name := fn:QName("", fn:substring-after($ref, "#/definitions/"))
      where fn:empty($entity-def/definitions/object-node()[fn:node-name(.) eq $definiton-name])
      return
        fn:resolve-uri(fn:string($definiton-name) || "-" || $entity-version, fn:head(($entity-base-uri, "http://marklogic.com/data-hub/")[. ne '']))
    else
      fn:string($ref)
  where fn:exists($entity-uri)
  return (
    let $base-uri := fn:resolve-uri("./", $entity-uri)
    let $entity-identifier-parts := fn:tokenize(fn:substring-after($entity-uri, $base-uri), "-")
    let $entity-name := fn:string-join($entity-identifier-parts[fn:position() ne fn:last()], "")
    let $entity-version := $entity-identifier-parts[fn:last()]
    let $ref-entity :=
      cts:search(
        fn:collection($ENTITY-MODEL-COLLECTION),
        cts:and-query((
          cts:json-property-value-query("title", $entity-name, "exact"),
          cts:json-property-value-query("version", $entity-version, "exact"),
          if (fn:exists($entity-base-uri[. ne ''])) then
            cts:json-property-value-query("baseUri", $base-uri, "exact")
          else ()
        ))
      )[1]/object-node()
    return
      (: if we find the referenced entity, return it for uber model :)
      if (fn:exists($ref-entity)) then
        $ref-entity
      (: Otherwise, update to be external reference URI to ensure we still have a valid entity model :)
      else
        $prop => map:put("$ref", $entity-uri)
  )
let $info-map as map:map := $entity-def-map => map:get("info")
(: build uber model with original info :)
let $uber-model := hent:uber-model((xdmp:to-json($entity-def-map)/object-node(), $supporting-entity-defs)) => map:with("info", $info-map)
return (
  es:model-validate($uber-model)
)
