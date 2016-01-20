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

module namespace flow = "http://marklogic.com/hub-in-a-box/flow-lib";

import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

import module namespace transformer = "http://marklogic.com/hub-in-a-box/transformer-lib"
  at "/com.marklogic.hub/lib/transformer-lib.xqy";

import module namespace persister = "http://marklogic.com/hub-in-a-box/persister-lib"
  at "/com.marklogic.hub/lib/persister-lib.xqy";

declare namespace hub = "http://marklogic.com/hub-in-a-box";

declare option xdmp:mapping "false";

declare function flow:to-xml(
  $flow as object-node())
  as element(hub:flow)
{
  element hub:flow {
    $flow/collector/
    element hub:collector {
      attribute uri { uri },
      element hub:options
      {
        for $option in options
        return
          if ($option/option = "collection") then
            element hub:collection {
              $option/uri/attribute uri { . }
            }
          else ()
      }
    },

    element hub:transformers {
      for $transformer in $flow/transformers
      return
        element hub:transformer {
          attribute module { $transformer/module },
          attribute ns { $transformer/ns },
          attribute function { $transformer/function },
          element hub:options {
            $transformer/options/root/
              element hub:root {
                attribute ns { ns },
                attribute name { name }
              },

            $transformer/options/header/
            element hub:header {
              for $e in extractors
              return
                element hub:extractor {
                  for $a in $e/*[fn:not(self::functions)]
                  return
                    attribute { fn:node-name($a) } { fn:data($a) },

                  for $f in $e/functions
                  return
                    element hub:function {
                      for $a in $f/*
                      return
                        attribute { fn:node-name($a) } { fn:data($a) }
                    }
                }
            }
          }
        }
    }
  }
};

declare function flow:to-json(
  $flow as element(hub:flow)) as object-node()
{
  map:new((
    if ($flow/hub:namespace) then
      map:entry("namespaces", json:to-array((
        $flow/hub:namespace/
          map:new((
            @*/map:entry(fn:local-name(.), .)
          ))
      )))
    else (),

    $flow/hub:collector/
    map:entry("collector", map:new((
      map:entry("module", @module),
      map:entry("options", map:new((
        hub:options/*/
          map:entry(fn:local-name(.), map:new((
            if (fn:exists(./hub:uri)) then
              map:entry("uris", json:to-array((
                hub:uri/fn:data(.)
              )))
            else (),
            *[fn:not(self::hub:uri)]/map:entry(fn:local-name(.), fn:data(.))
          )))
      )))
    ))),

    map:entry("transformers", json:to-array((
      $flow/hub:transformers/hub:transformer/
      map:new((
        map:entry("module", @module),
        map:entry("ns", @ns),
        map:entry("function", @function),
        hub:options/
        map:entry("options", map:new((
          hub:*[fn:not(self::hub:extractor)]/map:entry(fn:local-name(.), map:new((
            @*/map:entry(fn:local-name(.), .)
          ))),
          if (hub:extractor) then
            map:entry("extractors", json:to-array((
              hub:extractor/map:new((
                @*/map:entry(fn:local-name(.), .),
                map:entry("functions", json:to-array((
                  hub:function/map:new((
                    @*/map:entry(fn:local-name(.), fn:data(.))
                  ))
                )))
              ))
            )))
          else ()
        )))
      ))
    ))),

    map:entry("persisters", json:to-array((
      $flow/hub:persisters/hub:persister/
      map:new((
        map:entry("module", @module),
        map:entry("ns", @ns),
        map:entry("function", @function)
      ))
    )))
  )) ! xdmp:to-json(.)/object-node()
};

declare function flow:get-flow($flow-name)
{
  let $uri := hul:resolve-flow($flow-name)
  let $doc := hul:get-module($uri)
  return
    if ($doc/hub:flow) then
      $doc/hub:flow
    else
      $doc
};

(:
 : Always returns the json version of the named flow
 : We use the json version of the flow for running
 :)
declare function flow:get-runnable-flow(
  $flow-name as xs:string)
  as object-node()
{
  let $f := flow:get-flow($flow-name)
  return
    if ($f instance of element(hub:flow)) then
      flow:to-json($f)
    else if ($f instance of document-node()) then
      $f/object-node()
    else
      $f
};

(:
 : Runs the transformers defined in the flow and return the output
 : Useful for when you just want transformer output. Doesn't persist
 :
 : @param $flow - the flow definition
 : @param $identifier - the identifier of the thing to transform
 :)
declare function flow:run-transformers(
  $flow as object-node(),
  $identifier as xs:string)
{
  let $output := transformer:run-from-flow($flow, $identifier, fn:doc($identifier))
  return
    map:get($output, "value")
};

(:
 : Runs the transformers defined in the flow and then persist
 : This method does not return the transformer output to the caller
 :
 : @param $flow - the flow definition
 : @param $identifier - the identifier of the thing to transform
 :)
declare function flow:run-flow(
  $flow as object-node(),
  $identifier as xs:string)
{
  let $output := transformer:run-from-flow($flow, $identifier, fn:doc($identifier))
  return
    persister:run-from-flow($flow, map:get($output, "uri"), map:get($output, "value"))
};
