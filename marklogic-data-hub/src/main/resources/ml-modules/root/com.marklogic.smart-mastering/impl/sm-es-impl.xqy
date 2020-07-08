xquery version "1.0-ml";

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : Code in this library simply returns information about known Entity Services
 : entity descriptors.
 :)

module namespace es-impl = "http://marklogic.com/smart-mastering/entity-services-impl";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";
import module namespace sem = "http://marklogic.com/semantics"
  at "/MarkLogic/semantics.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare variable $_entity-descriptors as array-node() := array-node {
    let $entities :=
      sem:sparql("SELECT ?entityIRI ?entityTitle ?entityVersion
                  WHERE
                  {
                    ?entityIRI a <http://marklogic.com/entity-services#EntityType>;
                               <http://marklogic.com/entity-services#title> ?entityTitle;
                               <http://marklogic.com/entity-services#version> ?entityVersion.
                    OPTIONAL {
                      ?entityIRI <http://marklogic.com/entity-services#primaryKey> ?primaryKey.
                    }
                  }
                  ORDER BY ?entityTitle")
    for $entity in  $entities
    let $entity-version := map:get($entity, "entityVersion")
    let $entity-title := map:get($entity, "entityTitle")
    let $nc-name := helper-impl:NCName-compatible($entity-title)
    let $raw-def :=
          fn:collection("http://marklogic.com/entity-services/models")
            /(object-node()|es:model)[(es:info/es:version|info/version) = $entity-version]
            /(es:definitions|definitions)/*[fn:string(fn:node-name(.)) eq $nc-name]
    let $namespace-uri := fn:string(fn:head($raw-def/(es:namespace-uri|namespaceUri|es:namespace|namespace)))
    let $primary-key := fn:head((map:get($entity, "primaryKey"), $raw-def/(es:primary-key|primaryKey) ! fn:string(.),null-node{}))
    return object-node {
      "entityIRI": map:get($entity, "entityIRI"),
      "entityTitle": $entity-title,
      "entityVersion": $entity-version,
      "namespaceUri": $namespace-uri,
      "primaryKey": $primary-key,
      "properties": array-node {
        let $properties :=
          sem:sparql("SELECT ?propertyIRI ?primaryKey ?ref ?datatype ?collation ?items ?title ?itemsDatatype ?itemsRef
                      WHERE
                      {
                        ?entityIRI <http://marklogic.com/entity-services#property> ?propertyIRI.
                        ?propertyIRI <http://marklogic.com/entity-services#title>  ?title.
                        OPTIONAL {
                          ?propertyIRI <http://marklogic.com/entity-services#ref> ?ref.
                        }
                        OPTIONAL {
                          ?propertyIRI <http://marklogic.com/entity-services#datatype> ?datatype.
                        }
                        OPTIONAL {
                          ?propertyIRI <http://marklogic.com/entity-services#items> ?items.
                          OPTIONAL {
                            ?items <http://marklogic.com/entity-services#datatype> ?itemsDatatype.
                          }
                          OPTIONAL {
                            ?items <http://marklogic.com/entity-services#ref> ?itemsRef.
                          }
                        }
                      }", $entity)
        for $property in $properties
        let $datatype := map:entry("datatype", fn:substring-after(map:get($property, "datatype"), "#"))
        let $items-datatype :=
          if (fn:exists(map:get($property, "itemsDatatype"))) then
            map:entry("itemsDatatype", fn:substring-after(map:get($property, "itemsDatatype"), "#"))
          else
            ()
        return
          map:new((
            $property,
            $datatype,
            $items-datatype
          ))
      }
    }
  };

declare function es-impl:get-entity-descriptors()
  as array-node()
{
  $_entity-descriptors
};

declare variable $_cached-entities as map:map := map:map();

declare function es-impl:get-entity-def($target-entity as item()?) as object-node()?
{
  if (fn:exists($target-entity)) then
    if (map:contains($_cached-entities, $target-entity)) then
      map:get($_cached-entities, $target-entity)
    else
      let $entity-def := fn:head(es-impl:get-entity-descriptors()/object-node()[(entityIRI,entityTitle) = $target-entity])
      (: try a second time with title, if not with IRI found since external entities give different IRIs :)
      let $entity-def := if (fn:empty($entity-def) and fn:matches($target-entity, "/[^/]+$")) then
          let $title := fn:tokenize($target-entity, "/")[fn:last()]
          return
            fn:head(es-impl:get-entity-descriptors()/object-node()[entityTitle = $title])
        else
          $entity-def
      return
        if (fn:exists($entity-def)) then (
          map:put($_cached-entities, $target-entity, $entity-def),
          $entity-def
        ) else
          fn:error($const:ENTITY-NOT-FOUND-ERROR, ("Specified entity not found"), ($target-entity))
  else ()
};

declare variable $_cached-entity-properties as map:map := map:map();

declare function es-impl:get-entity-def-property(
  $entity-def as object-node()?,
  $property-title as xs:string?
) as object-node()?
{
  if (fn:exists($entity-def)) then
    let $key := fn:generate-id($entity-def) || "|" || $property-title
    return
      if (map:contains($_cached-entity-properties, $key)) then
        map:get($_cached-entity-properties, $key)
      else
        let $property-def := $entity-def/properties[title = $property-title]
        return
          if (fn:exists($property-def)) then (
            map:put($_cached-entity-properties, $key, $property-def),
            $property-def
          ) else
            fn:error($const:ENTITY-PROPERTY-NOT-FOUND-ERROR, ("Specified entity property not found"), ($entity-def, $property-title))
  else ()
};


declare variable $indexes-by-property-names := map:map();
(:
  Provide information about a property for the purpose of querying and extracting values.
  @param $entity-type-iri The IRI string of the Entity Type the property belongs. (The first-level Entity Type, not strutured property)
  @param $property-path A dot notation to select a path. e.g, Customer with a billing property of type Address can access city with "billing.city"
  @return map:map {
    "propertyTitle": string of property title,
    "propertyPath": string of property's full dot notation,
    "pathExpression": string of full XPath to property in the document,
    "indexType": sem:iri if there is an index this is the IRI of range index type,
    "indexReference": cts:reference if a range index for the property exists,
    "firstEntityType": sem:iri of the top-level Entity Type for the property,
    "entityType": sem:iri of the most immediate Entity Type for the property including structured properties,
    "entityTitle": string of the title of the most immediate Entity Type for the property
  }
:)
declare function es-impl:get-entity-property-info($entity-type-iri as xs:string, $property-path as xs:string) as map:map?
{
  let $property-info := es-impl:get-entity-property-info($entity-type-iri) => map:get($property-path)
  return (
    $property-info,
    if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Retrieving property information '<"|| $entity-type-iri || ">" || $property-path ||"' : " || xdmp:to-json-string($property-info))
    else ()
  )
};

declare variable $entity-properties-by-model-iri as map:map := map:map();

declare function es-impl:get-entity-property-info($entity-type-iri as xs:string) as map:map
{
  let $entity-model-iri := fn:substring($entity-type-iri, 1, fn:head(fn:reverse(fn:index-of(fn:string-to-codepoints($entity-type-iri), fn:string-to-codepoints("/")))))
  let $entity-type-title := fn:substring-after($entity-type-iri, $entity-model-iri)
  return
    if (map:contains($entity-properties-by-model-iri, $entity-model-iri)) then
      $entity-properties-by-model-iri => map:get($entity-model-iri) => map:get($entity-type-title)
    else
      let $entity-model-descriptor := fn:head(cts:search(fn:collection("http://marklogic.com/entity-services/models"),
        cts:triple-range-query(sem:iri($entity-type-iri), sem:curie-expand("rdf:type"), sem:iri("http://marklogic.com/entity-services#EntityType"), "=")))
      let $entity-descriptor-maps := map:map()
      let $entity-property-info := es-impl:get-definition-properties($entity-model-descriptor, $entity-descriptor-maps, $entity-type-title, get-entity-type-namespaces($entity-type-iri))
      return (
        map:put($entity-properties-by-model-iri, $entity-model-iri, $entity-descriptor-maps),
        $entity-property-info
      )
};

declare variable $envelope-instance-expression as xs:string := "/(es:envelope|envelope)/(es:instance|instance)";

declare function es-impl:get-definition-properties(
    $entity-model-descriptor as document-node(),
    $definitions-map as map:map,
    $definition-name as xs:string,
    $namespaces as map:map
) {
  let $properties-map := es-impl:get-sub-map($definitions-map, $definition-name)
  return
    if (map:count($properties-map) gt 0) then
      $properties-map
    else
      let $definition := $entity-model-descriptor/definitions/*[fn:string(fn:node-name(.)) eq $definition-name]
      let $definition-namespace-prefix := fn:string($definition/namespacePrefix[fn:normalize-space(.)] ! (. || ":"))
      let $namespace := fn:string($definition/namespace)
      let $_properties :=
        for $property in $definition/properties/*
        let $property-title := fn:string(fn:node-name($property))
        let $path-expression := $envelope-instance-expression || "/" || $definition-namespace-prefix || $definition-name || "/" || $definition-namespace-prefix || $property-title
        let $property-path := $property-title
        let $collation := fn:head(($property/collation, fn:default-collation()))
        let $datatype := if (fn:exists($property/items/datatype)) then $property/items/datatype else $property/datatype
        let $options := (
          "type=" || $datatype,
          if ($datatype eq "string") then
            "collation=" || $collation
          else ()
        )
        let $is-indexed := $property/(facetable|sortable) = fn:true()
        return (
          map:put(
              $properties-map,
              $property-title,
              map:map()
              => map:with("propertyLineage", ())
              => map:with("entityTitle", $definition-name)
              => map:with("namespace", $namespace)
              => map:with("namespaces", $namespaces)
              => map:with("propertyTitle", $property-title)
              => map:with("pathExpression", $path-expression)
              => map:with("propertyPath", $property-path)
              => map:with("isIndexed", $is-indexed)
              => map:with("datatype", $datatype)
              => map:with("indexOptions", $options)
              => map:with("indexReference",
                  if ($property/(facetable|sortable) = fn:true()) then
                    try {
                      cts:path-reference($path-expression, $options, $namespaces)
                    } catch ($e) {
                      ()
                    }
                  else
                    ()
              )
          ),
          for $reference in $property//node("$ref")[fn:starts-with(., "#/definitions/")]
          let $ref-entity-title := fn:substring-after($reference, "#/definitions/")
          let $ref-entity-definition-properties := es-impl:get-definition-properties($entity-model-descriptor, $definitions-map, $ref-entity-title, $namespaces)
          for $sub-property-title in map:keys($ref-entity-definition-properties)
          let $sub-property-map := map:get($ref-entity-definition-properties, $sub-property-title)
          let $sub-path-expression := $path-expression || fn:substring-after($sub-property-map => map:get("pathExpression"), $envelope-instance-expression)
          let $sub-path-property-path := $property-path || "." || $sub-property-map => map:get("propertyPath")
          let $sub-property-is-indexed := $sub-property-map => map:get("isIndexed")
          let $sub-property-info := map:new($sub-property-map)
            => map:with("namespaceLineage", ($namespace, $sub-property-map => map:get("namespaceLineage")))
            => map:with("propertyLineage", ($property-title, $sub-property-map => map:get("propertyLineage")))
            => map:with("pathExpression", $sub-path-expression)
            => map:with("propertyPath", $sub-path-property-path)
            => map:with("indexReference",
                if ($sub-property-is-indexed) then
                  try {
                    cts:path-reference($sub-path-expression, $sub-property-map => map:get("indexOptions"), $namespaces)
                  } catch ($e) {()}
                else ()
            )
          return (
            map:put(
                $properties-map,
                $ref-entity-title || "." || $sub-property-title,
                $sub-property-info
            ),
            map:put(
                $properties-map,
                $sub-path-property-path,
                $sub-property-info
            )
          )
        )
      return (
        $properties-map
      )
};

declare function es-impl:get-sub-map($parent-map as map:map, $map-key as xs:string) {
  if (map:contains($parent-map, $map-key)) then
    map:get($parent-map, $map-key)
  else
    let $map := map:map()
    return (
      map:put($parent-map, $map-key, $map),
      $map
    )
};

declare variable $namespaces-by-entity-type := map:map();

declare function es-impl:get-entity-type-namespaces($entity-type-iri as xs:string) as map:map
{
  if (map:contains($namespaces-by-entity-type, $entity-type-iri)) then
    map:get($namespaces-by-entity-type, $entity-type-iri)
  else
    let $entity-namespaces := map:entry("es", "http://marklogic.com/entity-services")
    let $_populate-namespaces :=
      for $namespace-pair in sem:sparql('
          PREFIX es: <http://marklogic.com/entity-services#>
          PREFIX fn: <http://www.w3.org/2005/xpath-functions#>
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

          SELECT DISTINCT ?namespacePrefix ?namespaceURI WHERE {
              $entityType (es:ref|es:property|es:items)* ?path.
              ?path es:namespace ?namespaceURI;
                  es:namespacePrefix ?namespacePrefix.
          }', map:entry("entityType", sem:iri($entity-type-iri)))
      let $prefix := fn:string($namespace-pair => map:get("namespacePrefix"))
      let $uri := fn:string($namespace-pair => map:get("namespaceURI"))
      where $prefix ne ''
      return (
        if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
          xdmp:trace($const:TRACE-MATCH-RESULTS, "Namespace for <"|| $entity-type-iri ||"> found. " || $prefix || " : " || $uri)
        else (),
        $entity-namespaces => map:put($prefix, $uri)
      )
    return (
      $namespaces-by-entity-type => map:put($entity-type-iri, $entity-namespaces),
      $entity-namespaces
    )

};