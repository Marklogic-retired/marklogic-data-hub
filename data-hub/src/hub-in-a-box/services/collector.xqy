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

module namespace service = "http://marklogic.com/rest-api/resource/collector";

import module namespace collector = "http://marklogic.com/hub-in-a-box/collector-lib"
  at "/com.marklogic.hub/lib/collector-lib.xqy";

import module namespace debug = "http://marklogic.com/hub-in-a-box/debug-lib"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

import module namespace flow = "http://marklogic.com/hub-in-a-box/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

declare option xdmp:mapping "false";

(:~
 : Builds a JSON response common to get and post
 :)
declare function service:build-response($map as map:map)
  as document-node()
{
  let $items := map:get($map, "items")
  return
    json:to-array($items) ! xdmp:to-json(.)
};

(:
  Allows the client to send in the collector name and options.
  Useful for testing a collector without needing a flow
:)
declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  debug:dump-env(),
  let $options := $input/node()
  let $name := map:get($params, "name")
  let $method := map:get($params, "method")
  return
    if ($method = "estimate") then
      document {
        collector:get-estimate($name, $options)
      }
    else if($method = "collect") then
      let $start := map:get($params, "start") cast as xs:int
      let $limit := map:get($params, "limit") cast as xs:int
      return
        document {
          json:to-array(collector:run-collector($name, $start, $limit, $options)) ! xdmp:to-json(.)
        }

    else ()
};

(:(:
  Uses a flow definition to run a flow
:)
declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $flow-name := map:get($params, "flow-name")
  let $flow := flow:get-runnable-flow($flow-name)
  let $response := collector:run-collector($flow)
  return
    $response
    (:service:build-response($response):)
};:)
