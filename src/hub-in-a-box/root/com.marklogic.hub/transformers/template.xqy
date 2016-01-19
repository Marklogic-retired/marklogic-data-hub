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

module namespace template = "http://marklogic.com/hub-in-a-box/transformers/template";

import module namespace flow = "http://marklogic.com/hub-in-a-box/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

import module namespace ex = "http://marklogic.com/hub-in-a-box/extractor-lib"
  at "/com.marklogic.hub/lib/extractor-lib.xqy";

declare namespace hub = "http://marklogic.com/hub-in-a-box";

declare option xdmp:mapping "false";

declare function template:walk-template($template as node()*, $raw, $namespaces)
{
  for $t in $template
  return
    typeswitch($t)
      case document-node() return
        if ($t/object-node()) then
          template:walk-template($t/object-node(), $raw, $namespaces)
        else
          template:walk-template($t/node(), $raw, $namespaces)
      case element(hub:original-document) return
        if ($raw/object-node()) then
          xdmp:quote($raw)
        else
          $raw
      case element(hub:extractor) return
        ex:run-extractor($t, $raw, $namespaces)
      case element() return
        element { fn:node-name($t) }
        {
          template:walk-template(($t/@*, $t/node()), $raw, $namespaces)
        }
      case object-node() return
        if (fn:count($t/*) = 1 and $t/*/fn:string(fn:node-name(.)) = ("hub:extractor")) then
          let $e := $t/*
          return
            switch (fn:string(fn:node-name($e)))
              case "hub:extractor" return
                ex:run-extractor($e, $raw, $namespaces)
              default return
                ""
        else
          let $o := json:object()
          let $_ :=
            for $c in $t/*
            let $key := fn:string(fn:node-name($c))
            let $value :=
              if (fn:not($c instance of object-node()) and $c = "hub:original-document") then
                if ($raw/* instance of element()) then
                  xdmp:quote($raw)
                else
                  $raw
              else
                template:walk-template($c, $raw, $namespaces)
            return
              map:put($o, $key, $value)
          return
            xdmp:to-json($o)
      default return
        $t
};

(:
  $content  Data about the original input document. The map contains the following keys:
    uri - The URI of the document being inserted into the database.
    value - The contents of the input document, as a document node, binary node, or text node.

  $context  Additional context information about the insertion, such as tranformation-specific parameter values. The map contains the following keys:
    transform_param - The value passed by the client through the -transorm_param option, if any. Your function is responsible for parsing and validation.

  Your function should produce a map:map for each document to insert. The map:map for each output
  document must use the same keys as the $content map. You can modify the URI and document
  contents (the values associated with uri and value).
:)
declare function template:transform(
  $content as map:map,
  $context as map:map)
as map:map*
{
  let $template-uri :=
    hul:resolve-template(map:get($context, "options")/template/name)
  let $template :=
    template:walk-template(
      hul:get-module($template-uri),
      map:get($content, "value"),
      map:get($context, "namespaces"))
  let $_ := map:put($content, "value", $template)
  return
    $content
};
