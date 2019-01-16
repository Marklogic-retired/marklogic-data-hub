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

module namespace perf = "http://marklogic.com/data-hub/perflog-lib";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/data-hub/4/impl/debug-lib.xqy";

declare function perf:log($what, $func)
{
  if (debug:on()) then
    let $before := xdmp:elapsed-time()
    let $resp := $func()
    let $time := xdmp:elapsed-time() - $before
    let $_ := debug:log("PERFORMANCE: " || $what || " took " || $time )
    return
      $resp
  else
    $func()
};
