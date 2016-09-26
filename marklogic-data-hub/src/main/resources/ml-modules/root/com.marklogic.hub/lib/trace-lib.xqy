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

module namespace trace = "http://marklogic.com/data-hub/trace";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/lib/config.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";

import module namespace search = "http://marklogic.com/appservices/search"
  at "/MarkLogic/appservices/search/search.xqy";

declare option xdmp:mapping "false";

declare variable $FORMAT-XML := "xml";
declare variable $FORMAT-JSON := "json";

declare %private variable $current-trace-settings := map:map();

declare %private variable $current-trace := map:new((
  map:entry("traceId", xdmp:random()),
  map:entry("created", fn:current-dateTime())
));

declare function trace:enable-tracing($enabled as xs:boolean)
{
  xdmp:eval('
    declare namespace trace = "http://marklogic.com/data-hub/trace";
    declare variable $enabled external;
    xdmp:document-insert(
      "/com.marklogic.hub/settings/__tracing_enabled__.xml",
      element trace:is-tracing-enabled { if ($enabled) then 1 else 0 })
  ',
  map:new((map:entry("enabled", $enabled))),
  map:new(map:entry("database", xdmp:modules-database())))
};

declare function trace:enabled() as xs:boolean
{
  xdmp:eval('
    declare namespace trace = "http://marklogic.com/data-hub/trace";
    fn:exists(
      cts:search(
        fn:doc("/com.marklogic.hub/settings/__tracing_enabled__.xml"),
        cts:element-value-query(xs:QName("trace:is-tracing-enabled"), "1", ("exact")),
        ("unfiltered", "score-zero", "unchecked", "unfaceted")
      )
    )
  ',(), map:new(map:entry("database", xdmp:modules-database())))
};

declare function trace:has-errors() as xs:boolean
{
  (map:get($current-trace-settings, "_has_errors"), fn:false())[1] eq fn:true()
};

declare function trace:init-trace($format as xs:string)
{
  map:put($current-trace-settings, "data-format", $format)
};

declare function trace:write-trace()
{
  if (trace:enabled() or trace:has-errors()) then
    let $format := map:get($current-trace-settings, "data-format")
    let $trace :=
      if ($format eq $FORMAT-JSON) then
        xdmp:to-json((
          map:new((
            map:entry("format", map:get($current-trace, "format")),
            map:entry("traceId", map:get($current-trace, "traceId")),
            map:entry("created", map:get($current-trace, "created")),
            map:entry("identifier", map:get($current-trace, "identifier")),
            map:entry("flowType", map:get($current-trace, "flowType")),
            map:entry("hasError", trace:has-errors()),
            for $key in ("collectorPlugin", "contentPlugin", "headersPlugin", "triplesPlugin", "writerPlugin")
            let $m := map:get($current-trace, $key)
            return
              if (fn:exists($m)) then
                map:entry($key, map:new((
                  map:entry("pluginModuleUri", map:get($m, "pluginModuleUri")),
                  map:entry("input", map:get($m, "input")),
                  map:entry("output", map:get($m, "output")),
                  map:entry("error", map:get($m, "error")),
                  map:entry("duration", map:get($m, "duration"))
                )))
              else ()
          ))
        ))
      else
        element trace {
          element format { map:get($current-trace, "format") },
          element traceId { map:get($current-trace, "traceId") },
          element created { map:get($current-trace, "created") },
          element identifier { map:get($current-trace, "identifier") },
          element flowType { map:get($current-trace, "flowType") },
          element hasError { trace:has-errors() },
          for $key in ("collectorPlugin", "contentPlugin", "headersPlugin", "triplesPlugin", "writerPlugin")
          let $m := map:get($current-trace, $key)
          return
            if (fn:exists($m)) then
              element { $key } {
                element pluginModuleUri { map:get($m, "pluginModuleUri") },
                element input { map:get($m, "input") },
                element output { map:get($m, "output") },
                element error { map:get($m, "error") },
                element duration { map:get($m, "duration") }
              }
            else ()
        }
    return
      xdmp:eval('
        xquery version "1.0-ml";

        declare option xdmp:mapping "false";

        declare variable $trace external;

        xdmp:document-insert(
          "/" || $trace/traceId,
          $trace,
          xdmp:default-permissions(),
          ("trace", $trace/*:type)
        )
      ',
      map:new((
        map:entry("trace", $trace)
      )),
      map:new((
        map:entry("database", xdmp:database($config:TRACING-DATABASE)),
        map:entry("transactionMode", "update-auto-commit")
      )))
  else ()
};

declare function trace:plugin-trace(
  $identifier,
  $module-uri,
  $plugin-type as xs:string,
  $flowType as xs:string,
  $input,
  $output,
  $duration as xs:dayTimeDuration)
{
  let $format :=
    let $o :=
      if ($input instance of document-node()) then
        $input/node()
      else
        $input
    return
      typeswitch($o)
        case element() return "xml"
        case object-node() return "json"
        case array-node() return "json"
        default return "xml"
  return
    map:put($current-trace, "format", $format),
  map:put($current-trace, "identifier", $identifier),
  map:put($current-trace, "flowType", $flowType),
  let $plugin-map := map:new((
    map:entry("pluginModuleUri", $module-uri),
    map:entry("input", $input),
    map:entry("output", $output),
    map:entry("duration", $duration)
  ))
  return
    map:put($current-trace, $plugin-type || "Plugin", $plugin-map)
};

declare function trace:error-trace(
  $identifier as xs:string?,
  $module-uri as xs:string,
  $plugin-type as xs:string,
  $flowType as xs:string,
  $input,
  $error as element(error:error),
  $duration as xs:dayTimeDuration)
{
  let $format :=
    let $o :=
      if ($input instance of document-node()) then
        $input/node()
      else
        $input
    return
      typeswitch($o)
        case element() return "xml"
        case object-node() return "json"
        case array-node() return "json"
        default return "xml"
  return
    map:put($current-trace, "format", $format),
  map:put($current-trace, "identifier", $identifier),
  map:put($current-trace, "flowType", $flowType),
  map:put($current-trace-settings, "_has_errors", fn:true()),
  let $plugin-map := map:new((
    map:entry("pluginModuleUri", $module-uri),
    map:entry("input", $input),
    map:entry("error", $error),
    map:entry("duration", $duration)
  ))
  let $_ := map:put($current-trace, $plugin-type || "Plugin", $plugin-map)
  let $_ := trace:write-trace()
  return ()
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
            map:put($oo, fn:local-name($x), xdmp:quote($x, $quote-options))
        return
          map:put($o, "input", $oo)
      case element(output) return
        map:put($o, fn:local-name($n), xdmp:quote($n/node(), $quote-options))
      case element(error) return
        map:put($o, fn:local-name($n), xdmp:quote($n/node(), $quote-options))
      case element(duration) return
        map:put($o, "duration", fn:seconds-from-duration(xs:dayTimeDuration($n)))
      case element(hasError) return
        map:put($o, "hasError", xs:boolean($n))
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

declare function trace:trace-to-json($trace)
{
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
};

declare function trace:trace-to-json-slim($trace)
{
  let $o := json:object()
  let $_ := (
    map:put($o, "traceId", $trace/traceId/string()),
    map:put($o, "created", $trace/created/string()),
    map:put($o, "hasError", $trace/hasError/xs:boolean(.)),
    map:put($o, "identifier", $trace/identifier/string()),
    map:put($o, "flowType", $trace/flowType/string()),
    map:put($o, "format", $trace/format/string())
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
        <element ns="" name="created"/>
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
    for $trace in cts:search(/trace, cts:true-query(), ("unfiltered", cts:index-order(cts:element-reference(xs:QName("created")), "descending")))[$start to $end]
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
      cts:element-range-query(xs:QName("traceId"), "=", $id, ("collation=http://marklogic.com/collation/codepoint")),
      cts:json-property-range-query("traceId", "=", $id, ("collation=http://marklogic.com/collation/codepoint"))
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
    cts:element-value-co-occurrences(
      xs:QName("traceId"),
      xs:QName("identifier"),
      (
        "limit=10",
        "collation=http://marklogic.com/collation/codepoint"
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
