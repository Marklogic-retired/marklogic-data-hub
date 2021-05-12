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
xquery version "1.0-ml";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";
import module namespace system = "http://marklogic.com/data-hub/system"
  at "/data-hub/5/system/system-lib.xqy";

let $rewriter := system:get-default-rewriter()

let $job-routes := <wrapper xmlns="http://marklogic.com/xdmp/rewriter">
    <match-path matches="^/?$">
        <dispatch>/trace-ui/index.html</dispatch>
    </match-path>
    <match-path matches="^/?$|^/content/([^/]+)/?$">
        <dispatch>/trace-ui/index.html</dispatch>
    </match-path>
    <match-path matches="^/.*\.(ico|js|css|ttf|eot|woff|woff2|svg)$">
        <add-query-param name="uri">$0</add-query-param>
        <add-query-param name="extension">$1</add-query-param>
        <dispatch>/data-hub/4/tracing/trace-ui.xqy</dispatch>
    </match-path>
    <match-path matches="^/assets/.+$">
        <add-query-param name="uri">$0</add-query-param>
        <dispatch>/data-hub/4/tracing/trace-ui.xqy</dispatch>
    </match-path>
    <match-path matches="^/hub">
        <match-path matches="^/hub/traces">
            <match-path matches="^/hub/traces/?$">
                <dispatch>/data-hub/4/tracing/get-traces.xqy</dispatch>
            </match-path>
            <match-path matches="^/hub/traces/ids">
                <dispatch>/data-hub/4/tracing/get-ids.xqy</dispatch>
            </match-path>
            <match-path matches="^/hub/traces/search">
                <dispatch>/data-hub/4/tracing/search.xqy</dispatch>
            </match-path>
            <match-path matches="^/hub/traces/(\d+)">
                <add-query-param name="id">$1</add-query-param>
                <dispatch>/data-hub/4/tracing/get-trace.xqy</dispatch>
            </match-path>
        </match-path>
    </match-path>
</wrapper>

let $jobs-rewriter := element {fn:node-name($rewriter)} {
  $rewriter/@*,
  $job-routes/element(),
  $rewriter/element()
}

return xdmp:invoke-function(
  function() {
    let $my-uri := "/data-hub/5/data-services/system/createCustomRewriters.xqy"
    return xdmp:document-insert(
      "/data-hub/5/rest-api/jobs-rewriter.xml", $jobs-rewriter,
      xdmp:document-get-permissions($my-uri),
      xdmp:document-get-collections($my-uri)
    )
  },
  <options xmlns="xdmp:eval">
    <database>{xdmp:database($config:MODULES-DATABASE)}</database>
  </options>
)
