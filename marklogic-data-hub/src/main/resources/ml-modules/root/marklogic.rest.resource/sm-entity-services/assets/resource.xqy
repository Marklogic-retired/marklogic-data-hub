xquery version "1.0-ml";

module namespace ext = "http://marklogic.com/rest-api/resource/sm-entity-services";

import module namespace sm-es = "http://marklogic.com/smart-mastering/entity-services" at "/com.marklogic.smart-mastering/sm-entity-services.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";

declare option xdmp:mapping "false";

declare function ext:get(
  $context as map:map,
  $params  as map:map
) as document-node()*
{
  map:put($context, "output-types", "application/json"),
  xdmp:set-response-code(200, "OK"),
  document { sm-es:get-entity-descriptors() }
};
