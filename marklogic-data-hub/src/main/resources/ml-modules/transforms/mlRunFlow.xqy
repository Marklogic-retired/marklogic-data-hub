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

module namespace runFlow = "http://marklogic.com/rest-api/transform/mlRunFlow";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/data-hub/4/impl/consts.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/data-hub/4/impl/debug-lib.xqy";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/data-hub/4/impl/flow-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/data-hub/4/impl/trace-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/data-hub/4/impl/perflog-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare namespace rapi = "http://marklogic.com/rest-api";

declare %rapi:transaction-mode("query") function runFlow:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  debug:dump-env("run-flow:transform"),

  perf:log('/transforms/run-flow:transform', function() {
    let $job-id := (map:get($params, "job-id"), sem:uuid-string())[1]
    let $entity-name := map:get($params, 'entity-name')
    let $flow-name := map:get($params, 'flow-name')
    let $uri := map:get($context, 'uri')
    let $flow := flow:get-flow($entity-name, $flow-name, $consts:INPUT_FLOW)
    let $_ :=
      if ($flow) then ()
      else
        fn:error((),"RESTAPI-SRVEXERR", ("404","MISSING_FLOW", "The specified flow " || $entity-name || ":" || $flow-name || " is missing."))

    (: configure the options :)
    let $options as map:map := (
      map:get($params, "options") ! xdmp:unquote(.)/object-node(),
      map:map()
    )[1]
    let $_ := flow:set-default-options($options, $flow)

    let $mainFunc := flow:get-main($flow/hub:main)
    (: this can throw, but we want the REST API to know about problems, so let it :)
    let $envelope := flow:run-flow(
      $job-id, $flow, $uri, $content, $options, $mainFunc
    )

    (: write the trace for the current identifier :)
    let $item-context := map:get($flow:context-queue, $uri)
    let $_ := trace:write-trace($item-context)
    return
      document { $envelope }
  })
};
