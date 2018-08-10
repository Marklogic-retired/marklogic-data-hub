(:
  Copyright 2012-2018 MarkLogic Corporation

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

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/MarkLogic/data-hub-framework/impl/hub-utils-lib.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/MarkLogic/data-hub-framework/impl/debug-lib.xqy";

declare option xdmp:mapping "false";

debug:dump-env(),
hul:run-in-modules(function() {
  xdmp:document-get("./Modules/MarkLogic/data-hub-framework/tracing/dist" || xdmp:get-request-field("uri"))
})
