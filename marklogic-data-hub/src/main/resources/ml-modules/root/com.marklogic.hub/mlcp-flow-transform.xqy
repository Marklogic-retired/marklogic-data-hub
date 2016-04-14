xquery version "1.0-ml";

module namespace mlcpFlow = "http://marklogic.com/data-hub/mlcp-flow-transform";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/com.marklogic.hub/lib/trace-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare function mlcpFlow:transform(
  $content as map:map,
  $context as map:map
) as map:map*
{
  let $uri := map:get($content, "uri")

  let $paramNodes := xdmp:unquote(map:get($context, 'transform_param'))/node()/*
  let $paramMap := map:new()
  let $_ := $paramNodes ! map:put($paramMap, fn:local-name(.), ./string())

  let $flow := flow:get-flow(
    map:get($paramMap, 'entity-name'),
    map:get($paramMap, 'flow-name'),
    map:get($paramMap, 'flow-type'))

  let $envelope := flow:run-plugins($flow, $uri, map:get($content, "value"), $paramMap)
  let $_ := map:put($content, "value", $envelope)
  let $_ :=
    if (trace:enabled()) then
      trace:create-trace(
        trace:plugin-trace(
          $uri,
          if ($envelope instance of element()) then ()
          else
            null-node {},
          "mlcp-writer",
          $flow/hub:type,
          $envelope,
          if ($envelope instance of element()) then ()
          else
            null-node {},
          xs:dayTimeDuration("PT0S"),
          if ($envelope instance of element()) then "xml"
          else "json"
        )
      )
    else ()
  return
    $content
};
