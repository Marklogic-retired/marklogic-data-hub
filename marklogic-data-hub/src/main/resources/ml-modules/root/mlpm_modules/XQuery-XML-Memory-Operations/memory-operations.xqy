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
@version 1.0.6
@description This is a module with function changing XML in memory by creating subtrees using the ancestor, preceding-sibling, and following-sibling axes
				and intersect/except expressions. Requires MarkLogic 6+.
~:)
module namespace mem-op="http://maxdewpoint.blogspot.com/memory-operations";
import module namespace node-op="http://maxdewpoint.blogspot.com/node-operations" at "node-operations.xqy";
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace xdmp="http://marklogic.com/xdmp";
declare namespace map="http://marklogic.com/xdmp/map";
declare option xdmp:mapping "true";
declare option xdmp:copy-on-validate "true";
declare %private variable $queue as map:map := map:map();
declare %private variable $transform-functions as map:map := map:map();

(: Insert a child into the node :)
declare function mem-op:insert-child(
  $parent-node as element()+,
  $new-nodes as node()*)
as node()?
{
  mem-op:process($parent-node, $new-nodes, "insert-child")
};

(: Queue insert a child into the node :)
declare function mem-op:insert-child(
  $transaction-id as xs:string,
  $parent-node as element()*,
  $new-nodes as node()*)
as empty-sequence()
{
  mem-op:queue(
    $transaction-id, $parent-node, $new-nodes, "insert-child")
};

(: Insert as first child into the node :)
declare function mem-op:insert-child-first(
  $parent-node as element()+,
  $new-nodes as node()*)
as node()?
{
  mem-op:process(
    $parent-node, $new-nodes, "insert-child-first")
};

(: Queue insert as first child into the node :)
declare function mem-op:insert-child-first(
  $transaction-id as xs:string,
  $parent-node as element()*,
  $new-nodes as node()*)
as empty-sequence()
{
  mem-op:queue(
    $transaction-id,
    $parent-node,
    $new-nodes,
    "insert-child-first")
};

(: Insert a sibling before the node :)
declare function mem-op:insert-before(
  $sibling as node()+,
  $new-nodes as node()*)
as node()?
{
  mem-op:process($sibling, $new-nodes, "insert-before")
};

(: Queue insert a sibling before the node :)
declare function mem-op:insert-before(
  $transaction-id as xs:string,
  $sibling as node()*,
  $new-nodes as node()*)
as empty-sequence()
{
  mem-op:queue(
    $transaction-id, $sibling, $new-nodes, "insert-before")
};

(: Insert a sibling after the node :)
declare function mem-op:insert-after(
  $sibling as node()+,
  $new-nodes as node()*)
as node()?
{
  mem-op:process($sibling, $new-nodes, "insert-after")
};

(: Queue insert a sibling after the node :)
declare function mem-op:insert-after(
  $transaction-id as xs:string,
  $sibling as node()*,
  $new-nodes as node()*)
as empty-sequence()
{
  mem-op:queue(
    $transaction-id, $sibling, $new-nodes, "insert-after")
};

(: Replace the node :)
declare function mem-op:replace(
  $replace-nodes as node()+,
  $new-nodes as node()*)
as node()?
{
  mem-op:process(
    $replace-nodes except $replace-nodes/descendant::node(),
    $new-nodes,
    "replace")
};

(: Queue replace of the node :)
declare function mem-op:replace(
  $transaction-id as xs:string,
  $replace-nodes as node()*,
  $new-nodes as node()*)
as empty-sequence()
{
  mem-op:queue(
    $transaction-id,
    $replace-nodes except $replace-nodes/descendant::node(),
    $new-nodes,
    "replace")
};

(: Delete the node :)
declare function mem-op:delete($delete-nodes as node()+)
as node()?
{
  mem-op:process(
    $delete-nodes except $delete-nodes/descendant::node(),
    (),
    "replace")
};

(: Queue delete the node :)
declare function mem-op:delete(
  $transaction-id as xs:string,
  $delete-nodes as node()*)
as empty-sequence()
{
  mem-op:queue(
    $transaction-id,
    $delete-nodes except $delete-nodes/descendant::node(),
    (),
    "replace")
};

(: Rename a node :)
declare function mem-op:rename(
  $nodes-to-rename as node()+,
  $new-name as xs:QName)
as node()?
{
  mem-op:process(
    $nodes-to-rename, element { $new-name } { }, "rename")
};

(: Queue renaming of node :)
declare function mem-op:rename(
  $transaction-id as xs:string,
  $nodes-to-rename as node()*,
  $new-name as xs:QName)
as empty-sequence()
{
  mem-op:queue(
    $transaction-id,
    $nodes-to-rename,
    element { $new-name } { },
    "rename")
};

(: Replaces a value of an element or attribute :)
declare function mem-op:replace-value(
  $nodes-to-change as node()+,
  $value as xs:anyAtomicType?)
as node()?
{
  mem-op:process(
    $nodes-to-change, text { $value }, "replace-value")
};

(: Queue replacement of a value of an element or attribute :)
declare function mem-op:replace-value(
  $transaction-id as xs:string,
  $nodes-to-change as node()*,
  $value as xs:anyAtomicType?)
as empty-sequence()
{
  mem-op:queue(
    $transaction-id,
    $nodes-to-change,
    text { $value },
    "replace-value")
};

(: Replaces contents of an element :)
declare function mem-op:replace-contents(
  $nodes-to-change as node()+,
  $contents as node()*)
as node()?
{
  mem-op:process(
    $nodes-to-change, $contents, "replace-value")
};

(: Queue replacement of contents of an element :)
declare function mem-op:replace-contents(
  $transaction-id as xs:string,
  $nodes-to-change as node()*,
  $contents as node()*)
as empty-sequence()
{
  mem-op:queue(
    $transaction-id,
    $nodes-to-change,
    $contents,
    "replace-value")
};

(: Replaces with the result of the passed function :)
declare function mem-op:transform(
  $nodes-to-change as node()+,
  $transform-function as function(node()) as node()*)
as node()?
{
   let $function-key as xs:string := mem-op:function-key($transform-function)
   return
  (map:put($transform-functions, $function-key, $transform-function),
   mem-op:process($nodes-to-change, text { $function-key }, "transform"),
   map:delete($transform-functions, $function-key))
};

(: Queues the replacement of the node with the result of the passed function :)
declare function mem-op:transform(
  $transaction-id as xs:string,
  $nodes-to-change as node()*,
  $transform-function as function(node()) as node()*)
as empty-sequence()
{
   let $function-key as xs:string := mem-op:function-key($transform-function)
   return
  (map:put(
     map:get($queue, $transaction-id), $function-key, $transform-function),
   mem-op:queue(
     $transaction-id,
     $nodes-to-change,
     text { $function-key },
     "transform"))
};

(: Select the root to return after transaction :)
declare function mem-op:copy($node-to-copy as node())
as xs:string
{
  let $transaction-id as xs:string := concat(mem-op:generate-id($node-to-copy), current-dateTime())
  let $transaction-map as map:map := map:map()
  let $_add-copy-to-transaction-map as empty-sequence() := map:put($transaction-map, "copy", $node-to-copy)
  let $_add-transaction-map-to-queue as empty-sequence() := map:put(
                                                            $queue,
                                                            $transaction-id,
                                                            $transaction-map
                                                           )
  return $transaction-id
};

(: Execute transaction :)
declare function mem-op:execute($transaction-id as xs:string)
as node()*
{
  let $transaction-map as map:map := map:get($queue, $transaction-id)
  return
  (
  if (exists(map:get($transaction-map, "nodes-to-modify")))
  then
     mem-op:safe-copy(mem-op:process(
       $transaction-map,
       (: Ensure nodes to modify are in document order by using union :)
       map:get($transaction-map, "nodes-to-modify") | (),
       map:get($transaction-map, "modifier-nodes"),
       map:get($transaction-map, "operation"),
       map:get($transaction-map, "copy")
     ))
  else
    mem-op:safe-copy(map:get($transaction-map, "copy"))
  ,
    map:clear($transaction-map)
  ),
  map:delete($queue, $transaction-id)
};

(: Execute transaction :)
declare function mem-op:execute-section($transaction-id as xs:string, $section-root as node())
as node()*
{
  let $transaction-map as map:map := map:get($queue, $transaction-id),
      $nodes-to-mod as node()* := map:get($transaction-map, "nodes-to-modify") intersect ($section-root/descendant-or-self::node(),$section-root/descendant-or-self::*/@*)
  return
  (
   if (exists($nodes-to-mod))
   then
     (mem-op:safe-copy(
       mem-op:process(
         $transaction-map,
         $nodes-to-mod,
         map:get($transaction-map, "modifier-nodes"),
         map:get($transaction-map, "operation"),
         $section-root
       ) except $section-root/../(@*|node()))
     ,
      map:put($transaction-map, "nodes-to-modify",map:get($transaction-map, "nodes-to-modify") except $nodes-to-mod)
    )
   else
     mem-op:safe-copy($section-root)
  )
};

(: Begin private functions! :)

(: Queue actions for later execution :)
declare %private
function mem-op:queue(
  $transaction-id as xs:string,
  $nodes-to-modify as node()*,
  $modifier-nodes as node()*,
  $operation as xs:string?)
as empty-sequence()
{
  if (exists($nodes-to-modify))
  then
    let $transaction-map as map:map := map:get($queue, $transaction-id)
    (: Creates elements based off of generate-id (i.e., node is 12439f8e4a3, then we get back <mem-op:_12439f8e4a3/>) :)
    let $modified-node-ids as element()* := mem-op:id-wrapper($nodes-to-modify) (: This line uses function mapping :)
    return
    (
    mem-op:all-nodes-from-same-doc($nodes-to-modify,map:get($transaction-map,"copy")),
    map:put(
        $transaction-map,
        "operation",
        (<mem-op:operation>{
             attribute operation { $operation },
             $modified-node-ids
           }</mem-op:operation>,
         (: Ensure operations are accummulated :)
         map:get($transaction-map, "operation"))),
    map:put(
        $transaction-map,
        "nodes-to-modify",
        ($nodes-to-modify,
         (: Ensure nodes to modify are accummulated :)
         map:get($transaction-map, "nodes-to-modify"))),
    map:put(
        $transaction-map,
        "modifier-nodes",
        (<mem-op:modifier-nodes>{
             attribute mem-op:operation { $operation },
             $modifier-nodes[self::attribute()],
             $modified-node-ids,
             $modifier-nodes[not(self::attribute())]
           }</mem-op:modifier-nodes>,
         (: Ensure nodes to modifier nodes are accummulated :)
         map:get($transaction-map, "modifier-nodes")))
    )
  else ()
};

declare function mem-op:all-nodes-from-same-doc($nodes as node()*,$parent-node as node()) as empty-sequence() {
  (: NOTE: must use every in satisfies to account for multiple outermost nodes :)
  if (every $n in node-op:outermost(($parent-node,$nodes)) satisfies $n is $parent-node)
  then ()
  else
    error(xs:QName("mem-op:MIXEDSOURCES"), "The nodes to change are coming from multiple sources",$nodes)
};

(: The process functions handle the core logic for handling forked paths that
    need to be altered :)
declare
function mem-op:process(
  $nodes-to-modify as node()+,
  $new-nodes as node()*,
  $operation)
as node()*
{
  mem-op:all-nodes-from-same-doc($nodes-to-modify,root($nodes-to-modify[1])),
  mem-op:safe-copy(mem-op:process((), $nodes-to-modify, $new-nodes, $operation, ()))
};

declare
function mem-op:process(
  $transaction-map as map:map?,
  $nodes-to-modify as node()+,
  $new-nodes as node()*,
  $operation,
  $root-node as node()?)
as node()*
{
  mem-op:process(
    $transaction-map,
    $nodes-to-modify,
    node-op:outermost($nodes-to-modify),
    $new-nodes,
    $operation,
    $root-node
  )
};

declare
function mem-op:process(
  $transaction-map as map:map?,
  $nodes-to-modify as node()+,
  $outermost-nodes-to-modify as node()+,
  $new-nodes as node()*,
  $operation,
  $root-node as node()?)
as node()*
{
  mem-op:process(
    $transaction-map,
    $nodes-to-modify,
    $outermost-nodes-to-modify,
    $nodes-to-modify,
    $new-nodes,
    $operation,
    mem-op:find-ancestor-intersect($outermost-nodes-to-modify, 1, ())
        except
    (if (exists($root-node))
     then $root-node/ancestor::node()
     else ())
  )
};

declare %private
function mem-op:process(
  $transaction-map as map:map?,
  $nodes-to-modify as node()+,
  $outermost-nodes-to-modify as node()+,
  $all-nodes-to-modify as node()*,
  $new-nodes as node()*,
  $operation,
  $common-ancestors as node()*)
as node()*
{
  mem-op:process(
    $transaction-map,
    $nodes-to-modify,
    $outermost-nodes-to-modify,
    $all-nodes-to-modify,
    $new-nodes,
    $operation,
    $common-ancestors,
    (: get the first common parent of all the items to modify
      (First going up the tree. Last in document order.) :)
    $common-ancestors[last()])
};

declare %private
function mem-op:process(
  $transaction-map as map:map?,
  $nodes-to-modify as node()+,
  $outermost-nodes-to-modify as node()+,
  $all-nodes-to-modify as node()*,
  $new-nodes as node()*,
  $operation,
  $common-ancestors as node()*,
  $common-parent as node()?)
as node()*
{
  mem-op:process(
    $transaction-map,
    $nodes-to-modify,
    $outermost-nodes-to-modify,
    $all-nodes-to-modify,
    $new-nodes,
    $operation,
    $common-ancestors,
    $common-parent,
    ($common-parent/node(), $common-parent/@node()) intersect
     $outermost-nodes-to-modify/ancestor-or-self::node())
};

declare %private
function mem-op:process(
  $transaction-map as map:map?,
  $nodes-to-modify as node()+,
  $outermost-nodes-to-modify as node()+,
  $all-nodes-to-modify as node()*,
  $new-nodes as node()*,
  $operation,
  $common-ancestors as node()*,
  $common-parent as node()?,
  $merging-nodes as node()*)
as node()*
{
  mem-op:process(
    $transaction-map,
    $nodes-to-modify,
    $outermost-nodes-to-modify,
    $all-nodes-to-modify,
    $new-nodes,
    $operation,
    $common-ancestors,
    $common-parent,
    $merging-nodes,
    (: create new XML trees for all the unique paths to
        the items to modify :)
    <mem-op:trees>{
        if (exists($common-parent))
        then
        mem-op:build-subtree(
          $transaction-map,
          $merging-nodes,
          $nodes-to-modify,
          $new-nodes,
          $operation,
          (: get all of the ancestors :)
          $common-parent/ancestor-or-self::node())
        else (
            let $reference-node as node()? := $nodes-to-modify[1]/..
            return
                mem-op:build-subtree(
                    $transaction-map,
                    if (exists($reference-node))
                    then ($reference-node/@node(),$reference-node/node()) intersect $nodes-to-modify/ancestor-or-self::node()
                    else $outermost-nodes-to-modify,
                    $nodes-to-modify,
                    $new-nodes,
                    $operation,
                    (: get all of the ancestors :)
                    $nodes-to-modify[1]/ancestor::node())
        )
      }</mem-op:trees>)
};

declare %private
function mem-op:process(
  $transaction-map as map:map?,
  $nodes-to-modify as node()+,
  $outermost-nodes-to-modify as node()+,
  $all-nodes-to-modify as node()*,
  $new-nodes as node()*,
  $operation,
  $common-ancestors as node()*,
  $common-parent as node()?,
  $merging-nodes as node()*,
  $trees as element(mem-op:trees))
as node()*
{
  if (exists($common-parent))
  then
    mem-op:process-ancestors(
      $transaction-map,
      (: Ancestors of the common parent which will be used to walk up the XML tree. :)
      reverse($common-ancestors except $common-parent),
      $common-parent,
      $operation,
      $all-nodes-to-modify,
      (: Nodes to modify that are part of the common ancestors :)
      $all-nodes-to-modify intersect $common-ancestors,
      $new-nodes,
      mem-op:reconstruct-node-with-additional-modifications(
        $transaction-map,
        $common-parent,
        mem-op:place-trees(
          (: Reduce iterations by using outermost nodes :)
          $outermost-nodes-to-modify except $common-parent,
          (: Pass attributes and child nodes excluding ancestors of nodes to modify. :)
          ($common-parent/node(), $common-parent/@node())
            except
          $merging-nodes,
          (: New sub trees to put in place. :)
          $trees),
        $new-nodes,
        (),
        $all-nodes-to-modify,
        $operation,
        fn:false()
      )
    )
  else
    mem-op:place-trees(
      (: Reduce iterations by using outermost nodes :)
      $outermost-nodes-to-modify,
      (: Pass attributes and child nodes excluding ancestors of nodes to modify. :)
      let $copy-node as node()? :=
          if (fn:exists($transaction-map))
          then map:get($transaction-map,'copy')
          else ()
      let $reference-node as node()? := $nodes-to-modify[1]/..
      return
        (if (fn:empty($transaction-map) or ($copy-node << $reference-node or $reference-node is $copy-node))
        then($reference-node/(@node()|node()))
        else ())
        except
      $nodes-to-modify/ancestor-or-self::node(),
      (: New sub trees to put in place. :)
      $trees)
};

declare %private
function mem-op:build-subtree(
  $transaction-map as map:map?,
  $mod-node as node(),
  $nodes-to-modify as node()*,
  $new-nodes as node()*,
  $operations,
  $all-ancestors as node()*)
as node()*
{
  mem-op:subtree(
    $transaction-map,
    $mod-node,
    $nodes-to-modify intersect
    ($mod-node/descendant-or-self::node(),
     $mod-node/descendant-or-self::node()/@node()),
    $new-nodes,
    $operations,
    $all-ancestors)
};

declare %private
function mem-op:subtree(
  $transaction-map as map:map?,
  $mod-node as node(),
  $nodes-to-modify as node()*,
  $new-nodes as node()*,
  $operations,
  $all-ancestors as node()*)
as node()*
{
  let $mod-node-id-qn := mem-op:generate-id-qn($nodes-to-modify[1])
  let $descendant-nodes-to-mod := $nodes-to-modify except $mod-node
  return
    mem-op:wrap-subtree(
      $mod-node-id-qn,
      if (empty($descendant-nodes-to-mod))
      then
        mem-op:process-subtree(
          $transaction-map,
          $mod-node/ancestor::node() except $all-ancestors,
          $mod-node,
          $mod-node-id-qn,
          $new-nodes,
          $operations,
          ())
      else
        let $outermost-nodes-to-mod as node()+ := node-op:outermost($descendant-nodes-to-mod)
        return
          mem-op:process(
            $transaction-map,
            $descendant-nodes-to-mod,
            $outermost-nodes-to-mod,
            $nodes-to-modify,
            $new-nodes,
            $operations,
            (: find the ancestors that all nodes to modify have in common :)
            mem-op:find-ancestor-intersect(
              $outermost-nodes-to-mod,
              1,
              ()
            )
              except
            $all-ancestors)
    )
};

declare %private
function mem-op:wrap-subtree(
  $mod-node-id-qn as xs:QName,
  $results as node()*
)as node()*
{
  if ($results)
  then
    element { $mod-node-id-qn } {
      $results
    }
  else ()
};
(: Creates a new subtree with the changes made based off of the operation.  :)
declare %private
function mem-op:process-subtree(
  $transaction-map as map:map?,
  $ancestors as node()*,
  $node-to-modify as node(),
  $node-to-modify-id-qn as xs:QName,
  $new-node as node()*,
  $operations,
  $ancestor-nodes-to-modify as node()*)
as node()*
{
  mem-op:process-ancestors(
    $transaction-map,
    reverse($ancestors),
    (),
    $operations,
    $node-to-modify,
    $ancestor-nodes-to-modify,
    $new-node,
    mem-op:build-new-xml(
      $transaction-map,
      $node-to-modify,
      typeswitch ($operations)
       case xs:string return $operations
       default return
         $operations[*[node-name(.) eq $node-to-modify-id-qn]]/
         @operation,
      typeswitch ($new-node)
       case element(mem-op:modifier-nodes)* return $new-node[*[node-name(.) eq $node-to-modify-id-qn]]
       default return
         <mem-op:modifier-nodes>{
             attribute mem-op:operation { $operations },
             $new-node
           }</mem-op:modifier-nodes>))
};

(: Find all of the common ancestors of a given set of nodes  :)
declare %private
function mem-op:find-ancestor-intersect(
  $items as node()*,
  $current-position as xs:integer,
  $ancestor-intersect as node()*)
as node()*
{
  if (empty($items))
  then $ancestor-intersect
  else if ($current-position gt 1)
  (: if ancestor-intersect already exists intersect with the current item's ancestors :)
  then
    if (empty($ancestor-intersect))
    (: short circuit if intersect is empty :)
    then ()
    else
      $ancestor-intersect intersect head($items)/ancestor::node() intersect $items[fn:last()]/ancestor::node()
  (: otherwise just use the current item's ancestors :)
  else
    mem-op:find-ancestor-intersect(
      tail($items),
      $current-position + 1,
      head($items)/ancestor::node())
};

(: Place newly created trees in proper order :)
declare %private
function mem-op:place-trees(
  $nodes-to-modify as node()*,
  $merging-nodes as node()*,
  $trees as element(mem-op:trees)?)
as node()*
{
  if (empty($nodes-to-modify) or empty($trees[*]))
  then $merging-nodes
  else (
    let $tree-ids := $trees/* ! substring-after(local-name(.),'_')
    let $count-of-trees := count($tree-ids)
    for $tree at $pos in $trees/*
    let $previous-tree-pos := $pos - 1
    let $previous-tree-id := $tree-ids[position() eq $previous-tree-pos]
    let $current-tree-id := $tree-ids[position() eq $pos]
    let $previous-node-to-modify :=
                           if (exists($previous-tree-id))
                           then $nodes-to-modify[generate-id() eq $previous-tree-id][1]
                           else ()
    let $node-to-modify := $nodes-to-modify[generate-id() eq $current-tree-id][1]
    return
      (
        node-op:inbetween($merging-nodes, $previous-node-to-modify, $node-to-modify),
        $tree/(attribute::node()|child::node()),
        if ($pos eq $count-of-trees)
        then
          node-op:inbetween($merging-nodes, $node-to-modify, ())
        else ()
      )
  )
};

(: Go up the tree to build new XML using tail recursion. This is used when there are no side
  steps to merge in, only a direct path up the tree. $ancestors is expected to be passed in
  REVERSE document order. :)
declare %private
function mem-op:process-ancestors(
  $transaction-map as map:map?,
  $ancestors as node()*,
  $last-ancestor as node()?,
  $operations,
  $nodes-to-modify as node()*,
  $ancestor-nodes-to-modify as node()*,
  $new-node as node()*,
  $base as node()*)
as node()*
{
  if (exists($ancestors))
  then
    mem-op:process-ancestors(
      $transaction-map,
      tail($ancestors),
      head($ancestors),
      $operations,
      $nodes-to-modify,
      $ancestor-nodes-to-modify,
      $new-node,
      mem-op:reconstruct-node-with-additional-modifications(
        $transaction-map,
        head($ancestors),
        ($last-ancestor/preceding-sibling::node(),$base,$last-ancestor/following-sibling::node()),
        $new-node,
        $nodes-to-modify,
        $ancestor-nodes-to-modify,
        $operations,
        fn:true()
      )
    )
  else
    $base
};

(: Generic logic for rebuilding document/element nodes and passing in for  :)
declare %private
function mem-op:reconstruct-node-with-additional-modifications(
  $transaction-map as map:map?,
  $node as node(),
  $ordered-content as node()*,
  $new-node as node()*,
  $nodes-to-modify as node()*,
  $ancestor-nodes-to-modify as node()*,
  $operations,
  $carry-over-attributes as xs:boolean)
{
  if (some $n in $ancestor-nodes-to-modify
      satisfies $n is $node)
  then
    mem-op:process-subtree(
      $transaction-map,
      (),
      mem-op:reconstruct-node($node,$ordered-content,$nodes-to-modify,$carry-over-attributes),
      mem-op:generate-id-qn($node),
      $new-node,
      $operations,
      ()
    )
  else
    mem-op:reconstruct-node($node,$ordered-content,$nodes-to-modify,$carry-over-attributes)
};

(: Generic logic for rebuilding document/element nodes :)
declare %private
function mem-op:reconstruct-node(
  $node as node(),
  $ordered-content as node()*,
  $nodes-to-modify as node()*,
  $carry-over-attributes as xs:boolean)
{
  typeswitch ($node)
  case element() return
       element { node-name($node) } {
         if ($carry-over-attributes)
         then $node/@attribute() except $nodes-to-modify
         else (),
         $node/namespace::*,
         $ordered-content
       }
  case document-node() return
       document {
         $ordered-content
       }
  default return ()
};

(: Generate an id unique to a node in memory. Right now using fn:generate-id. :)
declare
function mem-op:id-wrapper($node as node())
{
  element {mem-op:generate-id-qn($node)} {()}
};

(: Generate QName from node :)
declare %private
function mem-op:generate-id-qn($node as node())
{
  QName(
      "http://maxdewpoint.blogspot.com/memory-operations",
      concat("_", mem-op:generate-id($node)))
};

(: Generate an id unique to a node in memory. Right now using fn:generate-id. :)
declare %private
function mem-op:generate-id($node as node())
{
  generate-id($node)
};

(: Create a key to uniquely identify a function :)
declare
function mem-op:function-key($function as function(*))
{
    xdmp:key-from-QName(
      (function-name($function),
       xs:QName("_" || string(xdmp:random())))[1]) ||
    "#" ||
    string(function-arity($function))
};

(: This is where the transformations to the XML take place and this module can be extended. :)
declare %private
function mem-op:build-new-xml(
  $transaction-map as map:map?,
  $node as node(),
  $operations as xs:string*,
  $modifier-nodes as element(mem-op:modifier-nodes)*)
{
  mem-op:build-new-xml(
    $transaction-map,
    $node,
    mem-op:weighed-operations(distinct-values($operations)),
    $modifier-nodes,
    ()
  )
};

(: This function contains the logic for each of the operations is is going to be the most
  likely place extensions will be made. :)
declare %private
function mem-op:build-new-xml(
  $transaction-map as map:map?,
  $nodes as node()*,
  $operations as xs:string*,
  $modifier-nodes as element(mem-op:modifier-nodes)*,
  $modifying-node as node()?)
{
  if (empty($operations) or empty($nodes))
  then $nodes
  else
    let $node as node()? := if (count($nodes) eq 1) then $nodes else $modifying-node
    let $pivot-pos as xs:integer? := $nodes/(if (. is $node) then position() else ())
    let $operation as xs:string := head($operations)
    let $last-in-wins as xs:boolean := $operation = ('replace-value')
    let $mod-nodes as node()* :=
      let $modifier-nodes :=
            if ($last-in-wins)
            then ($modifier-nodes[@mem-op:operation eq $operation])[1]
            else $modifier-nodes[@mem-op:operation eq $operation]
      return
        ($modifier-nodes/@node() except
         $modifier-nodes/@mem-op:operation,
         $modifier-nodes/node() except
         $modifier-nodes/mem-op:*)

    let $new-nodes :=
      switch ($operation)
      case "replace" return $mod-nodes
      case "insert-child" return
          element { node-name($node) } {
            let $attributes-to-insert := $mod-nodes[self::attribute()],
                $attributes-to-insert-qns := $attributes-to-insert/node-name(.)
            return
              ($node/@*[not(node-name(.) = $attributes-to-insert-qns)],
               $attributes-to-insert,
               $node/namespace::*,
               $node/node(),
               $mod-nodes except $attributes-to-insert)
          }
        case "insert-child-first" return
          element { node-name($node) } {
            let $attributes-to-insert := $mod-nodes[self::attribute()],
                $attributes-to-insert-qns := $attributes-to-insert/node-name(.)
            return
              ($attributes-to-insert,
               $node/@*[not(node-name(.) = $attributes-to-insert-qns)],
               $node/namespace::*,
               $mod-nodes except $attributes-to-insert,
               $node/node())
          }
        case "insert-after" return ($node, $mod-nodes)
        case "insert-before" return ($mod-nodes, $node)
        case "rename" return
          element { node-name(($mod-nodes[self::element()])[1]) } { $node/@*, $node/namespace::*, $node/node() }
        case "replace-value" return
          typeswitch ($node)
           case attribute() return attribute { node-name($node) } { $mod-nodes }
           case element() return
             element { node-name($node) } { $node/@*, $node/namespace::*, $mod-nodes }
           case processing-instruction() return
             processing-instruction {
               node-name($node)
             } {
               $mod-nodes
             }
           case comment() return
             comment {
               $mod-nodes
             }
           case text() return $mod-nodes
           default return ()
        case "transform" return
          if (exists($transaction-map))
          then
            map:get(
              $transaction-map,
              string($mod-nodes))(
              $node)
          else
            map:get($transform-functions, string($mod-nodes))(
              $node)
        default return ()
    return
      mem-op:build-new-xml(
        $transaction-map,
        unordered {
            $nodes[position() lt $pivot-pos],
            $new-nodes,
            $nodes[position() gt $pivot-pos]
        },
        tail($operations),
        $modifier-nodes,
        if ($operation = ('insert-after','insert-before'))
        then $node
        else $new-nodes[1]
      )
};

(: Order the operations in such a way that the least amount of stomping on eachother occurs :)
declare %private
function mem-op:weighed-operations(
  $operations as xs:string*) as xs:string*
{
  $operations[. eq "replace"],
  $operations[. eq "replace-value"],
  $operations[not(. = ("replace","replace-value","transform"))],
  $operations[. eq "transform"]
};

declare %private
function mem-op:safe-copy(
  $node as node())
as node()? {
  try {
    validate lax {
      $node
    }
  } catch * {
    mem-op:reconstruct-node($node,$node/*,(),fn:true())
  }
};
