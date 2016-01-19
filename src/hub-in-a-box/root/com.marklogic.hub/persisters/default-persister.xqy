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

module namespace persister = "http://marklogic.com/hub-in-a-box/persisters/default";

declare option xdmp:mapping "false";

declare function persister:persist(
  $node as node()?,
  $config as object-node()?)
{
  let $uri as xs:string := $config/uri
  return
    xdmp:document-insert($uri, $node)
};
