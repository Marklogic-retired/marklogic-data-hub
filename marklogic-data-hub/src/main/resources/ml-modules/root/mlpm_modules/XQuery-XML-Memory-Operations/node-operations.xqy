xquery version "3.0";
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
@version 0.7
@description This is a module with function changing XML in memory by creating subtrees using the ancestor, preceding-sibling, and following-sibling axes
				and intersect/except expressions. Requires MarkLogic 6+.
:)

module namespace node-op = "http://maxdewpoint.blogspot.com/node-operations";
declare default function namespace "http://www.w3.org/2005/xpath-functions";


declare function node-op:innermost($nodes as node()*) {
	(: node-op:function-select((
		function-lookup(QName('http://www.w3.org/2005/xpath-functions','innermost'), 1),
		function ($nodes as node()*) { :)
			$nodes except $nodes/ancestor::node()
	(:	}
	))($nodes) :)
};

declare function node-op:outermost($nodes as node()*) {
	(:node-op:function-select((
		function-lookup(QName('http://www.w3.org/2005/xpath-functions','outermost'), 1),
		function ($nodes as node()*) { :)
			$nodes except $nodes[ancestor::node() intersect $nodes]
	(:	}
	))($nodes) :)
};

declare function node-op:inbetween($nodes as node()*, $start as node()?, $end as node()?) {
	node-op:inbetween($nodes, $start, $end, ())
};

declare function node-op:inbetween-inclusive($nodes as node()*, $start as node()?, $end as node()?) {
	node-op:inbetween($nodes, $start, $end, ('start','end'))
};

declare function node-op:inbetween-inclusive-start($nodes as node()*, $start as node()?, $end as node()?) {
	node-op:inbetween($nodes, $start, $end, ('start'))
};

declare function node-op:inbetween-inclusive-end($nodes as node()*, $start as node()?, $end as node()?) {
	node-op:inbetween($nodes, $start, $end, ('end'))
};

declare %private function node-op:inbetween($nodes as node()*, $start as node()?, $end as node()?, $inclusion as xs:string*) {
  if (fn:exists($nodes))
  then
    (
      if ($inclusion = 'start')
      then $nodes intersect $start
      else ()
    ) union (
      if (exists($start) and exists($end))
      then $nodes[. >> $start][. << $end]
      else if (exists($start))
      then $nodes[. >> $start]
      else if (exists($end))
      then $nodes[. << $end]
      else ()
    ) union (
      if ($inclusion = 'end')
      then $nodes intersect $end
      else ()
    )
  else ()
};



declare %private function node-op:function-select($functions as function(*)+) as function(*) {
	$functions[1]
};
