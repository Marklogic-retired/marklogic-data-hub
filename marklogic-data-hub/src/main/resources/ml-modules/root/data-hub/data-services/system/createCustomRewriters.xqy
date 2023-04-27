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

xdmp:security-assert("http://marklogic.com/xdmp/privileges/any-uri", "execute"),

let $rewriter := system:get-default-rewriter()

(:
Per DHFPROD-7334, DHF 5.5 is no longer forking a couple dozen REST API modules in order to support the "ml:*"
pattern for REST extensions. This was producing other bugs due to DHF using a forked rewriter that didn't always match up
with the version of ML that was installed. DHF 5 still makes use of ml:hubversion, and it's expected that some DHF 4 users may
still be hitting ml:flow and ml:sjsFlow directly, so those 3 routes are supported below. Note that the collector endpoints
could be easily replaced by Data Service endpoints, thus removing the need for the two collector routes below.
:)
let $staging-routes := <wrapper xmlns="http://marklogic.com/xdmp/rewriter">
  <match-path matches="^/(v1|LATEST)/internal/hubcollector5/?$">
    <match-method any-of="GET">
      <match-query-param name="database">
        <set-database checked="true">$0</set-database>
      </match-query-param>
      <dispatch>/data-hub/5/endpoints/collector.mjs</dispatch>
    </match-method>
  </match-path>
</wrapper>

let $staging-rewriter := element {fn:node-name($rewriter)} {
  $rewriter/@*,
  $staging-routes/element(),
  $rewriter/element()
}

let $_ := xdmp:invoke-function(
  function() {
    let $my-uri := "/data-hub/data-services/system/createCustomRewriters.xqy"
    let $module-permissions := xdmp:document-get-permissions($my-uri)
    let $module-collections := xdmp:document-get-collections($my-uri)
    return (
      xdmp:document-insert(
        "/data-hub/5/rest-api/jobs-rewriter.xml", $rewriter, $module-permissions, $module-collections
      ),
      xdmp:document-insert(
        "/data-hub/5/rest-api/staging-rewriter.xml", $staging-rewriter, $module-permissions, $module-collections
      )
    )
  },
  <options xmlns="xdmp:eval">
    <database>{xdmp:database($config:MODULES-DATABASE)}</database>
  </options>
)

return ($staging-rewriter)
