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

module namespace service = "http://marklogic.com/rest-api/resource/mlScaffoldContent";

import module namespace consts = "http://marklogic.com/data-hub/consts"
at "/data-hub/4/impl/consts.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
at "/data-hub/4/impl/debug-lib.xqy";

import module namespace functx = "http://www.functx.com"
at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";

import module namespace hent = "http://marklogic.com/data-hub/hub-entities"
at "/data-hub/5/impl/hub-entities.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
at "/data-hub/4/impl/perflog-lib.xqy";

import module namespace esi = "http://marklogic.com/entity-services-impl"
at "/MarkLogic/entity-services/entity-services-impl.xqy";

declare namespace es = "http://marklogic.com/entity-services";

declare namespace rapi = "http://marklogic.com/rest-api";

declare option xdmp:mapping "false";

declare function service:comment-xqy($comment-text as xs:string*)
{
  "(: " || fn:string-join($comment-text, "&#10;     ") || " :)"
};

declare function service:comment-sjs($comment-text as xs:string*)
{
  "/* " || fn:string-join($comment-text, "&#10;     ") || " */"
};

declare function service:kebob-case($str as xs:string)
{
  fn:lower-case(fn:replace(fn:replace($str, "([A-Z])", "-$1"), "^-", ""))
};

declare function service:camel-case($str as xs:string)
{
  fn:string-join(
    let $tokens := fn:tokenize($str, "[-_]")
    return
      (
        $tokens[1],
        for $x in fn:subsequence($tokens, 2)
        return
          functx:capitalize-first($x)
      ),
    "")
};

declare function service:get-property($root as xs:string, $property as xs:string)
{
  if (fn:contains($property, "-")) then
    $root || "['" || $property || "']"
  else
    $root || "." || $property
};

declare function service:casting-function-name-xqy(
  $datatype as xs:string
) as xs:string
{
  if ($datatype eq "iri")
  then "sem:iri"
  else "xs:" || $datatype
};

declare function service:casting-function-name-sjs(
  $datatype as xs:string
) as xs:string
{
  if ($datatype eq "iri")
  then "sem.iri"
  else "xs." || $datatype
};

declare function service:generate-lets($model as map:map, $entity-type-name, $mapping as map:map?, $parent-entity as xs:string)
{
  fn:string-join(
    let $definitions := map:get($model, "definitions")
    let $entity-type := map:get($definitions, $entity-type-name)
    let $properties := map:get($entity-type, "properties")
    let $required-properties := (
      map:get($entity-type, "primaryKey"),
      map:get($entity-type, "required") ! json:array-values(.)
    )
    for $property-name in map:keys($properties)
    let $is-required := $property-name = $required-properties
    let $property := map:get($properties, $property-name)
    let $is-array := map:get($property, "datatype") eq "array"
    let $property := map:get($properties, $property-name)
    let $property-datatype := esi:resolve-datatype($model, $entity-type-name, $property-name)
    let $casting-function-name :=
      if (map:contains($property, "datatype") and map:get($property, "datatype") ne "array") then
        service:casting-function-name-xqy($property-datatype)
      else ()
    let $wrap-if-array := function($str) {
      if ($is-array) then
        "json:to-array(" || $str || ")"
      else
        $str
    }
    let $ref :=
      if ($is-array) then
        let $items as map:map? := map:get($property, "items")
        return
          $items ! map:get(., "$ref")
      else
        map:get($property, "$ref")
    let $path-to-property := fn:concat("$source-node/", $property-name)
    let $property-comment :=
      if (fn:empty($ref)) then ()
      else if (fn:contains($ref, "#/definitions")) then
        service:comment-xqy("The following property is a local reference.")
      else (
          service:comment-xqy((
            'The following property assigment comes from an external reference.',
            'Its generated value probably requires developer attention.'
          ))
        )
    let $ref-name := functx:substring-after-last($ref, "/")
    let $extract-reference-fn :=
      fn:string-join((
        "",
        "    plugin:make-reference-object('" || $ref-name || "', (: put your value here :) '')"
      ), "&#10;")
    let $value :=
      if (empty($ref)) then (
        if(service:mapping-present($mapping, $property-name) and $parent-entity eq $entity-type-name)
        then (fn:concat("$source",service:map-value($property-name, $mapping)))
        else ($wrap-if-array(fn:concat("$source/", $property-name))))
      else if (contains($ref, "#/definitions")) then
        let $inner-var := "$" || fn:lower-case($ref-name) || "s"
        let $inner-val :=
          if(service:mapping-present($mapping, $property-name))
          then (fn:concat("$source",service:map-value($property-name, $mapping)))
          else (fn:concat("$source/", $property-name))
        return
          fn:string-join((
            "",
            "let " || $inner-var || " :=",
            "  (: create a sequence of " || $ref-name || " instances from your data :)",
            "  for $sub-entity in ("||$inner-val||")",
            "  return",
            "    plugin:extract-instance-" || $ref-name || "($sub-entity)",
            "return",
            if ($is-required) then
              "  json:to-array(" || $inner-var || ")"
            else (
              "  if (fn:exists(" || $inner-var || ")) then",
              "    json:to-array(" || $inner-var || ")",
              "  else ()"
            )
          ), "&#10;    ") || "&#10;"
      else if(fn:not(empty($ref))) then
           fn:concat("$source/", $property-name)
      else $wrap-if-array($extract-reference-fn)

    return (
      $property-comment ! ("", .),

      let $name := service:kebob-case($property-name)
      let $valueWrap := fn:concat(fn:string-join(
        if ($casting-function-name) then
          $casting-function-name else ())
        , fn:concat(
          "(", $value,")"))
      return
        "let $" || $name || " := " || $valueWrap
    )
    , "&#10;  ")
(: end code generation block :)
};

declare function service:generate-xqy($entity as xs:string, $flow-type as xs:string, $model as map:map, $mapping as map:map?)
{
  let $root-name :=
    if ($flow-type eq $consts:INPUT_FLOW) then "$raw-content"
    else "$doc"
  return
    document {
<module>xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

import module namespace es = "http://marklogic.com/entity-services"
at "/MarkLogic/entity-services/entity-services.xqy";

declare option xdmp:mapping "false";

(:~
: Create Content Plugin
:
: @param $id          - the identifier returned by the collector
: @param $options     - a map containing options. Options are sent from Java
:
: @return - your transformed content
:)
declare function plugin:create-content(
  $id as xs:string,
  {
    if ($flow-type eq $consts:INPUT_FLOW) then
      "$raw-content as node()?,&#10;  "
    else ()
  }$options as map:map) as map:map
{{
  {
    if ($flow-type eq $consts:HARMONIZE_FLOW) then
      "let $doc := fn:doc($id)&#10;  "
    else ()
  }let $source := {$root-name}
  return
  {
    "plugin:extract-instance-" || $entity || "($source)"
  }
}};
  {
for $entity-type-name in map:keys(map:get($model, "definitions"))
return
<extract-instance>
(:~
: Creates a map:map instance from some source document.
: @param $source-node  A document or node that contains
:   data for populating a {$entity-type-name}
: @return A map:map instance with extracted data and
:   metadata about the instance.
:)
declare function plugin:extract-instance-{$entity-type-name}(
$source as node()?
) as map:map
{{
{
  if ($entity-type-name eq $entity) then
  <txt>
  (: the original source documents :)
  let $attachments := $source
  let $source      :=
    if ($source/*:envelope and $source/node() instance of element()) then
      $source/*:envelope/*:instance/node()
    else if ($source/*:envelope) then
      $source/*:envelope/*:instance
    else if ($source/instance) then
      $source/instance
    else
      $source
  </txt>/text()
  else (<txt>
  let $source :=
    if($source/node() instance of element()) then
    $source/node()
  else (
    $source
  )
  </txt>/text()
  )
}
{
  if ($entity eq $entity-type-name and fn:empty($mapping) eq fn:false() and fn:empty(map:get($mapping, "name")) eq fn:false()) then
  <txt>(: These mappings were generated using mapping: {map:get($mapping, "name")}, version: {map:get($mapping, "version")} on {fn:current-dateTime()}. :)
  </txt>/text()
  else ()
}
{
service:generate-lets($model, $entity-type-name, $mapping, $entity)
}

  (: return the in-memory instance :)
  (: using the XQuery 3.0 syntax... :)
  let $model := json:object()
  let $_ := (
  {
    if ($entity-type-name eq $entity) then
      "  map:put($model, '$attachments', $attachments),"
    else ()
  }
    map:put($model, '$type', '{ $entity-type-name }'),
    map:put($model, '$version', '{ map:get(map:get($model, "info"), "version") }'){
  let $definitions := map:get($model, "definitions")
  let $entity-type := map:get($definitions, $entity-type-name)
  let $properties := map:get($entity-type, "properties")
  let $property-keys := map:keys($properties)
  where fn:count($property-keys) > 0
  return
    ",&#10;" ||
    fn:string-join(
      (: Begin code generation block :)
      let $required-properties := (
        map:get($entity-type, "primaryKey"),
        map:get($entity-type, "required") ! json:array-values(.)
      )
      for $property-name in $property-keys
      let $is-required := $property-name = $required-properties
      return
        "    map:put($model, '" || $property-name || "', $" || service:kebob-case($property-name) || ")"
      , ",&#10;")
  (: end code generation block :)
  }
  )

  (: if you prefer the xquery 3.1 version with the => operator....
  https://www.w3.org/TR/xquery-31/#id-arrow-operator
  let $model :=
  json:object()
  {
  if ($entity-type-name eq $entity) then
    "  =>map:with('$attachments', $attachments)"
  else ()
  }
    =>map:with('$type', '{ $entity-type-name }')
    =>map:with('$version', '{ map:get(map:get($model, "info"), "version") }')
  {
  fn:string-join(
    (: Begin code generation block :)
    let $definitions := map:get($model, "definitions")
    let $entity-type := map:get($definitions, $entity-type-name)
    let $properties := map:get($entity-type, "properties")
    let $required-properties := (
      map:get($entity-type, "primaryKey"),
    if (fn:empty(map:get($entity-type, "required"))) then
      ()
    else
      json:array-values(map:get($entity-type, "required"))
    )
    for $property-name in map:keys($properties)
    let $is-required := $property-name = $required-properties
    return
      if ($is-required) then
        "  =>map:with('" || $property-name || "', $" || service:kebob-case($property-name) || ")"
      else
        "    =>es:optional('" || $property-name || "', $" || service:kebob-case($property-name) || ")"
    , "&#10;")
  (: end code generation block :)
  }
  :)
  return $model
}};
</extract-instance>/text()
  }
declare function plugin:make-reference-object(
$type as xs:string,
$ref as xs:string)
{{
  let $o := json:object()
  let $_ := (
    map:put($o, '$type', $type),
    map:put($o, '$ref', $ref)
  )
  return
  $o
}};</module>/text()
}
};


declare function service:generate-vars($model as map:map, $entity-type-name, $mapping as map:map?, $parent-entity as xs:string)
{
  fn:string-join(
    let $definitions := map:get($model, "definitions")
    let $entity-type := map:get($definitions, $entity-type-name)
    let $properties := map:get($entity-type, "properties")
    let $required-properties := (
      map:get($entity-type, "primaryKey"),
      map:get($entity-type, "required") ! json:array-values(.)
    )
    for $property-name in map:keys($properties)
    let $is-required := $property-name = $required-properties

    let $property := map:get($properties, $property-name)
    let $is-array := map:get($property, "datatype") eq "array"
    let $property-datatype := esi:resolve-datatype($model, $entity-type-name, $property-name)
    let $casting-function-name := service:casting-function-name-sjs($property-datatype)
    let $wrap-if-array := function($str) {
      if ($is-array) then
        "json:to-array(" || $str || ")"
      else
        $str
    }
    let $ref :=
      if ($is-array) then
        let $items as map:map? := map:get($property, "items")
        return
          $items ! map:get(., "$ref")
      else
        map:get($property, "$ref")
    let $path-to-property :=
      if (service:mapping-present($mapping, $property-name) and $parent-entity eq $entity-type-name)
      then (fn:concat("fn.head(source.xpath('",service:map-value($property-name, $mapping), "'))"))
      else (fn:concat("fn.head(source.xpath('/", $property-name, "'))"))
    let $property-comment :=
      if (fn:empty($ref)) then ()
      else if (fn:contains($ref, "#/definitions")) then
        service:comment-sjs("The following property is a local reference.")
      else (
          service:comment-sjs((
            'The following property assigment comes from an external reference.',
            'Its generated value probably requires developer attention.'
          ))
        )
    let $ref-name := functx:substring-after-last($ref, "/")
    (:    let $extract-reference-fn :=
      fn:string-join((
        " {",
        "    '$type': '" || $ref-name || "',",
        "    '$ref': " || service:get-property($path-to-property, $ref-name),
        "  }"
      ), "&#10;"):)
    let $value :=
      if (empty($ref)) then
        "!fn.empty(" || $path-to-property || ") ? " || (
        if($is-array) then
          $path-to-property || " : []"
        else
        $casting-function-name || "("
        || "fn.head(" ||
        $path-to-property ||
        (
          if ($property-datatype eq "iri") then
            ".toString()"
          else
            ()
        ) ||
        ")) : null"
        )
      else if (contains($ref, "#/definitions")) then
        if ($is-array) then
          fn:string-join((
            "[];",
            "if(" || $path-to-property || ") {",
            "  for(const item of Sequence.from(source.xpath('/"|| $property-name || "'))) {",
            "    // let's create and pass the node",
            "    let itemSource = new NodeBuilder();",
            "    itemSource.addNode(fn.head(item));",
            "    // this will return an instance of a " || $ref-name,
            "    " || service:camel-case($property-name) || ".push(" || service:camel-case("extractInstance-" || $ref-name) || "(itemSource.toNode()));",
            "    // or uncomment this to create an external reference to a " || $ref-name,
            "    //" || service:camel-case($property-name) || ".push(makeReferenceObject('" || $ref-name || "', itemSource.toNode()));",
            "  }",
            "}"
          ), "&#10;  ")
        else
          fn:string-join((
            "null;",
            "if(" || $path-to-property || ") {",
            "  // let's create and pass the node",
            "  let " ||$property-name||"Source = new NodeBuilder();",
            "  " ||$property-name||"Source.addNode(fn.head(source.xpath('/"|| $property-name || "'))).toNode();",
            "  // either return an instance of a " || $ref-name,
            "  " || service:camel-case($property-name) || " = " || service:camel-case("extractInstance-" || $ref-name) || "("||$property-name||"Source);",
            "",
            "  // or a reference to a " || $ref-name,
            "  // " || service:camel-case($property-name) || " = makeReferenceObject('" || $ref-name || "', "||$property-name||"Source));",
            "}"
          ), "&#10;  ")
      else
        if ($is-array) then
          fn:string-join((
            " null;",
            "  if (" || service:get-property($path-to-property, $ref-name) || ") {",
            "    " || service:camel-case($property-name) || " = " || service:get-property($path-to-property, $ref-name) || ".map(function(item) {",
            "      return makeReferenceObject('" || $ref-name || "', fn.head(source.xpath('/"|| $property-name || "')));",
            "    });",
            "  }"
          ), "&#10;")
        else
          " makeReferenceObject('" || $ref-name || "', " || service:get-property($path-to-property, $ref-name) || ")"
    (:          fn:string-join((
            " {",
            "    '$type': '" || $ref-name || "',",
            "    '$ref': " || service:get-property($path-to-property, $ref-name),
            "  }"
          ), "&#10;"):)

    return (
      $property-comment ! ("", .),
      "let " || service:camel-case($property-name) || " = " || $value || ";"
    )
    , "&#10;  ")
(: end code generation block :)
};

declare function service:generate-sjs($entity as xs:string, $flow-type as xs:string, $model as map:map, $mapping as map:map?)
{
  let $root-name :=
    if ($flow-type eq $consts:INPUT_FLOW) then "rawContent"
    else "doc"
  return
    document {<module>'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, {
  if ($flow-type eq $consts:INPUT_FLOW) then
    "rawContent, "
  else ()
}options) {{
  {
    if ($flow-type eq $consts:HARMONIZE_FLOW) then
      "let doc = cts.doc(id);"
    else ()
  }

  let source;

  // for xml we need to use xpath
  if({$root-name} &amp;&amp; xdmp.nodeKind({$root-name}) === 'element' &amp;&amp; {$root-name} instanceof XMLDocument) {{
    source = {$root-name}
  }}
  // for json we need to return the instance
  else if({$root-name} &amp;&amp; {$root-name} instanceof Document) {{
    source = fn.head({$root-name}.root);
  }}
  // for everything else
  else {{
    source = {if ($flow-type eq $consts:INPUT_FLOW) then $root-name else "doc"};
  }}

  return {service:camel-case("extractInstance-" || $entity) || "(source)"};
}}
  {
for $entity-type-name in map:keys(map:get($model, "definitions"))
return <extract-instance>
/**
* Creates an object instance from some source document.
* @param source  A document or node that contains
*   data for populating a {$entity-type-name}
* @return An object with extracted data and
*   metadata about the instance.
*/
function {service:camel-case("extractInstance-" || $entity-type-name)}(source) {{
  {
    if (($entity eq $entity-type-name) and ($flow-type eq $consts:HARMONIZE_FLOW)) then
  "// the original source documents
  let attachments = source;
  // now check to see if we have XML or json, then create a node clone from the root of the instance
  if (source instanceof Element || source instanceof ObjectNode) {
    let instancePath = '/*:envelope/*:instance';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath += '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }
  "
    else (
  "let attachments = source;
  // now check to see if we have XML or json, then create a node clone to operate of off
  if (source instanceof Element || source instanceof ObjectNode) {
    let instancePath = '/';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath = '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }
  "
    )
  }
  {
    if ($entity eq $entity-type-name and fn:empty($mapping) eq fn:false() and fn:empty(map:get($mapping, "name")) eq fn:false()) then
      <txt>/* These mappings were generated using mapping: {map:get($mapping, "name")}, version: {map:get($mapping, "version")} on {fn:current-dateTime()}.*/&#10;  </txt>/text()
    else ()
  }
  {
    service:generate-vars($model, $entity-type-name, $mapping, $entity)
  }

  // return the instance object
  return {{
  {
    if ($entity eq $entity-type-name) then
      "  '$attachments': attachments,"
    else ()
  }
    '$type': '{ $entity-type-name }',
    '$version': '{ map:get(map:get($model, "info"), "version") }'{
  let $definitions := map:get($model, "definitions")
  let $entity-type := map:get($definitions, $entity-type-name)
  let $properties := map:get($entity-type, "properties")
  let $properties-keys := map:keys($properties)
  where fn:count($properties-keys) > 0
  return
    ",&#10;    " ||
    fn:string-join(
      (: Begin code generation block :)
      for $property-name in $properties-keys
      return
        "'" || $property-name || "': " ||  service:camel-case($property-name)
      , ",&#10;    ")
  (: end code generation block :)
  }
  }}
}};
</extract-instance>/text()
}

function makeReferenceObject(type, ref) {{
  return {{
    '$type': type,
    '$ref': ref
  }};
}}

module.exports = {{
  createContent: createContent
}};

</module>/text()
    }
};

declare function service:map-value($key as xs:string, $mapping as map:map?) {
  let $properties := map:get($mapping, "properties")
  let $property := map:get($properties, $key)
  let $source := fn:replace(map:get($mapping, "sourceContext"), "'", '"')
  return fn:concat($source, map:get($property, "sourcedFrom"))
};

declare function service:get-mapping($mapping-name) {
  let $mapping-base-name := functx:substring-before-last($mapping-name, "-")
  let $mapping-uri := fn:concat("/mappings/", $mapping-base-name, "/", $mapping-name, ".mapping.json")
  let $mapping-doc := fn:doc($mapping-uri)
  return
    if(fn:exists($mapping-doc)) then (map:new(xdmp:from-json($mapping-doc)))
    else ()
};

declare function service:mapping-present($mapping as map:map?, $property-name as xs:string?) {
  (fn:empty($mapping) eq fn:false() and fn:empty(map:get(map:get($mapping, "properties"), $property-name)) eq fn:false())
};

declare function service:get(
  $context as map:map,
  $params  as map:map
) as document-node()*
{
  debug:dump-env(),

  perf:log('/v1/resources/validate:get', function() {
    let $entity as xs:string := map:get($params, "entity")
    let $code-format as xs:string := map:get($params, "codeFormat")
    let $flow-type as xs:string := map:get($params, "flowType")
    let $mapping-name as xs:string? := map:get($params, "mapping")
    let $mapping as map:map? := if(fn:empty($mapping-name) eq fn:false()) then (service:get-mapping($mapping-name)) else ()
    let $model as map:map? := hent:get-model($entity)
    return
      if (fn:exists($model)) then
        if((fn:empty($mapping) eq fn:false() and fn:empty($mapping-name) eq fn:false()) or (fn:empty($mapping-name) eq fn:true())) then
          if ($code-format eq "xqy") then
            service:generate-xqy($entity, $flow-type, $model, $mapping)
          else
            service:generate-sjs($entity, $flow-type, $model, $mapping)
        else
          fn:error((),"RESTAPI-SRVEXERR", (404, "Not Found", "The requested mapping: " || $mapping-name || " was not found"))
      else
        fn:error((),"RESTAPI-SRVEXERR", (404, "Not Found", "The requested entity: " || $entity || " was not found"))
  })
};
