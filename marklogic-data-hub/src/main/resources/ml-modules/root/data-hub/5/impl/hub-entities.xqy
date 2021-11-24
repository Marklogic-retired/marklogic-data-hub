(:
  Copyright (c) 2021 MarkLogic Corporation

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

import module namespace ext = "http://marklogic.com/data-hub/extensions/entity"
  at "/data-hub/extensions/entity/post-process-search-options.xqy";


import module namespace tg = "http://marklogic.com/data-hub/hub-entities" at "/data-hub/5/impl/template-generated.xqy";

import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";
declare namespace search = "http://marklogic.com/appservices/search";
declare namespace tde = "http://marklogic.com/xdmp/tde";


declare variable $ENTITY-MODEL-COLLECTION := "http://marklogic.com/entity-services/models";

declare option xdmp:mapping "true";



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

(:
See the comments on the uber-models(models) functions.
:)
declare function hent:uber-model() as map:map
{
  hent:uber-model(fn:collection($ENTITY-MODEL-COLLECTION)/object-node())
};

(:
This concept of an "uber model" dates back to DHF 4. It combines the entity definitions from every model into a single
entity model. However, this means that if there are two models that have an entity definition - such as "Address" - with
the same name but different config, only one will be in the returned model. This may lead to bugs, such as DHFPROD-7713.

This approach seems to be based on how QuickStart in DHF 4 and 5 would create a duplicate entity definition in some
scenarios. For example, if you had a Customer in QS and then added a property of type Address, QS would both add
Address to the Customer entity model, and it would also create an Address entity model with the same config. So QS was
already assuming that if you have two entity definitions with the same name in different models, they must have the
same config, as it was likely QS that did that.

If it turns out that users need to have multiple entity definitions with the same name but different config, this
function will of course need to be reworked to accomodate that.
:)
declare function hent:uber-model($models as object-node()*) as map:map
{
  map:new((
    map:entry("definitions", map:new((
      for $model as map:map in $models
      let $definitions := map:get($model, "definitions")
      where fn:exists($definitions)
      return
        for $entity-type-name in map:keys($definitions)
        return map:entry($entity-type-name, map:get($definitions, $entity-type-name))
    )))
  ))
};

declare function hent:is-tde-generation-enabled($entity-def as object-node()) as xs:boolean
{
  let $entity-def-map as map:map := $entity-def
  let $definitions := $entity-def-map => map:get("definitions")
  let $entity-title := $entity-def/info/title
  (: Check if TDE generation is enabled. If the property is not set or has any value other than true/'true', it enables TDE generation. :)
  let $primary-type-def := ($definitions => map:get($entity-title), $definitions => map:get(map:keys($definitions)[1]))[1]
  let $is-property-set := map:contains($primary-type-def, "tdeGenerationDisabled")
  let $property-value := xs:string(map:get($primary-type-def, "tdeGenerationDisabled"))
  let $tdes-enabled := not($is-property-set) or $property-value != "true"
  return $tdes-enabled
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
declare function hent:fix-options($nodes as node()*)
{
  for $n in $nodes
  return
    typeswitch($n)
      case element(search:options) return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          $n/@*,
          <search:constraint name="Collection">
            <search:collection/>
          </search:constraint>,
          <search:constraint name="createdByJob">
            <search:value>
              <search:field name="datahubCreatedByJob"/>
            </search:value>
          </search:constraint>,
          <search:constraint name="createdByStep">
            <search:value>
              <search:field name="datahubCreatedByStep"/>
            </search:value>
          </search:constraint>,
          hent:fix-options($n/node())
        }
      case element(search:additional-query) return ()
      case element(search:return-facets) return <search:return-facets>true</search:return-facets>
      case element(search:path-index) return fix-path-index($n)
      case element() return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          $n/@*,
          hent:fix-options($n/node()),

          let $is-range-constraint := $n[self::search:range] and $n/..[self::search:constraint]
          where $is-range-constraint and fn:not($n/search:facet-option[starts-with(., "limit=")])
          return <search:facet-option>limit=25</search:facet-option>
        }
      case text() return
        fn:replace($n, "es:", "*:")
      default return $n
};

declare %private function hent:fix-options-for-explorer(
  $nodes as node()*,
  $sortable-properties as map:map,
  $entity-namespace-map as map:map
)
{
  for $n in $nodes
  return
    typeswitch($n)
      case element(search:options) return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          $n/@*,
          build-static-explorer-constraints(),
          hent:build-sort-operator($sortable-properties, $entity-namespace-map),
          hent:fix-options-for-explorer($n/node(), $sortable-properties, $entity-namespace-map),
          <search:transform-results apply="snippet">
            <per-match-tokens>30</per-match-tokens>
            <max-matches>4</max-matches>
            <max-snippet-chars>200</max-snippet-chars>
          </search:transform-results>
        }
      case element(search:constraint) return
        let $container-for-entity-property-generated-by-es := $n/search:container
        where fn:not($container-for-entity-property-generated-by-es)
        return
          element {fn:node-name($n)} {
            $n/@* ! attribute {fn:node-name()} { fn:replace(., "/", ".")},
            let $path-expression := fix-path-expression(fn:string($n/search:range/search:path-index))
            let $search-range-node := $n/search:range
            let $is-sortable-only :=
              let $sort-info := map:get($sortable-properties, $path-expression)
              return
                if (fn:exists($sort-info)) then map:get($sort-info, "is-sortable-only") = fn:true()
                else fn:false()
            return
              if (fn:empty($search-range-node) or fn:not($is-sortable-only)) then
                hent:fix-options-for-explorer($n/node(), $sortable-properties, $entity-namespace-map)
              else
                element {fn:node-name($search-range-node)} {
                  $search-range-node/attribute()[not(name() = 'facet')],
                  attribute facet {"false"},
                  hent:fix-options-for-explorer($search-range-node, $sortable-properties, $entity-namespace-map)/node()
                }
          }
      case element(search:additional-query) return ()
      case element(search:return-facets) return <search:return-facets>true</search:return-facets>
      (: HubCentral doesn't have any need for extracted data :)
      case element(search:extract-document-data) return ()
      case element(search:transform-results) return <!--<search:transform-results apply="empty-snippet"></search:transform-results>-->
      case element(search:path-index) return fix-path-index($n)
      case element() return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          $n/@*,
          hent:fix-options-for-explorer($n/node(), $sortable-properties, $entity-namespace-map),

          let $is-range-constraint := $n[self::search:range] and $n/..[self::search:constraint]
          where $is-range-constraint and fn:not($n/search:facet-option[starts-with(., "limit=")])
          return (
            <search:facet-option>limit=25</search:facet-option>,
            <search:facet-option>frequency-order</search:facet-option>,
            <search:facet-option>descending</search:facet-option>)
        }
      case text() return
        fn:replace($n, "es:", "*:")
      default return $n
};

declare function is-explorer-constraint-name($name as xs:string) as xs:boolean
{
  let $default-constraint-names := es:search-options-generate(map:map())/search:constraint/@name/fn:string()
  let $explorer-constraint-names := build-static-explorer-constraints()/@name/fn:string()
  return $name = ($default-constraint-names, $explorer-constraint-names)
};

(:
Defined in a separate function so that these can be referenced when validating entity names.
:)
declare private function build-static-explorer-constraints() as element(search:constraint)+
{
  (: This wrapper element is used to avoid repeating the "search:" prefix over and over :)
  <wrapper xmlns="http://marklogic.com/appservices/search">
    <constraint name="Collection">
      <collection>
        <facet-option>limit=25</facet-option>
        <facet-option>frequency-order</facet-option>
        <facet-option>descending</facet-option>
      </collection>
    </constraint>
    <constraint name="entityType">
      <custom facet="false">
        <parse apply="parse" ns="http://marklogic.com/data-hub/entities/constraint/entityType"
          at="/data-hub/5/entities/constraint/entityType.xqy" />
      </custom>
    </constraint>
    <constraint name="hideHubArtifacts">
      <custom facet="false">
        <parse apply="parse" ns="http://marklogic.com/data-hub/entities/constraint/hideHubArtifacts"
          at="/data-hub/5/entities/constraint/hideHubArtifacts.xqy" />
      </custom>
    </constraint>
    <constraint name="createdByJob">
      <range facet="false">
        <field name="datahubCreatedByJob"/>
      </range>
    </constraint>
    <constraint name="createdByStep">
      <range>
        <field name="datahubCreatedByStep"/>
        <facet-option>limit=25</facet-option>
        <facet-option>frequency-order</facet-option>
        <facet-option>descending</facet-option>
      </range>
    </constraint>
    <constraint name="createdByJobWord">
      <word>
        <field name="datahubCreatedByJob"/>
      </word>
    </constraint>
    <constraint name="createdOnRange">
      <range facet="false">
        <field name="datahubCreatedOn"/>
      </range>
    </constraint>
    <constraint name="createdInFlowRange">
      <range>
        <field name="datahubCreatedInFlow"/>
        <facet-option>limit=25</facet-option>
        <facet-option>frequency-order</facet-option>
        <facet-option>descending</facet-option>
      </range>
    </constraint>
    <constraint name="sourceName">
      <range>
        <field name="datahubSourceName"/>
        <facet-option>limit=25</facet-option>
        <facet-option>frequency-order</facet-option>
        <facet-option>descending</facet-option>
      </range>
    </constraint>
    <constraint name="sourceType">
      <range>
        <field name="datahubSourceType"/>
        <facet-option>limit=25</facet-option>
        <facet-option>frequency-order</facet-option>
        <facet-option>descending</facet-option>
      </range>
    </constraint>
  </wrapper>/element()
};

declare %private function hent:build-sort-operator(
  $sortable-properties as map:map,
  $entity-namespace-map as map:map
) as element(search:operator)?
{
  let $states :=
    for $path-expression in map:keys($sortable-properties)
    let $sort-info := map:get($sortable-properties, $path-expression)
    let $indexable-datatype := hent:get-indexable-datatype(map:get($sort-info, "property-datatype"))
    let $state-name-prefix := fn:concat(map:get($sort-info, "entity-title"), "_", map:get($sort-info, "property-name"))
    for $direction in ("ascending", "descending")
    return
      <search:state name="{fn:concat($state-name-prefix, xdmp:initcap($direction))}">
        <search:sort-order type="{fn:concat("xs:", $indexable-datatype)}" direction="{$direction}">
          {
            element search:path-index {
              attribute {"xmlns:es"} {"http://marklogic.com/entity-services"},
              for $prefix in map:keys($entity-namespace-map)
              return attribute {"xmlns:" || $prefix} {map:get($entity-namespace-map, $prefix)},
              $path-expression
            }
          }
        </search:sort-order>
      </search:state>
  where $states
  return <search:operator name="sort">{$states}</search:operator>
};

(:
Returns an indexable scalar data type for ES logical datatype.
:)
declare function hent:get-indexable-datatype($datatype as xs:string) as xs:string
{
    switch ($datatype)
    case "boolean" return "string"
    case "iri" return "string"
    case "byte" return "int"
    case "short" return "int"
    case "unsignedShort" return "unsignedInt"
    case "unsignedByte" return "unsignedInt"
    case "integer" return "decimal"
    case "negativeInteger" return "decimal"
    case "nonNegativeInteger" return "decimal"
    case "positiveInteger" return "decimal"
    case "nonPositiveInteger" return "decimal"
    default return $datatype
};

(:
Returns a map with an entry for each entity definition that defines namespace and namespacePrefix, with the
key of each entry being the prefix. It's public so unit tests can work against it.
:)
declare function build-entity-namespace-map($uber-model)
{
  map:new(
    let $definitions := map:get($uber-model, "definitions")
    for $entity-name in map:keys($definitions)
    let $entity-type := map:get($definitions, $entity-name)
    let $ns := map:get($entity-type, "namespace")
    let $prefix := map:get($entity-type, "namespacePrefix")
    where $ns and $prefix
    return map:entry($prefix, $ns)
  )
};

declare function hent:dump-search-options($entities as json:array, $for-explorer as xs:boolean?)
{
  let $entity-model-map := hent:add-indexes-for-entity-properties($entities)
  let $sortable-properties := map:get($entity-model-map, "sortable-properties")
  let $uber-model :=
    let $entities := map:get($entity-model-map, "updated-models")
    return hent:uber-model(json:array-values($entities) ! xdmp:to-json(.)/object-node())

  return
    if ($for-explorer = fn:true()) then
      let $options := hent:fix-options-for-explorer(es:search-options-generate($uber-model), $sortable-properties, build-entity-namespace-map($uber-model))
      return ext:post-process-search-options($options)
    else
      hent:fix-options(es:search-options-generate($uber-model))
};

declare private function fix-path-index($path-index as element(search:path-index)) as element(search:path-index)
{
  element {fn:node-name($path-index)} {
    $path-index/namespace::node(),
    $path-index/@*,
    text {fix-path-expression($path-index/fn:string())}
  }
};

declare function hent:find-entity-identifiers(
    $all-uris as xs:string*,
    $entity-type as xs:string
) as map:map {
  let $entity-type-iri := sem:iri($entity-type)
  let $primary-key-defined := xdmp:exists(cts:search(fn:doc(), cts:triple-range-query($entity-type-iri, sem:iri('http://marklogic.com/entity-services#primaryKey'), ())))
  let $primary-keys := if ($primary-key-defined) then
    (: Optimize set to zero to avoid issue where query occausional doesn't return primary keys. See https://project.marklogic.com/jira/browse/DHFPROD-7388 :)
    let $results := sem:sparql('
      SELECT * WHERE {
        ?instanceIRI <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?entityTypeIRI;
           <http://www.w3.org/2000/01/rdf-schema#isDefinedBy> ?URI.
      }', map:entry("entityTypeIRI", $entity-type-iri), ("optimize=0"), cts:document-query($all-uris))
    let $primary-keys := map:new(
        let $entity-type-prefix := $entity-type || "/"
        for $result in $results
        let $uri := fn:string(map:get($result, "URI"))
        let $primary-key := fn:substring-after(fn:string(map:get($result, "instanceIRI")), $entity-type-prefix)
        return map:entry(
            $uri,
            if (fn:normalize-space($primary-key) eq "") then
              $uri
            else
              $primary-key
        )
      )
    let $_fill-in-missing :=
      for $uri in $all-uris
      where fn:not(map:contains($primary-keys, $uri))
      return
        map:put($primary-keys, $uri, $uri)
    return $primary-keys
  else
    map:new(
        $all-uris ! map:entry(., .)
    )
  return $primary-keys
};

(:
Fixes the path expression used by es:database-properties-generate and es:search-options-generate. Both are known to
return a path starting with "//es:instance/" but not including namespace prefixes/wildcards for the entity and property
names. This is instead replaced with our best attempt at a path that is functional and reasonably efficient.
:)
declare private function fix-path-expression($path as xs:string) as xs:string
{
  if (fn:starts-with($path, "//es:instance/")) then
    let $subpath := fn:substring($path, fn:string-length("//es:instance/") + 1)
    let $subpath-tokens := fn:tokenize($subpath, "/")
    return
      if (fn:contains($subpath-tokens[1], ":")) then
        "/es:envelope/es:instance/" || $subpath
      else
        "/(es:envelope|envelope)/(es:instance|instance)/" || $subpath
  else
    (: This is never expected to be reached, but if for some reason the ML function does not return a path
    starting with //es:instance, we don't want to mess with it :)
    $path
};

(:
Use hubEs.generateDatabaseProperties instead of this. This code is being kept here for now as there's a lot of
custom logic that would need to be rewritten in SJS. That is likely worth doing eventually since the output
of es:database-properties-generate is a JSON object, and it's of course easier to manipulate JSON in SJS vs XQuery.
:)
declare function hent:dump-indexes($entities as json:array) as document-node()
{
  let $updated-models := map:get(hent:add-indexes-for-entity-properties($entities), "updated-models")
  let $uber-model := hent:uber-model(json:array-values($updated-models) ! xdmp:to-json(.)/object-node())

  let $database-config := xdmp:from-json(es:database-properties-generate($uber-model))

  let $_ := add-entity-namespaces-to-path-namepaces($uber-model, $database-config)

  let $_ :=
    for $x in ("database-name", "schema-database", "triple-index", "collection-lexicon")
    return
      map:delete($database-config, $x)

  let $_ :=
    for $index in map:get($database-config, "range-path-index") ! json:array-values(.)
    let $path := map:get($index, "path-expression")
    return map:put($index, "path-expression", fix-path-expression($path))

  let $_ := remove-duplicate-range-indexes($database-config)
  return xdmp:to-json($database-config)
};

(:
Regardless of whether there are any path expressions that use an entity definition's namespace, we ensure that
such namespaces and their prefixes are added as path namespaces to workaround a bug in the Manage API where
indexes that do use the prefixes cannot be removed unless the prefixes are defined in path-namespaces.
:)
declare private function hent:add-entity-namespaces-to-path-namepaces($uber-model, $database-config)
{
  let $path-namespaces := map:get($database-config, "path-namespace")
  let $path-namespaces :=
    (: This is expected to always define 'es', but just in case, we ensure it's an array :)
    if (fn:not($path-namespaces)) then
      let $array := json:array()
      let $_ := map:put($database-config, "path-namespace", $array)
      return $array
    else $path-namespaces

  let $already-defined-prefixes :=
    for $ns in json:array-values($path-namespaces)
    return map:get($ns, "prefix")

  let $entity-namespace-map := build-entity-namespace-map($uber-model)
  let $_ :=
    for $prefix in map:keys($entity-namespace-map)
    where fn:not($prefix = $already-defined-prefixes)
    return json:array-push($path-namespaces, map:new((
      map:entry("prefix", $prefix),
      map:entry("namespace-uri", map:get($entity-namespace-map, $prefix))
    )))

  return ()
};

(:
es:database-properties-generate will generate duplicate range indexes when e.g. two entities have properties with the
same name and namespace and are both configured to have range indexes. This function removes duplicates, where
duplicates are considered to have the same local name, namespace URI, and collation.
:)
declare private function hent:remove-duplicate-range-indexes($database-config as item())
{
  let $indexes := map:get($database-config, "range-element-index")
  where (fn:exists($indexes))
  return
      let $index-map := map:map()
      let $_ :=
        for $index in json:array-values($indexes)
        let $key := fn:string-join(
          (
            "localname", map:get($index, "localname"),
            "namespace", map:get($index, "namespace-uri"),
            "collation", map:get($index, "collation")
          ), "-"
        )
        where fn:not(map:contains($index-map, $key))
        return map:put($index-map, $key, $index)

      let $deduplicated-indexes := json:array()
      let $_ := map:keys($index-map) ! json:array-push($deduplicated-indexes, map:get($index-map, .))
      let $_ := map:put($database-config, "range-element-index", $deduplicated-indexes)
      return ()
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
  let $entity-name := map:get(map:get($uber-model, "info"), "title")
  let $entity-name :=
    if (($uber-model => map:get("definitions") => map:contains($entity-name))) then
      $entity-name
    else
      (: if the title doesn't match a definition, make our best guess at what the root entity definition is :)
      hent:get-primary-entity-type-title($uber-model => map:get("definitions"))
  let $es-template := extraction-template-generate($uber-model)
  return hent:fix-tde($es-template, $entity-model-contexts, $uber-model, $entity-name)
};




declare function hent:get-primary-entity-type-title($entity-definition as item()) {
  let $entity-definition-node :=
    if ($entity-definition instance of node()) then
      $entity-definition
    else
      xdmp:to-json($entity-definition)/object-node()
  let $references-for-local-definitions := $entity-definition-node/object-node() ! ("#/definitions/"||fn:string(fn:node-name(.)))
  let $local-references-made := fn:distinct-values($entity-definition-node//text("$ref"))[fn:starts-with(., "#/definitions/")]
  let $unreferenced-definitions := $references-for-local-definitions[fn:not(. = $local-references-made)]
  let $primary-definition := fn:head($unreferenced-definitions)
  return $primary-definition ! fn:substring-after(., "#/definitions/")
};

declare variable $default-nullable as element(tde:nullable) := element tde:nullable {fn:true()};
declare variable $default-invalid-values as element(tde:invalid-values) := element tde:invalid-values {"ignore"};

declare function hent:fix-tde($nodes as node()*, $entity-model-contexts as xs:string*, $uber-model as map:map)
{
  hent:fix-tde($nodes, $entity-model-contexts, $uber-model, ())
};

declare function hent:fix-tde($nodes as node()*, $entity-model-contexts as xs:string*, $uber-model as map:map, $entity-name as xs:string?)
{
  for $n in $nodes
  return
    typeswitch($n)
      case document-node() return
        document {
          hent:fix-tde($n/node(), $entity-model-contexts, $uber-model, $entity-name)
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
              let $uber-definitions := $uber-model => map:get("definitions")
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
                  hent:fix-tde($n/node(), $entity-model-contexts, $uber-model, ())
            else
              hent:fix-tde($n/node(), $entity-model-contexts, $uber-model, ())
        }

      case element(tde:context) return
        fix-tde-context($n, $entity-model-contexts, $uber-model, $entity-name)

      case element(tde:column) return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          $n/@*,
          hent:fix-tde($n/* except $n/(tde:nullable|tde:invalid-values), $entity-model-contexts, $uber-model, ()),
          $default-nullable,
          $default-invalid-values
        }
      case element(tde:subject)|element(tde:predicate)|element(tde:object) return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          hent:fix-tde($n/* except $n/tde:invalid-values, $entity-model-contexts, $uber-model, ()),
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
              hent:fix-tde($n/tde:context, $entity-model-contexts, $uber-model, ()),
              element tde:rows {
                element tde:row {
                  $rows/(tde:schema-name|tde:view-name|tde:view-layout),
                  element tde:columns {
                    let $join-prefix := $context-item || "_"
                    for $column in $rows/tde:columns/tde:column
                    return
                      element tde:column {
                        $column/@*,
                        hent:fix-tde($column/(tde:name|tde:scalar-type), $entity-model-contexts, $uber-model, ()),
                        if (fn:starts-with($column/tde:name, $join-prefix)) then (
                          let $tde-val := fn:string($column/tde:val)
                          let $uber-definitions := $uber-model => map:get("definitions")
                          let $primary-key := $uber-definitions => map:get($tde-val) => map:get("primaryKey")
                          return
                            element tde:val {
                              if ($primary-key = $generated-primary-key-column) then
                                $generated-primary-key-expression
                              else
                                $tde-val || "/" || $primary-key
                            }
                        ) else
                          hent:fix-tde($column/tde:val, $entity-model-contexts, $uber-model, ()),
                        $default-nullable,
                        $default-invalid-values,
                        hent:fix-tde($column/(tde:default|tde:reindexing|tde:collation), $entity-model-contexts, $uber-model, ())
                      }
                  }
                }
              }
            ) else
              hent:fix-tde($n/node(), $entity-model-contexts, $uber-model, $entity-name)
        }
      case element() return
        element { fn:node-name($n) } {
          $n/namespace::node(),
          hent:fix-tde(($n/@*, $n/node()), $entity-model-contexts, $uber-model, ())
        }
      case text() return
        fn:replace(
          fn:replace($n, "^\.\./(.+)$", "(../$1|parent::array-node()/../$1)"),
          "\./" || $generated-primary-key-column,
          $generated-primary-key-expression
        )
      default return $n
};

(:
Fixes the ES-generated TDE context path by:
- Replacing the use of wildcards, which lead to false positives
- Checking the entity namespacePrefix to determine if the context only needs to support XML

False positives in the context path won't lead to incorrect results when querying via the TDE, but they will
lead to unnecessary reindexing, per DHFPROD-6954.

Example of an ES-generated path: //*:instance[*:info/*:version = "1.0"]
:)
declare private function fix-tde-context(
  $context as element(tde:context),
  $entity-model-contexts as xs:string*,
  $uber-model as map:map,
  $entity-name as xs:string?
) as element(tde:context)
{
  element tde:context {
    $context/namespace::node(),

    (: This appears to be for the 'non-root' context elements in a TDE :)
    if ($context = $entity-model-contexts) then
      fn:replace(fn:replace(fn:string($context),"^\./", ".//"), "(.)$", "$1[node()]")

    else if ($entity-name) then
      let $version := get-version-from-uber-model($uber-model)
      let $ns-prefix := get-namespace-prefix($uber-model, $entity-name)
      return
        if ($ns-prefix) then
          let $entity-predicate := "[" || $ns-prefix || ":" || $entity-name || "]"
          return
            if ($version) then
              "/(es:envelope|envelope)/(es:instance|instance)[es:info/es:version = '" || $version || "']" || $entity-predicate
            else
              replace-context-wildcards($context/text()) || $entity-predicate
        else
          let $entity-predicate := "[" || $entity-name || "]"
          return
            if ($version) then
              (: An 'or' clause is used to further avoid false positives :)
              "/(es:envelope|envelope)/(es:instance|instance)[es:info/es:version = '" || $version || "' or info/version = '" || $version || "']" || $entity-predicate
            else
              replace-context-wildcards($context/text()) || $entity-predicate

      else
        (: In the absence of an entity-name, which is very unexpected, at least remove the wildcards :)
        replace-context-wildcards($context/text())
  }
};

declare private function get-version-from-uber-model($uber-model as map:map) as xs:string?
{
  let $info := map:get($uber-model, "info")
  where fn:exists($info)
  return map:get($info, "version")
};

declare private function get-namespace-prefix($uber-model as map:map, $entity-name as xs:string) as xs:string?
{
  let $uber-definitions := $uber-model => map:get("definitions")
  where fn:exists($uber-definitions)
  return
    let $def := map:get($uber-definitions, $entity-name)
    where fn:exists($def)
    return map:get($def, "namespacePrefix")
};

(:
Replacing wildcards in the ES-generated context path eliminates many false positives, per DHFPROD-6954.
This function should also only be used when the entity def does not have a namespace prefix, as the path it
returns is intended to support JSON entity instances and XML entity instances that do not have a namespace (but still
use the es namespace for envelope/instance/info/version).
:)
declare private function replace-context-wildcards($path as xs:string) as xs:string
{
  let $temp := fn:replace($path, "//\*:instance", "/(es:envelope|envelope)/(es:instance|instance)")
  return fn:replace($temp, "\*:info/\*:version", "(es:info/es:version|info/version)")
};

declare variable $number-types as xs:string+ := ("byte","decimal","double","float","int","integer","long","negativeInteger","nonNegativeInteger","nonPositiveInteger","positiveInteger","short","unsignedLong","unsignedInt","unsignedShort","unsignedByte");
declare variable $string-types as xs:string+ := ("dateTime","date");

declare function hent:json-schema-generate($entity-title as xs:string, $uber-model as map:map)
{
  let $uber-model := map:new((
  (: Ensure we're not change a map for anyone else :)
  map:map(document{$uber-model}/*),
  map:entry("lang", "zxx"),
  map:entry("$schema", "http://json-schema.org/draft-07/schema#")
  ))
  let $definitions := $uber-model => map:get("definitions")
  (: JSON Schema needs an extra level of wrapping to account for Entity Model label wrapping it. :)
  let $_nest-refs :=
    for $definition-type in map:keys($definitions)
    let $definition-properties := $definitions => map:get($definition-type) => map:get("properties")
    for $property-name in map:keys($definition-properties)
    let $property := $definition-properties => map:get($property-name)
    let $property-items := $property => map:get("items")
    let $datatype := $property => map:get("datatype")
    let $_set-types := (
      $property => map:put("type", if ($datatype = $number-types) then "number" else if ($datatype = $string-types) then "string" else $datatype),
      $property => map:delete("datatype"),
      if ($property-items instance of map:map) then (
        let $items-datatype := $property => map:get("datatype")
        return (
          $property-items => map:put("type", if ($items-datatype = $number-types) then "number" else if ($items-datatype = $string-types) then "string" else $datatype),
          $property-items => map:delete("datatype"))
      ) else ()
    )
    return
    (: references can be in the property or in items for arrays :)
      if ($property => map:contains("$ref")) then
        map:put($definition-properties, $property-name,
          map:new((
            map:entry("type", "object"),
            map:entry("properties",
              map:entry(fn:tokenize(map:get($property,"$ref"),"/")[fn:last()], $property)
            )
          ))
        )
      else if ($property-items instance of map:map and $property-items => map:contains("$ref")) then
        map:put($property, "items",
          map:new((
            map:entry("type", "object"),
            map:entry("properties",
              map:entry(fn:tokenize(map:get($property-items,"$ref"),"/")[fn:last()], $property-items)
            )
          ))
        )
      else ()
  let $_set-info := (
    $uber-model => map:put("properties", map:entry($entity-title, map:entry("$ref", "#/definitions/"||$entity-title)))
  )
  return xdmp:to-json($uber-model)
};

declare %private function hent:build-indexes-for-structured-entity-properties($entity-path as xs:string, $definiton-name as xs:string, $definitions as map:map, $primary-entity-definition as map:map) {
  let $entity-type := map:get($definitions, $definiton-name)
  let $entity-type-properties := map:get($entity-type, "properties")

  let $_ :=
    for $entity-type-property in map:keys($entity-type-properties)
    let $ref := map:get($entity-type-properties, $entity-type-property)=>map:get("$ref")
    let $items := map:get($entity-type-properties, $entity-type-property)=>map:get("items")
    return
      if (fn:empty($ref) and (fn:empty($items) or fn:not(fn:starts-with(map:get($items, "$ref"), "#")))) then
        if (map:get($entity-type-properties, $entity-type-property)=>map:get("facetable")) then
          json:array-push(map:get($primary-entity-definition, "rangeIndex"), $entity-path || "/" || $entity-type-property)
        else ()
      else
        let $definiton-name :=
          if (fn:empty($items)) then
            fn:substring-after($ref, "#/definitions/")
          else
            fn:substring-after(map:get($items, "$ref"), "#/definitions/")
        where $definiton-name
        return
          let $path := $entity-path || "/" || $entity-type-property || "/" || $definiton-name
          let $_ := hent:build-indexes-for-structured-entity-properties($path, $definiton-name, $definitions, $primary-entity-definition)
          return ()
  return $primary-entity-definition
};

(:
  this function finds the first level facetable entityType properties and constrcuts and adds the rangeIndex array to
  the entityModel. All the structured properties are ignored for now even if a property is modeled as facetable as per
  https://project.marklogic.com/jira/browse/DHFPROD-5018
:)
declare %private function hent:add-indexes-for-entity-properties($entities as json:array) as map:map {
  let $models := json:array-values($entities) ! xdmp:to-json(.)/object-node()
  let $updated-models := json:array()
  let $sortable-properties := map:map()
  let $result-map := map:map()

  let $_ :=
    for $model as map:map in $models
      let $entity-title := map:get($model, "info")=>map:get("title")
      let $entity-definition := map:get($model, "definitions")=>map:get($entity-title)
      let $entity-type-properties :=
        let $empty-map := map:map()
          return
            if (fn:empty($entity-definition)) then
              let $_ := xdmp:log("Could not find entity definition with name: " || $entity-title)
              return $empty-map
            else
              let $_ :=
                if (fn:empty(map:get($entity-definition, "rangeIndex"))) then map:put($entity-definition, "rangeIndex", json:array())
                else ()
              return map:get($entity-definition, "properties")

      let $namespace := if (fn:exists($entity-definition)) then map:get($entity-definition, "namespace") else ()
      let $namespace-prefix := if (fn:exists($entity-definition)) then map:get($entity-definition, "namespacePrefix") else ()

      let $_ :=
        for $entity-type-property in map:keys($entity-type-properties)
          let $ref := map:get($entity-type-properties, $entity-type-property)=>map:get("$ref")
          return
            let $items := map:get($entity-type-properties, $entity-type-property)=>map:get("items")
            let $is-facetable :=
              if (fn:empty($ref) and (fn:empty($items) or fn:not(fn:starts-with(map:get($items, "$ref"), "#")))) then
                map:get($entity-type-properties, $entity-type-property)=>map:get("facetable")
              else
                let $definiton-name :=
                  if (fn:empty($items)) then
                    fn:substring-after($ref, "#/definitions/")
                  else
                    fn:substring-after(map:get($items, "$ref"), "#/definitions/")
                where $definiton-name
                return
                  let $definitions := map:get($model, "definitions")
                  let $entity-path := $entity-type-property || "/" || $definiton-name
                  let $model := hent:build-indexes-for-structured-entity-properties($entity-path, $definiton-name, $definitions, $entity-definition)
            return
              fn:false()

            let $is-sortable :=
              if (fn:empty($ref)) then
                let $items := map:get($entity-type-properties, $entity-type-property)=>map:get("items")
                return
                  if (fn:empty($items)) then
                    map:get($entity-type-properties, $entity-type-property)=>map:get("sortable")
                  else
                    fn:not(fn:starts-with(map:get($items, "$ref"), "#")) and
                            map:get($entity-type-properties, $entity-type-property)=>map:get("sortable")
              else
                fn:false()

            let $_ :=
              if ($is-sortable) then
                let $path-expression :=
                  if ($namespace and $namespace-prefix) then
                    fn:concat("/es:envelope/es:instance/", $namespace-prefix, ":", $entity-title, "/", $namespace-prefix, ":", $entity-type-property)
                  else
                    fn:concat("/(es:envelope|envelope)/(es:instance|instance)/", $entity-title, "/", $entity-type-property)
                let $property-datatype :=
                    let $items := map:get($entity-type-properties, $entity-type-property)=>map:get("items")
                    return
                      if(fn:empty($items)) then
                        map:get($entity-type-properties, $entity-type-property)=>map:get("datatype")
                      else
                        map:get($items, "datatype")
                (: If something is only sortable, we need a path range index for it, but we need to ensure that a facet
                is not configured for it :)
                let $sort-info := map:new((
                  map:entry("is-sortable-only", $is-sortable and fn:not($is-facetable)),
                  map:entry("entity-title", $entity-title),
                  map:entry("property-name", $entity-type-property),
                  map:entry("property-datatype", $property-datatype)
                ))
                return map:put($sortable-properties, $path-expression, $sort-info)
              else ()

            where $is-facetable or $is-sortable
            return json:array-push(map:get($entity-definition, "rangeIndex"), $entity-type-property)

      return json:array-push($updated-models, $model)

  let $_ := map:put($result-map, "updated-models", $updated-models)
  let $_ := map:put($result-map, "sortable-properties", $sortable-properties)
  return $result-map
};
