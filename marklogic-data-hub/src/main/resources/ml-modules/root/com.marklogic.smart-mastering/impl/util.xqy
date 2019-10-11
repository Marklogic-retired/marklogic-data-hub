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

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : This library contains functions that are shared accross matching/merging
 :)

module namespace util-impl = "http://marklogic.com/smart-mastering/util-impl";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare variable $write-objects-by-uri as map:map := map:map();

declare function util-impl:add-all-write-objects(
  $write-objects as map:map*
) as map:map? {
  for $write-object in $write-objects
  return map:put($write-objects-by-uri, $write-object => map:get("uri"), $write-object),
  $write-objects-by-uri
};

declare function util-impl:retrieve-write-object(
  $uri as xs:string
) as map:map?
{
  if (map:contains($write-objects-by-uri, $uri)) then
    $write-objects-by-uri
    => map:get($uri)
  else
    let $write-obj := util-impl:build-write-object-for-doc(fn:doc($uri))
    return (
      map:put($write-objects-by-uri, $uri, $write-obj),
      $write-obj
    )
};

declare function util-impl:build-write-object-for-doc($doc as document-node())
as map:map
{
  map:new((
    map:entry("uri", xdmp:node-uri($doc)),
    map:entry("value", $doc),
    map:entry("context", map:new((
      map:entry("collections", xdmp:node-collections($doc)),
      map:entry("metadata", xdmp:node-metadata($doc)),
      map:entry("permissions", xdmp:node-permissions($doc, "objects"))
    )))
  ))
};

declare function util-impl:adjust-collections-on-document(
  $uri as xs:string,
  $collection-function as function(map:map) as xs:string*
) {
  let $write-object := util-impl:retrieve-write-object($uri)
  let $write-context := $write-object => map:get("context")
  let $current-collections := $write-context => map:get("collections")
  let $new-collections := $collection-function(map:entry($uri, $current-collections))
  let $_set-collections := $write-context => map:put("collections", $new-collections)
  return (
    if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
      xdmp:trace($const:TRACE-MERGE-RESULTS, "Setting collections to URI '"|| $uri ||"': " || fn:string-join($new-collections, ","))
    else (),
    $write-object
  )
};

declare function util-impl:combine-maps($base-map as map:map, $maps as map:map*) {
  fn:fold-left(function($map1,$map2) {
    $map1 + $map2
  }, $base-map, $maps)
};
