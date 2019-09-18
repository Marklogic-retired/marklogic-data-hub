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

module namespace service = "http://marklogic.com/rest-api/resource/ml:flow";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/data-hub/4/impl/consts.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/data-hub/4/impl/debug-lib.xqy";

import module namespace err = "http://marklogic.com/data-hub/err"
  at "/data-hub/4/impl/error-lib.xqy";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/data-hub/4/impl/flow-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/data-hub/4/impl/perflog-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/data-hub/4/impl/trace-lib.xqy";

declare namespace error = "http://marklogic.com/xdmp/error";

declare namespace hub = "http://marklogic.com/data-hub";

declare option xdmp:mapping "false";

(:~
 : Entry point for java to get flow(s).
 :
 : if the "flow-name" param is given then return a flow. Otherwise
 : return all flows.
 :
 :)
declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  debug:dump-env("GET FLOW"),

  perf:log('/v1/resources/flow:get', function() {
    document {
      let $entity-name := map:get($params, "entity-name")
      let $flow-name := map:get($params, "flow-name")
      let $flow-type := map:get($params, "flow-type")
      let $resp :=
        if (fn:exists($flow-name)) then
          let $flow := flow:get-flow($entity-name, $flow-name, $flow-type)
          return
            if (fn:exists($flow)) then $flow
            else
              fn:error((),"RESTAPI-SRVEXERR", (404, "Not Found", "The requested flow was not found"))
        else
          flow:get-flows($entity-name)
      return
       $resp
    }
  })
};

(:~
 : Entry point for java to run a flow.
 :
 : The flow xml is provided in the request body
 :)
declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  debug:dump-env("RUN FLOW"),

  perf:log('/v1/resources/flow:post', function() {
    let $entity-name := map:get($params, "entity-name")
    let $flow-name := map:get($params, "flow-name")
    let $flow-type := $consts:HARMONIZE_FLOW
    let $job-id := (map:get($params, "job-id"), sem:uuid-string())[1]

    (: determine the database to insert into :)
    let $target-database :=
      if (fn:exists(map:get($params, "target-database"))) then
        xdmp:database(map:get($params, "target-database"))
      else
        xdmp:database($config:FINAL-DATABASE)
    let $identifiers := map:get($params, "identifiers")
    let $flow as element(hub:flow) := flow:get-flow($entity-name, $flow-name, $flow-type)

    (: add the default options from the flow :)
    let $options as map:map := (
      map:get($params, "options") ! xdmp:unquote(.)/object-node(),
      map:map()
    )[1]
    let $_ := (
      flow:set-default-options($options, $flow),
      map:put($options, "target-database", $target-database)
    )
    let $errors := json:array()
    return
      if (fn:exists($flow)) then
        let $_ :=
          let $mainFunc := flow:get-main($flow/hub:main)
          for $identifier in $identifiers
          return
            try {
              flow:run-flow($job-id, $flow, $identifier, $options, $mainFunc)
            }
            catch($ex) {
              xdmp:log(("error in run-flow:", $ex)),
              json:array-push($errors, $ex/err:error-to-json(.))
            }
        (: run writers :)
        let $before := xdmp:elapsed-time()
        let $_ :=
          try {
            flow:run-writers($identifiers)
          }
          catch($ex) {
            xdmp:log(("error in run-writers", $ex)),
            json:array-push($errors, $ex/err:error-to-json(.)),

            let $batch-error :=
              let $msg := $ex/error:message
              let $stack := $ex/error:stack
              return <error:error>{$ex/@*,
              $msg/preceding-sibling::*,
              <error:message>{fn:concat("BATCH-FAILED: ", $ex//error:message/fn:string())}</error:message>,
              $msg/following-sibling::* intersect $stack/preceding-sibling::*,
              <error:stack>{fn:concat("BATCH-FAILED: ", $ex//error:stack/fn:string())}</error:stack>,
              $stack/following-sibling::*}
              </error:error>

            for $identifier in $identifiers
            let $item-context := map:get($flow:context-queue, $identifier)
            let $datum := $ex//error:data/error:datum/fn:string()
            return if (fn:not($datum = $identifier))
            then trace:error-trace($item-context, $batch-error, xdmp:elapsed-time() - $before)
            else trace:error-trace($item-context, $ex, xdmp:elapsed-time() - $before)
          }
        let $output :=
          document {
            object-node {
              "totalCount": fn:count($identifiers),
              "errorCount": trace:get-error-count(),
              "completedItems": trace:get-completed-items(),
              "failedItems": trace:get-failed-items(),
              "errors": $errors
            }
          }
        let $is-plugin-error :=
          for $error in json:array-values($errors)
          where contains(xdmp:to-json($error)/code, "DATAHUB-PLUGIN-ERROR") or contains(xdmp:to-json($error)/formatString , "DATAHUB-PLUGIN-ERROR")
          return fn:true()
        let $resp :=
          if (trace:get-error-count() > 0 and $is-plugin-error) then
            fn:error((),"RESTAPI-SRVEXERR", (400, "Plugin error", text{$output}))
          else
            $output
        return
          $resp
      else
        fn:error((),"RESTAPI-SRVEXERR", (404, "Not Found", "The requested flow was not found"))
  })
};
