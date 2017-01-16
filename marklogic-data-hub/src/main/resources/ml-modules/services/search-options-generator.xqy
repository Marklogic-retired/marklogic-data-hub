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

module namespace service = "http://marklogic.com/rest-api/resource/search-options-generator";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

import module namespace hent = "http://marklogic.com/data-hub/hub-entities"
  at "/com.marklogic.hub/lib/hub-entities.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

declare option xdmp:mapping "false";

declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  debug:dump-env(),

  perf:log('/v1/resources/validate:get', function() {
    document {
      hent:dump-search-options($input)
    }
  })
};
