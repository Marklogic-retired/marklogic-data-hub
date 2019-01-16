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

module namespace dhf = "http://marklogic.com/dhf";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/data-hub/4/impl/flow-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/data-hub/4/impl/trace-lib.xqy";

declare option xdmp:mapping "false";

(:
 : Runs a given function as a plugin. This method provides
 : tracing around your function. Tracing will catch uncaught
 : exceptions and log them into the traces database.
 :
 : @param $context - the context for this plugin
 : @param $func - the function to run
 : @return - returns whatever your function returns
 :)
declare function dhf:run(
  $context as json:object,
  $func)
{
  let $label := map:get($context, "label")
  let $_ :=
    if (fn:exists($label)) then
      trace:set-plugin-label($label)
    else
      fn:error((), "DATAHUB-CONTEXT-MISSING-LABEL", "Your context is missing a label.")
  let $_ := trace:reset-plugin-input()
  let $_ :=
    let $inputs := map:get($context, "inputs")
    for $key in map:keys($inputs)
    return
      trace:set-plugin-input($key, map:get($inputs, $key))
  return
    flow:safe-run($func)
};

(:
 : Creates a legacy envelope in the http://marklogic.com/data-hub/envelope namespace (if xml)
 : This is for users who upgraded from 1.x and have legacy envelopes already in production
 :
 : @param $content - the content section of the envelope
 : @param $headers - the headers section of the envelope
 : @param $triples - the triples section of the envelope
 : @param $data-format - the format to use for making the envelope (xml|json)
 :)
declare function dhf:make-legacy-envelope($content, $headers, $triples, $data-format)
  as document-node()
{
  flow:make-legacy-envelope($content, $headers, $triples, $data-format)
};

(:
 : Creates an entity services envelope in the http://marklogic.com/entity-services namespace (if xml)
 :
 : @param $content - the content section of the envelope
 : @param $headers - the headers section of the envelope
 : @param $triples - the triples section of the envelope
 : @param $data-format - the format to use for making the envelope (xml|json)
 :)
declare function dhf:make-envelope($content, $headers, $triples, $data-format)
  as document-node()
{
  flow:make-envelope($content, $headers, $triples, $data-format)
};

(:
 : Runs a writer plugin
 :
 : @param $writer-function - the writer function to run
 : @param $id - the id for the current flow execution
 : @param $envelope - the envelope to write
 : @param $options - a map:map of options
 :)
declare function dhf:run-writer(
  $writer-function,
  $id as xs:string+,
  $envelope as item(),
  $options as map:map)
{
  flow:queue-writer($writer-function, $id, $envelope, $options)
};

(:
 : Creates a generic context for use in any plugin
 :
 : @param $label - the label to give this plugin for tracing
 :)
declare function dhf:context($label as xs:string) as json:object
{
  let $context := json:object()
  let $_ := map:put($context, "inputs", json:object())
  let $_ := dhf:set-trace-label($context, $label)
  return
    $context
};

(:
 : Creates a context for a content plugin
 :)
declare function dhf:content-context() as json:object
{
  dhf:context("content")
};

(:
 : Creates a context for a content plugin
 :)
declare function dhf:content-context($raw-content) as json:object
{
  let $context := dhf:context("content")
  let $_ := dhf:add-trace-input($context, "rawContent", $raw-content)
  return
    $context
};

(:
 : Creates a context for a headers plugin
 :)
declare function dhf:headers-context($content) as json:object
{
  let $context := dhf:context("headers")
  let $_ := dhf:add-trace-input($context, "content", $content)
  return
    $context
};

(:
 : Creates a context for a triples plugin
 :)
declare function dhf:triples-context($content, $headers) as json:object
{
  let $context := dhf:context("triples")
  let $_ := dhf:add-trace-input($context, "content", $content)
  let $_ := dhf:add-trace-input($context, "headers", $headers)
  return
    $context
};

(:
 : Creates a context for a writer plugin
 :)
declare function dhf:writer-context($envelope) as json:object
{
  let $context := dhf:context("writer")
  let $_ := dhf:add-trace-input($context, "envelope", $envelope)
  return
    $context
};

(:
 : Sets the trace label for a given context
 : Used internally. private.
 :
 : @param $context - the context
 : @param $label - the label for the context
 :
 : @return - returns the passed in $context
 :)
declare %private function dhf:set-trace-label(
  $context as json:object,
  $label as xs:string) as json:object
{
  let $_ := map:put($context, "label", $label)
  return
    $context
};

(:
 : Adds a trace input to the context
 : You can add as many trace inputs as you like so long
 : as each one has a unique label
 :
 : @param $context - the context
 : @param $input-label - the label for the input
 : @param $input - the input to add to the context
 :
 : @return - returns the passed in $context
 :)
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

declare function dhf:log-trace(
  $context as json:object)
{
  let $label := map:get($context, "label")
  let $_ :=
    if (fn:exists($label)) then
      trace:set-plugin-label($label)
    else
      fn:error((), "DATAHUB-CONTEXT-MISSING-LABEL", "Your context is missing a label")
  let $_ := trace:reset-plugin-input()
  let $_ :=
    let $inputs := map:get($context, "inputs")
    for $key in map:keys($inputs)
    return
      trace:set-plugin-input($key, map:get($inputs, $key))
  let $_ := trace:plugin-trace((), "PT0S")
  return
    ()
};
