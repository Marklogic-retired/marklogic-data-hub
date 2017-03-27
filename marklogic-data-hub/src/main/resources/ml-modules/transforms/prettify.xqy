xquery version "1.0-ml";

module namespace transform = "http://marklogic.com/rest-api/transform/prettify";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

declare function transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  perf:log("/transforms/prettify:transform", function() {

    map:put($context, "output-types", "text/plain"),
    if (fn:exists($content/element())) then
      document {
        xdmp:quote(
          $content,
          <options xmlns="xdmp:quote">
            <indent>yes</indent>
            <indent-untyped>yes</indent-untyped>
            <omit-xml-declaration>yes</omit-xml-declaration>
          </options>
        )
      }
    else
      $content
  })
};

