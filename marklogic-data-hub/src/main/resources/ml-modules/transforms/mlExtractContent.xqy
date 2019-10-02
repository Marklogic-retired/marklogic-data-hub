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

module namespace transform = "http://marklogic.com/rest-api/transform/mlExtractContent";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/data-hub/4/impl/perflog-lib.xqy";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare function transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  perf:log('/transforms/get-content:transform', function() {
    document {
      if ($content/envelope:envelope) then
      (
        map:put($context, "output-type", "application/xml"),
        $content/envelope:envelope/envelope:content/node()
      )
      else
      (
        map:put($context, "output-type", "application/json"),
        $content/content
      )
    }
  })
};
