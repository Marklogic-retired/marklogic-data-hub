xquery version "1.0-ml";

module namespace mlcpFlow = "http://marklogic.com/hub-in-a-box/mlcp-flow-transform";

import module namespace flow = "http://marklogic.com/hub-in-a-box/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

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
  return
    $content
};
