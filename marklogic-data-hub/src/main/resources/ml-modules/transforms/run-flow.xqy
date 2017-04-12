xquery version "1.0-ml";

module namespace runFlow = "http://marklogic.com/rest-api/transform/run-flow";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
at "/com.marklogic.hub/lib/flow-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/com.marklogic.hub/lib/trace-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare function runFlow:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  perf:log('/transforms/run-flow:transform', function() {
    let $job-id := map:get($params, "job-id")
    let $entity-name := map:get($params, 'entity')
    let $flow-name := map:get($params, 'flow')
    let $flow-type := "input"
    let $_ := map:put($params, "flowType", $flow-type)

    let $uri := map:get($context, 'uri')
    let $flow := flow:get-flow($entity-name, $flow-name, $flow-type)
    let $_ :=
      if ($flow) then ()
      else
        fn:error(xs:QName("MISSING_FLOW"), "The specified flow " || $entity-name || ":" || $flow-name || " is missing.")

    let $_ := trace:set-job-id($job-id)
    let $envelope := flow:run-plugins($flow, $uri, $content, $params)
    let $_ :=
      if (trace:enabled()) then
        trace:plugin-trace(
          $uri,
          if ($flow/hub:data-format eq $flow:XML) then ()
          else
            null-node {},
          "writer",
          $flow/hub:type,
          $envelope,
          if ($flow/hub:data-format eq $flow:XML) then ()
          else
            null-node {},
          xs:dayTimeDuration("PT0S")
        )
      else ()
    let $_ := trace:write-trace()
    return document { $envelope }
  })
};
