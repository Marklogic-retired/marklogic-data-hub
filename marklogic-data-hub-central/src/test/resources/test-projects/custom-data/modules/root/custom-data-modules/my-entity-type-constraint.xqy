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

module namespace ns = "org:example";

declare function parse(
  $constraint-qtext as xs:string,
  $right as schema-element(cts:query)
) as schema-element(cts:query)
{
  (: Adds "entity-" as a prefix, which is the convention for collections in this example project :)
  let $entity-types :=
    for $token in fn:tokenize($right//cts:text, ",")
    let $token := fn:normalize-space($token)
    where fn:not($token = "")
    return "entity-" || $token

  let $query :=
    if ($entity-types) then <x>{cts:collection-query($entity-types)}</x>/*
    else <x>{cts:false-query()}</x>/*

  return element {fn:node-name($query)} {
    attribute qtextconst {fn:concat($constraint-qtext, fn:string($right//cts:text))},
    $query/@*,
    $query/node()
  }
};
