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

module namespace dhf = "http://marklogic.com/dhf";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/com.marklogic.hub/lib/trace-lib.xqy";

declare option xdmp:mapping "false";

declare function dhf:run(
  $context as json:object,
  $func)
{
  let $label := map:get($context, "label")
  let $_ :=
    if (fn:exists($label)) then
      trace:set-plugin-label($label)
    else
      fn:error(xs:QName("CONTEXT_MISSING_LABEL"), "Your context object is missing a label")
  let $_ := trace:reset-plugin-input()
  let $_ :=
    let $inputs := map:get($context, "inputs")
    for $key in map:keys($inputs)
    return
      trace:set-plugin-input($key, map:get($inputs, $key))
  return
    flow:safe-run($func)
};

declare function dhf:make-envelope($content, $headers, $triples, $data-format)
  as document-node()
{
  flow:make-envelope($content, $headers, $triples, $data-format)
};

declare function dhf:run-writer(
  $writer-function,
  $id as xs:string+,
  $envelope as item(),
  $options as map:map)
{
  trace:set-plugin-label("writer"),
  trace:set-plugin-input("envelope", $envelope),
  flow:run-writer($writer-function, $id, $envelope, $options)
};

declare function dhf:context($label as xs:string) as json:object
{
  let $context := json:object()
  let $_ := map:put($context, "inputs", json:object())
  let $_ := dhf:set-trace-label($context, $label)
  return
    $context
};

declare function dhf:content-context() as json:object
{
  dhf:context("content")
};

declare function dhf:headers-context($content) as json:object
{
  let $context := dhf:context("headers")
  let $_ := dhf:add-trace-input($context, "content", $content)
  return
    $context
};

declare function dhf:triples-context($content, $headers) as json:object
{
  let $context := dhf:context("triples")
  let $_ := dhf:add-trace-input($context, "content", $content)
  let $_ := dhf:add-trace-input($context, "headers", $headers)
  return
    $context
};

declare function dhf:set-trace-label(
  $context as json:object,
  $label as xs:string) as json:object
{
  let $_ := map:put($context, "label", $label)
  return
    $context
};

declare function dhf:add-trace-input(
  $context as json:object,
  $input-label as xs:string,
  $input) as json:object
{
  let $inputs := map:get($context, "inputs")
  let $_ := map:put($inputs, $input-label, $input)
  let $_ := map:put($context, "inputs", $inputs)
  return
    $context
};
