xquery version "1.0-ml";

module namespace runFlow = "http://marklogic.com/rest-api/transform/run-flow";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/com.marklogic.hub/lib/consts.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/com.marklogic.hub/lib/debug-lib.xqy";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/com.marklogic.hub/lib/trace-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare namespace rapi = "http://marklogic.com/rest-api";

declare %rapi:transaction-mode("query") function runFlow:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  debug:dump-env("run-flow:transform"),

  perf:log('/transforms/run-flow:transform', function() {
    let $job-id := map:get($params, "job-id")
    let $entity-name := map:get($params, 'entity')
    let $flow-name := map:get($params, 'flow')
    let $uri := map:get($context, 'uri')
    let $flow := flow:get-flow($entity-name, $flow-name, $consts:INPUT_FLOW)
    let $_ :=
      if ($flow) then ()
      else
        fn:error(xs:QName("MISSING_FLOW"), "The specified flow " || $entity-name || ":" || $flow-name || " is missing.")

    (: configure the options :)
    let $options as map:map := (
      map:get($params, "options") ! xdmp:unquote(.)/object-node(),
      map:map()
    )[1]
    let $_ := flow:set-default-options($options, $flow)

    (: this can throw, but we want the REST API to know about problems, so let it :)
    let $envelope := flow:run-flow(
      $job-id, $flow, $uri, $content, $options
    )

    (: write trace for imaginary writer :)
    let $_ := (
      trace:set-plugin-label("rest builtin writer"),
      trace:set-plugin-input("envelope", $envelope),
      trace:plugin-trace((), xs:dayTimeDuration("PT0S"))
    )

    let $_ := trace:write-trace()
    return
      document { $envelope }
  })
};
