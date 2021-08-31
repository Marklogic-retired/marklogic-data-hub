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

module namespace ext = "http://marklogic.com/data-hub/extensions/entity";

(:
Invoked when DHF needs to build a query that constrains on documents for one or more entity types.
By default, DHF assumes that entity documents are in a collection with a name matching that of the
associated entity type.
:)
declare function build-entity-query($entity-type-names as xs:string*) as cts:query
{
  cts:collection-query($entity-type-names)
};

