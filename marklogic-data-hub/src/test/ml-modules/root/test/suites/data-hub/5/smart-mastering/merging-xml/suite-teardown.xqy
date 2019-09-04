xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

(: Currently, there isn't a function to delete options. :)
xdmp:collection-delete($const:OPTIONS-COLL),

xdmp:collection-delete($const:ALGORITHM-COLL),

for $uri in (
  "/xqy-action-output/source/1/doc1.xml",
  "/xqy-action-output/source/2/doc2.xml"
)
where doc-available($uri)
return xdmp:document-delete($uri),

xdmp:invoke-function(function() {
  xdmp:document-delete("/custom-merge-xqy.xqy"),
  xdmp:document-delete("/custom-merge-sjs.sjs"),
  xdmp:document-delete("/custom-triple-merge-xqy.xqy"),
  xdmp:document-delete("/custom-triple-merge-sjs.sjs"),
  xdmp:document-delete("/custom-action.xqy"),
  xdmp:document-delete("/custom-action.sjs"),
  xdmp:document-delete("/combine.xqy")
},
  map:new((
    map:entry('database', xdmp:modules-database()),
    map:entry('update','true')
  ))
)
