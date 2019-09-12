xquery version "1.0-ml";
module namespace ml-flows = "http://marklogic.com/rest-api/resource/ml:flows";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
at "/MarkLogic/rest-api/lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "ml:flows";
declare private variable $modPath := "/data-hub/5/services/flows.sjs";
declare private variable $caller  := xdmp:function(
  xs:QName("applyOnce"), "/data-hub/5/rest-api/lib/extensions-util.sjs"
);

declare function ml-flows:source-format() as xs:string {
  "javascript"
};
declare function ml-flows:get(
  $context as map:map, $params as map:map
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"GET",$context,$params),"result")
};
declare function ml-flows:delete(
  $context as map:map, $params as map:map
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"DELETE",$context,$params),"result")
};
declare function ml-flows:post(
  $context as map:map, $params as map:map, $input as document-node()*
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"POST",$context,$params,$input), "results")
};
declare function ml-flows:put($context as map:map, $params as map:map, $input as document-node()*
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"PUT",$context,$params,$input), "results")
};
declare function ml-flows:transform(
  $context as map:map, $params as map:map, $input as document-node()?
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input), "results")
};
