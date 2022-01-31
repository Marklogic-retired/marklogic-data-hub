(:
  Copyright (c) 2022 MarkLogic Corporation

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

module namespace ns = "http://marklogic.com/data-hub/entities/constraint/relatedTo";

declare namespace search = "http://marklogic.com/appservices/search";

(:
Supports hiding hub artifacts from an "all data" search, the assumption being that by default, users do not
want to see these documents in their search results.
:)
declare function parse(
  $query-elem as element(),
  $options as element(search:options)
) as schema-element(cts:query)?
{
  let $subjects := get-data($query-elem/search:docIRI)
  let $predicates := get-data($query-elem/search:predicate)
  let $objects := cts:triples($subjects, $predicates) ! sem:triple-object(.)
  return document{
    if (fn:empty($objects)) then
      cts:false-query()
    else
      cts:triple-range-query(
        ($objects),
        (),
        ()
      )
  }/*
};

declare private function get-data($vals) {
  for $v in $vals[fn:normalize-space(.) ne '']
  return
    if ($v/search:value) then
      if ($v/search:datatype) then
        sem:typed-literal($v/search:value, sem:iri($v/search:datatype))
      else
        data($v/search:value)
    else
      sem:iri($v)
};