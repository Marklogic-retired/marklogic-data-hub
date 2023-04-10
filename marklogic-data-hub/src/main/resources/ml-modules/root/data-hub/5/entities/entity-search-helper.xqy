(:
  Copyright (c) 2023 Progress Corporation

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
module namespace entity-search-lib = "http://marklogic.com/data-hub/entity-search-lib";

(: These functions were moved to XQuery to avoid seg faults in ML 10.0-9.5 :)

declare function getDocumentMetadata($doc as document-node()) as json:object {
  json:object()
    => map:with("lastProcessedByFlow", xdmp:node-metadata-value($doc, "datahubCreatedInFlow"))
    => map:with("lastProcessedByStep", xdmp:node-metadata-value($doc, "datahubCreatedByStep"))
    => map:with("lastProcessedDateTime", xdmp:node-metadata-value($doc, "datahubCreatedOn"))
};

declare variable $sizes as xs:string* := ('B', 'KB', 'MB');
declare variable $bytes-log := math:log(1024);

declare function getDocumentSize($doc as document-node()) as json:object {
  let $is-binary := $doc/node() instance of binary()
  let $binary := if ($is-binary) then $doc/node() else xdmp:unquote(xdmp:quote($doc), (), "format-binary")/node()
  let $bytes := xdmp:binary-size($binary)
  let $power := fn:floor(math:log($bytes) div $bytes-log)
  let $power := if ($power gt 2) then 2 else $power
  let $value := $bytes idiv math:pow(1024, $power)
  let $units := $sizes[$power + 1]
  return json:object()
             => map:with("value", $value)
             => map:with("units", $units)
};