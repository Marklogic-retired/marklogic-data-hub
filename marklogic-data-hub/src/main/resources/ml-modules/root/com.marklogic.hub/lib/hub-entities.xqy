xquery version "1.0-ml";

module namespace hent = "http://marklogic.com/data-hub/hub-entities";

import module namespace es = "http://marklogic.com/entity-services"
  at "/MarkLogic/entity-services/entity-services.xqy";

declare namespace search = "http://marklogic.com/appservices/search";

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

(:
  this method doctors the output from ES
  because of https://github.com/marklogic/entity-services/issues/359
:)
declare %private function hent:fix-options($nodes as node()*)
{
  for $n in $nodes
  return
    typeswitch($n)
      case element(search:options) return
        element { fn:node-name($n) } {
          <search:constraint name="Collection">
            <search:collection/>
          </search:constraint>,
          hent:fix-options(($n/@*, $n/node()))
        }
      case element(search:additional-query) return ()
      case element(search:return-facets) return <search:return-facets>true</search:return-facets>
      case element() return
        element { fn:node-name($n) } { hent:fix-options(($n/@*, $n/node())) }
      case text() return
        fn:replace($n, "es:", "*:")
      default return $n
};

declare function hent:dump-search-options($entities as json:array)
{
  let $uber-model := hent:uber-model(json:array-values($entities) ! xdmp:to-json(.)/object-node())
  return
    es:search-options-generate($uber-model)
};

declare function hent:dump-indexes($entities as json:array)
{
  let $uber-model := hent:uber-model(json:array-values($entities) ! xdmp:to-json(.)/object-node())
  let $o := xdmp:from-json(es:database-properties-generate($uber-model))
  let $_ :=
    for $x in ("database-name", "schema-database", "triple-index", "collection-lexicon")
    return
      map:delete($o, $x)
  let $_ :=
    for $idx in map:get($o, "range-path-index") ! json:array-values(.)
    return
      map:put($idx, "path-expression", fn:replace(map:get($idx, "path-expression"), "es:", "*:"))
  return
    xdmp:to-json($o)
};
