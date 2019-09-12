xquery version "1.0-ml";
module namespace ml-batches = "http://marklogic.com/rest-api/resource/ml:batches";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
at "/MarkLogic/rest-api/lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "ml:batches";
declare private variable $modPath := "/data-hub/5/services/batches.sjs";
declare private variable $caller  := xdmp:function(
  xs:QName("applyOnce"), "/data-hub/5/rest-api/lib/extensions-util.sjs"
);

declare function ml-batches:source-format() as xs:string {
  "javascript"
};
declare function ml-batches:get(
  $context as map:map, $params as map:map
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"GET",$context,$params),"result")
};
declare function ml-batches:delete(
  $context as map:map, $params as map:map
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"DELETE",$context,$params),"result")
};
declare function ml-batches:post(
  $context as map:map, $params as map:map, $input as document-node()*
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"POST",$context,$params,$input), "results")
};
declare function ml-batches:put($context as map:map, $params as map:map, $input as document-node()*
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"PUT",$context,$params,$input), "results")
};
declare function ml-batches:transform(
  $context as map:map, $params as map:map, $input as document-node()?
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input), "results")
};
