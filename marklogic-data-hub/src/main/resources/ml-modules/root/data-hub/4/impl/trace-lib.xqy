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

module namespace trace = "http://marklogic.com/data-hub/trace";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/data-hub/4/impl/consts.xqy";

import module namespace err = "http://marklogic.com/data-hub/err"
  at "/data-hub/4/impl/error-lib.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";

import module namespace rfc = "http://marklogic.com/data-hub/run-flow-context"
  at "/data-hub/4/impl/run-flow-context.xqy";

import module namespace search = "http://marklogic.com/appservices/search"
  at "/MarkLogic/appservices/search/search.xqy";

declare option xdmp:mapping "false";

(: new trace-settings are initialized for each transaction :)
declare variable $current-trace-settings := map:map();

declare function trace:new-trace() as map:map
{
  map:new((
    map:entry("traceId", xdmp:random()),
    map:entry("created", fn:current-dateTime())
  ))
};

declare function trace:enable-tracing($enabled as xs:boolean)
{
  if ($enabled)
  then
  xdmp:eval('
    declare namespace trace = "http://marklogic.com/data-hub/trace";
    xdmp:document-insert(
      "/com.marklogic.hub/settings/__tracing_enabled__.xml",
      element trace:is-tracing-enabled { 1 },
      xdmp:default-permissions(),
      "hub-core-module")
    ', (), map:new((map:entry("database", xdmp:modules-database()), map:entry("ignoreAmps", fn:true())))
  )
  else
    xdmp:eval('
    try {
        xdmp:document-delete("/com.marklogic.hub/settings/__tracing_enabled__.xml")
    } catch ($e) {
        ()
    }
    ',(), map:new((map:entry("database", xdmp:modules-database()), map:entry("ignoreAmps", fn:true())))
    )
};

declare function trace:enabled() as xs:boolean
{
    xdmp:eval('
          fn:doc-available("/com.marklogic.hub/settings/__tracing_enabled__.xml")
    ',(), map:new(map:entry("database", xdmp:modules-database())))
};

declare function trace:has-errors() as xs:boolean
{
  (map:get($current-trace-settings, "_has_errors"), fn:false())[1] eq fn:true()
};

declare %private function trace:increment-error-count()
{
  map:put($current-trace-settings, "error-count", trace:get-error-count() + 1)
};

declare function trace:get-error-count()
{
  (map:get($current-trace-settings, "error-count"), 0)[1]
};

declare %private function trace:add-failed-item($item as xs:string)
{
  json:array-push(trace:get-failed-items(), $item)
};

declare %private function trace:add-completed-item($item as xs:string)
{
  json:array-push(trace:get-completed-items(), $item)
};

declare function trace:set-plugin-label(
  $label as xs:string)
{
  trace:set-plugin-label(
    rfc:get-trace($rfc:item-context),
    $label
  )
};

(:
 : Sets the label of the currently running plugin
 :
 : @param $label - the label of the running plugin
 :)
declare function trace:set-plugin-label(
  $current-trace as map:map,
  $label as xs:string)
{
  map:put($current-trace, "plugin-label", $label)
};

declare function trace:get-plugin-label(
  $current-trace as map:map)
as xs:string
{
  map:get($current-trace, "plugin-label")
};

declare function trace:reset-plugin-input()
{
  trace:reset-plugin-input(rfc:get-trace($rfc:item-context))
};

declare function trace:reset-plugin-input(
  $current-trace as map:map)
{
  map:put($current-trace, "plugin-input", json:object())
};

declare %private function trace:get-plugin-input(
  $current-trace as map:map)
{
  let $o := map:get($current-trace, "plugin-input")
  where fn:exists($o)
  return
    if (rfc:is-json()) then
      let $oo := json:object()
      let $_ :=
        for $key in map:keys($o)
        let $value := map:get($o, $key)
        let $value := trace:sanitize-data($value)
        return
         map:put($oo, $key, $value)
      return $oo
    else
      for $key in map:keys($o)
      return
        element { $key } {
          let $value := map:get($o, $key)
          return
            trace:sanitize-data($value)
        }
};

(:
 : Registers an input with the trace library
 :
 : @param $label - the label of the input being registered
 : @param $input - the value of the input being registered
 :)
declare function trace:set-plugin-input(
  $label as xs:string,
  $input)
{
  trace:set-plugin-input(rfc:get-trace($rfc:item-context), $label, $input)
};

declare function trace:set-plugin-input(
  $current-trace as map:map,
  $label as xs:string,
  $input)
{
  let $existing := (map:get($current-trace, "plugin-input"), json:object())[1]
  let $_ := map:put($existing, $label, $input)
  return
    map:put($current-trace, "plugin-input", $existing)
};

declare function trace:get-completed-items()
{
  if (map:contains($current-trace-settings, "completed-items")) then
    map:get($current-trace-settings, "completed-items")
  else
    let $value := json:array()
    let $_ := map:put($current-trace-settings, "completed-items", $value)
    return
      $value
};

declare function trace:get-failed-items()
{
  if (map:contains($current-trace-settings, "failed-items")) then
    map:get($current-trace-settings, "failed-items")
  else
    let $value := json:array()
    let $_ := map:put($current-trace-settings, "failed-items", $value)
    return
      $value
};

declare function trace:write-trace(
  $item-context as map:map)
{
  let $identifier := rfc:get-id($item-context)
  where $identifier instance of xs:string
  return
    trace:add-completed-item($identifier),
  trace:write-error-trace($item-context)
};

declare %private function trace:write-error-trace(
  $item-context as map:map)
{
  let $current-trace := rfc:get-trace($item-context)
  return
    if (trace:enabled() or trace:has-errors()) then (
      let $trace :=
        if (rfc:is-json()) then
          xdmp:to-json((
            map:entry("trace",
              map:new((
                map:entry("jobId", rfc:get-job-id()),
                map:entry("format", rfc:get-data-format()),
                map:entry("traceId", map:get($current-trace, "traceId")),
                map:entry("created", map:get($current-trace, "created")),
                map:entry("identifier", rfc:get-id($item-context)),
                map:entry("flowType", rfc:get-flow-type()),
                map:entry("hasError", trace:has-errors()),
                let $steps := json:array()
                let $_ :=
                  for $step in map:get($current-trace, "traceSteps")
                  return
                    json:array-push($steps, $step)
                return
                  map:entry("steps", $steps)
              ))
            )
          ))
        else
          document {
            element trace {
              element jobId { rfc:get-job-id() },
              element format { rfc:get-data-format() },
              element traceId { map:get($current-trace, "traceId") },
              element created { map:get($current-trace, "created") },
              element identifier { rfc:get-id($item-context) },
              element flowType { rfc:get-flow-type() },
              element hasError { trace:has-errors() },
              element steps {
                for $step in map:get($current-trace, "traceSteps")
                return
                  element step {
                    element label { map:get($step, "label") },
                    element input { map:get($step, "input") },
                    element output { map:get($step, "output") },
                    element error { map:get($step, "error") },
                    element duration { map:get($step, "duration") },
                    element options { map:get($step, "options") }
                  }
              }
            }
          }
      return
        xdmp:eval('
          xquery version "1.0-ml";

          declare option xdmp:mapping "false";

          declare variable $trace external;
          declare variable $extension external;

          xdmp:document-insert(
            "/" || $trace/*:trace/*:traceId || $extension,
            $trace,
            xdmp:default-permissions(),
            ("trace", $trace/*:trace/*:flow-type, $trace/*:trace/*:flowType)
          )
        ',
        map:new((
          map:entry("trace", $trace),
          map:entry("extension", if (rfc:is-json()) then ".json" else ".xml")
        )),
        map:new((
          map:entry("database", xdmp:database($config:TRACE-DATABASE)),
          map:entry("commit", "auto"),
          map:entry("update", "true"),
          map:entry("ignoreAmps", fn:true())
        )))
    )
    else ()
};

declare function trace:sanitize-data($data)
{
  if ($data instance of binary()) then xs:hexBinary($data)
  else if (fn:not(rfc:is-json())) then
    if ($data instance of null-node()) then ()
    else $data
  else $data
};

declare function trace:plugin-trace(
  $output,
  $duration) as empty-sequence()
{
  trace:plugin-trace($rfc:item-context, $output, $duration)
};

declare function trace:plugin-trace(
  $item-context as map:map,
  $output,
  $duration) as empty-sequence()
{
  let $current-trace := rfc:get-trace($item-context)
  let $output := trace:sanitize-data($output)
  return
    if (trace:enabled()) then(
      let $new-step := map:map()
      let $_ := (
        map:put($new-step, "label", get-plugin-label($current-trace)),
        trace:get-plugin-input($current-trace) ! map:put($new-step, "input", .),
        map:put($new-step, "output", $output),
        map:put($new-step, "duration", $duration),
        map:put($new-step, "options", json:object(document { rfc:get-options($item-context) }/node()))
      )
      let $trace-steps := (
        map:get($current-trace, "traceSteps"),
        $new-step
      )
      return
        map:put($current-trace, "traceSteps", $trace-steps)
    )
    else ()
};

declare function trace:error-trace(
  $item-context as map:map,
  $error as element(error:error),
  $duration as xs:dayTimeDuration)
{
  let $current-trace := rfc:get-trace($item-context)
  let $identifier := rfc:get-id($item-context)
  let $_ := trace:increment-error-count()
  let $_ := $identifier ! trace:add-failed-item(.)
  return (
    map:put($current-trace-settings, "_has_errors", fn:true()),
    let $trace-steps := (
      map:get($current-trace, "traceSteps"),
      map:new((
        map:entry("label", get-plugin-label($current-trace)),
        map:entry("input", get-plugin-input($current-trace)),
        map:entry("error",
          if (rfc:is-json()) then
            $error/err:error-to-json(.)
          else
            $error
        ),
        map:entry("duration", $duration),
        map:entry("options", rfc:get-options($item-context))
      ))
    )
    let $_ := map:put($current-trace, "traceSteps", $trace-steps)
    let $_ := trace:write-error-trace($item-context)
    let $_ := map:put($current-trace-settings, "_has_errors", fn:false())
    return ()
  )
};

declare function trace:_walk_json($nodes as node()* ,$o)
{
  let $quote-options :=
    <options xmlns="xdmp:quote">
      <indent>yes</indent>
      <indent-untyped>yes</indent-untyped>
      <omit-xml-declaration>yes</omit-xml-declaration>
    </options>

  for $n in $nodes
  return
    typeswitch($n)
      case array-node() return
        let $name as xs:string := fn:string(fn:node-name($n))
        return
          if ($name = "steps") then
            let $a := json:array()
            let $_ :=
              for $value in $n/node()
              let $oo := json:object()
              let $_ := trace:_walk_json($value/node(), $oo)
              return
                json:array-push($a, $oo)
            return
              map:put($o, $name, $a)
          else
            map:put($o, $name, xdmp:quote($n))
      case object-node() return
        let $oo := map:new()
        let $name as xs:string := fn:string(fn:node-name($n))
        return
          if ($name = "input") then
            if ($n/node()) then
              let $_ :=
                for $x in $n/node()
                (: try to unquote xml for formatting :)
                let $unquoted :=
                  if ($x instance of text()) then
                    try {
                      xdmp:quote(xdmp:unquote(fn:string($x)), $quote-options)
                    }
                    catch($ex) {
                      $x
                    }
                  else
                    $x
                let $nn := fn:string(fn:node-name($x))
                return
                  map:put($oo, $nn, $unquoted)
              return
                map:put($o, $name, $oo)
            else
              map:put($o, $name, null-node {})
          else if ($name = "output") then
            (: try to unquote xml for formatting :)
            let $unquoted :=
              if ($n instance of text()) then
                try {
                  xdmp:quote(xdmp:unquote(fn:string($n)), $quote-options)
                }
                catch($ex) {
                  $n
                }
              else
                $n
            return
              map:put($o, $name, $unquoted)
          else if ($name = "error") then
            map:put($o, $name, $n)
          else if ($name = ("collectorPlugin", "contentPlugin", "headersPlugin", "triplesPlugin", "writerPlugin")) then
            ()
          else
            let $_ := trace:_walk_json($n/node(), $oo)
            return
              map:put($o, $name, $oo)
      case number-node() |
           boolean-node() |
           null-node() return
        map:put($o, fn:string(fn:node-name($n)), fn:data($n))
      case text() return
        let $unquoted :=
          try {
            xdmp:quote(xdmp:unquote(fn:string($n)), $quote-options)
          }
          catch($ex) {
            $n
          }
        return
          map:put($o, fn:string(fn:node-name($n)), $unquoted)
      case element(input) return
        let $oo := json:object()
        let $_ :=
          for $x in $n/*
          return
            map:put($oo, fn:local-name($x), xdmp:quote($x/*, $quote-options))
        return
          map:put($o, "input", $oo)
      case element(output) return
        map:put($o, fn:local-name($n), xdmp:quote($n/node(), $quote-options))
      case element(error) return
        map:put($o, fn:local-name($n), $n/error:error/err:error-to-json(.))
      case element(duration) return
        map:put($o, "duration", fn:seconds-from-duration(xs:dayTimeDuration($n)))
      case element(hasError) return
        map:put($o, "hasError", xs:boolean($n))
      case element(steps) return
        let $a := json:array()
        let $_ :=
          for $step in $n/step
          let $oo := json:object()
          let $_ := trace:_walk_json($step/*, $oo)
          return
            json:array-push($a, $oo)
        return
          map:put($o, "steps", $a)
      case element() return
        if ($n/*) then
          let $oo := json:object()
          let $_ := trace:_walk_json($n/*, $oo)
          return
            map:put($o, fn:local-name($n), $oo)
        else
          map:put($o, fn:local-name($n), $n/fn:data(.))
      default return
        $n
};

declare function trace:trace-to-json-legacy($trace)
{
  let $o := json:object()
  let $_ :=
    for $n in $trace/node()
    let $name := fn:string(fn:node-name($n))
    where fn:not($name = ("collectorPlugin", "contentPlugin", "headersPlugin", "triplesPlugin", "writerPlugin"))
    return
      map:put($o, $name, $n/data())
  let $steps := json:array()
  let $_build_steps :=
    for $n in $trace/node()
    let $name := fn:string(fn:node-name($n))
    where $name = ("collectorPlugin", "contentPlugin", "headersPlugin", "triplesPlugin", "writerPlugin")
    return
      let $step := json:object()
      let $_ := map:put($step, "label", fn:replace($name, "Plugin", ""))
      let $_ :=
        trace:_walk_json($n/node(), $step)
      return
        json:array-push($steps, $step)
  let $_ := map:put($o, "steps", $steps)
  return $o
};


declare function trace:trace-to-json($trace)
{
  if (fn:exists($trace/steps) or
      xdmp:node-kind($trace) = "object" and
      fn:exists($trace/trace/steps)) then
    let $o := json:object()
    let $walk-me :=
      let $n := $trace/node()
      return
        if ($n instance of object-node()) then
          $n/node()
        else
          $n
    let $_ := trace:_walk_json($walk-me, $o)
    return
      $o
  else
    trace:trace-to-json-legacy($trace)
};

declare function trace:trace-to-json-slim($trace)
{
  let $o := json:object()
  let $_ := (
    map:put($o, "traceId", $trace/trace/traceId/string()),
    map:put($o, "jobId", $trace/trace/jobId/string()),
    map:put($o, "created", $trace/trace/created/string()),
    map:put($o, "hasError", $trace/trace/hasError/xs:boolean(.)),
    map:put($o, "identifier", $trace/trace/identifier/string()),
    map:put($o, "flowType", $trace/trace/flowType/string()),
    map:put($o, "format", $trace/trace/format/string())
  )
  return
    $o
};

declare function trace:find-traces(
  $q,
  $page as xs:unsignedLong,
  $page-length as xs:unsignedLong)
{
  let $options :=
    <options xmlns="http://marklogic.com/appservices/search">
      <additional-query>{cts:collection-query("trace")}</additional-query>
      <return-results>false</return-results>
      <return-facets>true</return-facets>
      <sort-order type="xs:dateTime"
          direction="descending">
        <path-index>/trace/created</path-index>
      </sort-order>
    </options>
  let $query := search:parse($q)
  let $count := search:estimate($query, $options)
  let $start := ($page - 1) * $page-length + 1
  let $end := fn:min(($start + $page-length - 1, $count))
  let $results :=
    for $result in search:resolve-nodes($query, $options, $start, $page-length)
    return
      trace:trace-to-json-slim($result/node())
  return
    object-node {
      "start": $start,
      "end": $end,
      "total": $count,
      "page": $page,
      "pageCount": $page-length,
      "traces": json:to-array($results)
    }
};

declare function trace:get-traces($page as xs:int, $page-length as xs:int)
{
  let $start := ($page - 1) * $page-length + 1
  let $end := $start + $page-length - 1
  let $count := xdmp:estimate(/trace)
  let $traces :=
    for $trace in cts:search(/trace, cts:true-query(), ("unfiltered", cts:index-order(cts:path-reference("/trace/created"), "descending")))[$start to $end]
    return
      trace:trace-to-json($trace)
  return
    object-node {
      "start": $start,
      "end": $end,
      "total": $count,
      "page": $page,
      "pageCount": $page-length,
      "traces": json:to-array($traces)
    }
};

declare function trace:get-trace($id as xs:string)
{
  let $query :=
    cts:or-query((
      cts:path-range-query("/trace/traceId", "=", $id, ("collation=http://marklogic.com/collation/codepoint"))
    ))
  return
    trace:trace-to-json(cts:search(fn:doc(), $query)[1]/node())
};

declare function trace:get-traceIds($q as xs:string?)
{
  let $query :=
    if ($q) then
      cts:element-value-query(xs:QName("identifier"), fn:lower-case($q) || "*", "wildcarded")
    else ()
  let $results :=
    cts:value-co-occurrences(
      cts:path-reference("/trace/traceId"),
      cts:path-reference("/trace/identifier"),
      (
        "limit=10"
      ),
      $query)
  let $results :=
    for $r in $results
    return
      object-node {
        "traceId": fn:data($r/*:value[1]),
        "identifier": fn:data($r/*:value[2])
      }
  return
    json:to-array($results)
};
