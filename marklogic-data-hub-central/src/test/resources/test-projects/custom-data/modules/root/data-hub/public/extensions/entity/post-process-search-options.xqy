(:
  Copyright (c) 2021 MarkLogic Corporation

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

module namespace ext = "http://marklogic.com/data-hub/extensions/entity";

declare namespace search = "http://marklogic.com/appservices/search";

declare function post-process-search-options($options as element(search:options)) as element(search:options)
{
  element search:options {
    $options/@*,

    for $el in $options/element()
    return

      if ($el[self::search:constraint and @name = "entityType"]) then
        <constraint name="entityType" xmlns="http://marklogic.com/appservices/search">
          <custom facet="false">
            <parse apply="parse" ns="org:example" at="/custom-data-modules/my-entity-type-constraint.xqy"/>
          </custom>
        </constraint>

      else if ($el//search:path-index) then rewrite($el)

      else $el
  }
};

(: Recursive function for rewriting an element with a search:path-index somewhere in it :)
declare private function rewrite($el as element()) as element()
{
  element {fn:node-name($el)} {
    $el/@*,
    for $kid in $el/node()
    return
      if ($kid instance of element()) then
        if ($kid[self::search:path-index]) then
          element search:path-index {convert-path($kid/text())}
        else rewrite($kid)
      else $kid
  }
};

declare private function convert-path($path as xs:string) as xs:string
{
  let $property-name := fn:tokenize($path, "/")[fn:last()]
  return  "/customEnvelope/Person/" || $property-name || "/value"
};


