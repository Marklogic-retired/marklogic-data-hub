xquery version "1.0-ml";

module namespace transformNSPrefix =
  "http://marklogic.com/rest-api/transform/placeholder";

declare function transformNSPrefix:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  $content
};