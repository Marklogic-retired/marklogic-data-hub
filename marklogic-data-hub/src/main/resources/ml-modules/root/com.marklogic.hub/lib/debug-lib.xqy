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

declare option xdmp:mapping "false";

declare function debug:enable($enable as xs:boolean)
{
  xdmp:document-insert(
    "/com.marklogic.hub/__debug_enabled__.xml",
    element debug:is-debugging-enabled { if ($enable) then 1 else 0 })
};

(:~
 : Determines whether debugging is on or not
 :
 : @return - boolean: on or off
 :)
declare function debug:on() as xs:boolean
{
  let $value := cts:element-values(xs:QName("debug:is-debugging-enabled"), (), ("type=unsignedInt","limit=1"))
  return
    if ($value) then
      $value eq 1
    else
      fn:false()

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
  let $request-path := xdmp:get-request-path()
  let $request-path :=
    if ($request-path = '/MarkLogic/rest-api/endpoints/resource-service-query.xqy') then
      let $params := fn:string-join(
        for $f in xdmp:get-request-field-names()[fn:starts-with(., "rs:")]
        return
          $f || "=" || xdmp:get-request-field($f),
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
      for $p in xdmp:get-request-field-names()
      return
        "    " || $p || " => " || xdmp:get-request-field($p),
      let $body := xdmp:get-request-body()
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
