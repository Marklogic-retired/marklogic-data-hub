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

declare namespace rewriter = "http://marklogic.com/xdmp/rewriter";

let $custom-rewriter := __CUSTOM_REWRITER__
return
  xdmp:invoke-function(function() {
    xdmp:document-insert("/com.marklogic.hub/rewriter.xml",
    <rewriter xmlns="http://marklogic.com/xdmp/rewriter">
    {
      $custom-rewriter/node(),
      xdmp:read-cluster-config-file("../Modules/MarkLogic/rest-api/rewriter.xml")/rewriter:rewriter/node()
    }
    </rewriter>)
  },
  <options xmlns="xdmp:eval">
    <database>{xdmp:modules-database()}</database>
    <transaction-mode>update-auto-commit</transaction-mode>
  </options>)
