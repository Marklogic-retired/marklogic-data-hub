xquery version "1.0-ml";

module namespace mlcpFlow = "http://marklogic.com/hub-in-a-box/mlcp-flow-transform";

import module namespace flowLib = "http://marklogic.com/hub-in-a-box/flow-lib" at "/com.marklogic.hub/lib/flow-lib.xqy";

declare function mlcpFlow:transform(
  $content as map:map,
  $context as map:map
) as map:map*
{
  let $uri := map:get($content, "uri")
  let $_ := xdmp:log('mlcp-flow-transform received: ' || $uri)
  
  let $paramNodes := xdmp:unquote(map:get($context, 'transform_param'))/node()/*
  let $paramMap := map:new()
  let $_ := $paramNodes ! map:put($paramMap, fn:local-name(.), ./string())
  
  let $_ := xdmp:log($paramMap)
  
  let $flow := flowLib:get-flow(map:get($paramMap, 'domain-name'), map:get($paramMap, 'flow-name'), map:get($paramMap, 'flow-type'))
  let $_ := xdmp:log('Flow:')
  let $_ := xdmp:log($flow)
  
  let $_ := xdmp:log('Running flow with: ' || $uri)
  
  let $flowResult := flowLib:run-flow($flow, $uri, $paramMap)
  let $_ := xdmp:log('Flow Result:')
  let $_ := xdmp:log($flowResult)
  
  return ()
};