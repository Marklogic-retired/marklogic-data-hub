(:
 Copyright (c) 2021 MarkLogic Corporation

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

module namespace service = "http://marklogic.com/rest-api/resource/mlSmMatch";

declare function get($context as map:map, $params as map:map) as document-node()? {
  post($context, $params, ())
};

declare function post($context as map:map, $params as map:map, $input as document-node()?) as document-node()? {
  xdmp:to-json(xdmp:invoke("/data-hub/5/mastering/matching/invokeMatchPreview.mjs",
    map:map()
      => map:with("params", $params)
      => map:with("input", $input)))
};

