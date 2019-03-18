xquery version "1.0-ml";

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : Code in this library simply retruns information about known Entity Services
 : entity descriptors.
 :)

module namespace es-impl = "http://marklogic.com/smart-mastering/entity-services-impl";

declare function es-impl:get-entity-descriptors()
  as array-node()
{
  array-node {
    let $entities :=
      sem:sparql("SELECT ?entityIRI ?entityTitle
                  WHERE
                  {
                    ?entityIRI a <http://marklogic.com/entity-services#EntityType>;
                               <http://marklogic.com/entity-services#title> ?entityTitle.
                  }
                  ORDER BY ?entityTitle")
    for $entity in  $entities
    return object-node {
      "entityIRI": map:get($entity, "entityIRI"),
      "entityTitle": map:get($entity, "entityTitle"),
      "properties": array-node {
        let $properties :=
          sem:sparql("SELECT ?propertyIRI ?datatype ?collation ?items ?title ?itemsDatatype ?itemsRef
                      WHERE
                      {
                        ?entityIRI <http://marklogic.com/entity-services#property> ?propertyIRI.
                        ?propertyIRI <http://marklogic.com/entity-services#datatype> ?datatype;
                                      <http://marklogic.com/entity-services#title>  ?title.
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
  }
};
