xquery version "1.0-ml";

module namespace nifi = "http://marklogic.com/data-hub/nifi";

import module namespace json = "http://marklogic.com/xdmp/json" at "/MarkLogic/json/json.xqy";

import module namespace nifi = "http://marklogic.com/data-hub/nifi" at
"database-client-service.xqy",
"get-file.xqy",
"invoke-http.xqy",
"log-attribute.xqy",
"log-message.xqy",
"merge-content.xqy",
"options-json.xqy",
"put-marklogic.xqy",
"run-flow-step.xqy",
"split-text.xqy",
"update-attribute.xqy";

declare namespace jb = "http://marklogic.com/xdmp/json/basic";

declare function build-template($flow-uri as xs:string) as element(template)
{
  build-template-from-flow(doc($flow-uri))
};

declare function build-template-from-flow($flow-json as item()) as element(template)
{
  let $flow := json:transform-from-json($flow-json)
  let $flow-name := $flow/jb:name/fn:string()

  let $group-id := sem:uuid-string()

  (:
  TODO This should really be flow-operator, but it defaults to admin so that a mapping step can fetch an entity document from
  a schemas database, where it likely has no permissions on it. A fix is planned for 5.0.3 that should allow for
  flow-operator to be the default user here instead.
  :)
  let $username := "admin"

  let $database-client-service := nifi:build-database-client-service(map:new((
    map:entry("parent-group-id", $group-id),
    map:entry("username", $username)
  )))

  (: Define variables to keep track of the NiFi objects to add to the template :)
  let $connections := ()
  let $controller-services := $database-client-service
  let $processors := ()

  (:
  Need to keep track of this so we know if a connection needs to be created to this step's
  first processor from the last step's last processor
  :)
  let $last-step-last-processor := ()

  (: Where on the X axis to start adding columns of processors, with each step in a separate column :)
  let $initial-x := 700

  (: The amount of space between each column of processors :)
  let $x-padding := 500

  let $_ :=
    for $step at $step-number in $flow/jb:steps/element()
    let $step-x := $initial-x + (($step-number - 1) * $x-padding)
    let $step-name := $step/jb:name/fn:string()

    (: Used for splitting up the collected URIs into smaller batches :)
    let $batch-size :=
      let $val := $step/jb:batchSize/fn:string()
      return if ($val = "0") then 100 else xs:integer($val)

    return
      if (fn:lower-case($step/jb:stepDefinitionType) = "ingestion") then
        let $thread-count :=
          let $val := $step/jb:threadCount/fn:string()
          return if ($val = "0") then 4 else xs:integer($val)

        let $get-file := nifi:build-get-file(map:new((
          map:entry("name", "Get Files"),
          map:entry("parent-group-id", $group-id),
          (: This needs to be an absolute path for NiFi to be happy :)
          map:entry("input-directory", $step/jb:fileLocations/jb:inputFilePath/fn:string()),
          map:entry("x", $step-x),
          map:entry("y", 0)
        )))
        let $update-attribute := nifi:build-update-attribute(map:new((
          map:entry("name", "Set marklogic.uri"),
          map:entry("parent-group-id", $group-id),
          map:entry("x", $step-x),
          map:entry("y", 220),
          map:entry("flow-name", $flow-name),
          map:entry("step-name", $step-name)
        )))

        let $put-marklogic := nifi:build-put-marklogic(map:new((
          map:entry("parent-group-id", $group-id),
          map:entry("x", $step-x),
          map:entry("y", 440),
          map:entry("flow-name", $flow-name),
          map:entry("collections", fn:string-join($step/jb:options/jb:collections/jb:item/fn:string(), ",")),
          map:entry("thread-count", $thread-count),
          map:entry("batch-size", $batch-size),
          map:entry("databaseclient-service-id", $database-client-service/id/fn:string())
        )))

        return (
          xdmp:set($processors, ($processors, $get-file, $update-attribute, $put-marklogic)),
          xdmp:set($connections, (
            $connections,
            build-connection($group-id, $get-file, $update-attribute, "success"),
            build-connection($group-id, $update-attribute, $put-marklogic, "success")
          ))
        )

      else

        let $collect-uris := nifi:build-invoke-http-processor(map:new((
          map:entry("name", "Collect URIs - " || $step-name),
          map:entry("parent-group-id", $group-id),
          map:entry("x", $step-x),
          map:entry("y", 0),
          map:entry("http-method", "GET"),
          map:entry("remote-url", "http://${host}:${stagingPort}/v1/internal/hubcollector5?flow-name=" || $flow-name || "&amp;database=data-hub-STAGING&amp;step=" || $step-number),
          map:entry("basic-authentication-username", $username),
          map:entry("digest-authentication", "true")
        )))

        let $split-text := nifi:build-split-text-processor(map:new((
          map:entry("name", "Split URIs into batches"),
          map:entry("parent-group-id", $group-id),
          map:entry("x", $step-x),
          map:entry("y", 220),
          map:entry("line-split-count", $batch-size)
        )))

        let $build-options-json := nifi:build-options-json-processor(map:new((
          map:entry("parent-group-id", $group-id),
          map:entry("x", $step-x),
          map:entry("y", 440)
        )))

        let $run-flow-step := nifi:build-run-flow-step(map:new((
          map:entry("name", "Process URIs - " || $step-name),
          map:entry("parent-group-id", $group-id),
          map:entry("x", $step-x),
          map:entry("y", 660),
          map:entry("databaseclient-service-id", $database-client-service/id/fn:string()),
          map:entry("flow-name", $flow-name),
          map:entry("step-number", $step-number)
        )))

        let $log-results := nifi:build-log-attribute-processor(
          map:new((
            map:entry("name", "Log Results - " || $step-name),
            map:entry("parent-group-id", $group-id),
            map:entry("x", $step-x),
            map:entry("y", 880),
            map:entry("log-payload", "true")
          )))

        let $merge-content := nifi:build-merge-content-process(map:new((
          map:entry("parent-group-id", $group-id),
          map:entry("x", $step-x),
          map:entry("y", 1100)
        )))

        let $log-message := nifi:build-log-message-processor(map:new((
          map:entry("parent-group-id", $group-id),
          map:entry("x", $step-x),
          map:entry("y", 1320),
          map:entry("log-message", $step-name || " completed")
        )))

        return (
          xdmp:set($processors, (
            $processors,
            $collect-uris, $split-text, $build-options-json, $run-flow-step, $log-results, $merge-content, $log-message
          )),
          xdmp:set($connections, (
            $connections,
            build-connection($group-id, $collect-uris, $split-text, "Response"),
            build-connection($group-id, $split-text, $build-options-json, "splits"),
            build-connection($group-id, $build-options-json, $run-flow-step, "success"),
            build-connection($group-id, $run-flow-step, $log-results, "success"),
            build-connection($group-id, $log-results, $merge-content, "success"),
            build-connection($group-id, $merge-content, $log-message, "merged"),

            if ($last-step-last-processor) then
              build-connection($group-id, $last-step-last-processor, $collect-uris, "merged")
            else (),

            xdmp:set($last-step-last-processor, $merge-content)
          ))
        )

  return
    <template encoding-version="1.2">
      <description>NiFi template for DHF flow {$flow-name}</description>
      <groupId>{sem:uuid-string()}</groupId>
      <name>{$flow-name}-{fn:current-dateTime()}</name>
      <snippet>
        <processGroups>
          <id>{$group-id}</id>
          <position>
            <x>0.0</x>
            <y>0.0</y>
          </position>
          <contents>
            {$connections, $controller-services, $processors}
          </contents>
          <name>{$flow-name}</name>
          <variables>
            <entry>
              <key>host</key>
              <value>localhost</value>
            </entry>
            <entry>
              <key>stagingPort</key>
              <value>8010</value>
            </entry>
            <entry>
              <key>stagingDatabase</key>
              <value>data-hub-STAGING</value>
            </entry>
          </variables>
        </processGroups>
      </snippet>
    </template>

};

declare function build-connection(
  $group-id as xs:string,
  $from-processor as element(processors),
  $to-processor as element(processors),
  $relationships as xs:string*
)
{
  <connections>
    <id>{sem:uuid-string()}</id>
    <parentGroupId>{$group-id}</parentGroupId>
    <backPressureDataSizeThreshold>1 GB</backPressureDataSizeThreshold>
    <backPressureObjectThreshold>10000</backPressureObjectThreshold>
    <destination>
      <groupId>{$group-id}</groupId>
      <id>{$to-processor/id/fn:string()}</id>
      <type>PROCESSOR</type>
    </destination>
    <flowFileExpiration>0 sec</flowFileExpiration>
    <labelIndex>1</labelIndex>
    <loadBalanceCompression>DO_NOT_COMPRESS</loadBalanceCompression>
    <loadBalancePartitionAttribute></loadBalancePartitionAttribute>
    <loadBalanceStatus>LOAD_BALANCE_NOT_CONFIGURED</loadBalanceStatus>
    <loadBalanceStrategy>DO_NOT_LOAD_BALANCE</loadBalanceStrategy>
    <name></name>
    {$relationships ! element selectedRelationships {.}}
    <source>
      <groupId>{$group-id}</groupId>
      <id>{$from-processor/id/fn:string()}</id>
      <type>PROCESSOR</type>
    </source>
    <zIndex>0</zIndex>
  </connections>
};
