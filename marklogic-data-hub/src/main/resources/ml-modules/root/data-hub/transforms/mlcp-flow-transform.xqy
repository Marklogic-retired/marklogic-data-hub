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

module namespace mlcpDataHub = "DataHub";

(: This looks for the entire list of URIs in an MLCP batch :)
declare variable $urisInBatch as xs:string* :=
  for $requestField in xdmp:get-request-field-names()
  let $fieldValue := xdmp:get-request-field($requestField)
  where $fieldValue = "URI"
  return xdmp:get-request-field(fn:replace($requestField, "^evl", "evv"));

declare variable $urisToContent as map:map := map:map();

declare function transform($content, $context) {
  let $contentUri := $content => map:get("uri")
  let $_ := $urisToContent => map:put($contentUri, $content)
  (: Only call DH flow once per MLCP batch :)
  let $everyContentItemVisited := every $uri in $urisInBatch satisfies map:contains($urisToContent, $uri)
  where $everyContentItemVisited
  return
    let $output := xdmp:invoke("/data-hub/transforms/mlcp-flow-invoke.mjs", map:map() => map:with("urisToContent", $urisToContent) => map:with("context", $context))
    let $content := $output => map:get("content")
    let $newContext := $output => map:get("context")
    let $_setContext :=
      for $key in map:keys($newContext)
      return $context => map:put($key, $newContext => map:get($key))
    return $content
};