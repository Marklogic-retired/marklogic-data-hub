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

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare option xdmp:mapping "false";

(:~
 : The default Create Content Plugin.
 :
 : This plugin gets called when you don't supply a content plugin in your own flow.
 :
 : @param $id          - the identifier returned by the collector
 : @param $options     - a map containing options. Options are sent from Java
 :
 : @return - your transformed content
 :)
declare function plugin:create-content(
  $id as xs:string,
  $options as map:map) as node()?
{
  let $doc := fn:doc($id)
  return
    if ($doc/envelope:envelope) then
      $doc/envelope:envelope/envelope:content/node()
    else if ($doc/content) then
      $doc/content
    else
      $doc
};
