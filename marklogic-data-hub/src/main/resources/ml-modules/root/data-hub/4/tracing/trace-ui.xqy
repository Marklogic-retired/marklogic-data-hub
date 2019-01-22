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

import module namespace hul = "http://marklogic.com/data-hub/hub-utils-lib"
  at "/data-hub/4/impl/hub-utils-lib.xqy";

import module namespace debug = "http://marklogic.com/data-hub/debug"
  at "/data-hub/4/impl/debug-lib.xqy";

declare option xdmp:mapping "false";

debug:dump-env()
,
switch (xdmp:get-request-field("extension"))
case "css" return   xdmp:set-response-content-type("text/css")
case "js" return    xdmp:set-response-content-type("application/javascript")
case "ico" return   xdmp:set-response-content-type("image/vnd.microsoft.icon")
case "ttf" return   xdmp:set-response-content-type("application/font-sfont")
case "eot" return   xdmp:set-response-content-type("application/vnd.ms-fontobject")
case "woff" return  xdmp:set-response-content-type("application/font-woff")
case "woff2" return xdmp:set-response-content-type("application/font-woff2")
case "svg" return   xdmp:set-response-content-type("image/svg+xml")
default return      ()
,
xdmp:log(("FIELD", xdmp:get-request-field("uri")))
,
hul:run-in-modules(function() {
  fn:doc("/trace-ui" || xdmp:get-request-field("uri"))
})
