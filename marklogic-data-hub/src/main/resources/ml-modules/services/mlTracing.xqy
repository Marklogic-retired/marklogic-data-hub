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

module namespace service = "http://marklogic.com/rest-api/resource/mlTracing";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/data-hub/4/impl/debug-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/data-hub/4/impl/trace-lib.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";

declare option xdmp:mapping "false";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  debug:dump-env(),

  document { trace:enabled() }
};

declare %rapi:transaction-mode("update") function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  debug:dump-env(),

  let $enable := map:get($params, "enable") = ("true", "yes")
  let $_ := trace:enable-tracing($enable)
  return
    document { () }
};
