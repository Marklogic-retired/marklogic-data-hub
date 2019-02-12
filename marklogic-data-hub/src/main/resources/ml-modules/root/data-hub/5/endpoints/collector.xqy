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

import module namespace parameters = "http://marklogic.com/rest-api/endpoints/parameters"
  at "/MarkLogic/rest-api/endpoints/parameters.xqy";

declare option xdmp:mapping "false";

xdmp:security-assert("http://marklogic.com/xdmp/privileges/rest-reader", "execute"),

let $params := map:new()

  =>parameters:query-parameter("flow-name",true(),false())
  =>parameters:query-parameter("step",true(),false())
  =>parameters:query-parameter("database",true(),false())

let $flow-name := map:get($params, "flow-name")
let $step := map:get($params, "step")
let $db :=   map:get($params, "database")
let $job-id := sem:uuid-string()

let $flow-doc := fn:doc(fn:concat("/flows/", $flow-name, ".flow.json"))
let $_ :=
  if (fn:exists($flow-doc)) then ()
  else
    fn:error((),"RESTAPI-SRVEXERR", (404, "Not Found", "The requested flow was not found"))
let $query :=   $flow-doc/node()/Steps[$step]/identifier
let $resp := xdmp:eval($query,
(),
<options xmlns="xdmp:eval">
  <database>{xdmp:database($db)}</database>
</options>)

return ($job-id, $resp)

