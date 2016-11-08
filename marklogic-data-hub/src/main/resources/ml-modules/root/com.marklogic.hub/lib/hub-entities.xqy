xquery version "1.0-ml";

module namespace hent = "http://marklogic.com/data-hub/hub-entities";

import module namespace esi = "http://marklogic.com/entity-services-impl"
  at "/MarkLogic/entity-services/entity-services-impl.xqy";

declare variable $ENTITY-MODEL-COLLECTION := "http://marklogic.com/entity-services/models";

declare option xdmp:mapping "false";

declare function hent:dump-indexes()
{
  let $uber-model := map:map()
  let $definitions :=
    let $m := map:map()
    let $_ :=
      for $model as map:map in fn:collection($ENTITY-MODEL-COLLECTION)/object-node()
      let $defs := map:get($model, "definitions")
      for $key in map:keys($defs)
      return
        map:put($m, $key, map:get($defs, $key))
    return
      map:put($uber-model, "definitions", $m)
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
  let $_ :=
    for $entity-type-name in $entity-type-names
    let $entity-type := map:get($definitions, $entity-type-name)
    let $properties := map:get($entity-type, "properties")
    let $range-index-properties := map:get($entity-type, "rangeIndex")
    return (
      for $range-index-property in $range-index-properties ! json:array-values(.)
      let $ri-map := json:object()
      let $property := map:get($properties, $range-index-property)
      let $specified-datatype := esi:resolve-datatype($model, $entity-type-name, $range-index-property)
      let $datatype := esi:indexable-datatype($specified-datatype)
      let $collation := head( (map:get($property, "collation"), "http://marklogic.com/collation/en") )
      let $_ := map:put($ri-map, "collation", $collation)
      let $invalid-values := "reject"
      let $_ := map:put($ri-map, "invalid-values", $invalid-values)
      let $_ := map:put($ri-map, "path-expression", "//es:instance/" || $entity-type-name || "/" || $range-index-property)
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
  return xdmp:to-json($database-properties)
};
