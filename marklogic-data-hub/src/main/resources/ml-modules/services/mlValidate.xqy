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

module namespace service = "http://marklogic.com/rest-api/resource/mlValidate";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/data-hub/4/impl/consts.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/data-hub/4/impl/debug-lib.xqy";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/data-hub/4/impl/flow-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/data-hub/4/impl/perflog-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare namespace rapi = "http://marklogic.com/rest-api";

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
  debug:dump-env(),
  perf:log('/v1/resources/validate:get', function() {
    xdmp:set-response-content-type("application/json"),
    document {
      xdmp:to-json(flow:validate-entities())
    }
  })
};

declare %rapi:transaction-mode("update") function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  debug:dump-env(),

  perf:log('/v1/resources/validate:post', function() {
    let $entity-name := map:get($params, "entity")
    let $flow-name := map:get($params, "flow")
    let $plugin-name := map:get($params, "plugin")
    let $type := map:get($params, "type")
    let $ns := flow:get-module-ns($type)
    let $extension :=
      if ($type eq $consts:XQUERY) then ".xqy"
      else ".sjs"
    let $module-uri := "/_validate-hub-module/" || $entity-name || "/" || $flow-name || "/" || $plugin-name || $extension
    let $_ := try {
      xdmp:eval('declare variable $module-uri external; declare variable $content external; xdmp:document-insert($module-uri, $content)',
        map:new((
          map:entry("module-uri", $module-uri),
          map:entry("content", $input)
        )),
        map:new((map:entry("database", xdmp:modules-database())))
      )
    }
    catch($ex) {
      $ex
    }
    let $errors := json:object()
    let $_ :=
      try {
        if ($type eq $consts:XQUERY) then
          xdmp:eval(
            'import module namespace x = "' || $ns || '" at "' || $module-uri || '"; ' ||
            '()',
            map:new((
              map:entry("staticCheck", fn:true())
            ))
          )
        else
          xdmp:javascript-eval(
            'var x = require("' || $module-uri || '");',
            map:new((
              map:entry("staticCheck", fn:true())
            ))
          )
      }
      catch($ex) {
        flow:make-error-json(
          $errors,
          $entity-name,
          $flow-name,
          $plugin-name,
          $ex)
      }
    return
      document {
        xdmp:to-json(
          map:new(
            map:entry("errors", $errors)
          )
        )
      }
  })
};
