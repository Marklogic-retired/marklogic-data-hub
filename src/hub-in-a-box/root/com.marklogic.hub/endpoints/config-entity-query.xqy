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

import module namespace entity = "http://marklogic.com/hub-in-a-box/entity-lib"
  at "/com.marklogic.hub/lib/entity-lib.xqy";

import module namespace debug = "http://marklogic.com/hub-in-a-box/debug-lib"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

declare option xdmp:mapping "false";

debug:dump-env(),

let $entity-name := xdmp:get-request-field("entity-name", ())
let $method := xdmp:get-request-method()
return
  switch ($method)
    (: Gets the entity definition if it exists :)
    case "GET" return
      let $def := entity:get-entity-def($entity-name)
      return
        if (fn:exists($def)) then
          $def
        else
          xdmp:set-response-code(404,"Not Found")
    default return
      fn:error((),"HUB-INVALIDREQ", ("unsupported method " || $method, $entity-name))

