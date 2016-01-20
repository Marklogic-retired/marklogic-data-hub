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

module namespace collector = "http://marklogic.com/hub-in-a-box/collectors/query";

import module namespace ast = "http://marklogic.com/appservices/search-ast" at
  "/MarkLogic/appservices/search/ast.xqy";

import module namespace search-impl = "http://marklogic.com/appservices/search-impl"
  at "/MarkLogic/appservices/search/search-impl.xqy";

declare option xdmp:mapping "false";

declare function collector:get-estimate(
  $config as object-node()?) as xs:int
{
  let $query := xdmp:unquote($config/query)/*:query
  let $q := map:get(ast:to-query($query, $search-impl:default-options), "query")
  return
    xdmp:estimate(cts:search(fn:doc(), $q))
};

declare function collector:collect(
  $start as xs:int,
  $limit as xs:int,
  $config as object-node()?) as xs:string*
{
  let $query := xdmp:unquote($config/query)/*:query
  let $q := map:get(ast:to-query($query, $search-impl:default-options), "query")
  return
    cts:uris((), ("skip=" || $start, "limit=" || $limit), $q)
};
