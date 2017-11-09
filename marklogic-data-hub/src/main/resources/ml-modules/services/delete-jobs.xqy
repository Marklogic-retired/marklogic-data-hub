(:
  Copyright 2012-2016 MarkLogic Corporation

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
xquery version "1.0-ml";

module namespace service = "http://marklogic.com/rest-api/resource/delete-jobs";

declare namespace rapi = "http://marklogic.com/rest-api";

declare option xdmp:mapping "false";

declare private function service:delete-jobs($job-ids as xs:string*) as xs:string*
{
  for $id in $job-ids
  let $uri := cts:uris((), (), cts:json-property-value-query("jobId", $id))
  return (
    xdmp:document-delete($uri),
    $id
  )
};

(:
 : tracing document includes:
 : <jobId>be3ae963-2cc7-4bcb-b71a-b25e585b7df5</jobId>
 : <traceId>11614584719163504615</traceId>
:)
declare private function service:delete-traces($job-ids as xs:string*) as xs:string*
{
  for $id in $job-ids
  let $traces := /trace[jobId = $id]/traceId
  for $trace in $traces
  let $_ := xdmp:document-delete(fn:base-uri($trace))
  return $trace/fn:string()
};

declare %rapi:transaction-mode("update") function service:post(
    $context as map:map,
    $params  as map:map,
    $input   as document-node()*
) as document-node()*
{
  xdmp:log("delete-jobs: " || xdmp:quote($params)),
  let $job-ids := fn:tokenize(map:get($params, "jobIds"), ",")
  let $deleted-jobs := service:delete-jobs($job-ids)
  let $deleted-traces :=
    xdmp:invoke-function(
      function() {
        service:delete-traces($job-ids)
      },
      <options xmlns="xdmp:eval">
        <database>{xdmp:database(map:get($params, "tracingDB"))}</database>
      </options>
    )
  return
    document {
      object-node {
        "totalCount": fn:count($job-ids),
        "errorCount": 0,
        "deletedJobs": json:to-array($deleted-jobs),
        "deletedTraces": json:to-array($deleted-traces),
        "failedJobs": json:array(),
        "failedTraces": json:array(),
        "errors": json:array()
      }
    }
};
