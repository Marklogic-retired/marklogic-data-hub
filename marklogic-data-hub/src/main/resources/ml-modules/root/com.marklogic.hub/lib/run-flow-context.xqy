xquery version "1.0-ml";

module namespace rfc = "http://marklogic.com/data-hub/run-flow-context";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/com.marklogic.hub/lib/consts.xqy";

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

declare namespace hub = "http://marklogic.com/data-hub";

declare option xdmp:mapping "false";

(: the context for running a flow :)
declare variable $context := map:map();

declare function rfc:with-flow(
  $flow as element(hub:flow)
) as map:map
{
  map:put($context, "flow", $flow),
  map:put($context, "flow-type", fn:string($flow/hub:type)),
  map:put($context, "data-format", fn:string($flow/hub:data-format)),
  $context
};

declare function rfc:with-job-id(
  $job-id as xs:string)
{
  map:put($context, "job-id", $job-id),
  $context
};

declare function rfc:with-id(
  $identifier as xs:string) as map:map
{
  map:put($context, "identifier", $identifier),
  $context
};

declare function rfc:with-content(
  $content as item()?) as map:map
{
  map:put($context, "content", $content),
  $context
};

declare function rfc:with-options(
  $options as map:map) as map:map
{
  map:put($context, "options", $options),
  $context
};

declare function rfc:with-data-format(
  $data-format as xs:string) as map:map
{
  map:put($context, "data-format", $data-format),
  $context
};

declare function rfc:with-target-database(
  $target-database as xs:unsignedLong) as map:map
{
  map:put($context, "target-database", $target-database),
  $context
};

declare function rfc:with-module-uri(
  $module-uri as xs:string) as map:map
{
  map:put($context, "module-uri", $module-uri),
  map:put($context, "code-format", hul:get-file-from-uri($module-uri)),
  $context
};

declare function rfc:get-id() as xs:string?
{
  map:get($context, "identifier")
};

declare function rfc:get-content() as item()?
{
  map:get($context, "content")
};

declare function rfc:get-options() as map:map
{
  map:get($context, "options")
};

declare function rfc:get-flow() as element(hub:flow)
{
  map:get($context, "flow")
};

declare function rfc:get-flow-type() as xs:string
{
  map:get($context, "flow-type")
};

declare function rfc:get-module-uri() as xs:string
{
  map:get($context, "module-uri")
};

declare function rfc:get-code-format() as xs:string
{
  map:get($context, "code-format")
};

declare function rfc:get-target-database() as xs:unsignedLong
{
  map:get($context, "target-database")
};

declare function rfc:get-data-format() as xs:string
{
  map:get($context, "data-format")
};

declare function rfc:is-json() as xs:boolean
{
  rfc:get-data-format() eq $consts:JSON
};

declare function rfc:get-job-id()
{
  map:get($context, "job-id")
};
