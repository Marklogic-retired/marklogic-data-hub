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

module namespace service = "http://marklogic.com/rest-api/resource/mlHubstats";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";

declare option xdmp:mapping "false";

declare function service:get-db-count($db)
{
  xdmp:invoke-function(function() {
    xdmp:estimate(fn:doc())
  },
  map:new((map:entry("database", xdmp:database($db)), map:entry("ignoreAmps", fn:true())))
  )
};

(:~
 : Entry point for java to get hub stats
 :
 :)
declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
    xdmp:set-response-content-type("application/json"),
    let $staging-count := service:get-db-count($config:STAGING-DATABASE)
    let $final-count := service:get-db-count($config:FINAL-DATABASE)
    let $job-count := service:get-db-count($config:JOB-DATABASE)
    let $trace-count := service:get-db-count($config:TRACE-DATABASE)
    let $stats := json:object()
    let $_ := (
      map:put($stats, "stagingCount", $staging-count),
      map:put($stats, "stagingDb", $config:STAGING-DATABASE),
      map:put($stats, "finalCount", $final-count),
      map:put($stats, "finalDb", $config:FINAL-DATABASE),
      map:put($stats, "jobCount", $job-count),
      map:put($stats, "jobDb", $config:JOB-DATABASE),
      map:put($stats, "traceCount", $trace-count),
      map:put($stats, "traceDb", $config:TRACE-DATABASE)
    )
    return
      document {
        xdmp:to-json($stats)
      }
};
