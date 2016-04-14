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

declare option xdmp:mapping "false";

declare function trace:enable-tracing($enabled as xs:boolean)
{
  xdmp:set-server-field("HUB-TRACING-ENABLED", $enabled)
};

declare function trace:enabled() as xs:boolean
{
  xdmp:get-server-field("HUB-TRACING-ENABLED", fn:false())
};

declare function trace:create-trace(
  $stuff-to-trace,
  $duration as xs:dayTimeDuration
)
{
  if (trace:enabled()) then
    xdmp:eval('
      declare variable $stuff-to-trace external;
      declare variable $duration external;

      xdmp:document-insert(
        "/" || xdmp:random(),
        <trace xmlns="http://marklogic.com/data-hub/trace">
          <created>{fn:current-dateTime()}</created>
          {$stuff-to-trace}
          <duration>{$duration}</duration>
        </trace>
      )
    ',
    map:new((
      map:entry("stuff-to-trace", $stuff-to-trace),
      map:entry("duration", $duration)
    )),
    map:new((
      map:entry("database", xdmp:database($config:TRACING-DATABASE)),
      map:entry("transactionMode", "update-auto-commit")
    )))
  else ()
};
