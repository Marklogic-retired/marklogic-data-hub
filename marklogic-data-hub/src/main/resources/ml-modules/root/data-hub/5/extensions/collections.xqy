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
module namespace collections = "http://marklogic.com/rest-api/extensions/collections";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "collections";
declare private variable $modPath := "/data-hub/5/extensions/collections.sjs";
declare private variable $caller := xdmp:function(
  xs:QName("applyOnce"), "/data-hub/5/rest-api/lib/extensions-util.sjs"
);

declare function collections:source-format() as xs:string {
  "javascript"
};

declare function collections:get(
  $context as map:map, $params as map:map
) as map:map {
  xdmp:apply($caller, $extName, $modPath, "GET", $context, $params)
};
