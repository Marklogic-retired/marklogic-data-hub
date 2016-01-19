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

module namespace collector = "http://marklogic.com/hub-in-a-box/collector-lib";

import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

declare variable $COLLECTOR-NS := "http://marklogic.com/hub-in-a-box/collectors/";

declare option xdmp:mapping "false";

(:declare function collector:run-collector(
  $flow as object-node()) as map:map
{
  let $collector := $flow/collector
  let $name as xs:string := hul:resolve-collector($collector/name)
  return
    collector:run-collector($name, $collector/options)
};:)

declare function collector:run-collector(
  $module-name as xs:string,
  $start as xs:int,
  $limit as xs:int,
  $options as object-node()?) as xs:string*
{
  let $ns := $COLLECTOR-NS || fn:lower-case($module-name)
  let $module-path as xs:string := hul:resolve-collector($module-name)
  let $func := xdmp:function(fn:QName($ns, "collect"), $module-path)
  return
    xdmp:apply($func, $start, $limit, $options)
};

declare function collector:get-estimate(
  $module-name as xs:string,
  $options as object-node()?) as xs:int
{
  let $ns := $COLLECTOR-NS || fn:lower-case($module-name)
  let $module-path as xs:string := hul:resolve-collector($module-name)
  let $func := xdmp:function(fn:QName($ns, "get-estimate"), $module-path)
  return
    xdmp:apply($func, $options)
};
