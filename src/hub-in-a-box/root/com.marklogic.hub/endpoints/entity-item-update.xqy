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

declare option xdmp:mapping "false";

let $entity-name := xdmp:get-request-field("entity-name", ())
let $entity-id := xdmp:get-request-field("entity-id", ())
let $method := xdmp:get-request-method()
return
  switch ($method)
    case "PUT" return
      entity:put($entity-name, $entity-id)
    case "POST" return
      entity:post($entity-name, $entity-id)
    case "DELETE" return
      entity:delete($entity-name, $entity-id)
    default return
      fn:error((),"HUB-INVALIDREQ", ("unsupported method " || $method, $entity-name))
