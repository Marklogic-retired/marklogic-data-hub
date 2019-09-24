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

module namespace service = "http://marklogic.com/rest-api/resource/mlDeleteJobs";

import module namespace job = "http://marklogic.com/data-hub/job-lib"
  at "/data-hub/4/impl/job-lib.xqy";

import module namespace perf = "http://marklogic.com/data-hub/perflog-lib"
  at "/data-hub/4/impl/perflog-lib.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";

declare option xdmp:mapping "false";

(:
 : REST API extension to delete jobs and associated traces.
 : Note: it shouldn't be necessary to use xdmp:invoke-function below, but a bug
 : in ML 8.0-7 (fixed in 8.0-7.1) messes up the transaction mode.
 :
 : Also, ML 9.0-1.1 is the only DHF-supported version that does not support the
 : <update> option for xdmp:invoke-function. (<transaction-mode> has been deprecated.)
 :)
declare %rapi:transaction-mode("update") function service:post(
    $context as map:map,
    $params  as map:map,
    $input   as document-node()*
) as document-node()?
{
  let $options :=
    <options xmlns="xdmp:eval">
      {
        if (xdmp:version() = "9.0-1.1") then
          <transaction-mode>update-auto-commit</transaction-mode>
        else
          <update>true</update>
      }
      <ignore-amps>{fn:true()}</ignore-amps>
      <isolation>same-statement</isolation>
      <ignore-amps>true</ignore-amps>
    </options>
  return
    perf:log('/v1/resources/delete-jobs:post', function() {
      xdmp:invoke-function(
        function() {
          let $job-ids := fn:tokenize(map:get($params, "jobIds"), ",")
          return
            job:delete-jobs-and-traces($job-ids)
        },
        $options
      )
    })
};
