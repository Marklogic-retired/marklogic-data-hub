(:
  Copyright 2012-2016 MarkLogic Corporation

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

module namespace service = "http://marklogic.com/rest-api/resource/scaffold-content";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/com.marklogic.hub/lib/consts.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

import module namespace functx = "http://www.functx.com"
  at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";

import module namespace hent = "http://marklogic.com/data-hub/hub-entities"
  at "/com.marklogic.hub/lib/hub-entities.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

import module namespace es-wrapper = "http://marklogic.com/data-hub/es-wrapper"
  at "/com.marklogic.hub/lib/entity-services-wrapper.xqy";

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

declare function service:generate-lets($model as map:map, $entity-type-name)
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
    let $property-datatype := es-wrapper:resolve-datatype($model, $entity-type-name, $property-name)
    let $casting-function-name :=
      if (map:contains($property, "datatype") and map:get($property, "datatype") ne "array") then
        service:casting-function-name-xqy($property-datatype)
      else ()
    let $wrap-if-array := function($str) {
      if ($is-array) then
        "json:to-array(" || $str || "&#10;  )"
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
      if (empty($ref)) then "()"
      else if (contains($ref, "#/definitions")) then
        let $inner-var := "$" || fn:lower-case($ref-name) || "s"
        return
          fn:string-join((
            "",
            "let " || $inner-var || " :=",
            "  (: create a sequence of " || $ref-name || " instances from your data :)",
            "  for $sub-entity in ()",
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
      else
        $wrap-if-array($extract-reference-fn)

    return (
      $property-comment ! ("", .),

      let $name := fn:string-join((
        service:kebob-case($property-name),
        if ($casting-function-name) then
          "as " || $casting-function-name || (if ($is-required) then "" else "?")
        else ()
      ), " ")
      return
        "let $" || $name || " := " || $value
    )
  , "&#10;  ")
(: end code generation block :)
};

declare function service:generate-xqy($entity as xs:string, $flow-type as xs:string, $model as map:map)
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
  }let $source :=
    if ({$root-name}/es:envelope) then
      {$root-name}/es:envelope/es:instance/node()
    else if ({$root-name}/instance) then
      {$root-name}/instance
    else
      {$root-name}
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
      <txt>(: the original source documents :)
  let $attachments := $source

  </txt>/text()
    else ()
  }

  {
    service:generate-lets($model, $entity-type-name)
  }

  (: return the in-memory instance :)
  (: using the XQuery 3.0 syntax... :)
  let $model := json:object()
  let $_ := (
    {
      if ($entity-type-name eq $entity) then
        "map:put($model, '$attachments', $attachments),&#10;    "
      else ()
    }map:put($model, '$type', '{ $entity-type-name }'),
    map:put($model, '$version', '{ map:get(map:get($model, "info"), "version") }'){
      let $definitions := map:get($model, "definitions")
      let $entity-type := map:get($definitions, $entity-type-name)
      let $properties := map:get($entity-type, "properties")
      let $property-keys := map:keys($properties)
      where fn:count($property-keys) > 0
      return
        ",&#10;    " ||
        fn:string-join(
          (: Begin code generation block :)
          let $required-properties := (
            map:get($entity-type, "primaryKey"),
            map:get($entity-type, "required") ! json:array-values(.)
          )
          for $property-name in $property-keys
          let $is-required := $property-name = $required-properties
          return
            if ($is-required) then
              "map:put($model, '" || $property-name || "', $" || service:kebob-case($property-name) || ")"
            else
              "es:optional($model, '" || $property-name || "', $" || service:kebob-case($property-name) || ")"
        , ",&#10;    ")
        (: end code generation block :)
    }
  )

  (: if you prefer the xquery 3.1 version with the => operator....
   : https://www.w3.org/TR/xquery-31/#id-arrow-operator
  let $model :=
    json:object()
  {
    if ($entity-type-name eq $entity) then
      "    =>map:with('$attachments', $attachments)&#10;  "
    else ()
  }    =>map:with('$type', '{ $entity-type-name }')
      =>map:with('$version', '{ map:get(map:get($model, "info"), "version") }')
    {
    fn:string-join(
      (: Begin code generation block :)
      let $definitions := map:get($model, "definitions")
      let $entity-type := map:get($definitions, $entity-type-name)
      let $properties := map:get($entity-type, "properties")
      let $required-properties := (
        map:get($entity-type, "primaryKey"),
        json:array-values(map:get($entity-type, "required"))
      )
      for $property-name in map:keys($properties)
      let $is-required := $property-name = $required-properties
      return
        if ($is-required) then
          "  =>map:with('" || $property-name || "', $" || service:kebob-case($property-name) || ")"
        else
          "  =>es:optional('" || $property-name || "', $" || service:kebob-case($property-name) || ")"
    , "&#10;    ")
    (: end code generation block :)
    }
  :)
  return
    $model
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


declare function service:generate-vars($model as map:map, $entity-type-name)
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
    let $property-datatype := es-wrapper:resolve-datatype($model, $entity-type-name, $property-name)
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
    let $path-to-property := service:get-property("source", $property-name)
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
        $casting-function-name || "(" ||
        $path-to-property ||
        (
          if ($property-datatype eq "iri") then
            ".toString()"
          else
            ()
        ) ||
        ")"
      else if (contains($ref, "#/definitions")) then
        if ($is-array) then
          fn:string-join((
            "[];",
            "if (" || $path-to-property || ") {",
            "  // either return an instance of a " || $ref-name,
            "  " || service:camel-case($property-name) || ".push(" || service:camel-case("extractInstance-" || $ref-name) || "(item." || $ref-name || "));",
            "",
            "  // or a reference to a " || $ref-name,
            "  // " || service:camel-case($property-name) || ".push(makeReferenceObject('" || $ref-name || "', item));",
            "}"
          ), "&#10;  ")
        else
          fn:string-join((
            "null;",
            "if (" || $path-to-property || ") {",
            "  // either return an instance of a " || $ref-name,
            "  " || service:camel-case($property-name) || " = " || service:camel-case("extractInstance-" || $ref-name) || "(item." || $ref-name || ");",
            "",
            "  // or a reference to a " || $ref-name,
            "  // " || service:camel-case($property-name) || " = makeReferenceObject('" || $ref-name || "', item);",
            "}"
          ), "&#10;  ")
      else
        if ($is-array) then
          fn:string-join((
            " null;",
            "  if (" || service:get-property($path-to-property, $ref-name) || ") {",
            "    " || service:camel-case($property-name) || " = " || service:get-property($path-to-property, $ref-name) || ".map(function(item) {",
            "      return makeReferenceObject('" || $ref-name || "', item);",
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

declare function service:generate-sjs($entity as xs:string, $flow-type as xs:string, $model as map:map)
{
  let $root-name :=
    if ($flow-type eq $consts:INPUT_FLOW) then "rawContent"
    else "root"
  return
document {
<module>
'use strict'

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
      "let doc = cts.doc(id);
  let " || $root-name || " = doc.root.toObject();"
    else ()
  }

  let source;

  // for xml we need to use xpath
  if ({$root-name} &amp;&amp; xdmp.nodeKind({$root-name}) === 'element') {{
    source = {$root-name}.xpath('/*:envelope/*:instance/node()');
  }}
  // for json we need to return the instance
  else if ({$root-name} &amp;&amp; {$root-name}.envelope &amp;&amp; {$root-name}.envelope.instance) {{
    source = {$root-name}.envelope.instance;
  }}
  // for everything else
  else {{
    source = {if ($flow-type eq $consts:INPUT_FLOW) then $root-name else "doc"};
  }}

  return {service:camel-case("extractInstance-" || $entity) || "(source)"};
}}
{
  for $entity-type-name in map:keys(map:get($model, "definitions"))
  return
  <extract-instance>
/**
 * Creates an object instance from some source document.
 * @param source  A document or node that contains
 *   data for populating a {$entity-type-name}
 * @return An object with extracted data and
 *   metadata about the instance.
 */
function {service:camel-case("extractInstance-" || $entity-type-name)}(source) {{
  // the original source documents
  let attachments = source;

  {
    service:generate-vars($model, $entity-type-name)
  }

  // return the instance object
  return {{
    {
      if ($entity eq $entity-type-name) then
        "'$attachments': attachments,&#10;    "
      else
        ()
    }'$type': '{ $entity-type-name }',
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
            "'" || $property-name || "': " || $property-name
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

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  debug:dump-env(),

  perf:log('/v1/resources/validate:get', function() {
    let $entity as xs:string := map:get($params, "entity")
    let $code-format as xs:string := map:get($params, "codeFormat")
    let $flow-type as xs:string := map:get($params, "flowType")
    let $model as map:map? := hent:get-model($entity)
    return
      if (fn:exists($model)) then
        if ($code-format eq "xqy") then
          service:generate-xqy($entity, $flow-type, $model)
        else
          service:generate-sjs($entity, $flow-type, $model)
      else
        fn:error((),"RESTAPI-SRVEXERR", (404, "Not Found", "The requested entity: " || $entity || " was not found"))
  })
};
