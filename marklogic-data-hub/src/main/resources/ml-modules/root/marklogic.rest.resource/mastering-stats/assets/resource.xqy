(:
  Copyright 2012-2018 MarkLogic Corporation

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

module namespace service = "http://marklogic.com/rest-api/resource/ml:mastering-stats";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
at "/com.marklogic.smart-mastering/constants.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";

declare option xdmp:mapping "false";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $json := json:object()
  let $m := cts:values(cts:collection-reference(), (), ("item-frequency", "map"))
  let $_ := for $key in map:keys($m) return map:put($m, $key, cts:frequency(map:get($m, $key)))
  let $_ := map:put($json, "docCount", xdmp:estimate(cts:search(fn:doc(), cts:collection-query(cts:collection-match("mdm-import://*")), "unfiltered")))
  let $_ := map:put($json, "mergeCount", xdmp:estimate(cts:search(fn:doc(), cts:and-not-query(cts:collection-query($const:MERGED-COLL), cts:collection-query($const:ARCHIVED-COLL)), "unfiltered")))
  let $_ := map:put($json, "instanceCount", map:get($m, $const:CONTENT-COLL))
  let $_ := map:put($json, "notificationCount", map:get($m, $const:NOTIFICATION-COLL))
  return
    document {
      xdmp:to-json($json)
    }
};

declare %rapi:transaction-mode("update") function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  document { () }
};
