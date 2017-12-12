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

module namespace debug = "http://marklogic.com/data-hub/debug";

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

declare option xdmp:mapping "false";

declare function debug:enable($enabled as xs:boolean)
{
  xdmp:eval('
    declare namespace debug = "http://marklogic.com/data-hub/debug";
    declare variable $enabled external;

    xdmp:document-insert(
      "/com.marklogic.hub/settings/__debug_enabled__.xml",
      element debug:is-debugging-enabled { if ($enabled) then 1 else 0 },
      xdmp:default-permissions(),
      "hub-core-module")
    ',
    map:new((map:entry("enabled", $enabled))),
    map:new(map:entry("database", xdmp:modules-database()))
  ),
  hul:invalidate-field-cache("debugging-enabled")
};

(:~
 : Determines whether debugging is on or not
 :
 : @return - boolean: on or off
 :)
declare function debug:on() as xs:boolean
{
  let $key := "debugging-enabled"
  let $flag :=  hul:from-field-cache-or-empty($key, ())
  return
    if (exists($flag)) then
      $flag
    else
      hul:set-field-cache(
        $key,
        xdmp:eval('
          declare namespace debug = "http://marklogic.com/data-hub/debug";
          fn:exists(
            cts:search(
              fn:doc("/com.marklogic.hub/settings/__debug_enabled__.xml"),
              cts:element-value-query(xs:QName("debug:is-debugging-enabled"), "1", ("exact")),
              ("unfiltered", "score-zero", "unchecked", "unfaceted")
            )
          )
        ',(), map:new(map:entry("database", xdmp:modules-database()))),
        ()
      )

  (:    
  hul:from-field-cache("debugging-enabled", function() {
    xdmp:eval('
      declare namespace debug = "http://marklogic.com/data-hub/debug";
      fn:exists(
        cts:search(
          fn:doc("/com.marklogic.hub/settings/__debug_enabled__.xml"),
          cts:element-value-query(xs:QName("debug:is-debugging-enabled"), "1", ("exact")),
          ("unfiltered", "score-zero", "unchecked", "unfaceted")
        )
      )
    ',(), map:new(map:entry("database", xdmp:modules-database())))
  },
  xs:dayTimeDuration("PT1M"))
  :)
};

(:~
 : Logs if debugging is on
 :
 : @param $items - the stuff to log
 :)
declare function debug:log($items)
{
  if (debug:on()) then
    xdmp:log($items)
  else
    ()
};

(:~
 : Dumps the request environment. Useful for debugging
 :)
declare function debug:dump-env()
{
  debug:dump-env(())
};

declare function debug:dump-env($name as xs:string?)
{
  if (debug:on()) then
    let $request-path := xdmp:get-request-path()
    let $request-path :=
      if ($request-path = '/MarkLogic/rest-api/endpoints/resource-service-query.xqy') then
        let $params := fn:string-join(
          for $f in xdmp:get-request-field-names()[fn:starts-with(., "rs:")]
          let $value := xdmp:get-request-field($f)
          return
            $f || "=" || fn:string-join($value, ", "),
        "&amp;")
        return
          "/v1/resources/" || xdmp:get-request-field("name") || "?" || $params
      else
        $request-path
    return
      debug:log((
        "",
        "",
        "################################################################",
        "REQUEST DETAILS:",
        "",
        if ($name) then
          (
            "  **" || $name || "**",
            ""
          )
        else (),
        "  [" || xdmp:get-request-method() || "]  " || $request-path,
        "",
        "  [Headers]",
        for $h in xdmp:get-request-header-names()
        return
          "    " || $h || " => " || xdmp:get-request-header($h),
        "",
        "  [Request Params]",
        for $p in xdmp:get-request-field-names()[fn:not(fn:starts-with(., "rs:"))]
        return
          "    " || $p || " => " || fn:string-join(xdmp:get-request-field($p), ", "),
        let $body :=
          try {
            xdmp:get-request-body()
          }
          catch($ex) {()}
        return
          if (fn:exists($body)) then
          (
            "",
            "  [Body]",
            "  " || xdmp:describe($body, (), ())
          )
          else (),
        "",
        "################################################################",
        "",
        "",
        ""
      ))
  else ()
};

declare function debug:dump-map($m as map:map)
{
  debug:dump-map($m, ())
};

declare function debug:dump-map($m as map:map, $prefix)
{
  for $key in map:keys($m)
  return
    $prefix || $key || " => " || map:get($m, $key)
};
