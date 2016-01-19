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

module namespace service = "http://marklogic.com/rest-api/resource/transformer";

import module namespace transformer = "http://marklogic.com/hub-in-a-box/transformer-lib"
  at "/com.marklogic.hub/lib/transformer-lib.xqy";

import module namespace flow = "http://marklogic.com/hub-in-a-box/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

declare option xdmp:mapping "false";

declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  let $options := $input/node()
  let $func := transformer:get-transformer-func(map:get($params, "name"))
  let $uri := map:get($params, "id")
  let $doc := fn:doc($uri)
  let $resp := transformer:run-transformer($func, $uri, $doc, $options)
  let $doc := map:get($resp, "value")
  return
    if ($doc instance of document-node()) then
      $doc
    else
      document { $doc }
};

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $flow-name := map:get($params, "flow-name")
  let $flow := flow:get-runnable-flow($flow-name)
  let $resp :=
    if ($flow) then
      transformer:run-from-flow($flow, map:get($params, "id"), ())
    else
      fn:error(xs:QName("FLOW_NOT_FOUND"), "flow not found", $flow-name)
  let $doc := map:get($resp, "value")
  return
    if ($doc instance of document-node()) then
      $doc
    else
      document { $doc }
};
