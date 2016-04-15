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

module namespace trace = "http://marklogic.com/data-hub/trace";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/lib/config.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";

declare option xdmp:mapping "false";

declare variable $FORMAT-XML := "xml";
declare variable $FORMAT-JSON := "json";

declare function trace:enable-tracing($enabled as xs:boolean)
{
  xdmp:set-server-field("HUB-TRACING-ENABLED", $enabled)
};

declare function trace:enabled() as xs:boolean
{
  xdmp:get-server-field("HUB-TRACING-ENABLED", fn:false())
};

declare function trace:create-trace($trace)
{
  if (trace:enabled()) then
    xdmp:eval('
      declare variable $trace external;

      xdmp:document-insert(
        "/" || xdmp:random(),
        $trace,
        xdmp:default-permissions(),
        ($trace/*:type)
      )
    ',
    map:new((
      map:entry("trace", $trace)
    )),
    map:new((
      map:entry("database", xdmp:database($config:TRACING-DATABASE)),
      map:entry("transactionMode", "update-auto-commit")
    )))
  else ()
};

declare function trace:plugin-trace(
  $identifier,
  $module-uri,
  $plugin-type as xs:string,
  $flow-type as xs:string,
  $input,
  $output,
  $duration as xs:dayTimeDuration,
  $format as xs:string?)
{
  if ($format eq $FORMAT-JSON) then
    object-node {
      "trace" : object-node {
        "type": "plugin-trace",
        "created": fn:current-dateTime(),
        "id": $identifier,
        "plugin-type": $plugin-type,
        "flow-type": $flow-type,
        "input": $input,
        "output": $output,
        "duration": $duration
      }
    }
  else
    <trace xmlns="http://marklogic.com/data-hub/trace">
      <type>input-trace</type>
      <created>{fn:current-dateTime()}</created>
      <id>{$identifier}</id>
      <plugin-type>{$plugin-type}</plugin-type>
      <flow-type>{$flow-type}</flow-type>
      <plugin-module-uri>{$module-uri}</plugin-module-uri>
      <input>{$input}</input>
      <output>{$output}</output>
      <duration>{$duration}</duration>
    </trace>
};

declare function trace:error-trace(
  $identifier as xs:string?,
  $module-uri as xs:string,
  $plugin-type as xs:string,
  $flow-type as xs:string,
  $error as element(error:error),
  $input,
  $duration as xs:dayTimeDuration,
  $format as xs:string?)
{
  if ($format eq $FORMAT-JSON) then
    let $error :=
      let $config := json:config("custom")
      let $_ := map:put($config, "array-element-names", xs:QName("error:frame"))
      let $_ := map:put($config, "ignore-attribute-names", xs:QName("xsi:schemaLocation"))
      let $_ := map:put($config, "whitespace", "ignore")
      return
        json:transform-to-json($error, $config)
    return
      object-node {
        "trace": object-node {
          "type": "error-trace",
          "created": fn:current-dateTime(),
          "id": $identifier,
          "plugin-type": $plugin-type,
          "flow-type": $flow-type,
          "error": $error,
          "input": $input,
          "duration": $duration
        }
      }
  else
    <trace xmlns="http://marklogic.com/data-hub/trace">
      <type>error-trace</type>
      <created>{fn:current-dateTime()}</created>
      {
        $identifier ! <id>{.}</id>
      }
      <plugin-type>{$plugin-type}</plugin-type>
      <flow-type>{$flow-type}</flow-type>
      <plugin-module-uri>{$module-uri}</plugin-module-uri>
      <error>{$error}</error>
      <input>{$input}</input>
      <duration>{$duration}</duration>
    </trace>
};
