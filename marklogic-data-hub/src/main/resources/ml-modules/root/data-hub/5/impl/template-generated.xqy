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

 import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";

import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";

declare namespace search = "http://marklogic.com/appservices/search";
declare namespace tde = "http://marklogic.com/xdmp/tde";


declare option xdmp:mapping "true";

declare %private variable $DEFAULT_BASE_URI := "http://example.org/";

declare function extraction-template-generate(
  $model as map:map
) as element(tde:template)
{
  let $top-id := map:get($model,"$id")
  let $schema-name := $model=>map:get("info")=>map:get("title")
  let $entity-type-names := $model=>map:get("definitions")=>map:keys()
  let $scalar-rows := map:map()
  let $secure-tde-name := fn:replace(?, "-", "_")
  let $path-namespaces := map:map()
  let $local-references :=
    if (count($entity-type-names)=1) then ()
    else local-references($model)
  let $top-entity := top-entity($model, false())
  let $maybe-local-refs :=
    if (exists($top-entity)) then () else local-references($model)
  let $_ :=
    for $entity-type-name in $entity-type-names
    let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
    let $primary-key-name := map:get($entity-type, "primaryKey")
    let $required-properties := (map:get($entity-type, "required"))
    let $required-properties := (if (fn:exists($required-properties)) then json:array-values($required-properties) else (), $primary-key-name)
    let $properties := map:get($entity-type, "properties")
    let $primary-key-type := map:get( map:get($properties, $primary-key-name), "datatype" )
    let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
    let $namespace-uri := $entity-type=>map:get("namespace")
    let $prefix-value :=
      (
        map:put($path-namespaces,
          $namespace-prefix,
          <tde:path-namespace>
            <tde:prefix>{$namespace-prefix}</tde:prefix>
            <tde:namespace-uri>{$namespace-uri}</tde:namespace-uri>
          </tde:path-namespace>),
        if ($namespace-prefix)
        then $namespace-prefix || ":"
        else ""
      )
    return
      map:put($scalar-rows, $entity-type-name,
        <tde:rows>
          <tde:row>
            <tde:schema-name>{ $schema-name=>$secure-tde-name() }</tde:schema-name>
            <tde:view-name>{ $entity-type-name=>$secure-tde-name() }</tde:view-name>
            <tde:view-layout>sparse</tde:view-layout>
            <tde:columns>
              {
                for $property-name in map:keys($properties)
                let $property-definition := map:get($properties, $property-name)
                let $items-map := map:get($property-definition, "items")
                let $datatype :=
                  if (map:get($property-definition, "datatype") eq "iri")
                  then "IRI"
                  else map:get($property-definition, "datatype")
                let $is-nullable :=
                  if ($property-name = $required-properties)
                  then ()
                  else <tde:nullable>true</tde:nullable>
                return
                (: if the column is an array, skip it in scalar row :)
                  if (exists($items-map)) then ()
                  else
                    if ( map:contains($property-definition, "$ref") )
                    then
                      <tde:column>
                        <tde:name>{ $property-name=>$secure-tde-name() }</tde:name>
                        <tde:scalar-type>{ let $dt := ref-datatype($model, $entity-type-name, $property-name) return if ($dt="iri") then "IRI" else $dt} </tde:scalar-type>
                        <tde:val>{ $prefix-value }{ $property-name }/{ ref-prefixed-name($model, $entity-type-name, $property-name) }{ let $pk := ref-primary-key-name($model, $entity-type-name, $property-name) return if (empty($pk)) then () else "/"||$pk}</tde:val>
                        {$is-nullable}
                      </tde:column>
                    else
                      <tde:column>
                        <tde:name>{ $property-name=>$secure-tde-name() }</tde:name>
                        <tde:scalar-type>{ if ($datatype="iri") then "IRI" else $datatype }</tde:scalar-type>
                        <tde:val>{ $prefix-value }{$property-name }</tde:val>
                        {$is-nullable}
                      </tde:column>
              }
            </tde:columns>
          </tde:row>
        </tde:rows>)
  let $array-rows := map:map()
  let $triples-templates := map:map()
  let $_ :=
    (: this is a long loop.  It creates row-based templates for each
         :  entity-type name, as well as two triples that tie an entity
         :  instance document to its type and document IRI :)
    for $entity-type-name in $entity-type-names
    let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
    let $primary-key-name := map:get($entity-type, "primaryKey")
    let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
    let $prefix-value :=
      if ($namespace-prefix)
      then $namespace-prefix || ":"
      else ""
    let $prefix-path :=
      if ((exists($top-entity) and ($top-entity=$entity-type-name)) or
        (empty($top-entity) and empty($maybe-local-refs)))
      then "./"
      else ".//"
    let $required-properties := ($primary-key-name, json:array-values(map:get($entity-type, "required")))
    let $properties := map:get($entity-type, "properties")
    let $primary-key-type := map:get( map:get($properties, $primary-key-name), "datatype" )
    let $column-map := map:map()
    let $_ :=
      for $property-name in map:keys($properties)
      let $property-definition := map:get($properties, $property-name)
      let $items-map := map:get($property-definition, "items")
      let $is-ref := map:contains($items-map, "$ref")
      let $id-for-ref := map:get($items-map, "$id")
      let $id-for-ref :=
        if (empty($id-for-ref) or (exists($top-id) and $id-for-ref=$top-id))
        then ()
        else $id-for-ref
      let $is-local-ref := map:contains($items-map, "$ref") and starts-with( map:get($items-map, "$ref"), "#/definitions/") and empty($id-for-ref)
      let $is-external-ref := $is-ref and not($is-local-ref)
      let $ref-model :=
        if ($is-external-ref)
        then (
          let $ref := map:get($items-map, "$ref")
          let $ref := if (empty($ref) or contains($ref,"#")) then $ref else $ref||"#"
          let $ref-node :=
            if (empty($id-for-ref))
            then fn:doc(substring-before($ref,"#"))
            else fn:doc($id-for-ref)
          return
            if (empty($ref-node)) then $model else model-create($ref-node)
        ) else $model
      let $reference-value :=
        $property-definition=>map:get("items")=>map:get("$ref")
      let $ref-name := functx:substring-after-last($reference-value, "/")
      let $is-nullable :=
        if ($property-name = $required-properties)
        then ()
        else <tde:nullable>true</tde:nullable>
      let $items-datatype :=
        if (map:get($items-map, "datatype") eq "iri")
        then "string"
        else map:get($items-map, "datatype")
      let $ref-primary-key := ref-primary-key-name($ref-model, $entity-type-name, $property-name)
      let $ref-type-name := ref-type-name($model, $entity-type-name, $property-name)
      where exists($items-map)
      return
        map:put($column-map, $property-name,
          <tde:template>
            <tde:context>./{ $prefix-value }{ $property-name }{if ($is-ref) then concat("/",$ref-name) else ()}</tde:context>
            <tde:rows>
              <tde:row>
                <tde:schema-name>{ $schema-name=>$secure-tde-name() }</tde:schema-name>
                <tde:view-name>{ $entity-type-name=>$secure-tde-name() }_{ $property-name=>$secure-tde-name() }</tde:view-name>
                <tde:view-layout>sparse</tde:view-layout>
                <tde:columns>
                  { if (empty($primary-key-name))
                  then comment { "Warning, no primary key in enclosing type",
                    $entity-type-name }
                  else
                    <tde:column>
                      { comment { "This column joins to property",
                      $primary-key-name, "of",
                      $entity-type-name } }
                      <tde:name>{ $primary-key-name=>$secure-tde-name() }</tde:name>
                      <tde:scalar-type>{ if ($primary-key-type="iri") then "IRI" else $primary-key-type }</tde:scalar-type>
                      <tde:val>ancestor::{$entity-type-name}/{ $prefix-value }{ $primary-key-name }</tde:val>
                    </tde:column>,
                  if ($is-local-ref and empty($ref-primary-key))
                  then
                    (
                      map:get($scalar-rows, $ref-type-name)/tde:row[tde:view-name eq $ref-type-name ]/tde:columns/tde:column,
                      map:put($scalar-rows, $ref-type-name,
                        comment { "No extraction template emitted for" ||
                        $ref-type-name ||
                        "as it was incorporated into another view. "
                        }
                      )
                    )
                  else if ($is-local-ref)
                  then
                    <tde:column>
                      { comment { "This column joins to primary key of",
                      $ref-type-name } }
                      <tde:name>{ $property-name=>$secure-tde-name() || "_" || $ref-primary-key=>$secure-tde-name() }</tde:name>
                      <tde:scalar-type>{ let $dt := ref-datatype($model, $entity-type-name, $property-name) return if ($dt="iri") then "IRI" else $dt }</tde:scalar-type>
                      <tde:val>{ $prefix-value }{ $ref-primary-key }</tde:val>
                    </tde:column>
                  else
                    if ($is-external-ref)
                    then
                      <tde:column>
                        { comment { "This column joins to primary key of an external reference" } }
                        <tde:name>{ $property-name=>$secure-tde-name() }</tde:name>
                        <tde:scalar-type>string</tde:scalar-type>
                        <tde:val>.</tde:val>
                        {$is-nullable}
                      </tde:column>
                    else
                      <tde:column>
                        { comment { "This column holds array values from property",
                        $primary-key-name, "of",
                        $entity-type-name } }
                        <tde:name>{ $property-name=>$secure-tde-name() }</tde:name>
                        <tde:scalar-type>{ if ($items-datatype="iri") then "IRI" else $items-datatype }</tde:scalar-type>
                        <tde:val>.</tde:val>
                        {$is-nullable}
                      </tde:column>
                  }
                </tde:columns>
              </tde:row>
            </tde:rows>
          </tde:template>
        )
   return
        (
          if (exists($primary-key-name))
          then
            map:put($triples-templates, $entity-type-name,
              <tde:template>
                <tde:context>{ $prefix-path }{ $prefix-value }{ $entity-type-name }</tde:context>
                <tde:vars>
                  {
                    if ($primary-key-type eq "string")
                    then (
                      <tde:var><tde:name>subject-iri</tde:name><tde:val>sem:iri(concat("{ model-graph-prefix($model) }/{ $entity-type-name }/", fn:encode-for-uri(./{ $prefix-value }{ $primary-key-name })))</tde:val></tde:var>
                    ) else (
                      <tde:var><tde:name>subject-iri</tde:name><tde:val>sem:iri(concat("{ model-graph-prefix($model) }/{ $entity-type-name }/", fn:encode-for-uri(xs:string(./{ $prefix-value }{ $primary-key-name }))))</tde:val></tde:var>
                    )
                  }
                </tde:vars>
                <tde:triples>
                  <tde:triple>
                    <tde:subject><tde:val>$subject-iri</tde:val></tde:subject>
                    <tde:predicate><tde:val>$RDF_TYPE</tde:val></tde:predicate>
                    <tde:object><tde:val>sem:iri("{ model-graph-prefix($model) }/{ $entity-type-name }")</tde:val></tde:object>
                  </tde:triple>
                  <tde:triple>
                    <tde:subject><tde:val>$subject-iri</tde:val></tde:subject>
                    <tde:predicate><tde:val>sem:iri("http://www.w3.org/2000/01/rdf-schema#isDefinedBy")</tde:val></tde:predicate>
                    <tde:object><tde:val>fn:base-uri(.)</tde:val></tde:object>
                  </tde:triple>

                {


                 for $property-name in map:keys($properties)
                     let $property-info :=
                         if (map:contains(map:get($properties, $property-name), "items"))
                         then map:get(map:get($properties, $property-name), "items")
                         else map:get($properties, $property-name)
                         let $is-related-entity-type := map:contains($property-info, "relatedEntityType" )
                         let $related-entity-type := map:get($property-info, "relatedEntityType" )
                   (: let $is-related-entity-type := map:contains( map:get($properties, $property-name), "relatedEntityType" )
                    let $related-entity-type := map:get( map:get($properties, $property-name), "relatedEntityType" ):)
                    where exists($related-entity-type)
                    return(
                     <tde:triple>
                       <tde:subject><tde:val>$subject-iri</tde:val></tde:subject>
                       <tde:predicate><tde:val>sem:iri("{ model-graph-prefix($model) }/{ $entity-type-name }/{ $property-name}")</tde:val></tde:predicate>
                       <tde:object><tde:val>sem:iri(concat("{ $related-entity-type}/", fn:encode-for-uri(xs:string(./{ $property-name}))))</tde:val></tde:object>
                     </tde:triple>
                     )

                  }

                </tde:triples>
              </tde:template>)

          else (),
          if (exists(map:keys($column-map)))
          then map:put($array-rows, $entity-type-name, $column-map)
          else ()
        )
  let $entity-type-templates :=
    let $scalar-row-keys := map:keys($scalar-rows)
    for $entity-type-name in $scalar-row-keys
    let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
    let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
    let $namespace-uri := $entity-type=>map:get("namespace")
    let $prefix-value :=
      if ($namespace-uri)
      then
        $namespace-prefix || ":"
      else ""
    let $prefix-path :=
      if ((exists($top-entity) and ($top-entity=$entity-type-name)) or
        (empty($top-entity) and empty($maybe-local-refs)))
      then "./"
      else ".//"
    return
      if (empty ( ( json:array-values(
        $entity-type=>map:get("required")),
      $entity-type=>map:get("primaryKey"))
      ))
      then comment { "The standalone template for " || $entity-type-name ||
      " cannot be generated.  Each template row requires " ||
      "a primary key or at least one required property." }
      else
        (
          map:get($triples-templates, $entity-type-name),
          <tde:template>
            <tde:context>{ $prefix-path }{ $prefix-value }{ $entity-type-name }</tde:context>
            {
              map:get($scalar-rows, $entity-type-name),
              if (map:contains($array-rows, $entity-type-name))
              then
                let $m := map:get($array-rows, $entity-type-name)
                return
                  <tde:templates>{ for $k in map:keys($m) return map:get($m, $k) }</tde:templates>
              else ()
            }
          </tde:template>
        )
  return
    <tde:template xmlns:tde="http://marklogic.com/xdmp/tde" xml:lang="zxx">
      <tde:description>
        Extraction Template Generated from Entity Type Document
        graph uri: {model-graph-iri($model)}
      </tde:description>
      <!-- The following line matches JSON and XML instances, but may be slower to index documents. -->
      <tde:context>//*:instance[*:info/*:version = "{$model=>map:get("info")=>map:get("version")}"]</tde:context>
      {comment{
        " Replace the above with the following line to match XML instances only.  This may speed up indexing
        <tde:context>//es:instance[es:info/es:version =",concat('"',$model=>map:get("info")=>map:get("version"),'"]</tde:context>
')
      },
      comment{
        " Replace the above with the following line to match JSON instances only.  This may speed up indexing
        <tde:context>//instance[info/version =",concat('"',$model=>map:get("info")=>map:get("version"),'"]</tde:context>
')
      }}
      <tde:vars>
        <tde:var><tde:name>RDF</tde:name><tde:val>"http://www.w3.org/1999/02/22-rdf-syntax-ns#"</tde:val></tde:var>
        <tde:var><tde:name>RDF_TYPE</tde:name><tde:val>sem:iri(concat($RDF, "type"))</tde:val></tde:var>
      </tde:vars>
      <tde:path-namespaces>
        <tde:path-namespace>
          <tde:prefix>es</tde:prefix>
          <tde:namespace-uri>http://marklogic.com/entity-services</tde:namespace-uri>
        </tde:path-namespace>
        { ($path-namespaces=>map:keys()) ! ($path-namespaces=>map:get(.)) }
      </tde:path-namespaces>
      {
        if ( $entity-type-templates/element() )
        then
          <tde:templates>
            { $entity-type-templates }
          </tde:templates>
        else
          comment { "An entity type must have at least one required column or a primary key to generate an extraction template." }
      }
    </tde:template>
};


declare function model-graph-iri(
    $model as map:map
) as sem:iri
{
    let $info := map:get($model, "info")
    let $base-uri-prefix := resolve-base-uri($info)
    return
    sem:iri(
        concat( $base-uri-prefix,
               map:get($info, "title"),
               "-" ,
               map:get($info, "version")))
};

(: resolves the default URI from a model's info section :)
declare function resolve-base-uri(
    $info as map:map
) as xs:string
{
    let $base-uri := fn:head((map:get($info, "baseUri"), $DEFAULT_BASE_URI))
    return
        if (fn:matches($base-uri, "[#/]$"))
        then $base-uri
        else concat($base-uri, "#")
};

declare function model-graph-prefix(
    $model as map:map
) as sem:iri
{
    let $info := map:get($model, "info")
    let $base-uri-prefix := resolve-base-prefix($info)
    return
    sem:iri(
        concat( $base-uri-prefix,
               map:get($info, "title"),
               "-" ,
               map:get($info, "version")))
};



declare %private function ref-prefixed-name(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as xs:string
{
    let $ref-type := ref-type( $model, $entity-type-name, $property-name )
    let $ref-name := ref-type-name($model, $entity-type-name, $property-name)
    let $namespace-prefix := $ref-type=>map:get("namespacePrefix")
    let $is-local-ref := is-local-reference($model, $entity-type-name, $property-name)
    return
        if ($namespace-prefix and $is-local-ref)
        then $namespace-prefix || ":" || $ref-name
        else $ref-name
};

declare %private function resolve-base-prefix(
    $info as map:map
) as xs:string
{
    replace(resolve-base-uri($info), "#", "/")
};


(:
 : Resolves a reference and returns its datatype
 : If the reference is external, return 'string'
 :)
declare %private function ref-datatype(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as xs:string
{
    let $ref-type := ref-type($model, $entity-type-name, $property-name)
    return
        if (is-local-reference($model, $entity-type-name, $property-name))
        then
            (: if the referent type has a primary key, use that type :)
            let $primary-key-property := map:get($ref-type, "primaryKey")
            return
                if (empty($primary-key-property))
                then "string"
                else map:get(
                        map:get(
                            map:get($ref-type, "properties"),
                            $primary-key-property),
                        "datatype")
        else "string"
};

declare %private function ref-type(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as map:map?
{
    $model
        =>map:get("definitions")
        =>map:get( ref-type-name($model, $entity-type-name, $property-name) )
};


(:
 : Given a model, an entity type name and a reference property,
 : return a reference's type name
 :)
declare function ref-type-name(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as xs:string
{
    let $property := $model
        =>map:get("definitions")
        =>map:get($entity-type-name)
        =>map:get("properties")
        =>map:get($property-name)
    let $ref-target := head( ($property=>map:get("$ref"),
                  $property=>map:get("items")=>map:get("$ref") ) )
    return functx:substring-after-last($ref-target, "/")
};


declare %private function is-local-reference(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
)
{
    let $top-id := map:get($model,"$id")
    let $property := $model
        =>map:get("definitions")
        =>map:get($entity-type-name)
        =>map:get("properties")
        =>map:get($property-name)
    let $id-target :=
      head( ($property=>map:get("$id"),
             $property=>map:get("items")=>map:get("$id") ) )
    let $id-target :=
      if (empty($id-target) or (exists($top-id) and $top-id=$id-target)) then ()
      else $id-target
    let $ref-target := head( ($property=>map:get("$ref"),
                              $property=>map:get("items")=>map:get("$ref") ) )
    return starts-with($ref-target, "#/definitions") and empty($id-target)
};


(: returns empty-sequence if no primary key :)
declare %private function ref-primary-key-name(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as xs:string?
{
    let $ref-type-name := ref-type-name($model, $entity-type-name, $property-name)
    let $ref-target := $model=>map:get("definitions")=>map:get($ref-type-name)
    return
        if (is-local-reference($model, $entity-type-name, $property-name)) then (
          if (map:contains($ref-target, "primaryKey"))
          then map:get($ref-target, "primaryKey")
          else ()
        ) else ()
};


declare %private function model-create(
    $model-descriptor
) as map:map
{
  let $tentative-result :=
    typeswitch ($model-descriptor)
    case document-node() return
        if ($model-descriptor/object-node())
        then xdmp:from-json($model-descriptor)
        else model-from-xml($model-descriptor/node())
    case element() return
        model-from-xml($model-descriptor)
    case object-node() return
        xdmp:from-json($model-descriptor)
    case map:map return $model-descriptor
    default return fn:error((), "ES-MODEL-INVALID")
  return
    if (is-modern-model($tentative-result))
    then $tentative-result
    else modernize($tentative-result)
};


declare function model-from-xml(
    $model as element(es:model)
) as map:map
{
    let $info := json:object()
        =>map:with("title", data($model/es:info/es:title))
        =>map:with("version", data($model/es:info/es:version))
        =>with-if-exists("baseUri", data($model/es:info/es:base-uri))
        =>with-if-exists("description", data($model/es:info/es:description))
    let $definitions :=
        let $d := json:object()
        let $_ :=
            for $entity-type-node in $model/es:definitions/*
            let $entity-type := json:object()
            let $properties := json:object()
            let $_ :=
                for $property-node in $entity-type-node/es:properties/*
                let $property-attributes := json:object()
                    =>with-if-exists("datatype", data($property-node/es:datatype))
                    =>with-if-exists("$ref", data($property-node/es:ref))
                    =>with-if-exists("description", data($property-node/es:description))
                    =>with-if-exists("collation", data($property-node/es:collation))
                    =>with-if-exists("$id", data($property-node/es:id))
                    =>with-if-exists("type", data($property-node/es:type))
                    =>with-if-exists("format", data($property-node/es:format))

                let $items-map := json:object()
                    =>with-if-exists("datatype", data($property-node/es:items/es:datatype))
                    =>with-if-exists("$ref", data($property-node/es:items/es:ref))
                    =>with-if-exists("description", data($property-node/es:items/es:description))
                    =>with-if-exists("collation", data($property-node/es:items/es:collation))
                    =>with-if-exists("$id", data($property-node/es:items/es:id))
                    =>with-if-exists("type", data($property-node/es:items/es:type))
                    =>with-if-exists("format", data($property-node/es:items/es:format))
                let $_ := if (count(map:keys($items-map)) gt 0)
                        then map:put($property-attributes, "items", $items-map)
                        else ()
                return map:put($properties, fn:local-name($property-node), $property-attributes)
            let $_ :=
                $entity-type
                  =>map:with("properties", $properties)
                  =>with-if-exists("primaryKey", data($entity-type-node/es:primary-key))
                  =>with-if-exists("required", json:to-array($entity-type-node/es:required/xs:string(.)))
                  =>with-if-exists("pii", json:to-array($entity-type-node/es:pii/xs:string(.)))
                  =>with-if-exists("namespace", $entity-type-node/es:namespace/xs:string(.))
                  =>with-if-exists("namespacePrefix", $entity-type-node/es:namespace-prefix/xs:string(.))
                  =>with-if-exists("rangeIndex", json:to-array($entity-type-node/es:range-index/xs:string(.)))
                  =>with-if-exists("pathRangeIndex", json:to-array($entity-type-node/es:path-range-index/xs:string(.)))
                  =>with-if-exists("elementRangeIndex", json:to-array($entity-type-node/es:element-range-index/xs:string(.)))
                  =>with-if-exists("wordLexicon", json:to-array($entity-type-node/es:word-lexicon/xs:string(.)))
                  =>with-if-exists("description", data($entity-type-node/es:description))
                  =>with-if-exists("$id", data($entity-type-node/es:id))
            return map:put($d, fn:local-name($entity-type-node), $entity-type)
        return $d

    let $properties :=
      let $top-entity := json:object()
      let $property-node := ($model/es:properties/*)[1] (: There can be only 1 :)
      return (
        (: {entity: { "$ref": "whatever" } } :)
        if (empty($property-node)) then () else (
          let $ref :=
            json:object()=>with-if-exists("$ref", data($property-node/es:ref))
          return json:object()=>map:with( fn:local-name($property-node), $ref )
        )
      )
    return json:object()
        =>map:with("lang","zxx")
        =>map:with("info", $info)
        =>map:with("definitions", $definitions)
        =>with-if-exists("$schema", data($model/es:schema))
        =>with-if-exists("$id", data($model/es:id))
        =>with-if-exists("required", json:to-array($model/es:required))
        =>with-if-exists("properties", $properties)
};



declare function
modernize($model as map:map) as map:map
{
  let $new-model := fix-references($model)
  let $top-entity := top-entity($new-model, true())
  return model-to-json-schema($new-model, $top-entity)
};

declare function
fix-references($model as map:map) as map:map
{
  let $_ :=
    let $top-id := map:get($model,"$id")
    for $entity-type in $model=>map:get("definitions")=>map:keys()
    let $entity := $model=>map:get("definitions")=>map:get($entity-type)
    return walk-to-fix-references($top-id, $entity)
  return $model
};

declare %private function with-if-exists(
    $map as map:map,
    $key-name as xs:string,
    $value as item()?
) as map:map
{
    typeswitch($value)
    case json:array return
        if (json:array-size($value) gt 0)
        then map:put($map, $key-name, $value)
        else ()
    default return
        if (exists($value))
        then map:put($map, $key-name, $value)
        else (),
    $map
};

(:
   Pick a top entity. If this is a modern model, we know already.
   If this is a legacy model, if there is only one entity, that's it.
   If there is only one entity that is NOT the target of a local reference,
   that must be it. Otherwise, we don't know, and we have to fall-back to
   lousy JSON Schemas, and lousy TDE template paths.
 :)
declare function
top-entity($model as map:map, $force as xs:boolean) as xs:string?
{
  let $entity-type-names := $model=>map:get("definitions")=>map:keys()
  return (
    if (is-modern-model($model)) then json:array-values($model=>map:get("required"))
    else if (count($entity-type-names)=1) then $entity-type-names
    else (
      let $local-refs := local-references($model)
      (: All the entities that are not the target of a local reference :)
      let $non-child-entities := $entity-type-names[not(. = $local-refs)]
      return (
        if (count($non-child-entities)=1) then (
          $non-child-entities
        ) else if ($force) then (
          (: No good reason for picking, but pick anyway :)
          $non-child-entities[1]
        ) else () (: No basis for picking :)
      )
    )
  )
};

declare function model-to-json-schema(
    $model as map:map,
    $entity-name as xs:string?
) as map:map
{
  if (is-modern-model($model)) then (
    $model
  ) else if (empty($entity-name)) then (
    model-to-json-schema($model)
  ) else (
    (:
       Take the model and add
       "$schema": "http://json-schema.org/draft-07/schema#" (if no $schema)
       "properties": { <$entity-name> : {"$ref": "#/definitions/<$entity-name>"} },
       "required": [<$entity-name>]

       If there is no definition with that name, error.

       If there is a info/baseUri property, add equivalent $id (if no $id)

       Fix external references.

       [53510] put primaryKey into required array if it is not there already
    :)
    let $new-model := fix-primary-keys(fix-references($model))
    return (
      if (empty($new-model=>map:get("definitions")=>map:get($entity-name))) then (
        fn:error((), "ES-ENTITY-NOTFOUND", $entity-name)
      ) else (
        if (empty($new-model=>map:get("$schema")))
        then map:put($new-model, "$schema", "http://json-schema.org/draft-07/schema#")
        else (),
        map:put($new-model,"lang","zxx"),
        map:put($new-model, "properties",
          map:map()=>map:with($entity-name,
            map:map()=>map:with("$ref", "#/definitions/"||$entity-name))),
        map:put($new-model, "required", json:to-array($entity-name)),
        let $baseUri := $new-model=>map:get("info")=>map:get("baseUri")
        where not(empty($baseUri)) and empty($new-model=>map:get("$id"))
        return map:put($new-model, "$id", $baseUri),
        $new-model
      )
    )
  )
};

declare function
fix-primary-keys($model as map:map) as map:map
{
  let $_ :=
    for $entity-type in $model=>map:get("definitions")=>map:keys()
    let $entity := $model=>map:get("definitions")=>map:get($entity-type)
    return walk-to-fix-primary-keys($entity)
  return $model
};


(:
    primary keys should be required
 :)
declare %private function
walk-to-fix-primary-keys($model as map:map) as empty-sequence()
{
  let $required := $model=>map:get("required")
  let $primaryKey := $model=>map:get("primaryKey")
  where (not(empty($primaryKey)) and
         (empty($required) or not($primaryKey = json:array-values($required)))
        )
  return (
    map:put($model, "required", json:to-array((json:array-values($required), $primaryKey)))
  )
  ,
  for $property in map:get($model, "properties")=>map:keys()
  let $propspec := map:get($model, "properties")=>map:get($property)
  return (
    walk-to-fix-primary-keys($propspec),
    if (exists($propspec=>map:get("items")))
    then walk-to-fix-primary-keys($propspec=>map:get("items"))
    else ()
  )
};


declare function model-to-json-schema(
    $model as map:map
) as map:map
{
  if (is-modern-model($model)) then (
    $model
  ) else (
    (:
       Take the model and add
       "$schema": "http://json-schema.org/draft-07/schema#" (if no $schema)
       "oneOf": [
         {"properties": { <$entity-name1> : {"$ref": "#/definitions/<$entity-name1>"} },
          "required": [<$entity-name1>]
         },
         {"properties": { <$entity-name2> : {"$ref": "#/definitions/<$entity-name2">} },
         "required": [<$entity-name2>]
         },
         ...
       ]

       If there are no definitions, error.

       If there is only one definition, just add it directly instead of the
       "oneOf"

       If there is a info/baseUri property, add equivalent $id (if no $id)
       [53510] put primaryKey into required array if it is not there already
    :)
    let $new-model := fix-primary-keys(fix-references($model))
    return (
      if (empty($new-model=>map:get("definitions")=>map:keys())) then (
        fn:error((), "ES-DEFINITIONS")
      ) else (
        if (empty($new-model=>map:get("$schema")))
        then map:put($new-model, "$schema", "http://json-schema.org/draft-07/schema#")
        else (),
        map:put($new-model,"lang","zxx"),
        let $alts :=
          for $entity-name in $new-model=>map:get("definitions")=>map:keys()
          return
            map:map()=>
              map:with("properties",
                map:map()=>map:with($entity-name,
                  map:map()=>map:with("$ref", "#/definitions/"||$entity-name)))=>
              map:with("required",
                json:to-array($entity-name))
        return (
          if (count($alts)=1) then (
            map:put($new-model, "properties", $alts=>map:get("properties")),
            map:put($new-model, "required", $alts=>map:get("required"))
          ) else (
            map:put($new-model, "oneOf", json:to-array($alts))
          )
        ),
        let $baseUri := $new-model=>map:get("info")=>map:get("baseUri")
        where not(empty($baseUri)) and empty($new-model=>map:get("$id"))
        return map:put($new-model, "$id", $baseUri),
        $new-model
      )
    )
  )
};

(:
   Old style external references are not consistent with $ref
   e.g. { "$ref": "http://example.com/base/OrderDetails" } should be
   { "$id": "http://example.com/base", "$ref": "#/definitions/OrderDetails" }
 :)
declare %private function
walk-to-fix-references($top-id as xs:string?, $model as map:map) as empty-sequence()
{
  (: Only consider $ref if it is non-absolute and doesn't already have the # :)
  let $ref := $model=>map:get("$ref")
  where (not(empty($ref)) and
         not(starts-with($ref,"#")) and
         not(contains($ref,"#")))
  return (
    let $ref-name := functx:substring-after-last($ref, "/")
    let $new-ref := "#/definitions/"||$ref-name
    let $new-id := functx:substring-before-last($ref, "/")
    return (
      map:put($model, "$ref", $new-ref),
      map:put($model, "$id", $new-id)
    )
  )
  ,
  for $property in map:get($model, "properties")=>map:keys()
  let $propspec := map:get($model, "properties")=>map:get($property)
  return (
    walk-to-fix-references($top-id, $propspec),
    if (exists($propspec=>map:get("items")))
    then walk-to-fix-references($top-id, $propspec=>map:get("items"))
    else ()
  )
};

(:
   A well-constructed modern model looks like:
  {
    $schema: ...,
    info: {
      ...
    },
    definitions: {
      E1: {...},
      E2: {...},
    },
    properties: {"E1": {"$ref":"#definitions/properties/E1"}},
    required: ["E1"]
  }

  With one required top level entity
 :)
declare function
is-modern-model($model as map:map) as xs:boolean
{
  exists($model=>map:get("$schema")) and
  exists($model=>map:get("properties")) and
  count($model=>map:get("properties")=>map:keys())=1 and
  exists($model=>map:get("properties")=>map:get(($model=>map:get("properties")=>map:keys())[1])=>map:get("$ref")) and
  exists($model=>map:get("required")) and
  count(json:array-values($model=>map:get("required")))=1
};

declare %private function
local-references($model as map:map) as xs:string*
{
  let $top-id := map:get($model,"$id")
  for $entity-type in $model=>map:get("definitions")=>map:keys()
  let $entity := $model=>map:get("definitions")=>map:get($entity-type)
  return walk-for-ref($top-id, $entity)
};


declare %private function
walk-for-ref($top-id as xs:string?, $model as map:map) as xs:string*
{
  (: Only consider $ref if there is not a $id that makes it non-local :)
  let $id := map:get($model,"$id")
  let $id :=
    if (exists($top-id)) then (
      if (exists($id) and $id!=$top-id) then $id else ()
    ) else (
      $id
    )
  let $ref := map:get($model,"$ref")
  where (exists($ref) and starts-with($ref,"#"))
  return tokenize($ref,"/")[last()]
  ,
  for $property in map:get($model, "properties") ! map:keys(.)
  let $propspec := map:get($model, "properties")=>map:get($property)
  return (
    walk-for-ref($top-id, $propspec),
    if (exists($propspec=>map:get("items")))
    then walk-for-ref($top-id, $propspec=>map:get("items"))
    else ()
  )
};
