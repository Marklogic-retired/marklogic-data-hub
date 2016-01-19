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

module namespace ex = "http://marklogic.com/hub-in-a-box/extractor-lib";

import module namespace xpath = "http://marklogic.com/hub-in-a-box/extractor/xpath"
  at "/com.marklogic.hub/extractors/xpath-extractor.xqy";

declare namespace hub = "http://marklogic.com/hub-in-a-box";

declare option xdmp:mapping "false";

declare function ex:run-func($value, $options)
{
  switch ($options/name)
    case "parseDate" return
      let $format := $options/format
      return
        xdmp:parse-dateTime($format, $value) ! xs:date(fn:substring(fn:string(.), 1, 10))
    case "parseDateTime" return
      xdmp:parse-dateTime($options, $value)
    case "trim" return
      fn:normalize-space($value)
    case "pad" return
      fn:string-join((1 to $options/count) ! $options/string, "")
    case "replace" return
      fn:replace($value, $options/pattern, $options/replacement)
    (: TODO: add some more functions :)
    default return $value
};

declare function ex:to-json($extractor)
{
  if ($extractor instance of object-node()) then
    $extractor
  else
    xdmp:to-json(
      map:new((
        (: grab the attributes :)
        $extractor/@*/map:entry(fn:local-name(.), .),

        if ($extractor/hub:function) then
          map:entry("functions", json:to-array((
            $extractor/hub:function/map:new((
              @*/map:entry(fn:local-name(.), .)
            ))
          )))
        else ()
      ))
    )/object-node()
};

declare function ex:run-extractor($extractor, $node, $namespaces)
{
  let $extractor := ex:to-json($extractor)
  let $value :=
    if ($extractor/type = "xpath") then
      xpath:extract($node, $extractor, $namespaces)
    else ()
  let $run-functions :=
    for $f in $extractor/functions
    return
      xdmp:set($value, ex:run-func($value, $f))
  return
    $value
};
