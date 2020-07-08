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
  let $property-key := $entity-type-iri || "|" || $property-path
  let $property-info := es-impl:get-entity-property-info() => map:get($property-key)
  return (
    $property-info,
    if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
      xdmp:trace($const:TRACE-MATCH-RESULTS, "Retrieving property information '"|| $property-key ||"' : " || xdmp:to-json-string($property-info))
    else ()
  )
};

declare function es-impl:get-entity-property-info() as map:map
{
  let $_populate :=
    if (map:count($indexes-by-property-names) = 0) then
        let $element-index-iri := sem:iri('http://marklogic.com/entity-services#ElementRangeIndexedProperty')
        let $path-index-iri := sem:iri('http://marklogic.com/entity-services#PathRangeIndexedProperty')
        let $properties := sem:sparql('
          PREFIX es: <http://marklogic.com/entity-services#>
          PREFIX fn: <http://www.w3.org/2005/xpath-functions#>
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

          SELECT ?property (IF(BOUND(?parentEntityType), fn:head(?parentEntityType), ?entityType) as ?firstEntityType) ?entityType ?entityTitle ?propertyTitle (CONCAT(IF(BOUND(?title),CONCAT(GROUP_CONCAT(?title;separator="."), "."),""), ?propertyTitle) AS ?propertyPath) (CONCAT("/(es:envelope|envelope)/(es:instance|instance)/",GROUP_CONCAT(?namespacedPath;separator="/"), IF(BOUND(?path),"/",""),?namespacePrefix, ?entityTitle,"/",?namespacePrefix, ?propertyTitle) AS ?pathExpression) ?namespace ?indexType ?collation ?datatype WHERE {
              ?entityType es:property  ?property;
                        es:title ?entityTitle.
              OPTIONAL {
                ?entityType es:namespace ?namespace;
                            es:namespacePrefix ?nsPrefix.
              }
              BIND(IF(BOUND(?nsPrefix), CONCAT(?nsPrefix, ":"), "") as ?namespacePrefix)
              ?property es:title ?propertyTitle;
                        es:datatype ?datatype.
              OPTIONAL {
                ?property rdf:type es:RangeIndexedProperty.
                ?property rdf:type ?indexType.
                OPTIONAL {
                  ?property es:collation ?collation.
                }
                FILTER (?indexType = es:ElementRangeIndexedProperty || ?indexType = es:PathRangeIndexedProperty)
              }
            OPTIONAL {
              ?path (es:ref|es:property)+ ?entityType;
                     es:title ?title.
              ?parentEntityType es:property ?path;
                                es:title ?parentEntityTypeTitle.
            }
            OPTIONAL {
              ?parentEntityType es:namespacePrefix ?pathNsPrefix.
            }
            BIND(IF(BOUND(?pathNsPrefix), CONCAT(?pathNsPrefix,":"), "") as ?pathNamespacePrefix).
            BIND(IF(BOUND(?title), CONCAT(IF(BOUND(?parentEntityTypeTitle),CONCAT(?pathNamespacePrefix,?parentEntityTypeTitle,"/"),""),?pathNamespacePrefix,?title), "") AS ?namespacedPath).
          }
          GROUP BY ?property')
        let $_ :=
          if (fn:empty($properties)) then
            map:put($indexes-by-property-names, "$empty", fn:true())
          else
            for $property in $properties
            let $first-entity-type-iri := fn:string(map:get($property, "firstEntityType"))
            let $entity-type-iri := fn:string(map:get($property, "entityType"))
            let $entity-title := fn:string(map:get($property, "entityTitle"))
            let $property-title := fn:string(map:get($property, "propertyTitle"))
            let $collation := map:get($property, "collation")
            let $datatype := fn:substring-after(fn:string(map:get($property, "datatype")),"#")
            let $options := (
              "type=" || $datatype,
              if ($datatype eq "string") then
                "collation=" || $collation
              else ()
            )
            let $namespace := fn:string(map:get($property, "namespace"))
            let $index-type := map:get($property, "indexType")
            let $index-reference :=
              try {
                if ($index-type = $element-index-iri) then
                  let $property-name := helper-impl:NCName-compatible(map:get($property,"propertyTitle"))
                  return
                    cts:element-reference(
                      fn:QName($namespace, $property-name),
                      $options
                    )
                else if ($index-type = $path-index-iri) then
                  (: TODO Likely need to build namespace map:map for 3rd argument :)
                  cts:path-reference(
                    map:get($property,"pathExpression"),
                    $options
                  )
                else ()
              } catch * {
                (: index isn't available yet :)
                ()
              }
            let $property-path := fn:replace(map:get($property,"propertyPath"), "^\.", "")
            let $_update-property := (
              map:put($property, "propertyPath", $property-path),
              map:put($property, "indexReference", $index-reference)
            )
            let $cache-ids := (
              $first-entity-type-iri || "|" || $property-path,
              (: The following is for the legacy way to reference a value in a structured property <EntityTitle>.<PropertyTitle> :)
              $entity-type-iri || "|" || $entity-title || "." || $property-title,
              $first-entity-type-iri || "|" || $entity-title || "." || $property-title
            )
            for $cache-id in $cache-ids
            return map:put($indexes-by-property-names, $cache-ids, $property)
          where xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)
          return
            xdmp:trace($const:TRACE-MATCH-RESULTS, "Property details: " || xdmp:to-json-string($indexes-by-property-names))
    else ()
  return $indexes-by-property-names
};
