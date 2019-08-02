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

module namespace custom = "http://marklogic.com/data-hub/custom";
declare namespace es = "http://marklogic.com/entity-services";
import module namespace json="http://marklogic.com/xdmp/json"
at "/MarkLogic/json/json.xqy";


(:~
 : Plugin Entry point
 :
 : @param $content     - the raw content
 : @param $options     - a map containing options
 :
 :)
declare function custom:main(
  $content as item()?,
  $options as map:map)
{
  (: get the source doc :)
  let $doc := if (xdmp:node-kind($content/value) eq "text") then xdmp:unquote($content/value) else $content/value

  (: get the headers :)
  let $headers := custom:create-headers($doc, $options)

  (: get the triples :)
  let $triples := custom:create-triples($doc, $options)

  (: get the instance :)
  let $instance := create-instance($doc, $options)

  let $output-format := if(fn:empty(map:get($options, "outputFormat"))) then "json" else map:get($options, "outputFormat")

  (: get the envelope :)
  let $envelope := custom:make-envelope($instance, $headers, $triples, $output-format)

  return $envelope
};

(:~
 : Creates instance
 :
 : @param $content  - the raw content
 : @param $options  - a map containing options
 :
 :)
declare function custom:create-instance(
  $content as item()?,
  $options as map:map) as item()?
{
(: This code is meant for illustrative purpose. It has to be replaced with your code for creating instance:)
    if ($content/es:envelope) then
      $content/es:envelope/es:instance/node()
    else if ($content/envelope/instance) then
      $content/envelope/instance
    else
      $content
};

(:~
 : Create Headers
 :
 : @param $content  - the raw content
 : @param $options  - a map containing options
 :
 :)
declare function custom:create-headers(
  $content as item()?,
  $options as map:map) as node()*
{
(: Code for creating headers:)
  ()
};

(:~
 : Create Triples
 :
 : @param $content  - the raw content
 : @param $options  - a map containing options
 :
 :)
declare function custom:create-triples(
  $content as item()?,
  $options as map:map) as sem:triple*
{
(: Code for creating triples:)
  ()
};

(:~
 : Creates Envelope
 :
 : @param $content  - the raw content
 : @param $options  - a map containing options
 :
 :)
declare function custom:make-envelope($content as item()?, $headers, $triples, $output-format) as document-node()
{

  (: This code is meant for illustrative purpose. It has to be replaced with your code for creating envelope:)

  if ($output-format = "xml") then
    document {
      <envelope xmlns="http://marklogic.com/entity-services">
        <headers>{$headers}</headers>
        <triples>{$triples}</triples>
        <instance>{$content}</instance>
        <attachments>
          {
            if ($content instance of map:map and map:keys($content) = "$attachments") then
              if(map:get($content, "$attachments") instance of element() or
                map:get($content, "$attachments")/node() instance of element()) then
                map:get($content, "$attachments")
              else
                let $c := json:config("basic")
                let $_ := map:put($c,"whitespace" , "ignore" )
                return
                  json:transform-from-json(map:get($content, "$attachments"),$c)
            else
              ()
          }
        </attachments>
      </envelope>
    }
  else
    let $envelope :=
      let $o := json:object()
      let $_ := (
        map:put($o, "headers", $headers),
        map:put($o, "triples", $triples),
        map:put($o, "instance",$content),
        map:put($o, "attachments",
          if ($content instance of map:map and map:keys($content) = "$attachments") then
            map:get($content, "$attachments")
          else
            ()
        )
      )
      return
        $o
    let $wrapper := json:object()
    let $_ := map:put($wrapper, "envelope", $envelope)
    return
      xdmp:to-json($wrapper)

};
