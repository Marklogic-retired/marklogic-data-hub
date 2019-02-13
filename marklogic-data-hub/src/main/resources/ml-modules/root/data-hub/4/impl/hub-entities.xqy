(:
  Copyright 2012-2019 MarkLogic Corporation

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

module namespace hent = "http://marklogic.com/data-hub/hub-entities";

import module namespace es = "http://marklogic.com/entity-services"
  at "/MarkLogic/entity-services/entity-services.xqy";
import module namespace tde = "http://marklogic.com/xdmp/tde"
  at "/MarkLogic/tde.xqy";

declare namespace search = "http://marklogic.com/appservices/search";

declare variable $ENTITY-MODEL-COLLECTION := "http://marklogic.com/entity-services/models";

declare option xdmp:mapping "false";

declare function hent:get-model($entity-name as xs:string)
{
  hent:get-model($entity-name, ())
};

declare function hent:get-model($entity-name as xs:string, $used-models as xs:string*)
{
  let $model :=
    let $_ := fn:collection($ENTITY-MODEL-COLLECTION)[lower-case(info/title) = lower-case($entity-name)]
    return
      if (fn:count($_) > 1) then
        fn:head(fn:collection($ENTITY-MODEL-COLLECTION)[info/title = $entity-name])
      else
        $_
  where fn:exists($model)
  return
    let $model-map as map:map? := $model
    let $refs := $model//*[fn:local-name(.) = '$ref'][fn:starts-with(., "#/definitions")] ! fn:replace(., "#/definitions/", "")
    let $definitions := map:get($model-map, "definitions")
      let $_ :=
        for $ref in $refs[fn:not(. = $used-models)]
        let $m :=
          if (fn:empty(map:get($definitions, $ref))) then
          let $other-model as map:map? := hent:get-model($ref, ($used-models, $entity-name))
          let $other-defs := map:get($other-model, "definitions")
          for $key in map:keys($other-defs)
          return
            map:put($definitions, $key, map:get($other-defs, $key))
          else ()
      return ()
    return $model-map
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
          $n/namespace::node(),
          <search:constraint name="Collection">
            <search:collection/>
          </search:constraint>,
          hent:fix-options(($n/@*, $n/node()))
        }
      case element(search:additional-query) return ()
      case element(search:return-facets) return <search:return-facets>true</search:return-facets>
      case element() return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          hent:fix-options(($n/@*, $n/node()))
        }
      case text() return
        fn:replace($n, "es:", "*:")
      default return $n
};

declare function hent:dump-search-options($entities as json:array)
{
  let $uber-model := hent:uber-model(json:array-values($entities) ! xdmp:to-json(.)/object-node())
  return
    (: call fix-options because of https://github.com/marklogic/entity-services/issues/359 :)
    hent:fix-options(es:search-options-generate($uber-model))
};

declare function hent:dump-pii($entities as json:array)
{
  let $uber-model := hent:uber-model(json:array-values($entities) ! xdmp:to-json(.)/object-node())
  return es:pii-generate($uber-model)
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

declare variable $generated-primary-key-column as xs:string := "DataHubGeneratedPrimaryKey";
declare variable $generated-primary-key-expression as xs:string := "xdmp:node-uri(.) || '#' || fn:position()";

declare function hent:dump-tde($entities as json:array)
{
  let $entity-values as map:map* := json:array-values($entities)
  let $uber-model := hent:uber-model($entity-values ! xdmp:to-json(.)/object-node())
  let $_set-info := $uber-model => map:put("info", fn:head($entity-values) => map:get("info"))
  let $uber-definitions := $uber-model => map:get("definitions")
  (: Primary keys are required for each definition in an entity. If the primary key is missing, we'll help out by using the doc URI and position as the primary key. :)
  let $_set-primary-keys-for-TDE :=
    for $definition-type in map:keys($uber-definitions)
    let $definition := $uber-definitions => map:get($definition-type)
    where fn:empty($definition => map:get("primaryKey"))
    return (
      $definition => map:put("primaryKey", $generated-primary-key-column),
      $definition => map:get("properties") => map:put($generated-primary-key-column, map:entry("datatype", "string"))
    )
  let $entity-model-contexts := map:keys($uber-definitions) ! ("./" || .)
  return hent:fix-tde(es:extraction-template-generate($uber-model), $entity-model-contexts, $uber-definitions)
};

declare variable $default-nullable as element(tde:nullable) := element tde:nullable {fn:true()};
declare variable $default-invalid-values as element(tde:invalid-values) := element tde:invalid-values {"ignore"};
(:
  this method doctors the TDE output from ES
:)
declare function hent:fix-tde($nodes as node()*, $entity-model-contexts as xs:string*, $uber-definitions as map:map)
{
  for $n in $nodes
  return
    typeswitch($n)
      case document-node() return
        document {
          hent:fix-tde($n/node(), $entity-model-contexts, $uber-definitions)
        }
      case element(tde:nullable) return
        $default-nullable
      case element(tde:invalid-values) return
        $default-invalid-values
      case element(tde:val) return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          let $col-name := fn:string($n/../tde:name)
          return
            if (fn:ends-with($col-name, $generated-primary-key-column)) then
              $generated-primary-key-expression
            else if (fn:starts-with($n, $col-name)) then
              let $parts := fn:tokenize($n, "/")
              let $entity-definition := $uber-definitions => map:get(fn:string($parts[2]))
              return
                if (fn:exists($entity-definition)) then
                  let $primary-key := $entity-definition => map:get("primaryKey")
                  return
                    if ($primary-key = $generated-primary-key-column) then
                      $generated-primary-key-expression
                    else
                      fn:string($n) || "/" || $primary-key
                else
                  hent:fix-tde($n/node(), $entity-model-contexts, $uber-definitions)
            else
              hent:fix-tde($n/node(), $entity-model-contexts, $uber-definitions)
        }
      case element(tde:context) return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          if ($n = $entity-model-contexts) then
            fn:replace(fn:string($n),"^\./", ".//")
          else
            $n/node()
        }
      case element(tde:column) return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          $n/@*,
          hent:fix-tde($n/* except $n/(tde:nullable|tde:invalid-values), $entity-model-contexts, $uber-definitions),
          $default-nullable,
          $default-invalid-values
        }
      case element(tde:subject)|element(tde:predicate)|element(tde:object) return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          hent:fix-tde($n/* except $n/tde:invalid-values, $entity-model-contexts, $uber-definitions),
          $default-invalid-values
        }
      case element(tde:template) return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          $n/@*,
          let $context-item :=  fn:replace(fn:string($n/tde:context), "\./", "")
          let $parent-context-item := fn:replace(fn:string($n/../../tde:context), "\./", "")
          let $is-join-template := $n/tde:rows/tde:row/tde:view-name = $parent-context-item  || "_" || $context-item
          let $rows := $n/tde:rows/tde:row
          return
            if ($is-join-template) then (
              hent:fix-tde($n/tde:context, $entity-model-contexts, $uber-definitions),
              element tde:rows {
                element tde:row {
                  $rows/(tde:schema-name|tde:view-name|tde:view-layout),
                  element tde:columns {
                    let $join-prefix := $context-item || "_"
                    for $column in $rows/tde:columns/tde:column
                    return
                      element tde:column {
                        $column/@*,
                        if (fn:starts-with($column/tde:name, $join-prefix)) then (
                          hent:fix-tde($column/(tde:name|tde:scalar-type), $entity-model-contexts, $uber-definitions),
                          let $tde-val := fn:string($column/tde:val)
                          let $primary-key := $uber-definitions => map:get($tde-val) => map:get("primaryKey")
                          return
                            element tde:val {
                              if ($primary-key = $generated-primary-key-column) then
                                $generated-primary-key-expression
                              else
                                $tde-val || "/" || $primary-key
                            },
                          $default-nullable,
                          $default-invalid-values,
                          hent:fix-tde($column/(tde:default|tde:reindexing|tde:collation), $entity-model-contexts, $uber-definitions)
                        ) else
                          hent:fix-tde($column/node(), $entity-model-contexts, $uber-definitions)
                      }
                  }
                }
              }
            ) else
              hent:fix-tde($n/node(), $entity-model-contexts, $uber-definitions)
        }
      case element() return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          hent:fix-tde(($n/@*, $n/node()), $entity-model-contexts, $uber-definitions)
        }
      case text() return
        fn:replace(
          fn:replace($n, "^\.\./(.+)$", "(../$1|parent::array-node()/../$1)"),
          "\./" || $generated-primary-key-column,
          $generated-primary-key-expression
        )
      default return $n
};
