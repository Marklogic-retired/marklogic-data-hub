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

module namespace service = "http://marklogic.com/rest-api/resource/entity";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";

declare namespace hub = "http://marklogic.com/data-hub";

declare option xdmp:mapping "false";

(:~
 : Entry point for java to get entity(s).
 :
 : if the "entity-name" param is given then return a entity. Otherwise
 : return all entities.
 :
 :)
declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  debug:dump-env("GET ENTITY(s)"),

  perf:log('/v1/resources/entity:get', function() {
    document {
      let $entity-name := map:get($params, "entity-name")
      let $resp :=
        if ($entity-name) then
          flow:get-entity($entity-name)
        else
          flow:get-entities()
      return
       $resp
    }
  })
};
