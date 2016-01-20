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

module namespace p = "http://marklogic.com/hub-in-a-box/persister-lib";

import module namespace cvt = "http://marklogic.com/cpf/convert"
      at "/MarkLogic/conversion/convert.xqy";

import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

declare option xdmp:mapping "false";

declare function p:get-persister-func(
  $name as xs:string) as xdmp:function
{
  p:get-persister-func($name, (), ())
};

declare function p:get-persister-func(
  $name as xs:string,
  $ns as xs:string?) as xdmp:function
{
  p:get-persister-func($name, $ns, ())
};

declare function p:get-persister-func(
  $name as xs:string,
  $ns as xs:string?,
  $function as xs:string?) as xdmp:function
{
  let $module-path as xs:string := hul:resolve-persister($name)
  let $namespace as xs:string :=
    if (fn:exists($ns)) then $ns
    else
      hul:get-module-namespace($module-path)
  let $function as xs:string := ($function, "persist")[1]
  return
    xdmp:function(fn:QName($namespace, $function), $module-path)
};

declare function p:run-persister(
  $func as xdmp:function,
  $identifier as xs:string,
  $input as node(),
  $options as object-node()?)
{
  let $content := map:new((
    map:entry("uri", $identifier),
    map:entry("value", $input)
  ))
  let $context := map:new((
    if ($options/namespaces) then
      map:entry("namespaces", $options/namespaces)
    else (),
    map:entry("options", $options)
  ))
  return
    $func($content, $context)
};

declare function p:run-from-flow(
  $flow as object-node(),
  $identifier as xs:string,
  $input as node()?)
{
  for $persister in $flow/persisters
  let $func := p:get-persister-func($persister/module, $persister/ns, $persister/function)
  let $options :=
    let $out-dir := ($persister/options/outputDir, "/canonical/")[1]
    return
      object-node {
        "uri": $out-dir || cvt:basename($identifier)
      }
  return
    xdmp:invoke-function(function() {
      $func($input, $options)
    },
    map:new((
      map:entry("transactionMode", "update-auto-commit")
    )))

};
