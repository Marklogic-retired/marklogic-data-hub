xquery version "1.0-ml";

module namespace runIngestHarmonize = "http://marklogic.com/rest-api/resource/run-ingest-harmonize";

import module namespace consts = "http://marklogic.com/data-hub/consts"
  at "/data-hub/4/impl/consts.xqy";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/data-hub/4/impl/flow-lib.xqy";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";

declare namespace hub = "http://marklogic.com/data-hub";
declare namespace rapi = "http://marklogic.com/rest-api";
declare namespace error = "http://marklogic.com/xdmp/error";

declare %rapi:transaction-mode("update") function runIngestHarmonize:put(
  $context as map:map,
  $params as map:map,
  $content as document-node()
  ) as document-node()
{
  let $job-id := map:get($params, "job-id")
  let $entity-name := map:get($params, 'entity-name')
  let $ingest-flow-name := map:get($params, 'ingest-flow-name')
  let $uri := map:get($params, 'uri')
  let $flow := flow:get-flow($entity-name, $ingest-flow-name, $consts:INPUT_FLOW)
  let $_ :=
    if ($flow) then ()
    else
      fn:error(xs:QName("MISSING_FLOW"), "The specified flow " || $entity-name || ":" || $ingest-flow-name || " is missing.")

  (: configure the options :)
  let $options as map:map := (
    map:get($params, "options") ! xdmp:unquote(.)/object-node(),
    map:map()
  )[1]
  let $_ := flow:set-default-options($options, $flow)

  (: this can throw, but we want the REST API to know about the problems, so let it :)
  let $envelope := runIngestHarmonize:run-flow($job-id, $flow, $uri, $content, $options)

  (: Insert the document into the STAGING database :)
  let $permissions := (xdmp:default-permissions(), xdmp:permission("rest-reader", "read"), xdmp:permission("rest-writer", "update"))
  let $collections := (xdmp:default-collections(), $entity-name, $ingest-flow-name, $consts:INPUT_FLOW)
  let $insertOptions :=
    <options xmlns="xdmp:document-insert">
      <permissions>{$permissions}</permissions>
      <collections>{
        for $collection in $collections
        return <collection>{$collection}</collection>
      }</collections>
    </options>
  let $_ := runIngestHarmonize:insert-document($uri, $envelope, $insertOptions)

  (: build all of the harmonization information :)
  let $harmonize-flow-name := map:get($params, 'harmonize-flow-name')
  let $flow := flow:get-flow($entity-name, $harmonize-flow-name, $consts:HARMONIZE_FLOW)
  let $_ :=
    if ($flow) then ()
    else
      fn:error(xs:QName("MISSING_FLOW"), "The specified flow " || $entity-name || ":" || $harmonize-flow-name || " is missing.")

  let $target-database :=
    if (fn:exists(map:get($params, "target-database"))) then
      xdmp:database(map:get($params, "target-database"))
    else
      xdmp:database($config:FINAL-DATABASE)
  (: add the target database to the harmonization options :)
  let $_ := (
    flow:set-default-options($options, $flow),
    map:put($options, "target-database", $target-database)
  )
  let $error :=
    try {
      runIngestHarmonize:run-flow($job-id, $flow, $uri, (), $options)
    }
    catch($ex) {
      xdmp:log(("caught error in run-ingest-harmonize.xqy")),
      xdmp:log($ex/error:format-string),
      $ex/error:format-string
    }

  return
    document {
      element response {
        element ingestion {
          $envelope
        },
        element harmonization {
          if (fn:empty($error)) then (
            element harmonizationSuccessful {fn:true()},
            element errorFound {fn:false()}
          )
          else (
            element harmonizationSuccessful {fn:false()},
            element errorFound {fn:true()},
            element errorMessage {$error}
          )
        }
      }
    }
};

declare private function runIngestHarmonize:run-flow(
  $job-id as xs:string,
  $flow as element(hub:flow),
  $uri as xs:string,
  $content as node()?,
  $options as map:map)
{
  (: The PUT command runs in update mode, so we need to eval in query mode :)
  xdmp:eval('
    import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
      at "/data-hub/4/impl/flow-lib.xqy";

    declare variable $job-id external;
    declare variable $flow external;
    declare variable $uri external;
    declare variable $content external;
    declare variable $options external;

    flow:run-flow($job-id, $flow, $uri, $content, $options)
  ',
  map:new((
    map:entry("job-id", $job-id),
    map:entry("flow", $flow),
    map:entry("uri", $uri),
    map:entry("content", $content),
    map:entry("options", $options)
  )))
};

declare private function runIngestHarmonize:insert-document(
  $uri as xs:string,
  $root as node(),
  $options as element()?) as empty-sequence()
{
  (: We need to evaluate the insert in a separate transaction so that it is visible to the harmonization flow :)
  xdmp:eval('
    declare variable $uri external;
    declare variable $root external;
    declare variable $options external;
    declare variable $collections external;

    xdmp:document-insert($uri, $root, $options)
  ',
  map:new((
    map:entry("uri", $uri),
    map:entry("root", $root),
    map:entry("options", $options)
  )))
};
