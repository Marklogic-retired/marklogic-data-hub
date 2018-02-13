xquery version "1.0-ml";
module namespace job-search = "http://marklogic.com/rest-api/transform/job-search";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "/MarkLogic/rest-api/lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "job-search";
declare private variable $modPath := "/MarkLogic/data-hub-framework/transforms/job-search.sjs";
declare private variable $caller  := xdmp:function(
    xs:QName("applyOnce"), "/MarkLogic/rest-api/lib/extensions-util.sjs"
    );

declare function job-search:source-format() as xs:string {
    "javascript"
};
declare function job-search:get(
    $context as map:map, $params as map:map
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"GET",$context,$params)
};
declare function job-search:delete(
    $context as map:map, $params as map:map
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"DELETE",$context,$params)
};
declare function job-search:post(
    $context as map:map, $params as map:map, $input as document-node()*
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"POST",$context,$params,$input)
};
declare function job-search:put($context as map:map, $params as map:map, $input as document-node()*
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"PUT",$context,$params,$input)
};
declare function job-search:transform(
    $context as map:map, $params as map:map, $input as document-node()?
) as map:map {
    xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input)
};
