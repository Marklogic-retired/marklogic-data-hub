(:
  Copyright 2012-2018 MarkLogic Corporation

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

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/MarkLogic/data-hub-framework/lib/consts.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/MarkLogic/data-hub-framework/lib/debug-lib.xqy";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/MarkLogic/data-hub-framework/lib/flow-lib.xqy";

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
  at "/MarkLogic/rest-api/endpoints/parameters.xqy";

declare option xdmp:mapping "false";

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

debug:dump-env(),

perf:log('/v1/resources/collector:post', function() {
  let $params := map:new()
    =>parameters:query-parameter("job-id",false(),false())
    =>parameters:query-parameter("entity-name",true(),true())
    =>parameters:query-parameter("flow-name",true(),false())
    =>parameters:query-parameter("options",false(),false())

  let $job-id := map:get($params, "job-id")
  let $job-id :=
    if (fn:exists($job-id)) then
      $job-id
    else
      sem:uuid-string()
  let $entity-name  := map:get($params, "entity-name")
  let $flow-name  := map:get($params, "flow-name")
  let $options  := map:get($params, "options")
  let $options as map:map := (
      $options ! xdmp:unquote(.)/object-node(),
      map:map()
    )[1]
  let $flow := flow:get-flow($entity-name, $flow-name, $consts:HARMONIZE_FLOW)
  let $_ :=
    if (fn:exists($flow)) then ()
    else
      fn:error(xs:QName("MISSING_FLOW"), "Missing Harmonize Flow: [" || $entity-name || " => " || $flow-name || "]")
  let $resp := flow:run-collector($flow, $job-id, $options)
  let $resp :=
    if ($resp instance of json:array) then
      json:array-values($resp)
    else
      $resp
  return
    $resp
})
