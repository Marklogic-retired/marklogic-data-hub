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

module namespace x = "http://marklogic.com/hub-in-a-box/extractor/xpath";

declare option xdmp:mapping "false";

declare function x:extract(
  $node as node(),
  $extractor as object-node(),
  $namespaces as object-node()*)
{
  let $path as xs:string := $extractor/path
  let $ns :=
    map:new((
      for $n in $namespaces
      return
        map:entry($n/prefix, $n/uri)
    ))
  return
    fn:data(xdmp:value("$node" || $path, $ns))
};
