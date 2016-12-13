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

module namespace job = "http://marklogic.com/data-hub/job";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/lib/config.xqy";

import module namespace err = "http://marklogic.com/data-hub/err"
  at "/com.marklogic.hub/lib/error-lib.xqy";

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";

import module namespace search = "http://marklogic.com/appservices/search"
  at "/MarkLogic/appservices/search/search.xqy";

declare namespace msb = "http://marklogic.com/spring-batch";
declare option xdmp:mapping "false";

declare function job:job-to-json-slim($job as element(msb:mlJobInstance))
{
  let $o := json:object()
  let $_ := (
    map:put($o, "jobId", $job/msb:jobInstance/msb:id/string()),
    map:put($o, "jobName", $job/msb:jobInstance/msb:jobName/string()),

    let $job-execution := ($job/msb:jobExecutions/msb:jobExecution)[1]
    return (
      map:put($o, "startTime", $job-execution/msb:startDateTime/xs:dateTime(.)),
      map:put($o, "endTime", $job-execution/msb:endDateTime/xs:dateTime(.)),
      map:put($o, "lastUpdated", $job-execution/msb:lastUpdatedDateTime/xs:dateTime(.)),
      map:put($o, "status", $job-execution/msb:status/string()),

      for $entry in $job-execution/msb:executionContext/msb:map/entry
      return
        map:put($o, $entry/*:key/string(), $entry/*:value/string()),

      for $param in $job-execution/msb:jobParameters/msb:jobParameter
      return
        map:put($o, $param/@key, fn:string($param))
    )
  )
  return
    $o
};
