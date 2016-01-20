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

module namespace envelope = "http://marklogic.com/hub-in-a-box/transformers/envelope";

import module namespace debug = "http://marklogic.com/hub-in-a-box/debug-lib"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

import module namespace flow = "http://marklogic.com/hub-in-a-box/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

import module namespace ex = "http://marklogic.com/hub-in-a-box/extractor-lib"
  at "/com.marklogic.hub/lib/extractor-lib.xqy";

declare namespace hub = "http://marklogic.com/hub-in-a-box";

declare option xdmp:mapping "false";

(:
  $content  Data about the original input document. The map contains the following keys:
    uri - The URI of the document being inserted into the database.
    value - The contents of the input document, as a document node, binary node, or text node.

  $context  Additional context information about the insertion, such as tranformation-specific parameter values. The map contains the following keys:
    transform_param - The value passed by the client through the -transorm_param option, if any. Your function is responsible for parsing and validation.

  Your function should produce a map:map for each document to insert. The map:map for each output
  document must use the same keys as the $content map. You can modify the URI and document
  contents (the values associated with uri and value).
:)
declare function envelope:transform(
  $content as map:map,
  $context as map:map)
as map:map*
{
  let $doc := map:get($content, "value")
  let $namespaces := map:get($context, "namespaces")
  let $headers :=
    for $e in map:get($context, "options")/extractors
    let $dst as xs:string := $e/dst
    return
      element { fn:QName("http://marklogic.com/hub-in-a-box/envelope", $dst) } {
        ex:run-extractor($e, $doc, $namespaces)
      }
  let $envelope :=
    <envelope xmlns="http://marklogic.com/hub-in-a-box/envelope">
      <header>{$headers}</header>
      {
        (: TODO: put triples here :)
        (: <rdf></rdf> :)
      }
      <original>
      {
        (:
         : TODO: allow end user to transform the document before
         : putting it here
         :)
        $doc
      }
      </original>
    </envelope>
  let $_ :=
    if (debug:on()) then debug:log(("envelope", $envelope))
    else ()
  let $_ := map:put($content, "value", $envelope)
  return
    $content
};
