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

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

declare option xdmp:mapping "false";

declare variable $job-id external;
declare variable $module-uri external;
declare variable $options external;

debug:dump-env(),

perf:log('/v1/resources/collector:post', function() {
  let $options as map:map := (
      $options ! xdmp:unquote(.)/object-node(),
      map:map()
    )[1]
  let $resp := flow:run-collector($job-id, $module-uri, $options)
  let $resp :=
    if ($resp instance of json:array) then
      json:array-values($resp)
    else
      $resp
  return
    (fn:count($resp), $resp)
})
