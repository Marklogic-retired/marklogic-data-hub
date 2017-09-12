xquery version "1.0-ml";

module namespace transform = "http://marklogic.com/rest-api/transform/trace-json";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/com.marklogic.hub/lib/trace-lib.xqy";

declare function transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  perf:log('/transforms/trace-json:transform', function() {

    map:put($context, "output-types", "application/json"),
    document {
      if ($content/trace) then
        xdmp:to-json(trace:trace-to-json($content/trace))
      else if ($content/node() instance of object-node()) then
        xdmp:to-json(trace:trace-to-json($content/node()))
      else ()
    }
  })
};
