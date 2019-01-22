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

import module namespace errut = "http://marklogic.com/rest-api/lib/error-util"
    at "/MarkLogic/rest-api/lib/error-util.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare variable $error:errors as element(error:error)* external;
declare variable $code := xdmp:get-response-code();

xdmp:log($error:errors),

let $preferred-error-format := errut:preferred-format()
return
    (
    errut:log-errors($error:errors,$code),
    if ($preferred-error-format eq "xml")
    then xdmp:set-response-content-type("application/xml")
    else xdmp:set-response-content-type("application/json"),
    errut:error-body($error:errors,$code,$preferred-error-format)
    )

