(:
  Copyright (c) 2020 MarkLogic Corporation

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

(: This library is for operations for mapping that are more dificult to accomplish in JavaScript :)
module namespace xquery-lib = "http://marklogic.com/mapping/es/xquery";

import module namespace inst="http://marklogic.com/entity-services-instance" at "/MarkLogic/entity-services/entity-services-instance.xqy";

declare function document-with-nodes($nodes as node()*) {
  document {
    $nodes
  }
};

(:
Copy of this function from ML 10.0-3. The only change is the addition of user-params.
Note that "parms" in the code below should really be "options", which would then match the signature of xslt-eval.

I opened bug 54632 to improve the ES functions so that a map of params will be accepted. Then we can get rid of this
hack.
:)
declare function data-hub-map-to-canonical(
  $source-instance as node(),
  $mapping-uri as xs:string,
  $user-params as map:map?,
  $options as map:map
) as node()
{
  let $target-entity-name := $options=>map:get("entity")
  let $format := $options=>map:get("format")
  let $format :=
    if (empty($format)) then
      typeswitch ($source-instance)
        case document-node() return
          if ($source-instance/element()) then "xml"
          else "json"
        case element() return "xml"
        default return "json"
    else $format
  let $input :=
    typeswitch ($source-instance)
      case document-node() return $source-instance
      case element() return document { $source-instance }
      default return document { $source-instance }
  let $parms :=
    if (empty($target-entity-name)) then ()
    else map:map()=>map:with("template", $target-entity-name)
  let $results :=
    xdmp:xslt-invoke($mapping-uri||".xslt", $input, $user-params, $parms)
  return
    if ($format="xml")
    then inst:canonical-xml($results)
    else inst:canonical-json($results)
};
