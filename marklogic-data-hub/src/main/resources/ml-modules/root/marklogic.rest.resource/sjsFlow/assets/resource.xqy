xquery version "1.0-ml";
module namespace ml-sjsflow = "http://marklogic.com/rest-api/resource/ml:sjsFlow";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
at "/MarkLogic/rest-api/lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "ml:sjsflow";
declare private variable $modPath := "/data-hub/4/services/sjsflow.sjs";
declare private variable $caller  := xdmp:function(
  xs:QName("applyOnce"), "/MarkLogic/rest-api/lib/extensions-util.sjs"
);

declare function ml-sjsflow:source-format() as xs:string {
  "javascript"
};
declare function ml-sjsflow:get(
  $context as map:map, $params as map:map
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"GET",$context,$params),"result")
};
declare function ml-sjsflow:delete(
  $context as map:map, $params as map:map
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"DELETE",$context,$params),"result")
};
declare function ml-sjsflow:post(
  $context as map:map, $params as map:map, $input as document-node()*
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"POST",$context,$params,$input), "results")
};
declare function ml-sjsflow:put($context as map:map, $params as map:map, $input as document-node()*
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"PUT",$context,$params,$input), "results")
};
declare function ml-sjsflow:transform(
  $context as map:map, $params as map:map, $input as document-node()?
) as document-node()? {
  map:set-javascript-by-ref($context, fn:true()),
  map:get(xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input), "results")
};
