(:
  Copyright (c) 2021 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
:)

(: This is a general extension to MarkLogic PROV library to handle PROV record creation and insertion :)

xquery version "1.0-ml";

module namespace dhps = "http://marklogic.com/data-hub/dh-provenance-services";

declare namespace prov = "http://www.w3.org/ns/prov#";
declare namespace xs="http://www.w3.org/2001/XMLSchema";

declare private variable $dhps-collection as xs:string := "http://marklogic.com/provenance-services/record";
declare private variable $user-role as xs:string := "ps-user";
declare private variable $internal-role as xs:string := "ps-internal";
declare private variable $ps-dir as xs:string := "/provenance/";


declare function new-provenance-record($id as xs:anyURI, $options as map:map) as node() {
  let $record := map:map()
  let $record := $record=>job-record-activity($id, $options)=>job-record-agent($options)=>job-record-associatedWith($id, $options)=>build()
  return $record
};

declare function insert-provenance-record($doc as node(), $target-database as xs:string) as xs:string {
  let $uri := record-uri(fn:head($doc/prov:activity/@prov:id))
  let $permissions := (xdmp:permission($internal-role,"update"), xdmp:permission($user-role,"read"))
  let $_ := dhps-document-insert($uri, $doc, $permissions, $dhps-collection, $target-database)
  return $uri
};

declare function update-endTime-in-provenance-record($uri as xs:string, $options as map:map*, $target-database as xs:string) as empty-sequence() {
  let $path := "prov:document/prov:activity"
  let $child-node := <prov:endTime>{map-get($options, "endTime")}</prov:endTime>
  return dhps-document-update($uri, $child-node, $path, $target-database)
};

declare function update-step-in-provenance-record($uri as xs:string, $options as map:map*, $target-database as xs:string) as empty-sequence() {
  let $path := "prov:document"
  let $step-name := map-get($options, "stepName")
  let $job-id := map-get($options, "jobId")

  let $prov-id := fn:concat("step:", $step-name)
  let $activity-ref := fn:concat("job:", $job-id)

  let $_ := job-record-step-entity($prov-id, "dh:Step", $step-name, $uri, $path, $target-database)
  let $_ := job-record-step-used($activity-ref, $step-name, "", $uri, $path, $target-database)
  return ()
};

declare function update-entity-in-provenance-record($uri as xs:string, $options as map:map*, $target-database as xs:string) as empty-sequence() {
  let $path := "prov:document"
  let $target-entity-type := map-get($options, "targetEntityType")
  let $label := fn:tokenize($target-entity-type, "/")[last()]
  let $job-id := map-get($options, "jobId")

  let $prov-id := $target-entity-type
  let $activity-ref := fn:concat("job:", $job-id)

  let $node-exists := xdmp:invoke-function(
    function() {
      let $doc := fn:doc($uri)
      return $doc/prov:document/prov:entity/@prov:id=$prov-id
    },
    <options xmlns="xdmp:eval">
      <database>{xdmp:database($target-database)}</database>
    </options>
  )

  return
    if ($node-exists = fn:false()) then
      let $_ := job-record-step-entity($prov-id, "dh:EntityType", $label, $uri, $path, $target-database)
      let $_ := job-record-step-used($activity-ref, $target-entity-type, "dh:TargetEntityType", $uri, $path, $target-database)
      return ()
    else ()
};

declare private function build($map as map:map) as node(){
  wrap-in-prov-document(build-components($map))
};

declare private function build-components($map as map:map) as node()*{
  (
    map:get($map,"activity"),
    map:get($map,"agent"),
    map:get($map,"wasAssociatedWith")
  )
};

declare private function dhps-document-insert($uri as xs:string, $doc as node(), $permissions as item()*, $collections as xs:string*, $target-database as xs:string) as empty-sequence(){
  xdmp:invoke-function(
    function() { xdmp:document-insert($uri,$doc,$permissions,$collections), xdmp:commit() },
    <options xmlns="xdmp:eval">
      <database>{xdmp:database($target-database)}</database>
    </options>
  )
};

declare private function dhps-document-update($uri as xs:string, $child-node as node(), $path as xs:string, $target-database as xs:string) as empty-sequence(){
  xdmp:invoke-function(
    function() {
      let $namespaces := map:map()
      let $_ := map:put($namespaces, "prov", "http://www.w3.org/ns/prov#")
      return xdmp:node-insert-child(xdmp:unpath($path, $namespaces, doc($uri)), $child-node)
    },
    <options xmlns="xdmp:eval">
      <database>{xdmp:database($target-database)}</database>
    </options>
  )
};

declare private function job-record-activity($map as map:map, $id as xs:string, $options as map:map*) as map:map {
  let $prov-id := fn:concat("job:", $id)
  let $rec :=
    <prov:activity prov:id="{$prov-id}">
      <prov:label>{$id}</prov:label>
      <prov:type xsi:type="xsd:QName">dh:Job</prov:type>
      <prov:startTime>{map-get($options, "startDateTime")}</prov:startTime>
    </prov:activity>
  let $_ := map:put($map, "activity", $rec)
  return $map
};

declare private function job-record-agent($map as map:map, $options as map:map*) as map:map {
  let $user := map-get($options,"user")
  let $prov-id := fn:concat("user:", $user)
  let $rec :=
    <prov:agent prov:id="{$prov-id}">
      <prov:label>{$user}</prov:label>
      <prov:type xsi:type="xsd:QName">dh:User</prov:type>
    </prov:agent>
  let $_ := map:put($map, "agent", $rec)
  return $map
};

declare private function job-record-associatedWith($map as map:map, $id as xs:string, $options as map:map*) as map:map {
  let $user := fn:concat("user:",map-get($options,"user"))
  let $prov-id := fn:concat("job:", $id)
  let $rec :=
    <prov:wasAssociatedWith>
      <prov:activity prov:ref="{$prov-id}"/>
      <prov:agent prov:ref="{$user}"/>
    </prov:wasAssociatedWith>
  let $_ := map:put($map, "wasAssociatedWith", $rec)
  return $map
};

declare private function job-record-step-entity($prov-id as xs:string, $prov-type as xs:string, $label as xs:string,
  $uri as xs:string, $path as xs:string, $target-database as xs:string) as empty-sequence() {

  let $child-node :=
    <prov:entity prov:id="{$prov-id}">
      <prov:type xsi:type="xsd:QName">{$prov-type}</prov:type>
      <prov:label>{$label}</prov:label>
    </prov:entity>
  return dhps-document-update($uri, $child-node, $path, $target-database)
};

declare private function job-record-step-used($activity-ref as xs:string, $entity-ref as xs:string, $prov-type as xs:string,
  $uri as xs:string, $path as xs:string, $target-database as xs:string) as empty-sequence() {

  let $child-node :=
    if(fn:not(fn:empty($prov-type)) and fn:compare($prov-type, "dh:TargetEntityType") = 0) then
      <prov:used>
        <prov:activity prov:ref="{$activity-ref}" />
        <prov:entity prov:ref="{$entity-ref}" />
        <prov:type xsi:type="xsd:QName">{$prov-type}</prov:type>
      </prov:used>
    else
      <prov:used>
        <prov:activity prov:ref="{$activity-ref}" />
        <prov:entity prov:ref="{$entity-ref}" />
      </prov:used>

  return dhps-document-update($uri, $child-node, $path, $target-database)
};

declare private function map-get($map as map:map, $key as xs:string){
  let $items := map:get($map,$key)
  return
    if ($items instance of json:array) then
      json:array-values($items)
    else
      $items
};

declare private function record-uri($provID as xs:string) as xs:string {
  let $uri := $ps-dir||xdmp:sha256($provID)||".xml"
  return $uri
};

declare private function wrap-in-prov-document($nodes as node()*) {
  element prov:document {
    namespace prov {"http://www.w3.org/ns/prov#"},
    namespace xsi {"http://www.w3.org/2001/XMLSchema-instance"},
    namespace ps  {"http://marklogic.com/provenance-services"},
    namespace dh  {"http://marklogic.com/data-hub/prov#"},
    namespace job  {"http://marklogic.com/data-hub/job#"},
    namespace step  {"http://marklogic.com/data-hub/step#"},
    $nodes
  }
};
