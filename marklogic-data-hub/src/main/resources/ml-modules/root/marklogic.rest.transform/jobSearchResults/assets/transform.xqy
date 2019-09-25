xquery version "1.0-ml";
module namespace ml-jobSearchResults = "http://marklogic.com/rest-api/transform/ml:jobSearchResults";

import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
at "/data-hub/5/rest-api/lib/extensions-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare private variable $extName := "ml:jobSearchResults";
declare private variable $modPath := "/marklogic.rest.transform/ml:jobSearchResults/assets/transform.sjs";
declare private variable $caller  := xdmp:function(
  xs:QName("applyOnce"), "/data-hub/5/rest-api/lib/extensions-util.sjs"
);

declare function ml-jobSearchResults:source-format() as xs:string {
  "javascript"
};

declare function ml-jobSearchResults:transform(
  $context as map:map, $params as map:map, $input as document-node()?
) as map:map {
  xdmp:apply($caller,$extName,$modPath,"transform",$context,$params,$input)
};
