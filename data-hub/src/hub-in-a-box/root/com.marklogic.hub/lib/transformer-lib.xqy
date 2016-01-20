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

module namespace t = "http://marklogic.com/hub-in-a-box/transformer-lib";

import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

declare option xdmp:mapping "false";

declare function t:get-transformer-func(
  $name as xs:string) as xdmp:function
{
  t:get-transformer-func($name, (), ())
};

declare function t:get-transformer-func(
  $name as xs:string,
  $ns as xs:string?) as xdmp:function
{
  t:get-transformer-func($name, $ns, ())
};

declare function t:get-transformer-func(
  $name as xs:string,
  $ns as xs:string?,
  $function as xs:string?) as xdmp:function
{
  let $module-path as xs:string := hul:resolve-transformer($name)
  let $namespace as xs:string :=
    if (fn:exists($ns)) then $ns
    else
      hul:get-module-namespace($module-path)
  let $function as xs:string := ($function, "transform")[1]
  return
    xdmp:function(fn:QName($namespace, $function), $module-path)
};

declare function t:run-transformer(
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

declare function t:run-from-flow(
  $flow as object-node(),
  $identifier as xs:string,
  $input as node()?) as map:map
{
  let $input :=
    if ($input) then
      $input
    else
      fn:doc($identifier)
  let $_sanity_checks :=
    if (fn:not(fn:exists($flow/transformers))) then
      fn:error(xs:QName("MISSING-TRANSFORMER-DEFINITIONS"))
    else ()
  let $_ :=
    for $transformer in $flow/transformers
    let $content := map:new((
      map:entry("uri", $identifier),
      map:entry("value", $input)
    ))
    let $context := map:new((
      if ($flow/namespaces) then
        map:entry("namespaces", $flow/namespaces)
      else (),
      map:entry("options", $transformer/options)
    ))
    let $func := t:get-transformer-func($transformer/module, $transformer/ns, $transformer/function)
    let $resp := xdmp:apply($func, $content, $context)
    return
      xdmp:set($input, $resp)
  return
    $input
};
