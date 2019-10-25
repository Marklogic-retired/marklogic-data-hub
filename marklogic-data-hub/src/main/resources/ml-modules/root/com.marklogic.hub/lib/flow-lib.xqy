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

module namespace flow = "http://marklogic.com/data-hub/flow-lib";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/com.marklogic.hub/lib/consts.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";

import module namespace functx = "http://www.functx.com"
  at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";

import module namespace rfc = "http://marklogic.com/data-hub/run-flow-context"
  at "/com.marklogic.hub/lib/run-flow-context.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/com.marklogic.hub/lib/trace-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare option xdmp:mapping "false";

(: the directory where entities live :)
declare variable $ENTITIES-DIR := "/entities/";

declare variable $PLUGIN-NS := "http://marklogic.com/data-hub/plugins";

declare function flow:get-module-ns(
  $type as xs:string) as xs:string?
{
  if ($type eq $consts:JAVASCRIPT) then ()
  else
    $PLUGIN-NS
};

(:~
 : Returns a flow by name. This xml is dynamically constructed
 : by looking in the modules database.
 :
 : @param $entity-name - name of the entity that owns the flow
 : @param $flow-name - name of the flow to retrieve
 : @return - xml describing the flow
 :)
declare function flow:get-flow(
  $entity-name as xs:string,
  $flow-name as xs:string,
  $flow-type as xs:string?) as element(hub:flow)?
{
  hul:run-in-modules(function() {
    /hub:flow[
      hub:entity = $entity-name and
      hub:name = $flow-name]
      [
        if (fn:exists($flow-type)) then
          hub:type = $flow-type
        else
          fn:true()
      ]
  })
};

(:~
 : Returns the flows that belong to the given entity in the database
 :
 : @param $entity-name - the name of the entity containing the flows
 : @return - xml describing the flows
 :)
declare function flow:get-flows(
  $entity-name as xs:string) as element(hub:flows)
{
  element hub:flows {
    hul:run-in-modules(function() {
      /hub:flow[hub:entity = $entity-name]
    })
  }
};

(:~
 : Returns an entity by name. This xml is dynamically constructed
 : by looking in the modules database.
 :
 : @param $entity-name - name of the entity to retrieve
 : @return - xml describing the entity
 :)
declare function flow:get-entity(
  $entity-name as xs:string)
{
  let $uris :=
    hul:run-in-modules(function() {
      cts:uri-match($ENTITIES-DIR || $entity-name || "/*")
    })
  return
    flow:get-entity($entity-name, $uris)
};

(:~
 : Returns a entity by name. This xml is dynamically constructed
 : by looking in the modules database.
 :
 : @param $entity-name - name of the entity to retrieve
 : @param $uris - uris used to build the entity xml
 : @return - xml describing the entity
 :)
declare %private function flow:get-entity(
  $entity-name as xs:string,
  $uris as xs:string*)
  as element(hub:entity)
{
  <entity xmlns="http://marklogic.com/data-hub">
    <name>{$entity-name}</name>
    {
      flow:get-flows($entity-name)
    }
  </entity>
};

(:~
 : Returns the entities in the database
 :
 : @return - xml describing the entities
 :)
declare function flow:get-entities() as element(hub:entities)
{
  let $uris := hul:run-in-modules(function() {
    cts:uri-match($ENTITIES-DIR || "*")
  })
  let $entity-names :=
    fn:distinct-values(
      let $regex := $ENTITIES-DIR || "([^/]+)/.*$"
      for $flow in $uris[fn:matches(., $regex)]
      let $name := fn:replace($flow, $regex, "$1")
      return
        $name)
  let $entities :=
    for $entity-name in $entity-names
    return
      flow:get-entity($entity-name, $uris[fn:matches(., $ENTITIES-DIR || $entity-name || "/.+")])
  return
    <entities xmlns="http://marklogic.com/data-hub">
    {
      $entities
    }
    </entities>
};

(:~
 : Runs a collector
 :
 : @param $module-uri - the uri of the collector module
 : @param $options - a map of options passed in by the client
 : @return - a sequence of strings
 :)
declare function flow:run-collector(
  $flow as element(hub:flow),
  $job-id as xs:string,
  $options as map:map) as item()*
{
    (: sanity check on required info :)
  if (fn:empty($flow/hub:collector/@module) or fn:empty($flow/hub:collector/@code-format)) then
    fn:error(xs:QName("INVALID-PLUGIN"), "The plugin definition is invalid.")
  else (),

  (: assert that we are in query mode :)
  let $_ts as xs:unsignedLong := xdmp:request-timestamp()

  let $_ := trace:set-plugin-label("collector")

  (: configure the run context :)
  let $_ := (
    rfc:with-job-id($job-id),
    rfc:with-flow($flow),
    rfc:with-module-uri($flow/hub:collector/@module),
    rfc:with-options($options)
  )

  let $func := flow:make-function(
    $flow/hub:collector/@code-format,
    "collect",
    $flow/hub:collector/@module
  )
  let $before := xdmp:elapsed-time()
  let $resp :=
    try {
      $func($options)
    }
    catch($ex) {
      debug:log(xdmp:describe($ex, (), ())),
      trace:error-trace($ex, xdmp:elapsed-time() - $before),
      xdmp:rethrow()
    }
  (: log and write the trace :)
  let $_ := (
    trace:plugin-trace($resp, xdmp:elapsed-time() - $before),
    trace:write-trace()
  )
  return
    $resp
};

(:~
 : Runs a given flow
 :
 : @param $flow - xml describing the flow
 : @param $identifier - the identifier to send to the flow steps (URI in corb lingo)
 : @param $options - a map of options passed in by the client
 : @return - nothing
 :)
declare function flow:run-flow(
  $job-id as xs:string,
  $flow as element(hub:flow),
  $identifier as xs:string,
  $options as map:map)
{
  flow:run-flow($job-id, $flow, $identifier, (), $options)
};

(:~
 : Runs a given flow
 :
 : @param $flow - xml describing the flow
 : @param $identifier - the identifier to send to the flow steps (URI in corb lingo)
 : @param $content - the content being loaded
 : @param $options - a map of options passed in by the client
 : @return - nothing
 :)
declare function flow:run-flow(
  $job-id as xs:string,
  $flow as element(hub:flow),
  $identifier as xs:string,
  $content as item()?,
  $options as map:map)
{
  (: assert that we are in query mode :)
  (: )let $_must_run_in_query_mode as xs:unsignedLong := xdmp:request-timestamp() :)

  (: configure the run context :)
  let $_ := (
    rfc:with-job-id($job-id),
    rfc:with-flow($flow),
    rfc:with-id($identifier),
    rfc:with-content(
      if ($content instance of document-node()) then
        $content/node()
      else $content
    ),
    rfc:with-options($options),
    map:get($options, "target-database") ! rfc:with-target-database(.)
  )

  (: run the users main.(sjs|xqy) :)
  return
    flow:run-main($flow/hub:main)
};

declare function flow:clean-data($resp, $destination, $data-format)
{
  let $resp :=
    typeswitch($resp)
      case document-node() return
        if (fn:count($resp/node()) > 1) then
          fn:error(xs:QName("TOO_MANY_NODES"), "Too Many Nodes!. Return just 1 node")
        else
          $resp/node()
      default return
        $resp

  (: clean up output :)
  return
    typeswitch($resp)
      case object-node() | json:object return
        (: object with $type key is ES response type :)
        if ($resp instance of map:map and map:keys($resp) = "$type") then
          $resp
        else if ($data-format = $consts:XML) then
          json:transform-from-json($resp, json:config("custom"))
        else
          $resp
      case json:array return
        if ($data-format = $consts:XML) then
          json:array-values($resp)
        else
          $resp
      case empty-sequence() return
        if ($destination = "headers" and $data-format = $consts:JSON) then
          json:object()
        else if ($destination = "triples" and $data-format = $consts:JSON) then
          json:array()
        else
          $resp
      default return
        if ($data-format = $consts:JSON and
            rfc:get-code-format() = $consts:XQUERY and
            $destination = "triples") then
          json:to-array($resp)
        else
          $resp
};

(:~
 : Construct an envelope
 :
 : @param $map - a map with all the stuff in it
 : @return - the newly constructed envelope
 :)
declare function flow:make-envelope($content, $headers, $triples, $data-format)
  as document-node()
{
  let $content := flow:clean-data($content, "content", $data-format)
  let $headers := flow:clean-data($headers, "headers", $data-format)
  let $triples := flow:clean-data($triples, "triples", $data-format)
  return
    if ($data-format = $consts:JSON) then
      let $envelope :=
        let $o := json:object()
        let $_ := (
          map:put($o, "headers", $headers),
          map:put($o, "triples", $triples),
          map:put($o, "instance",
            if ($content instance of map:map and map:keys($content) = "$type") then
              let $json := flow:instance-to-canonical-json($content)
              let $info :=
                let $o :=json:object()
                let $_ := (
                  map:put($o, "title", map:get($content, "$type")),
                  map:put($o, "version",  map:get($content, "$version"))
                )
                return $o
              let $_ := map:put($json, "info", $info)
              return $json
            else
              $content
          ),
          map:put($o, "attachments",
            if ($content instance of map:map and map:keys($content) = "$attachments") then
              map:get($content, "$attachments")
            else
              ()
          )
        )
        return
          $o
      let $wrapper := json:object()
      let $_ := map:put($wrapper, "envelope", $envelope)
      return
        xdmp:to-json($wrapper)
    else if ($data-format = $consts:XML) then
      document {
        <envelope xmlns="http://marklogic.com/entity-services">
          <headers>{$headers}</headers>
          <triples>{$triples}</triples>
          <instance>
          {
            if ($content instance of map:map and map:keys($content) = "$type") then (
              <info>
                <title>{map:get($content, "$type")}</title>
                <version>{map:get($content, "$version")}</version>
              </info>,
              flow:instance-to-canonical-xml($content)
            )
            else
              $content
          }
          </instance>
          <attachments>
          {
            if ($content instance of map:map and map:keys($content) = "$attachments") then
              map:get($content, "$attachments")
            else
              ()
          }
          </attachments>
        </envelope>
      }
    else
      fn:error(xs:QName("INVALID-DATA-FORMAT"), "Invalid data format: " || $data-format)
};

declare function flow:make-legacy-envelope($content, $headers, $triples, $data-format)
  as document-node()
{
  let $content := flow:clean-data($content, "content", $data-format)
  let $headers := flow:clean-data($headers, "headers", $data-format)
  let $triples := flow:clean-data($triples, "triples", $data-format)
  return
    if ($data-format = $consts:JSON) then
      let $envelope :=
        let $o := json:object()
        let $_ := (
          map:put($o, "headers", $headers),
          map:put($o, "triples", $triples),
          map:put($o, "content", $content)
        )
        return
          $o
      let $wrapper := json:object()
      let $_ := map:put($wrapper, "envelope", $envelope)
      return
        xdmp:to-json($wrapper)
    else if ($data-format = $consts:XML) then
      document {
        <envelope xmlns="http://marklogic.com/data-hub/envelope">
          <headers>{$headers}</headers>
          <triples>{$triples}</triples>
          <content>{$content}</content>
        </envelope>
      }
    else
      fn:error(xs:QName("INVALID-DATA-FORMAT"), "Invalid data format: " || $data-format)
};

declare function flow:instance-to-canonical-json(
  $entity-instance as map:map) as json:object
{
  let $root-object := json:object()
  let $o :=
    if ( map:contains($entity-instance, "$ref") ) then
      map:get($entity-instance, "$ref")
    else
      let $o := json:object()
      let $_ := (
        for $key in map:keys($entity-instance)
        let $instance-property := map:get($entity-instance, $key)
        where ($key castable as xs:NCName and $key ne "$type")
        return
          typeswitch ($instance-property)
          (: This branch handles embedded objects.  You can choose to prune
             an entity's representation of extend it with lookups here. :)
          case json:object+ return
            for $prop in $instance-property
            return
              map:put($o, $key, flow:instance-to-canonical-json($prop))
          (: An array can also treated as multiple elements :)
          case json:array return
            let $a := json:array()
            let $_ :=
              for $val in json:array-values($instance-property)
              return
                if ($val instance of json:object) then
                  json:array-push($a, flow:instance-to-canonical-json($val))
                else
                  json:array-push($a, $val)
            return
              map:put($o, $key, $a)
          (: A sequence of values should be simply treated as multiple elements :)
          case item()+ return
            for $val in $instance-property
            return
              map:put($o, $key, $val)
          default return
            map:put($o, $key, $instance-property)
      )
      return
        $o
  let $_ := map:put($root-object, map:get($entity-instance, "$type"), $o)
  return
    $root-object
};

declare function flow:instance-to-canonical-xml(
  $entity-instance as map:map) as element()
{
  (: Construct an element that is named the same as the Entity Type :)
  element { map:get($entity-instance, "$type") }  {
    if ( map:contains($entity-instance, "$ref") ) then
      map:get($entity-instance, "$ref")
    else
      for $key in map:keys($entity-instance)
      let $instance-property := map:get($entity-instance, $key)
      where ($key castable as xs:NCName and $key ne "$type")
      return
        typeswitch ($instance-property)
        (: This branch handles embedded objects.  You can choose to prune
           an entity's representation of extend it with lookups here. :)
        case json:object+ return
          for $prop in $instance-property
          return
            element { $key } {
              flow:instance-to-canonical-xml($prop)
            }
        (: An array can also treated as multiple elements :)
        case json:array return
          for $val in json:array-values($instance-property)
          return
            if ($val instance of json:object) then
              element { $key } {
                attribute datatype { "array" },
                flow:instance-to-canonical-xml($val)
              }
            else
              element { $key } {
                attribute datatype { "array" },
                $val
              }
        (: A sequence of values should be simply treated as multiple elements :)
        case item()+ return
          for $val in $instance-property
          return
            element { $key } { $val }
        default return
          element { $key } { $instance-property }
  }
};

(: Formats the input for a trace based on the plugin type :)
declare function flow:get-trace-input(
  $plugin as element(hub:plugin),
  $data-format as xs:string,
  $content as item()?,
  $headers as item()*,
  $flow-type as xs:string)
{
  let $destination as xs:string := $plugin/@dest
  let $content :=
    if ($content instance of document-node()) then
      $content/node()
    else
      $content
  let $o := json:object()
  let $_ :=
    switch($destination)
      case "content" return
        if ($flow-type = $consts:INPUT_FLOW) then
          if ($content instance of binary()) then
            map:put($o, "rawContent", "binary document")
          else
            map:put($o, "rawContent", $content)
        else
          ()
      case "headers" return
        map:put($o, "content", $content)
      case "triples" return
      (
        map:put($o, "content", $content),
        map:put($o, "headers", ($headers, null-node{})[1])
      )
      default return ()
  return
    if ($data-format = $consts:XML) then
      for $key in map:keys($o)
      return
        element { $key } {
          let $value := map:get($o, $key)
          return
            if ($value instance of null-node()) then ()
            else $value
        }
    else
      $o
};

declare function flow:set-default-options(
  $options as map:map,
  $flow as element(hub:flow))
{
  map:put($options, "entity", fn:string($flow/hub:entity)),
  map:put($options, "flow", fn:string($flow/hub:name)),
  map:put($options, "flowType", fn:string($flow/hub:type)),
  map:put($options, "dataFormat", fn:string($flow/hub:data-format))
};

declare function flow:run-main(
  $main as element(hub:main))
{
  (: sanity check on required info :)
  if (fn:empty($main/@module) or fn:empty($main/@code-format)) then
    fn:error(xs:QName("INVALID-PLUGIN"), "The plugin definition is invalid.")
  else (),

  let $module-uri as xs:string? := $main/@module
  let $_ := rfc:with-module-uri($module-uri)
  let $func := flow:make-function($main/@code-format, "main", $module-uri)
  let $before := xdmp:elapsed-time()
  let $resp := try {
    let $options := rfc:get-options()
    let $_ := map:set-javascript-by-ref($options, fn:true())
    let $resp :=
      if (rfc:get-flow-type() eq $consts:HARMONIZE_FLOW) then
        $func(rfc:get-id(), $options)
      else
        $func(rfc:get-id(), rfc:get-content(), $options)
    (: write the trace for the current identifier :)
    let $_ := trace:write-trace()
    return
      $resp
  }
  catch($ex) {
    if ($ex/error:name eq "PLUGIN-ERROR") then
      (: plugin errors are already handled :)
      ()
    else (
      (: this is an error in main.(sjs|xqy) :)
      debug:log(xdmp:describe($ex, (), ())),

      (: log the trace event for main :)
      trace:set-plugin-label("main"),
      trace:error-trace($ex, xdmp:elapsed-time() - $before)
    ),
    xdmp:rethrow()
  }
  return
    $resp
};

(:~
 : Run a given writer
 :
 : @param $writer - xml describing the writer to run
 : @param $identifier - the identifier to send to the flow steps (URI in corb lingo)
 : @param $envelope - the envelope
 : @param $options - a map of options passed in by the client
 : @return - the output of the writer. It varies.
 :)
declare function flow:run-writer(
  $writer-function,
  $identifier as xs:string,
  $envelope as item(),
  $options as map:map)
{
  let $before := xdmp:elapsed-time()
  let $resp :=
    try {
      xdmp:eval('
        declare variable $func external;
        declare variable $identifier external;
        declare variable $envelope external;
        declare variable $options external;

        $func($identifier, $envelope, $options)
      ',
      map:new((
        map:entry("func", $writer-function),
        map:entry("identifier", $identifier),
        map:entry("envelope", $envelope),
        map:entry("options", $options)
      )),
      map:new((
        map:entry("isolation", "different-transaction"),
        map:entry("database", rfc:get-target-database()),
        map:entry("transactionMode", "update-auto-commit")
      )))
    }
    catch($ex) {
      debug:log(xdmp:describe($ex, (), ())),
      trace:error-trace($ex, xdmp:elapsed-time() - $before),
      fn:error(xs:QName("PLUGIN-ERROR"), "error in writer", $ex)
    }
  let $duration := xdmp:elapsed-time() - $before
  let $_ := trace:plugin-trace((), xdmp:elapsed-time() - $before)
  return
    $resp
};

declare function flow:make-error-json(
  $errors as json:object,
  $entity as xs:string,
  $flow  as xs:string,
  $plugin as xs:string,
  $ex
) {
  let $eo :=
    if (map:contains($errors, $entity)) then
      map:get($errors, $entity)
    else
      let $e := map:map()
      let $_ := map:put($errors, $entity, $e)
      return
        $e
  let $fo :=
    if (map:contains($eo, $flow)) then
      map:get($eo, $flow)
    else
      let $f := map:map()
      let $_ := map:put($eo, $flow, $f)
      return
        $f

  let $f := $ex/error:stack/error:frame[1]
  return
    map:put($fo, $plugin, map:new((
      map:entry("uri", $f/error:uri/fn:data()),
      map:entry("line", $f/error:line/fn:data()),
      map:entry("column", $f/error:column/fn:data()),
      map:entry("msg", $ex/error:format-string/fn:data())
    )))
};

declare function flow:validate-entities()
{
  let $errors := json:object()
  let $options := map:map()
  let $_ :=
    for $entity in flow:get-entities()/hub:entity
    for $flow in $entity/hub:flows/hub:flow
    let $data-format := $flow/hub:data-format
    (: validate collector :)
    let $_ :=
      try {
        let $collector := $flow/hub:collector
        return
          if ($collector) then
            let $module-uri := $collector/@module
            let $ns := flow:get-module-ns($collector/@code-format)
            return
              if ($collector/@code-format eq $consts:XQUERY) then
                xdmp:eval(
                  'import module namespace x = "' || $ns || '" at "' || $module-uri || '"; ' ||
                  '()',
                  map:new(map:entry("staticCheck", fn:true()))
                )
              else
                xdmp:javascript-eval(
                  'var x = require("' || $module-uri || '");',
                  map:new(map:entry("staticCheck", fn:true()))
                )
          else ()
      }
      catch($ex) {
        flow:make-error-json(
          $errors,
          $entity/hub:name,
          $flow/hub:name,
          "collector",
          $ex)
      }
    (: validate plugins :)
    let $_ :=
      for $main in $flow/hub:main
      let $module-uri := $main/@module
      let $ns := flow:get-module-ns($main/@code-format)
      return
        (:
         : Note that we are static checking the files.
         : This is because there is no reasonable way to actually
         : call the plugins and pass in data that will work for all plugins.
         :
         : The disadvantage to static checking is that we will not catch typos
         : like ctsdoc <- (missing period) because Javascript is dynamically
         : typed. Static checking will only catch syntax errors in sjs.
         :)
        try {
          if ($main/@code-format eq $consts:XQUERY) then
            xdmp:eval(
              'import module namespace x = "' || $ns || '" at "' || $module-uri || '"; ' ||
              '()',
              map:new(map:entry("staticCheck", fn:true()))
            )
          else
            xdmp:javascript-eval(
              'var x = require("' || $module-uri || '");',
              map:new(map:entry("staticCheck", fn:true()))
            )
        }
        catch($ex) {
          let $plugin :=
            let $uri := ($ex/error:stack/error:frame)[1]/error:uri
            let $name := hul:get-file-name(hul:get-file-from-uri($uri))
            return
              if ($name eq "[anonymous]") then
                fn:replace($ex/error:expr, ".+/([^.]+)\.(sjs|xqy).*", "$1")
              else
                $name
          return
            flow:make-error-json(
              $errors,
              $entity/hub:name,
              $flow/hub:name,
              $plugin,
              $ex)
        }
    return
      ()
  return
    map:new(
      map:entry("errors", $errors)
    )
};

declare function flow:safe-run($func)
{
  let $before := xdmp:elapsed-time()
  return
    try {
      let $resp := $func()
      let $duration := xdmp:elapsed-time() - $before
      let $_ := trace:plugin-trace($resp, $duration)
      return
        $resp
    }
    catch($ex) {
      debug:log(xdmp:describe($ex, (), ())),
      trace:error-trace($ex, xdmp:elapsed-time() - $before),
      fn:error(xs:QName("PLUGIN-ERROR"), "error in a plugin", $ex)
    }
};

declare %private function flow:make-function(
  $code-format as xs:string?,
  $func-name as xs:string,
  $module-uri as xs:string)
{
  let $ns := flow:get-module-ns($code-format)
  return
    xdmp:function(fn:QName($ns, $func-name), $module-uri)
};
