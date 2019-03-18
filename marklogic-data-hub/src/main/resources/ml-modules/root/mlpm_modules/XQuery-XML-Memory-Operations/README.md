# XQuery XML Memory Operations
This module is created to provide an optimized way to perform operations on XML in memory. With heavy use XPath axis, node comparisions, and set operators this library is able to make changes to XML while only reconstructing nodes within the direct path of the nodes being altered. It also provides a way to perform multiple operations, while only reconstructiing the XML tree once.

The goal is to provide a way to bring the functionality of the XQuery Update Facility 1.0 (http://www.w3.org/TR/xquery-update-10/) to MarkLogic.

## Advanced Transform Statements
By calling mem:copy($node as node()) as xs:string the following calls to mem operations are stored and not actually executed until mem:execute($transaction-id as xs:string) is called. This allows the document to be rebuilt only once and increases performance.

You can just perform a copy and execute that will provide a copy of the node free from ancestors.

Examples of this is as follows:
 ```xquery
(: 
copy $c := fn:root($file)
modifiy (replace nodes $c/title with element title {"my new title"},
		insert nodes attribute new-attribute {"my new attribute"} as last into
			$c)
return $c
=>
:)
mem:copy(fn:root($file)) !
( 
mem:replace(.,$file/title, element title {"my new title"}),
mem:insert-child(.,$file, attribute new-attribute {"my new attribute"}),
mem:execute(.))
```

By using mem:copy and passing in a node, you indicating what the new root should be.
```xquery
(:
let $oldx := /a/b/x
return
   copy $newx := $oldx
   modify (rename node $newx as "newx", 
           replace value of node $newx with $newx * 2)
   return ($oldx, $newx)
=>
:)
let $oldx := /a/b/x
return
	($oldx,
	mem:copy($oldx) ! 
	(
	mem:rename(.,$oldx, fn:QName("","newx")),
	mem:replace-value(.,$oldx, $oldx * 5),
	mem:execute(.)
	)
	)
(: 
=>
(<x>...</x>,<newx>...</newx>)
:)
```

## Other Operations
 ```xquery
(: See http://www.w3.org/TR/xquery-update-10/#id-delete :)
mem:delete($file//comment()),
(: See http://www.w3.org/TR/xquery-update-10/#id-insert :)
mem:insert-after($file/title, element new-sibling-after {"my new sibling element"} ),
mem:insert-before($file/title, element new-sibling-before {"my new sibling element"} ),
mem:insert-child($file, attribute new-attribute {"my new attribute"} ),
mem:insert-child-first($file, attribute new-attribute-2 {"my new attribute"} ),
(: See http://www.w3.org/TR/xquery-update-10/#id-rename :)
mem:rename($file//block, fn:QName('http://www.w3.org/1999/xhtml','p')),
(: See http://www.w3.org/TR/xquery-update-10/#id-replacing-node :)
mem:replace($file/title, element title {"my new title"} ),
(: See http://www.w3.org/TR/xquery-update-10/#id-replacing-node-value :)
mem:replace-value($file/title, "my new title" ),
(: Transform by using a function reference :)
mem:transform($title,function($node as node()) as node()* {element new-title {"This is so awesome!"}})
```

