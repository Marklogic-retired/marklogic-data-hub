(:
  Copyright 2012-2018 MarkLogic Corporation

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
module namespace sjsflow = "http://marklogic.com/rest-api/extensions/sjsflow";
import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "/MarkLogic/rest-api/lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "sjsflow";
declare private variable $modPath := "/MarkLogic/data-hub-framework/extensions/sjsflow.sjs";
declare private variable $caller  := xdmp:function(
    xs:QName("applyOnce"), "/MarkLogic/rest-api/lib/extensions-util.sjs"
    );

declare function sjsflow:source-format() as xs:string {
    "javascript"
};
declare function sjsflow:get(
    $context as map:map, $params as map:map
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"GET",$context,$params)
};
declare function sjsflow:delete(
    $context as map:map, $params as map:map
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"DELETE",$context,$params)
};
declare function sjsflow:post(
    $context as map:map, $params as map:map, $input as document-node()*
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"POST",$context,$params,$input)
};
declare function sjsflow:put($context as map:map, $params as map:map, $input as document-node()*
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"PUT",$context,$params,$input)
};
declare function sjsflow:transform(
    $context as map:map, $params as map:map, $input as document-node()?
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input)
};
