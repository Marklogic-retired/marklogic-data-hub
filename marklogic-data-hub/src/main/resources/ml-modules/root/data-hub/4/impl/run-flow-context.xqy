(:
  Copyright 2012-2019 MarkLogic Corporation

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

module namespace rfc = "http://marklogic.com/data-hub/run-flow-context";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/data-hub/4/impl/consts.xqy";

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/data-hub/4/impl/hub-utils-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare option xdmp:mapping "false";

(: the transaction global context for running a flow :)
declare variable $context := map:map();

declare variable $item-context := map:map();

declare function rfc:with-flow(
  $flow as element(hub:flow)
) as map:map
{
  map:put($context, "flow", $flow),
  map:put($context, "flow-type", fn:string($flow/hub:type)),
  map:put($context, "data-format", fn:string($flow/hub:data-format)),
  $context
};

declare function rfc:with-job-id(
  $job-id as xs:string)
{
  map:put($context, "job-id", $job-id),
  $context
};

declare function rfc:with-data-format(
  $data-format as xs:string) as map:map
{
  map:put($context, "data-format", $data-format),
  $context
};

declare function rfc:with-target-database(
  $target-database as xs:unsignedLong) as map:map
{
  map:put($context, "target-database", $target-database),
  $context
};

declare function rfc:with-module-uri(
  $module-uri as xs:string) as map:map
{
  map:put($context, "module-uri", $module-uri),
  $context
};

declare function rfc:with-code-format(
  $code-format as xs:string) as map:map
{
  map:put($context, "code-format", $code-format),
  $context
};


declare function rfc:new-item-context() as map:map
{
  xdmp:set($item-context, map:map()),
  $item-context
};

declare function rfc:with-id(
  $ic as map:map,
  $identifier as xs:string) as map:map
{
  map:put($ic, "identifier", $identifier),
  $ic
};

declare function rfc:with-content(
  $ic as map:map,
  $content as item()?) as map:map
{
  map:put($ic, "content", $content),
  $ic
};

declare function rfc:with-options(
  $ic as map:map,
  $options as map:map) as map:map
{
  map:put($ic, "options", $options),
  $ic
};

declare function rfc:with-trace(
  $ic as map:map,
  $trace as map:map) as map:map
{
  map:put($ic, "trace", $trace),
  $ic
};

declare function rfc:get-flow() as element(hub:flow)
{
  map:get($context, "flow")
};

declare function rfc:get-flow-name() as xs:string
{
  let $flow as element(hub:flow) := rfc:get-flow()
  return $flow/hub:name
};

declare function rfc:get-flow-type() as xs:string
{
  map:get($context, "flow-type")
};

declare function rfc:get-module-uri() as xs:string
{
  map:get($context, "module-uri")
};

declare function rfc:get-code-format() as xs:string
{
  map:get($context, "code-format")
};

declare function rfc:get-target-database() as xs:unsignedLong
{
  map:get($context, "target-database")
};

declare function rfc:get-data-format() as xs:string
{
  map:get($context, "data-format")
};

declare function rfc:is-json() as xs:boolean
{
  rfc:get-data-format() eq $consts:JSON
};

declare function rfc:get-job-id()
{
  map:get($context, "job-id")
};

declare function rfc:get-id(
  $ic as map:map) as xs:string?
{
  map:get($ic, "identifier")
};

declare function rfc:get-content(
$ic as map:map) as item()?
{
  map:get($ic, "content")
};

declare function rfc:get-options(
  $ic as map:map) as map:map
{
  map:get($ic, "options")
};

declare function rfc:get-trace(
  $ic as map:map)
{
  map:get($ic, "trace")
};

