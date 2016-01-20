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

module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib";

import module namespace admin = "http://marklogic.com/xdmp/admin"
  at "/MarkLogic/admin.xqy";

import module namespace options = "http://marklogic.com/hub-in-a-box/hub-options"
  at "/com.marklogic.hub/lib/hub-options.xqy";

declare namespace hub = "http://marklogic.com/hub-in-a-box";

declare option xdmp:mapping "false";

(:~
 : Lists all modules containing $type in the modules database
 :
 : @param $type - type of modules (collectors|transformers)
 : @return - a sequence of module uris
 :)
declare function hul:module-list($type) as xs:string*
{
  hul:run-in-modules(function() {
    cts:uri-match("*" || $type || "/*")
  })
};

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

declare function hul:get-module($uri)
{
  hul:run-in-modules(function() {
    fn:doc($uri)
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
 : resolves the module uri of a collector
 :
 : @param $collector - the name or uri of a collector
 : @return - the uri of the collector in the modules db
 :)
declare function hul:resolve-collector($collector as xs:string) as xs:string?
{
  hul:resolve-module($collector, "collector")
};

declare function hul:resolve-flow($flow as xs:string) as xs:string?
{
  hul:resolve-data($flow, "flow")
};

declare function hul:resolve-persister($persister as xs:string) as xs:string?
{
  hul:resolve-module($persister, "persister")
};

declare function hul:resolve-extractor($extractor as xs:string) as xs:string?
{
  hul:resolve-module($extractor, "extractor")
};

declare function hul:resolve-data(
  $module as xs:string,
  $type as xs:string) as xs:string?
{
  hul:resolve-modules-file($module, $type, ("xml", "json"))
};

declare function hul:resolve-module(
  $module as xs:string,
  $type as xs:string) as xs:string?
{
  hul:resolve-modules-file($module, $type, hul:get-exe-extensions())
};

(:~
 : resolves the module uri of a template
 :
 : @param $template - the name or uri of a template
 : @return - the uri of the template in the modules db
 :)
declare function hul:resolve-template($template as xs:string) as xs:string?
{
  hul:resolve-data($template, "template")
};

(:~
 : resolves the module uri of a transformer
 :
 : @param $transformer - the name or uri of a transformer
 : @return - the uri of the transformer in the modules db
 :)
declare function hul:resolve-transformer($transformer as xs:string) as xs:string?
{
  hul:resolve-module($transformer, "transformer")
};

declare function hul:resolve-modules-file(
  $module as xs:string,
  $type as xs:string,
  $extensions as xs:string+) as xs:string?
{
  let $module-uri :=
    if (fn:matches($module, "^.*\..+$")) then
      if (hul:module-exists($module)) then
        $module
      else if (hul:module-exists("/" || $type || "s/" || $module)) then
        "/" || $type || "s/" || $module
      else if (hul:module-exists(options:default-dir($type) || $module)) then
        options:default-dir($type) || $module
      else
        ()
    else
      let $module := $module || "\.(" || fn:string-join($extensions, "|") || ")"
      let $modules := hul:module-list($type || "s")
      return
        $modules[fn:matches(., $module)][1]
  return
    if ($module-uri) then $module-uri
    else
      fn:error(xs:QName("INVALID-" || fn:upper-case($type)), "Invalid " || $type || " " || $module, $module)
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

(:~
 : Determines the namespace of a given module
 :
 : @param $module-uri - the uri of a module
 : @return - the namespace of the given module
 :)
declare function hul:get-module-namespace($module-uri) as xs:string?
{
  try {
    xdmp:eval('import module "*" at "' || $module-uri || '";()')
  }
  catch($ex) {
    $ex/error:data/error:datum[2]
  }
};
