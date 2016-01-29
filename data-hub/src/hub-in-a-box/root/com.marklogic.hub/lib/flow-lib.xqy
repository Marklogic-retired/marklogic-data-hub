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

module namespace flow = "http://marklogic.com/hub-in-a-box/flow-lib";

import module namespace debug = "http://marklogic.com/hub-in-a-box/debug-lib"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

declare namespace hub = "http://marklogic.com/hub-in-a-box";

declare option xdmp:mapping "false";

declare variable $DEFAULT-WRITER :=
  element hub:writer {
    attribute type { "xquery" },
    attribute module { "/com.marklogic.hub/writers/default.xqy" }
  };

declare variable $DEFAULT-CONTENT-PLUGIN :=
  element hub:plugin {
    attribute dest { "content" },
    attribute type { "xquery" },
    attribute module { "/com.marklogic.hub/plugins/raw.xqy" }
  };

declare variable $NO-OP-PLUGIN :=
  element hub:plugin {
    attribute type { "null" }
  };

declare variable $FLOWS-DIR := "/ext/flows/";

declare variable $PLUGIN-NS := "http://marklogic.com/hub-in-a-box/plugins/";

declare function flow:get-type($filename) as xs:string?
{
  let $ext as xs:string := hul:get-file-extension($filename)
  return
    if ($ext = hul:get-xqy-extensions()) then
      "xquery"
    else if ($ext = hul:get-sjs-extensions()) then
      "sjs"
    else if ($ext = hul:get-xslt-extensions()) then
      "xslt"
    else if ($ext = "xml") then
      "xml"
    else if ($ext = "json") then
      "json"
    else
      fn:error(xs:QName("INVALID_PLUGIN"), $filename)
};

declare function flow:get-collector(
  $flow-name as xs:string,
  $uris as xs:string*) as element(hub:collector)
{
  let $uri := $uris[1]
  let $filename as xs:string := hul:get-file-from-uri($uri)
  let $type := flow:get-type($filename)
  return
    element hub:collector {
      attribute type { $type },
      attribute module { $uri }
    }
};

declare function flow:get-plugin(
  $flow-name as xs:string,
  $uris as xs:string*,
  $destination as xs:string) as element(hub:plugin)*
{
  for $uri in $uris
  let $filename as xs:string := hul:get-file-from-uri($uri)
  let $type := flow:get-type($filename)
  return
    element hub:plugin {
      attribute dest { $destination },
      attribute type { $type },
      attribute module { $uri }
    }
};

declare function flow:get-content(
  $flow-name as xs:string,
  $uris as xs:string*)
{
  let $plugin := flow:get-plugin($flow-name, $uris, "content")
  return
    if ($plugin) then $plugin
    else
      $DEFAULT-CONTENT-PLUGIN
};

declare function flow:get-headers(
  $flow-name as xs:string,
  $uris as xs:string*)
{
  let $plugin := flow:get-plugin($flow-name, $uris, "headers")
  return
    if ($plugin) then $plugin
    else
      $NO-OP-PLUGIN
};

declare function flow:get-triples(
  $flow-name as xs:string,
  $uris as xs:string*)
{
  let $plugin := flow:get-plugin($flow-name, $uris, "triples")
  return
    if ($plugin) then $plugin
    else
      $NO-OP-PLUGIN
};

declare function flow:get-writer(
  $flow-name as xs:string,
  $uris as xs:string*)
{
  if ($uris) then
    for $uri in $uris
    let $filename as xs:string := hul:get-file-from-uri($uri)
    let $type := flow:get-type($filename)
    let $_ :=
      if (debug:on()) then
        debug:log((
          "$flow-name: " || $flow-name,
          "$uri: " || $uri,
          "$filename: " || $filename,
          "$type: " || $type
        ))
      else ()
    return
      element hub:writer {
        attribute type { $type },
        attribute module { $uri }
      }
  else
    $DEFAULT-WRITER
};

declare function flow:get-flow(
  $flow-name as xs:string)
{
  let $uris :=
    hul:run-in-modules(function() {
      cts:uri-match($FLOWS-DIR || $flow-name || "/*")
    })
  return
    flow:get-flow($flow-name, $uris)
};

declare function flow:get-flow(
  $flow-name as xs:string,
  $uris as xs:string*)
{
  let $map := map:map()
  let $_ :=
    for $dir in $uris
    let $dir-name := fn:replace($dir, $FLOWS-DIR || $flow-name || "/([^/]+)/$", "$1")
    let $child-uris := $uris[fn:matches(., $FLOWS-DIR || $flow-name || "/" || $dir-name || "/([^/]+)$")]
    return
      switch ($dir-name)
        case "collector" return
          map:put($map, "collector", flow:get-collector($flow-name, $child-uris))
        case "content" return
          map:put($map, "content", flow:get-content($flow-name, $child-uris))
        case "headers" return
          map:put($map, "headers", flow:get-headers($flow-name, $child-uris))
        case "triples" return
          map:put($map, "triples", flow:get-triples($flow-name, $child-uris))
        case "writer" return
          map:put($map, "writer", flow:get-writer($flow-name, $child-uris))
        default return
          ()
  return
    <flow xmlns="http://marklogic.com/hub-in-a-box">
      <name>{$flow-name}</name>
      <type>simple</type>
      {map:get($map, "collector")}
      <plugins>
      {
        (map:get($map, "content"), $DEFAULT-CONTENT-PLUGIN)[1],
        (map:get($map, "headers"), $NO-OP-PLUGIN)[1],
        (map:get($map, "triples"), $NO-OP-PLUGIN)[1]
      }
      </plugins>
      {
        (map:get($map, "writer"), $DEFAULT-WRITER)[1]
      }
    </flow>
};

declare function flow:get-flows() as element(hub:flows)
{
  let $uris := hul:run-in-modules(function() {
    cts:uri-match($FLOWS-DIR || "*")
  })
  let $flows :=
    for $flow in $uris[fn:matches(., $FLOWS-DIR || "[^/]+/$")]
    let $name := fn:replace($flow, $FLOWS-DIR || "([^/]+)/$", "$1")
    return
      flow:get-flow($name, $uris[fn:matches(., $FLOWS-DIR || $name || "/.+")])
  return
    <flows xmlns="http://marklogic.com/hub-in-a-box">
    {
      $flows
    }
    </flows>
};

declare function flow:run-collector(
  $module-uri as xs:string,
  $options as map:map)
{
  let $module-name := hul:get-module-name($module-uri)
  let $ns := $PLUGIN-NS || fn:lower-case($module-name)
  let $func := xdmp:function(fn:QName($ns, "collect"), $module-uri)
  return
    $func($options)
};

declare function flow:run-flow(
  $flow as element(hub:flow),
  $identifier as xs:string,
  $options as map:map)
{
  let $content :=
    map:new((
      map:entry("identifier", $identifier)
    ))
  let $_ :=
    xdmp:invoke-function(function() {
      for $plugin in $flow/hub:plugins/hub:plugin
      let $destination := $plugin/@dest
      let $resp :=
        flow:run-plugin(
          $plugin,
          $identifier,
          map:get($content, "content"),
          map:get($content, "headers"),
          map:get($content, "triple"),
          $options)
      return
        map:put($content, $destination, $resp)
    },
    map:new((
      map:entry("isolation", "different-transaction"),
      map:entry("transactionMode", "query")
    )))
  let $envelope := flow:make-envelope($content)
  let $_ :=
    for $writer in $flow/hub:writer
    return
      flow:run-writer($writer, $identifier, $envelope, $options)
  return
    ()
};

declare function flow:make-envelope($map as map:map)
{
  <envelope xmlns="http://marklogic.com/hub-in-a-box/envelope">
    <headers>{map:get($map, "headers")}</headers>
    <triples>{map:get($map, "triples")}</triples>
    <content>{map:get($map, "content")}</content>
  </envelope>
};

declare function flow:run-plugin(
  $plugin as element(hub:plugin),
  $identifier as xs:string,
  $content as element()?,
  $headers as element()*,
  $triples as element(sem:triple)*,
  $options as map:map)
{
  let $module-uri := $plugin/@module
  let $destination := $plugin/@dest
  let $module-name := hul:get-module-name($module-uri)
  let $ns := $PLUGIN-NS || fn:lower-case($module-name)
  let $func := xdmp:function(fn:QName($ns, "create-" || $destination), $module-uri)
  return
    $func($identifier, $content, $headers, $triples, $options)
};

declare function flow:run-writer(
  $writer as element(hub:writer),
  $identifier as xs:string,
  $node as element(),
  $options as map:map)
{
  let $module-uri as xs:string := $writer/@module
  let $module-name := hul:get-module-name($module-uri)
  let $ns := $PLUGIN-NS || fn:lower-case($module-name)
  let $func := xdmp:function(fn:QName($ns, "write"), $module-uri)
  return
    $func($identifier, $node, $options)
};
