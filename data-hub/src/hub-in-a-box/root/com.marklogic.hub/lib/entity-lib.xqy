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

module namespace entity = "http://marklogic.com/hub-in-a-box/entity-lib";

import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";

declare option xdmp:mapping "false";

(:
 : Returns a named entity definition
 : @param $entity-name - the name of the definition
 :)
declare function entity:get-entity-def(
  $entity-name as xs:string)
{
  (: TODO: return a named entity def :)
  ()
};

(:
 : Create a named entity definition
 : @param $entity-name - the name of the definition
 : @param $definition - the definition
 :)
declare function entity:create-entity-def(
  $entity-name as xs:string,
  $definition as object-node())
{
  (: TODO: create an entity def :)
  ()
};

(:
 : Merge two entity definitions into a named entity definition
 : @param $entity-name - the name of the definition
 : @param $definition - the definition
 : @param $new-definition - the 2nd definition
 :)
declare function entity:merge-entity-defs(
  $entity-name as xs:string,
  $definition as object-node(),
  $new-definition as object-node())
{
  (: TODO: merge 2 entity defs :)
  ()
};

(:
 : Delete a named entity definition
 : @param $entity-name - the name of the definition
 :)
declare function entity:remove-entity-def(
  $entity-name as xs:string)
{
  (: TODO: remove an entity def :)
  ()
};

(:
 : Gets an entity by id
 : @param $entity-name - the name of the definition
 : @param $entity-id - the id of the entity
 :)
declare function entity:get(
  $entity-name as xs:string,
  $entity-id as xs:string?)
{
  (: TODO: get an entity by id :)
  ()
};

(:
 : Creates or Merges an entity by id
 : @param $entity-name - the name of the definition
 : @param $entity-id - the id of the entity
 : @param $entity - the entity body
 :)
declare function entity:post(
  $entity-name as xs:string,
  $entity-id as xs:string,
  $entity as node())
{
  (: TODO: insert or merge an entity by name and id :)
  ()
};

(:
 : Creates or Replaces an entity by id
 : @param $entity-name - the name of the definition
 : @param $entity-id - the id of the entity
 : @param $entity - the entity body
 :)
declare function entity:put(
  $entity-name as xs:string,
  $entity-id as xs:string,
  $entity as node())
{
  (: TODO: insert or replace an entity by name and id :)
  ()
};

(:
 : Deletes an entity by id
 : @param $entity-name - the name of the definition
 : @param $entity-id - the id of the entity
 :)
declare function entity:delete(
  $entity-name as xs:string,
  $entity-id as xs:string)
{
  (: TODO: delete an entity by name and id :)
  ()
};

