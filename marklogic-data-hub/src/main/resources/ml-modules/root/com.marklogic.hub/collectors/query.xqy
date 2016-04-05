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

import module namespace ast = "http://marklogic.com/appservices/search-ast" at
  "/MarkLogic/appservices/search/ast.xqy";

import module namespace search-impl = "http://marklogic.com/appservices/search-impl"
  at "/MarkLogic/appservices/search/search-impl.xqy";

declare option xdmp:mapping "false";

(:~
 : Collect IDs plugin
 :
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - a sequence of ids or uris
 :)
declare function plugin:collect(
  $options as map:map) as xs:string*
{
  let $query := xdmp:unquote(map:get($options, "query"))/*:query
  let $q := map:get(ast:to-query($query, $search-impl:default-options), "query")
  return
    cts:uris((), (), $q)
};
