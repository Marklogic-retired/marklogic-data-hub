xquery version "1.0-ml";

module namespace transform = "http://marklogic.com/rest-api/transform/trace-json";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/com.marklogic.hub/lib/trace-lib.xqy";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare function transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  perf:log('/transforms/trace-json:transform', function() {

    document {
      map:put($context, "output-types", "application/json"),
      xdmp:to-json(trace:trace-to-json($content/trace))
    }
  })
};
