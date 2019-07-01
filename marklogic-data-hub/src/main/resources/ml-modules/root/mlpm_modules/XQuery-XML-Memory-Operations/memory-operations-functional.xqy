xquery version "1.0-ml";
(:~
Copyright (c) 2013 Ryan Dew

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

@author Ryan Dew (ryan.j.dew@gmail.com)
@version 1.0.3
@description This is a module with function changing XML in memory by creating subtrees using the ancestor, preceding-sibling, and following-sibling axes
				and intersect/except expressions. Requires MarkLogic 7+.
~:)
module namespace mem-op-fun="http://maxdewpoint.blogspot.com/memory-operations/functional";
import module namespace mem-op="http://maxdewpoint.blogspot.com/memory-operations" at "memory-operations.xqy";
import module namespace node-op="http://maxdewpoint.blogspot.com/node-operations" at "node-operations.xqy";
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace xdmp="http://marklogic.com/xdmp";
declare namespace map="http://marklogic.com/xdmp/map";
declare option xdmp:mapping "true";
declare option xdmp:copy-on-validate "true";

(: Queue insert a child into the node :)
declare function mem-op-fun:insert-child(
  $transaction-map as map:map,
  $parent-node as element()*,
  $new-nodes as node()*)
as map:map?
{
  mem-op-fun:queue(
    $transaction-map, $parent-node, $new-nodes, "insert-child")
};

(: Queue insert as first child into the node :)
declare function mem-op-fun:insert-child-first(
  $transaction-map as map:map,
  $parent-node as element()*,
  $new-nodes as node()*)
as map:map?
{
  mem-op-fun:queue(
    $transaction-map,
    $parent-node,
    $new-nodes,
    "insert-child-first")
};

(: Queue insert a sibling before the node :)
declare function mem-op-fun:insert-before(
  $transaction-map as map:map,
  $sibling as node()*,
  $new-nodes as node()*)
as map:map?
{
  mem-op-fun:queue(
    $transaction-map, $sibling, $new-nodes, "insert-before")
};

(: Queue insert a sibling after the node :)
declare function mem-op-fun:insert-after(
  $transaction-map as map:map,
  $sibling as node()*,
  $new-nodes as node()*)
as map:map?
{
  mem-op-fun:queue(
    $transaction-map, $sibling, $new-nodes, "insert-after")
};

(: Queue replace of the node :)
declare function mem-op-fun:replace(
  $transaction-map as map:map,
  $replace-nodes as node()*,
  $new-nodes as node()*)
as map:map?
{
  mem-op-fun:queue(
    $transaction-map,
    $replace-nodes except $replace-nodes/descendant::node(),
    $new-nodes,
    "replace")
};

(: Queue delete the node :)
declare function mem-op-fun:delete(
  $transaction-map as map:map,
  $delete-nodes as node()*)
as map:map?
{
  mem-op-fun:queue(
    $transaction-map,
    $delete-nodes except $delete-nodes/descendant::node(),
    (),
    "replace")
};

(: Queue renaming of node :)
declare function mem-op-fun:rename(
  $transaction-map as map:map,
  $nodes-to-rename as node()*,
  $new-name as xs:QName)
as map:map?
{
  mem-op-fun:queue(
    $transaction-map,
    $nodes-to-rename,
    element { $new-name } { },
    "rename")
};

(: Queue replacement of a value of an element or attribute :)
declare function mem-op-fun:replace-value(
  $transaction-map as map:map,
  $nodes-to-change as node()*,
  $value as xs:anyAtomicType?)
as map:map?
{
  mem-op-fun:queue(
    $transaction-map,
    $nodes-to-change,
    text { $value },
    "replace-value")
};

(: Queue replacement of contents of an element :)
declare function mem-op-fun:replace-contents(
  $transaction-map as map:map,
  $nodes-to-change as node()*,
  $contents as node()*)
as map:map?
{
  mem-op-fun:queue(
    $transaction-map,
    $nodes-to-change,
    $contents,
    "replace-value")
};

(: Queues the replacement of the node with the result of the passed function :)
declare function mem-op-fun:transform(
  $transaction-map as map:map,
  $nodes-to-change as node()*,
  $transform-function as function(node()) as node()*)
as map:map?
{
  let $function-key as xs:string := mem-op:function-key($transform-function)
  return 
    map:new((
      mem-op-fun:queue(
        $transaction-map,
        $nodes-to-change,
        text { $function-key },
        "transform"
      ),
      map:entry(
        $function-key,
        $transform-function
      )
    ))
};

(: Select the root to return after transaction :)
declare function mem-op-fun:copy($node-to-copy as node())
as map:map
{
  map:entry("copy", $node-to-copy)
};

(: Execute transaction :)
declare function mem-op-fun:execute($transaction-map as map:map)
as node()*
{
  if (exists(map:get($transaction-map, "nodes-to-modify")))
  then
    mem-op:process(
      $transaction-map,
      (: Ensure nodes to modify are in document order by using union :)
      map:get($transaction-map, "nodes-to-modify") | (),
      map:get($transaction-map, "modifier-nodes"),
      map:get($transaction-map, "operation"),
      map:get($transaction-map, "copy")
    )
  else
    validate lax {
      map:get($transaction-map, "copy")
    },
  map:clear($transaction-map)
};

(: Begin private functions! :)

(: Queue actions for later execution :)
declare %private 
function mem-op-fun:queue(
  $transaction-map as map:map,
  $nodes-to-modify as node()+,
  $modifier-nodes as node()*,
  $operation as xs:string?)
as map:map
{
  if (fn:exists($nodes-to-modify))
  then 
    (: Creates elements based off of generate-id (i.e., node is 12439f8e4a3, then we get back <mem-op:_12439f8e4a3/>) :)
    let $modified-node-ids as element()* := mem-op:id-wrapper($nodes-to-modify) (: This line uses function mapping :)
    return
    (
    mem-op:all-nodes-from-same-doc($nodes-to-modify,map:get($transaction-map,"copy")),
    map:new((
      $transaction-map,
      map:entry(
        "operation",
        (<mem-op:operation>{
           attribute operation { $operation },
           $modified-node-ids
        }</mem-op:operation>,
        (: Ensure operations are accummulated :)
        map:get($transaction-map, "operation"))
      ),
      map:entry(
        "nodes-to-modify",
        ($nodes-to-modify,
         (: Ensure nodes to modify are accummulated :)
         map:get($transaction-map, "nodes-to-modify"))
      ),
      map:entry(
        "modifier-nodes",
        (<mem-op:modifier-nodes>{
             attribute mem-op:operation { $operation },
             $modifier-nodes[self::attribute()],
             $modified-node-ids,
             $modifier-nodes[not(self::attribute())]
         }</mem-op:modifier-nodes>,
         (: Ensure nodes to modifier nodes are accummulated :)
         map:get($transaction-map, "modifier-nodes"))
      )
    ))
    )
  else
    $transaction-map
};
