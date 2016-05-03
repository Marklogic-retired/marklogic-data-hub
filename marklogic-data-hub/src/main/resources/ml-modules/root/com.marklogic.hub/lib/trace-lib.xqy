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
  map:entry("trace-id", xdmp:random()),
  map:entry("created", fn:current-dateTime())
));

declare function trace:enable-tracing($enabled as xs:boolean)
{
  xdmp:document-insert(
    "/com.marklogic.hub/__tracing_enabled__.xml",
    element trace:is-tracing-enabled { if ($enabled) then 1 else 0 })
};

declare function trace:enabled() as xs:boolean
{
  let $value := cts:element-values(xs:QName("trace:is-tracing-enabled"), (), "limit=1")
  return
    if ($value) then
      $value eq 1
    else
      fn:false()
};

declare function trace:has-errors()
{
  map:get($current-trace-settings, "_has_errors") eq fn:true()
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
        xdmp:to-json($current-trace)
      else
        element trace {
          element trace-id { map:get($current-trace, "trace-id") },
          element created { map:get($current-trace, "created") },
          element identifier { map:get($current-trace, "identifier") },
          for $key in ("collector-plugin", "content-plugin", "headers-plugin", "triples-plugin", "writer-plugin")
          let $m := map:get($current-trace, $key)
          return
            if (fn:exists($m)) then
              element { $key } {
                element plugin-module-uri { map:get($m, "plugin-module-uri") },
                element input { map:get($m, "input") },
                element output { map:get($m, "output") },
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
          "/" || $trace/trace-id,
          $trace,
          xdmp:default-permissions(),
          ($trace/*:type)
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
  $flow-type as xs:string,
  $input,
  $output,
  $duration as xs:dayTimeDuration)
{
  map:put($current-trace, "identifier", $identifier),
  map:put($current-trace, "flow-type", $flow-type),
  let $plugin-map := map:new((
    map:entry("plugin-module-uri", $module-uri),
    map:entry("input", $input),
    map:entry("output", $output),
    map:entry("duration", $duration)
  ))
  return
    map:put($current-trace, $plugin-type || "-plugin", $plugin-map)
};

declare function trace:error-trace(
  $identifier as xs:string?,
  $module-uri as xs:string,
  $plugin-type as xs:string,
  $flow-type as xs:string,
  $input,
  $error as element(error:error),
  $duration as xs:dayTimeDuration)
{
  map:put($current-trace, "identifier", $identifier),
  map:put($current-trace, "flow-type", $flow-type),
  map:put($current-trace-settings, "_has_errors", fn:true()),
  let $plugin-map := map:new((
    map:entry("plugin-module-uri", $module-uri),
    map:entry("input", $input),
    map:entry("error", $error),
    map:entry("duration", $duration)
  ))
  let $_ := map:put($current-trace, $plugin-type || "-plugin", $plugin-map)
  let $_ := trace:write-trace()
  return ()
};

declare function trace:find-traces($q)
{
  let $query := search:parse($q)
  let $results := cts:element-values(xs:QName("trace-id"), (), (), $query)
  return
    json:to-array($results)
};

declare function trace:get-traces($page as xs:int, $page-count as xs:int)
{
  ()
};
