xquery version "1.0-ml";

module namespace mlcpFlow = "http://marklogic.com/data-hub/mlcp-flow-transform";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/com.marklogic.hub/lib/perflog-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/com.marklogic.hub/lib/trace-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare option xdmp:mapping "false";

declare function mlcpFlow:transform(
  $content as map:map,
  $context as map:map
) as map:map*
{
  let $uri := map:get($content, "uri")
  return
    perf:log('mlcp-flow-transform(' || $uri || ')', function() {
      let $params := map:new((
        for $pair in map:get($context, 'transform_param') ! fn:tokenize(., ",")
        let $parts := fn:tokenize($pair, "=")
        return
          map:entry($parts[1], $parts[2])
      ))

      let $flow := flow:get-flow(
        map:get($params, 'entity'),
        map:get($params, 'flow'),
        map:get($params, 'flowType'))

      let $_ :=
        if ($flow) then ()
        else
          fn:error(xs:QName("MISSING_FLOW"), "The specified flow " || map:get($params, "flow") || " is missing.")

      let $param-job-id := map:get($params, "jobId")
      let $the-job-id := if ($param-job-id) then $param-job-id else sem:uuid-string()

      let $_ := trace:set-job-id($the-job-id)
      let $envelope := flow:run-plugins($flow, $uri, map:get($content, "value"), $params)
      let $_ := map:put($content, "value", $envelope)
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
      return
        $content
    })
};
