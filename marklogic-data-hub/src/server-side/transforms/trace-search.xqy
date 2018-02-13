xquery version "1.0-ml";
module namespace trace-search = "http://marklogic.com/rest-api/transform/trace-search";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "/MarkLogic/rest-api/lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "trace-search";
declare private variable $modPath := "/MarkLogic/data-hub-framework/transforms/trace-search.sjs";
declare private variable $caller  := xdmp:function(
    xs:QName("applyOnce"), "/MarkLogic/rest-api/lib/extensions-util.sjs"
    );

declare function trace-search:source-format() as xs:string {
    "javascript"
};
declare function trace-search:get(
    $context as map:map, $params as map:map
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"GET",$context,$params)
};
declare function trace-search:delete(
    $context as map:map, $params as map:map
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"DELETE",$context,$params)
};
declare function trace-search:post(
    $context as map:map, $params as map:map, $input as document-node()*
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"POST",$context,$params,$input)
};
declare function trace-search:put($context as map:map, $params as map:map, $input as document-node()*
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"PUT",$context,$params,$input)
};
declare function trace-search:transform(
    $context as map:map, $params as map:map, $input as document-node()?
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input)
};
