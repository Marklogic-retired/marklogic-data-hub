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

module namespace ns = "http://marklogic.com/data-hub/entities/constraint/entityType";

import module namespace ext = "http://marklogic.com/data-hub/extensions/entity"
  at "/data-hub/extensions/entity/build-entity-query.xqy";

declare namespace search = "http://marklogic.com/appservices/search";

(:
Supports constraint on collections specific to entity types while also excluding mastering-specific
collections that contain documents that are not considered to be entity instances.
:)
declare function parse(
  $constraint-qtext as xs:string,
  $right as schema-element(cts:query)
) as schema-element(cts:query)
{
  let $entity-types :=
    for $token in fn:tokenize($right//cts:text, ",")
    let $token := fn:normalize-space($token)
    where fn:not($token = "")
    return $token

  (:
  This query does not worry about custom queries for entity instances, as mastering does not yet allow
  that to be customized.
  :)
  let $mastering-data-query :=
    cts:collection-query((
      "mdm-auditing",
      for $entity-type in $entity-types
      return ("auditing", "notification") ! fn:concat("sm-", $entity-type, "-", .)
    ))

  let $query := <x>{
    cts:and-not-query(
      ext:build-entity-query($entity-types),
      $mastering-data-query
    )
  }</x>/element()

  return element { fn:node-name($query) } {
    attribute qtextconst { fn:concat($constraint-qtext, fn:string($right//cts:text)) },
    $query/@*,
    $query/node()
  }
};
