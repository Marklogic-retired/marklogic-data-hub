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
    let $nc-name := xdmp:encode-for-NCName($entity-title)
    let $namespace-uri := fn:string(
        fn:head(
          fn:collection("http://marklogic.com/entity-services/models")
            /(object-node()|es:model)[(es:info/es:version|info/version) = $entity-version]
            /(es:definitions|definitions)/*[fn:string(fn:node-name(.)) eq $nc-name]
            /(es:namespace-uri|namespaceUri)
        )
      )
    return object-node {
      "entityIRI": map:get($entity, "entityIRI"),
      "entityTitle": $entity-title,
      "entityVersion": $entity-version,
      "namespaceUri": $namespace-uri,
      "primaryKey": fn:head((map:get($entity, "primaryKey"),null-node{})),
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
