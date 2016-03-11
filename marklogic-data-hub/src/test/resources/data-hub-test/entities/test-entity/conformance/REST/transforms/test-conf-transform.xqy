xquery version "1.0-ml";

module namespace transform = "http://marklogic.com/rest-api/transform/test-conf-transform";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare function transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  document { $content/envelope:envelope/envelope:content/node() }
};
