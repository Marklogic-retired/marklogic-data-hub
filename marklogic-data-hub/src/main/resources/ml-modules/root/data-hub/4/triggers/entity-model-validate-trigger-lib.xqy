xquery version "1.0-ml";

module namespace entityTrigger = "http://marklogic.com/data-hub/entity-trigger";


import module namespace es = "http://marklogic.com/entity-services"
  at "/MarkLogic/entity-services/entity-services.xqy";
import module namespace hent = "http://marklogic.com/data-hub/hub-entities" at "/data-hub/5/impl/hub-entities.xqy";
import module namespace httputils="http://marklogic.com/data-hub/http-utils"
  at "/data-hub/5/impl/http-utils.xqy";

declare variable $ENTITY-MODEL-COLLECTION as xs:string := "http://marklogic.com/entity-services/models";

declare function entity-validate($entity-uri as xs:string, $is-draft as xs:boolean) {
  let $uber-model :=
    try {
      let $entity-def := fn:doc($entity-uri)/object-node()
      (: Create map version so we can update $ref to external links if we have to :)
      let $entity-def-map as map:map := $entity-def
      let $entity-base-uri := $entity-def/info/baseUri
      let $entity-title := $entity-def/info/title
      let $entity-version := $entity-def/info/version
      let $validate-base-uri := try {
        xdmp:json-validate-node($entity-def/info, xdmp:unquote('{type: "object", properties: {"baseUri":{type:"string", format:"uri"}}, required: ["baseUri"]}'), "strict")
      } catch ($ex) {
        if(($ex/error:code eq "XDMP-JSVALIDATEINVFORMAT" or $ex/error:code eq "XDMP-JSVALIDATEMISSING") and fn:contains($ex/error:format-string/text(), "baseUri")) then (
          httputils:throw-bad-request(fn:QName("error","XDMP-JSVALIDATEINVFORMAT"), fn:concat("A valid Base URI is required (e.g. http://example.org/) for entity: ", $entity-title, "."))
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
          (: if it is a draft, ignore empty references :)
          if ($is-draft and fn:string($ref) eq "") then
            (
              map:delete($prop, "$ref"),
              map:put($prop, "datatype", "string")
            )
          else if (fn:starts-with($ref, "#/definitions/")) then
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
      return hent:uber-model((xdmp:to-json($entity-def-map)/object-node(), $supporting-entity-defs)) => map:with("info", $info-map)
    } catch ($e) {
      httputils:throw-bad-request(xs:QName("INVALID-MODEL"), "Unable to validate entity model at URI: " || $entity-uri || "; cause: " || xdmp:quote($e))
    }

  (: This is kept separate from the above try/catch as model-validate is expected to throw a helpful error message :)
  return (
    es:model-validate($uber-model)
  )
};