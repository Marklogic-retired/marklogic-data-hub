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

module namespace ns = "http://marklogic.com/data-hub/entities/constraint/hideHubArtifacts";

declare namespace search = "http://marklogic.com/appservices/search";

(:
Supports hiding hub artifacts from an "all data" search, the assumption being that by default, users do not
want to see these documents in their search results.
:)
declare function parse(
  $constraint-qtext as xs:string,
  $right as schema-element(cts:query)
) as schema-element(cts:query)
{
  let $query :=
    if ("true" = fn:lower-case($right//cts:text/text())) then
      <x>{cts:not-query(cts:collection-query((
        "http://marklogic.com/data-hub/flow",
        "http://marklogic.com/data-hub/mappings",
        "http://marklogic.com/data-hub/step-definition",
        "http://marklogic.com/data-hub/steps",
        "http://marklogic.com/entity-services/models"
      )))}</x>/*
    else
      <x>{cts:true-query()}</x>/*

  return element {fn:node-name($query)} {
    attribute qtextconst { fn:concat($constraint-qtext, fn:string($right//cts:text)) },
    $query/@*,
    $query/node()
  }
};
