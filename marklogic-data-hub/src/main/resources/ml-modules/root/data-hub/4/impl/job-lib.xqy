(:
  Copyright 2012-2019 MarkLogic Corporation

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

module namespace job = "http://marklogic.com/data-hub/job-lib";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";

declare option xdmp:mapping "false";

declare variable $SUCCESS-KEY := "success";
declare variable $FAILED-KEY  := "failed";

(:
 : Given a list of job-ids, delete those jobs and any traces associated with them.
 :
 : ML 9.0-1.1 is the only DHF-supported version that does not support the <update> option
 : for xdmp:invoke-function. (<transaction-mode> has been deprecated.)
 :)
declare function job:delete-jobs-and-traces($job-ids as xs:string*)
{
  let $job-results := job:delete-jobs($job-ids)
  let $options :=
    <options xmlns="xdmp:eval">
      {
        if (xdmp:version() = "9.0-1.1") then
          <transaction-mode>update-auto-commit</transaction-mode>
        else
          <update>true</update>
      }
      <isolation>different-transaction</isolation>
      <database>{xdmp:database($config:TRACE-DATABASE)}</database>
      <ignore-amps>{fn:true()}</ignore-amps>
    </options>
  let $deleted-traces :=
    xdmp:invoke-function(
      function() {
        job:delete-traces($job-ids)
      },
      $options
    )
  return
    document {
      object-node {
        "totalCount": fn:count(map:get($job-results, $SUCCESS-KEY)),
        "errorCount": fn:count(map:get($job-results, $FAILED-KEY)),
        "deletedJobs": json:to-array(map:get($job-results, $SUCCESS-KEY)),
        "deletedTraces": json:to-array($deleted-traces),
        "failedJobs": json:to-array(map:get($job-results, $FAILED-KEY)),
        "failedTraces": json:array(),
        "errors": json:array()
      }
    }
};

declare private function job:delete-jobs($job-ids as xs:string*) as map:map
{
  let $results := map:map()
  let $_ :=
    for $id in $job-ids
    let $uri := cts:uris((), (), 
                cts:and-query(
                    ( cts:directory-query("/jobs/"), cts:json-property-value-query("jobId", $id))))
    return
      if (fn:doc-available($uri)) then (
        xdmp:document-delete($uri),
        map:put($results, $SUCCESS-KEY, (map:get($results, $SUCCESS-KEY), $id))
      )
      else
        map:put($results, $FAILED-KEY, (map:get($results, $FAILED-KEY), $id))
  return $results
};

(:
 : tracing document includes:
 : <jobId>be3ae963-2cc7-4bcb-b71a-b25e585b7df5</jobId>
 : <traceId>11614584719163504615</traceId>
:)
declare private function job:delete-traces($job-ids as xs:string*) as xs:string*
{
  for $id in $job-ids
  for $trace in /trace[jobId = $id]/traceId
  let $_ := xdmp:document-delete(xdmp:node-uri($trace))
  return $trace/fn:string()
};

