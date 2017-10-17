xquery version "1.0-ml";

module namespace hent = "http://marklogic.com/data-hub/hub-entities";

import module namespace es-wrapper = "http://marklogic.com/data-hub/es-wrapper"
  at "/com.marklogic.hub/lib/entity-services-wrapper.xqy";

import module namespace search = "http://marklogic.com/appservices/search"
  at "/MarkLogic/appservices/search/search.xqy";

declare variable $ENTITY-MODEL-COLLECTION := "http://marklogic.com/entity-services/models";

declare option xdmp:mapping "false";

declare function hent:get-model($entity-name as xs:string)
{
  hent:get-model($entity-name, ())
};

declare function hent:get-model($entity-name as xs:string, $used-models as xs:string*)
{
  let $model := fn:collection($ENTITY-MODEL-COLLECTION)[info/title = $entity-name]
  where fn:exists($model)
  return
    let $model-map as map:map? := $model
    let $refs := $model//*[fn:local-name(.) = '$ref'][fn:starts-with(., "#/definitions")] ! fn:replace(., "#/definitions/", "")
    let $_ :=
      let $definitions := map:get($model-map, "definitions")
      for $ref in $refs[fn:not(. = $used-models)]
      let $other-model as map:map? := hent:get-model($ref, ($used-models, $entity-name))
      let $other-defs := map:get($other-model, "definitions")
      for $key in map:keys($other-defs)
      return
        map:put($definitions, $key, map:get($other-defs, $key))
    return
      $model-map
};

declare function hent:uber-model() as map:map
{
  hent:uber-model(fn:collection($ENTITY-MODEL-COLLECTION)/object-node())
};

declare function hent:uber-model($models as object-node()*) as map:map
{
  let $uber-model := map:map()
  let $definitions :=
    let $m := map:map()
    let $_ :=
      for $model as map:map in $models
      let $defs := map:get($model, "definitions")
      for $key in map:keys($defs)
      return
        map:put($m, $key, map:get($defs, $key))
    return
      map:put($uber-model, "definitions", $m)
  return
    $uber-model
};

declare function hent:search-options-generate(
  $model as map:map
)
{
  let $entity-type-names := map:keys(map:get($model, "definitions"))
  let $seen-keys := map:map()
  let $all-constraints := json:array()
  let $all-tuples-definitions := json:array()
  let $_ :=
    for $entity-type-name in $entity-type-names
    let $entity-type := map:get(map:get($model, "definitions"), $entity-type-name)
    let $primary-key-name := map:get($entity-type, "primaryKey")
    let $properties := map:get($entity-type, "properties")
    let $tuples-range-definitions := json:array()
    let $_range-constraints :=
      for $property-name in map:get($entity-type, "rangeIndex") ! json:array-values(.)
      let $specified-datatype := es-wrapper:resolve-datatype($model,$entity-type-name,$property-name)
      let $property := map:get($properties, $property-name)
      let $datatype := es-wrapper:indexable-datatype($specified-datatype)
      let $collation := if ($datatype eq "string")
        then attribute
          collation {
            head( (map:get($property, "collation"), "http://marklogic.com/collation/en") )
          }
        else ()
      let $range-definition :=
        <search:range type="xs:{ $datatype }" facet="true">
          { $collation }
          <search:path-index>/*:envelope/*:instance/{$entity-type-name}/{$property-name}</search:path-index>
          <search:facet-option>limit=10</search:facet-option>
          <search:facet-option>frequency-order</search:facet-option>
          <search:facet-option>descending</search:facet-option>
        </search:range>
      let $constraint-template :=
        <search:constraint name="{ $property-name } ">
          {$range-definition}
        </search:constraint>
      (: the collecting array will be added once after accumulation :)
      let $_ := json:array-push($tuples-range-definitions, $range-definition)
      return
        json:array-push($all-constraints, hent:wrap-duplicates($seen-keys, $property-name, $constraint-template))
    let $_ :=
      if (json:array-size($tuples-range-definitions) gt 1)
      then
        json:array-push($all-tuples-definitions,
          <search:tuples name="{ $entity-type-name }">
            {json:array-values($tuples-range-definitions)}
          </search:tuples>)
      else if (json:array-size($tuples-range-definitions) eq 1)
      then
        json:array-push($all-tuples-definitions,
          <search:values name="{ $entity-type-name }">
            {json:array-values($tuples-range-definitions)}
          </search:values>)
      else ()
    let $_word-constraints :=
      for $property-name in json:array-values(map:get($entity-type, "wordLexicon"))
      return
      json:array-push($all-constraints, hent:wrap-duplicates($seen-keys, $property-name,
        <search:constraint name="{ $property-name } ">
          <search:word>
            <search:element ns="" name="{ $property-name }"/>
          </search:word>
        </search:constraint>))
    return ()
  let $types-expr := string-join( $entity-type-names, "|" )
  let $type-constraint :=
    <search:constraint name="entity-type">
      <search:value>
        <search:element ns="http://marklogic.com/entity-services" name="title"/>
      </search:value>
    </search:constraint>
  return
  <options xmlns="http://marklogic.com/appservices/search">
    <constraint name="Collection">
      <collection/>
    </constraint>
    {
    $type-constraint,
    json:array-values($all-constraints),
    json:array-values($all-tuples-definitions),
    comment {
      "Uncomment to return no results for a blank search, rather than the default of all results&#10;",       xdmp:quote(
    <term>
      <empty apply="no-results"/>
    </term>),
      "&#10;"
    },
    <values name="uris">
      <uri/>
    </values>,
    comment { "Change to 'filtered' to exclude false-positives in certain searches" },
    <search-option>unfiltered</search-option>,
    comment { "Modify document extraction to change results returned" },
    <extract-document-data selected="include">
      <extract-path>/*:envelope/*:instance/({ $types-expr })</extract-path>
    </extract-document-data>,

(:    comment { "Change or remove this additional-query to broaden search beyond entity instance documents" },
    <additional-query>
      <cts:element-query xmlns:cts="http://marklogic.com/cts">
      <cts:element xmlns:es="http://marklogic.com/entity-services">es:instance</cts:element>
      <cts:true-query/>
      </cts:element-query>
    </additional-query>,:)
    <return-facets>true</return-facets>,
    comment { "To return snippets, comment out or remove this option" },
    <transform-results apply="empty-snippet" />
    }
  </options>
};

declare function hent:wrap-duplicates(
    $duplicate-map as map:map,
    $property-name as xs:string,
    $item as element()
) as item()
{
    if (map:contains($duplicate-map, $property-name))
    then
        comment { "This item is a duplicate and is commented out so as to create a valid artifact.&#10;",
            xdmp:quote($item),
            "&#10;"
        }
    else (
        map:put($duplicate-map, $property-name, true()),
        $item)
};

declare function hent:dump-search-options($entities as json:array)
{
  let $uber-model := hent:uber-model(json:array-values($entities) ! xdmp:to-json(.)/object-node())
  return
    hent:search-options-generate($uber-model)
};

declare function hent:dump-indexes($entities as json:array)
{
  let $uber-model := hent:uber-model(json:array-values($entities) ! xdmp:to-json(.)/object-node())
  return
    hent:database-properties-generate($uber-model)
};

declare function hent:database-properties-generate(
  $model as map:map
) as document-node()
{
  let $definitions := map:get($model, "definitions")
  let $entity-type-names := map:keys($definitions)
  let $range-path-indexes := json:array()
  let $word-lexicons := json:array()
  let $range-element-indexes := json:array()
  let $_ :=
    for $entity-type-name in $entity-type-names
    let $entity-type := map:get($definitions, $entity-type-name)
    let $properties := map:get($entity-type, "properties")
    let $range-index-properties := map:get($entity-type, "rangeIndex")
    return (
      for $range-index-property in $range-index-properties ! json:array-values(.)
      let $ri-map := json:object()
      let $property := map:get($properties, $range-index-property)
      let $specified-datatype := es-wrapper:resolve-datatype($model, $entity-type-name, $range-index-property)
      let $datatype := es-wrapper:indexable-datatype($specified-datatype)
      let $collation := head( (map:get($property, "collation"), "http://marklogic.com/collation/en") )
      let $_ := map:put($ri-map, "collation", $collation)
      let $invalid-values := "reject"
      let $_ := map:put($ri-map, "invalid-values", $invalid-values)
      let $_ := map:put($ri-map, "path-expression", "/*:envelope/*:instance/" || $entity-type-name || "/" || $range-index-property)
      let $_ := map:put($ri-map, "range-value-positions", false())
      let $_ := map:put($ri-map, "scalar-type", $datatype)
      return json:array-push($range-path-indexes, $ri-map)
      ,
      let $word-lexicon-properties := map:get($entity-type, "wordLexicon")
      for $word-lexicon-property in $word-lexicon-properties ! json:array-values(.)
      let $wl-map := json:object()
      let $property := map:get($properties, $word-lexicon-property)
      let $collation := head( (map:get($property, "collation"), "http://marklogic.com/collation/en") )
      let $_ := map:put($wl-map, "collation", $collation)
      let $_ := map:put($wl-map, "localname", $word-lexicon-property)
      let $_ := map:put($wl-map, "namespace-uri", "")
      return json:array-push($word-lexicons, $wl-map)
      ,
      let $primary-key-property := map:get($entity-type, "primaryKey")
      where $primary-key-property
      return
        let $pk-map := json:object()
        let $property := map:get($properties, $primary-key-property)
        let $specified-datatype := es-wrapper:resolve-datatype($model, $entity-type-name, $primary-key-property)
        let $datatype := es-wrapper:indexable-datatype($specified-datatype)
        let $collation := head( (map:get($property, "collation"), "http://marklogic.com/collation/en") )
        let $_ := map:put($pk-map, "collation", $collation)
        let $_ := map:put($pk-map, "localname", $primary-key-property)
        let $_ := map:put($pk-map, "namespace-uri", "")
        let $_ := map:put($pk-map, "range-value-positions", fn:false())
        let $_ := map:put($pk-map, "scalar-type", $datatype)
        let $_ := map:put($pk-map, "invalid-values", "reject")
        return json:array-push($range-element-indexes, $pk-map)
    )
  let $path-namespaces := json:array()
  let $pn := json:object()
  let $_ := map:put($pn, "prefix", "es")
  let $_ := map:put($pn, "namespace-uri", "http://marklogic.com/entity-services")
  let $_ := json:array-push($path-namespaces, $pn)
  let $database-properties := json:object()
  let $_ := map:put($database-properties, "path-namespace", $path-namespaces)
  let $_ := map:put($database-properties, "element-word-lexicon", $word-lexicons)
  let $_ := map:put($database-properties, "range-path-index", $range-path-indexes)
  let $_ := map:put($database-properties, "range-element-index", $range-element-indexes)
  return xdmp:to-json($database-properties)
};
