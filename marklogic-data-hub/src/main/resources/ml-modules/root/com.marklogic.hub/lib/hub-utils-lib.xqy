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

module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib";

import module namespace admin = "http://marklogic.com/xdmp/admin"
  at "/MarkLogic/admin.xqy";

import module namespace cvt = "http://marklogic.com/cpf/convert"
      at "/MarkLogic/conversion/convert.xqy";

declare namespace mt = "http://marklogic.com/xdmp/mimetypes";

declare namespace hub = "http://marklogic.com/data-hub";

declare option xdmp:mapping "false";

declare variable $_cache := map:map();
(:~
 : determine if a module exists or not
 :
 : @param $uri - the uri of the module to check
 : @return - true if exists, false otherwise
 :)
declare function hul:module-exists($uri) as xs:boolean
{
  hul:run-in-modules(function() {
    fn:doc-available($uri)
  })
};

declare function hul:run-in-modules($func as function() as item()*)
{
  xdmp:invoke-function($func,
    <options xmlns="xdmp:eval">
      <database>{xdmp:modules-database()}</database>
    </options>)
};

declare function hul:from-map-cache($name, $func)
{
  if (map:contains($_cache, $name)) then
    map:get($_cache, $name)
  else
    let $value := $func()
    let $_ := map:put($_cache, $name, $value)
    return
      $value
};

declare function hul:from-field-cache($name, $func)
{
  hul:from-field-cache($name, $func, ())
};

declare function hul:set-field-cache($name, $value, $duration as xs:dayTimeDuration?)
{
  (
    if (fn:exists($duration)) then (
      let $_ := xdmp:set-server-field($name || "-refresh-date", fn:current-dateTime() + $duration)
      return
        xdmp:set-server-field($name, $value)
    )
    else
      xdmp:set-server-field($name, $value)
  )[1]
};

declare function hul:invalidate-field-cache($name)
{
  xdmp:set-server-field($name, ()),
  xdmp:set-server-field($name || "-refresh-date", ())
};

declare function hul:from-field-cache($name, $func, $duration as xs:dayTimeDuration?)
{
  let $existing := xdmp:get-server-field($name)
  let $refresh-date := xdmp:get-server-field($name || "-refresh-date")
  return
    if (fn:exists($existing)) then
      if (fn:exists($refresh-date) and ($refresh-date < fn:current-dateTime())) then
        hul:set-field-cache($name, $func(), $duration)
      else
        $existing[1]
    else
      if (fn:exists($duration)) then
        hul:set-field-cache($name, $func(), $duration)
      else
        hul:set-field-cache($name, $func(), $duration)
};

(:~
 : returns a list of file extensions for executable modules
 :
 : @return - extensions (xqy,xqy,sjs,...)
 :)
declare function hul:get-exe-extensions() as xs:string+
{
  hul:from-field-cache("exe-extensions", function() {
    let $config := admin:get-configuration()
    let $names := ("application/vnd.marklogic-xdmp", "application/vnd.marklogic-javascript", "application/xslt+xml")
    return
      admin:mimetypes-get($config)[mt:name = $names]/*:extensions/fn:tokenize(fn:string(.), " ")
  })
};

declare function hul:get-xqy-extensions() as xs:string*
{
  hul:from-field-cache("xqy-extensions", function() {
    let $config := admin:get-configuration()
    let $names := "application/vnd.marklogic-xdmp"
    return
      admin:mimetypes-get($config)[mt:name = $names]/*:extensions/fn:tokenize(fn:string(.), " ")
  })
};

declare function hul:get-sjs-extensions() as xs:string*
{
  hul:from-field-cache("sjs-extensions", function() {
    let $config := admin:get-configuration()
    let $names := "application/vnd.marklogic-javascript"
    return
      admin:mimetypes-get($config)[mt:name = $names]/*:extensions/fn:tokenize(fn:string(.), " ")
  })
};

declare function hul:get-xslt-extensions() as xs:string*
{
  hul:from-field-cache("xslt-extensions", function() {
    let $config := admin:get-configuration()
    let $names := "application/xslt+xml"
    return
      admin:mimetypes-get($config)[mt:name = $names]/*:extensions/fn:tokenize(fn:string(.), " ")
  })
};

declare function hul:get-file-from-uri($uri) as xs:string
{
  cvt:basename($uri)
};

declare function hul:get-file-extension($filename as xs:string)
{
  fn:replace($filename, ".*\.([^\.]+)$", "$1")
};

declare function hul:get-file-name($filename as xs:string)
{
  fn:replace($filename, "(.*)\.[^\.]+$", "$1")
};

declare function hul:is-ml-8() as xs:boolean
{
  fn:starts-with(xdmp:version(), "8")
};
