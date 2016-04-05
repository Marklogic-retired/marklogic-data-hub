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

declare namespace hub = "http://marklogic.com/data-hub";

declare option xdmp:mapping "false";

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

(:~
 : returns a list of file extensions for executable modules
 :
 : @return - extensions (xqy,xqy,sjs,...)
 :)
declare function hul:get-exe-extensions() as xs:string+
{
  let $config := admin:get-configuration()
  let $names := ("application/vnd.marklogic-xdmp", "application/vnd.marklogic-javascript", "application/xslt+xml")
  return
    admin:mimetypes-get($config)[*:name = $names]/*:extensions/fn:tokenize(fn:string(.), " ")
};

declare function hul:get-xqy-extensions() as xs:string*
{
  let $config := admin:get-configuration()
  let $names := "application/vnd.marklogic-xdmp"
  return
    admin:mimetypes-get($config)[*:name = $names]/*:extensions/fn:tokenize(fn:string(.), " ")
};

declare function hul:get-sjs-extensions() as xs:string*
{
  let $config := admin:get-configuration()
  let $names := "application/vnd.marklogic-javascript"
  return
    admin:mimetypes-get($config)[*:name = $names]/*:extensions/fn:tokenize(fn:string(.), " ")
};

declare function hul:get-xslt-extensions() as xs:string*
{
  let $config := admin:get-configuration()
  let $names := "application/xslt+xml"
  return
    admin:mimetypes-get($config)[*:name = $names]/*:extensions/fn:tokenize(fn:string(.), " ")
};

declare function hul:get-file-from-uri($uri)
{
  cvt:basename($uri)
};

declare function hul:get-file-extension($filename as xs:string)
{
  fn:replace($filename, ".*\.([^\.]+)$", "$1")
};
