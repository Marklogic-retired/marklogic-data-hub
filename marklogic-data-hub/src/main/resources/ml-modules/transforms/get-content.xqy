xquery version "1.0-ml";

module namespace transform = "http://marklogic.com/rest-api/transform/get-content";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare function transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  perf:log('/transforms/get-content:transform', function() {
    document {
      if ($content/envelope:envelope) then
      (
        map:put($context, "output-type", "application/xml"),
        $content/envelope:envelope/envelope:content/node()
      )
      else
      (
        map:put($context, "output-type", "application/json"),
        $content/content
      )
    }
  })
};
