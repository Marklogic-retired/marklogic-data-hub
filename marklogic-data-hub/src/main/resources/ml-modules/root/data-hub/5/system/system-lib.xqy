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

(:
Intended to define "system"-level functions that are about as generic as possible. Primary use
case will be supporting data services in the "system" directory.
:)
module namespace system = "http://marklogic.com/data-hub/system";

(: Expected to have an amp that grants the document-get privilege :)
declare function get-default-rewriter() as element()
{
  xdmp:document-get("Modules/MarkLogic/rest-api/rewriter.xml")/element()
};
