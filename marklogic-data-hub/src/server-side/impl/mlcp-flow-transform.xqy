xquery version "1.0-ml";

module namespace mlcpFlow = "http://marklogic.com/data-hub/mlcp-flow-transform";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/MarkLogic/data-hub-framework/impl/config.xqy";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/MarkLogic/data-hub-framework/impl/consts.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/MarkLogic/data-hub-framework/impl/debug-lib.xqy";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/MarkLogic/data-hub-framework/impl/flow-lib.xqy";

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/MarkLogic/data-hub-framework/impl/hub-utils-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/MarkLogic/data-hub-framework/impl/perflog-lib.xqy";

import module namespace trace = "http://marklogic.com/data-hub/trace"
  at "/MarkLogic/data-hub-framework/impl/trace-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare option xdmp:mapping "false";

declare function mlcpFlow:transform(
  $content as map:map,
  $context as map:map
) as map:map*
{
  debug:dump-env("mlcpFlow:transform"),

  let $uri := map:get($content, "uri")
  return
    perf:log('mlcp-flow-transform(' || $uri || ')', function() {
      let $params := map:new((
        for $pair in map:get($context, 'transform_param') ! fn:tokenize(., ",")
        let $parts := fn:tokenize($pair, "=")
        return
          map:entry($parts[1], $parts[2])
      ))

      let $job-id := (map:get($params, "job-id"), sem:uuid-string())[1]
      let $entity-name := map:get($params, 'entity-name') ! xdmp:url-decode(.)
      let $flow-name := map:get($params, 'flow-name') ! xdmp:url-decode(.)
      let $flow := flow:get-flow(
        $entity-name,
        $flow-name,
        $consts:INPUT_FLOW
      )

      let $_ :=
        if ($flow) then ()
        else
          fn:error(xs:QName("MISSING_FLOW"), "The specified flow " || map:get($params, "flow") || " is missing.")

      (: configure the options :)
      let $options as map:map := (
        map:get($params, "options") ! xdmp:unquote(.)/object-node(),
        map:map()
      )[1]
      let $_ := flow:set-default-options($options, $flow)

      (: this can throw, but we want MLCP to know about problems, so let it :)
      let $envelope := mlcpFlow:run-flow(
        $job-id, $flow, $uri, map:get($content, "value"), $options
      )
      let $_ := map:put($content, "value", $envelope)
      return
        $content
    })
};

declare function mlcpFlow:run-flow(
  $jobId, $flow, $uri, $content, $options)
{
  (: mlcp in runs in update mode :)
  xdmp:eval('
    import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
      at "/MarkLogic/data-hub-framework/impl/flow-lib.xqy";

    import module namespace trace = "http://marklogic.com/data-hub/trace"
      at "/MarkLogic/data-hub-framework/impl/trace-lib.xqy";

    declare variable $jobId external;
    declare variable $flow external;
    declare variable $uri external;
    declare variable $content external;
    declare variable $options external;

    flow:run-flow($jobId, $flow, $uri, $content, $options),

    (: write the trace for the current identifier :)
    let $item-context := map:get($flow:context-queue, $uri)
    return
      trace:write-trace($item-context)
  ',
  map:new((
    map:entry("jobId", $jobId),
    map:entry("flow", $flow),
    map:entry("uri", $uri),
    map:entry("content", $content),
    map:entry("options", $options)
  )),
    map:entry("ignoreAmps", fn:true())
  )
};
