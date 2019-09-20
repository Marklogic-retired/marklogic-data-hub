xquery version "1.0-ml";
module namespace ml-mappingValidator = "http://marklogic.com/rest-api/resource/ml:mappingValidator";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
at "/MarkLogic/rest-api/lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "ml:mappingValidator";
declare private variable $modPath := "/marklogic.rest.resource/"|| $extName ||"/assets/resource.sjs";
declare private variable $caller  := xdmp:function(
  xs:QName("applyOnce"), "/data-hub/5/rest-api/lib/extensions-util.sjs"
);

declare function ml-mappingValidator:source-format() as xs:string {
  "javascript"
};
declare function ml-mappingValidator:get(
  $context as map:map, $params as map:map
) as map:map {
  xdmp:apply($caller,$extName,$modPath,"GET",$context,$params)
};
declare function ml-mappingValidator:delete(
  $context as map:map, $params as map:map
) as map:map {
  xdmp:apply($caller,$extName,$modPath,"DELETE",$context,$params)
};
declare function ml-mappingValidator:post(
  $context as map:map, $params as map:map, $input as document-node()*
) as map:map {
  xdmp:apply($caller,$extName,$modPath,"POST",$context,$params,$input)
};
declare function ml-mappingValidator:put($context as map:map, $params as map:map, $input as document-node()*
) as map:map {
  xdmp:apply($caller,$extName,$modPath,"PUT",$context,$params,$input)
};
declare function ml-mappingValidator:transform(
  $context as map:map, $params as map:map, $input as document-node()?
) as map:map {
  xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input)
};
