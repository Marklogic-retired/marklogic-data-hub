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

module namespace options = "http://marklogic.com/hub-in-a-box/hub-options";

declare option xdmp:mapping "false";

declare variable $DEFAULT-DIR := "/com.marklogic.hub/";
declare variable $DEFAULT-COLLECTOR-DIR := $DEFAULT-DIR || "collectors/";
declare variable $DEFAULT-TRANSFORMER-DIR := $DEFAULT-DIR || "transformers/";
declare variable $DEFAULT-TEMPLATE-DIR := $DEFAULT-DIR || "templates/";
declare variable $DEFAULT-FLOW-DIR := $DEFAULT-DIR || "flows/";
declare variable $DEFAULT-PERSISTER-DIR := $DEFAULT-DIR || "persisters/";

declare function options:default-dir($type as xs:string) as xs:string
{
  switch ($type)
    case "collector" return $DEFAULT-COLLECTOR-DIR
    case "transformer" return $DEFAULT-TRANSFORMER-DIR
    case "template" return $DEFAULT-TEMPLATE-DIR
    case "flow" return $DEFAULT-FLOW-DIR
    case "persister" return $DEFAULT-PERSISTER-DIR
    default return ()
};
