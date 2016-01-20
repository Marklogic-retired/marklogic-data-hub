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

import module namespace entity = "http://marklogic.com/hub-in-a-box/entity-lib"
  at "/com.marklogic.hub/lib/entity-lib.xqy";

declare option xdmp:mapping "false";

declare variable $api-version := xdmp:get-request-field("api-version", "v1");

xdmp:set-response-content-type("application/json"),
map:new((
  map:entry("swagger", "2.0"),
  map:entry("info", map:new((
    map:entry("description", "Data Hub in a Box. Load all the data."),
    map:entry("title", "Data Hub in a Box"),
    map:entry("version", "1.0.0")
  ))),
  map:entry("host", xdmp:get-request-header("Host", xdmp:host-name())),
  map:entry("basePath", "/hub/" || $api-version || "/entitites"),
  map:entry("consumes", json:to-array(("application/json", "applicaiton/xml"))),
  map:entry("produces", json:to-array(("application/json", "text/xml", "text/html"))),
  map:entry("tags", json:to-array(("hub", "awesome"))),
  map:entry("schemes", json:to-array(("http"))),
  map:entry("paths",
    map:new((
      (: TODO: PUT DYNAMIC PATHS HERE BASED ON REGISTERED ENTITITES :)
    ))
  ),
  map:entry("securityDefinitions", ""),
  map:entry("definitions", map:new(())),
  map:entry("externalDocs", "")
))
