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

declare namespace envelope = "http://marklogic.com/hub-in-a-box/envelope";

declare option xdmp:mapping "false";

(: xml describing the default writer :)
declare variable $DEFAULT-WRITER :=
  element hub:writer {
    attribute type { "xquery" },
    attribute module { "/com.marklogic.hub/writers/default.xqy" }
  };

(: xml describing the default content plugin :)
declare variable $DEFAULT-CONTENT-PLUGIN :=
  element hub:plugin {
    attribute dest { "content" },
    attribute type { "xquery" },
    attribute module { "/com.marklogic.hub/plugins/raw.xqy" }
  };

(: xml describing a no-op plugin. used when no plugin is given :)
declare variable $NO-OP-PLUGIN :=
  element hub:plugin {
    attribute type { "null" }
  };

(: the directory where domains live :)
declare variable $DOMAINS-DIR := "/ext/domains/";

declare variable $PLUGIN-NS := "http://marklogic.com/hub-in-a-box/plugins/";

(:
 : Determines the type of flow given a filename
 :
 : @param $filename - name of the module plugin file
 : @return - a type (xquery, xml, sjs, ...)
 :)
declare %private function flow:get-type($filename) as xs:string?
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

(:~
 : Returns xml describing a collector
 :)
declare %private function flow:get-collector(
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

(:~
 : Returns xml describing a plugin
 :)
declare %private function flow:get-plugin(
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

(:~
 : Returns xml describing a content plugin
 :)
declare %private function flow:get-content(
  $flow-name as xs:string,
  $uris as xs:string*)
{
  let $plugin := flow:get-plugin($flow-name, $uris, "content")
  return
    if ($plugin) then $plugin
    else
      $DEFAULT-CONTENT-PLUGIN
};

(:~
 : Returns xml describing a headers plugin
 :)
declare %private function flow:get-headers(
  $flow-name as xs:string,
  $uris as xs:string*)
{
  let $plugin := flow:get-plugin($flow-name, $uris, "headers")
  return
    if ($plugin) then $plugin
    else
      $NO-OP-PLUGIN
};

(:~
 : Returns xml describing a triples plugin
 :)
declare %private function flow:get-triples(
  $flow-name as xs:string,
  $uris as xs:string*)
{
  let $plugin := flow:get-plugin($flow-name, $uris, "triples")
  return
    if ($plugin) then $plugin
    else
      $NO-OP-PLUGIN
};

(:~
 : Returns xml describing a writer
 :)
declare %private function flow:get-writer(
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

(:~
 : Returns a flow by name. This xml is dynamically constructed
 : by looking in the modules database.
 :
 : @param $domain-name - name of the domain that owns the flow
 : @param $flow-name - name of the flow to retrieve
 : @return - xml describing the flow
 :)
declare function flow:get-flow(
  $domain-name as xs:string,
  $flow-name as xs:string,
  $flow-type as xs:string?) as element(hub:flow)
{
  let $uris :=
    hul:run-in-modules(function() {
      let $type :=
        if ($flow-type) then $flow-type
        else "*"
      return
        cts:uri-match($DOMAINS-DIR || $domain-name || "/" || $type || "/" || $flow-name || "/*")
    })
  return
    flow:get-flow($domain-name, $flow-name, $flow-type, $uris)
};

(:~
 : Returns a flow by name. This xml is dynamically constructed
 : by looking in the modules database.
 :
 : @param $domain-name - name of the domain that owns the flow
 : @param $flow-name - name of the flow to retrieve
 : @param $uris - uris used to build the domain xml
 : @return - xml describing the flow
 :)
declare %private function flow:get-flow(
  $domain-name as xs:string,
  $flow-name as xs:string,
  $flow-type as xs:string?,
  $uris as xs:string*) as element(hub:flow)
{
  let $_ := xdmp:log(("domain: " || $domain-name, "flow: " || $flow-name, "flow-type: " || $flow-type, "uris:", $uris))
  let $real-flow-type := fn:replace($uris[1], $DOMAINS-DIR || $domain-name || "/([^/]+)/" || $flow-name || ".*$", "$1")
  let $map := map:map()
  let $_ :=
    for $dir in $uris
    let $type :=
      if ($flow-type) then $flow-type
      else "[^/]+"
    let $dir-name := fn:replace($dir, $DOMAINS-DIR || $domain-name || "/" || $type || "/" || $flow-name || "/([^/]+)/$", "$1")
    let $child-uris := $uris[fn:matches(., $DOMAINS-DIR || $domain-name || "/" || $type || "/" || $flow-name || "/" || $dir-name || "/([^/]+)$")]
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
      <domain>{$domain-name}</domain>
      <format>simple</format>
      <type>{$real-flow-type}</type>
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

(:~
 : Returns the flows that belong to the given domain in the database
 :
 : @param $domain-name - the name of the domain containing the flows
 : @return - xml describing the flows
 :)
declare function flow:get-flows(
  $domain-name as xs:string) as element(hub:flows)
{
  let $uris := hul:run-in-modules(function() {
    cts:uri-match($DOMAINS-DIR || "*")
  })
  let $flows :=
    for $flow in $uris[fn:matches(., $DOMAINS-DIR || $domain-name || "/(input|canonical)/[^/]+/$")]
    let $name := fn:replace($flow, $DOMAINS-DIR || $domain-name || "/(input|canonical)/([^/]+)/$", "$2")
    return
      flow:get-flow($domain-name, $name, (), $uris[fn:matches(., $DOMAINS-DIR || $domain-name || "/(input|canonical)/" || $name || "/.+")])
  return
    <flows xmlns="http://marklogic.com/hub-in-a-box">
    {
      $flows
    }
    </flows>
};

(:~
 : Returns a domain by name. This xml is dynamically constructed
 : by looking in the modules database.
 :
 : @param $domain-name - name of the domain to retrieve
 : @return - xml describing the domain
 :)
declare function flow:get-domain(
  $domain-name as xs:string)
{
  let $uris :=
    hul:run-in-modules(function() {
      cts:uri-match($DOMAINS-DIR || $domain-name || "/*")
    })
  return
    flow:get-domain($domain-name, $uris)
};

(:~
 : Returns a domain by name. This xml is dynamically constructed
 : by looking in the modules database.
 :
 : @param $domain-name - name of the domain to retrieve
 : @param $uris - uris used to build the domain xml
 : @return - xml describing the domain
 :)
declare %private function flow:get-domain(
  $domain-name as xs:string,
  $uris as xs:string*)
  as element(hub:domain)
{
  <domain xmlns="http://marklogic.com/hub-in-a-box">
    <name>{$domain-name}</name>
    {
      flow:get-flows($domain-name)
    }
  </domain>
};

(:~
 : Returns the domains in the database
 :
 : @return - xml describing the domains
 :)
declare function flow:get-domains() as element(hub:domains)
{
  let $uris := hul:run-in-modules(function() {
    cts:uri-match($DOMAINS-DIR || "*")
  })
  let $domains :=
    for $flow in $uris[fn:matches(., $DOMAINS-DIR || "[^/]+/$")]
    let $name := fn:replace($flow, $DOMAINS-DIR || "([^/]+)/$", "$1")
    return
      flow:get-domain($name, $uris[fn:matches(., $DOMAINS-DIR || $name || "/.+")])
  return
    <domains xmlns="http://marklogic.com/hub-in-a-box">
    {
      $domains
    }
    </domains>
};

(:~
 : Runs a collector
 :
 : @param $module-uri - the uri of the collector module
 : @param $options - a map of options passed in by the client
 : @return - a sequence of strings
 :)
declare function flow:run-collector(
  $module-uri as xs:string,
  $options as map:map) as xs:string*
{
  let $module-name := hul:get-module-name($module-uri)
  let $ns := $PLUGIN-NS || fn:lower-case($module-name)
  let $func := xdmp:function(fn:QName($ns, "collect"), $module-uri)
  return
    $func($options)
};

(:~
 : Runs a given flow
 :
 : @param $flow - xml describing the flow
 : @param $idenifier - the identifier to send to the flow steps (URI in corb lingo)
 : @param $options - a map of options passed in by the client
 : @return - nothing
 :)
declare function flow:run-flow(
  $flow as element(hub:flow),
  $identifier as xs:string,
  $options as map:map) as empty-sequence()
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
        if (fn:empty($destination))
        then ()
        else map:put($content, $destination, $resp)
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

(:~
 : Construct an envelope
 :
 : @param $map - a map with all the stuff in it
 : @return - the newly constructed envelope
 :)
declare function flow:make-envelope($map as map:map)
  as element(envelope:envelope)
{
  <envelope xmlns="http://marklogic.com/hub-in-a-box/envelope">
    <headers>{map:get($map, "headers")}</headers>
    <triples>{map:get($map, "triples")}</triples>
    <content>{map:get($map, "content")}</content>
  </envelope>
};

(:~
 : Run a given plugin
 :
 : @param $plugin - xml describing the plugin to run
 : @param $idenifier - the identifier to send to the flow steps (URI in corb lingo)
 : @param $content - the output of the content plugin
 : @param $headers - the output of the headers plugin
 : @param $triples - the output of the triples plugin
 : @param $options - a map of options passed in by the client
 : @return - the output of the plugin. It varies.
 :)
declare function flow:run-plugin(
  $plugin as element(hub:plugin),
  $identifier as xs:string,
  $content as element()?,
  $headers as element()*,
  $triples as element(sem:triple)*,
  $options as map:map)
{
  let $module-uri := $plugin/@module
  return
    if (fn:empty($module-uri))
    then
      ()
    else
      let $destination := $plugin/@dest
      let $module-name := hul:get-module-name($module-uri)
      let $ns := $PLUGIN-NS || fn:lower-case($module-name)
      let $func := xdmp:function(fn:QName($ns, "create-" || $destination), $module-uri)
      return
        $func($identifier, $content, $headers, $triples, $options)
};

(:~
 : Run a given writer
 :
 : @param $writer - xml describing the writer to run
 : @param $idenifier - the identifier to send to the flow steps (URI in corb lingo)
 : @param $envelope - the envelope
 : @param $options - a map of options passed in by the client
 : @return - the output of the writer. It varies.
 :)
declare function flow:run-writer(
  $writer as element(hub:writer),
  $identifier as xs:string,
  $envelope as element(),
  $options as map:map)
{
  let $module-uri as xs:string := $writer/@module
  let $module-name := hul:get-module-name($module-uri)
  let $ns := $PLUGIN-NS || fn:lower-case($module-name)
  let $func := xdmp:function(fn:QName($ns, "write"), $module-uri)
  return
    $func($identifier, $envelope, $options)
};
