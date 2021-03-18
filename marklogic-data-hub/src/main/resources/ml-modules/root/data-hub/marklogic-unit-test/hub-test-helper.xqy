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

module namespace dhmut = "http://marklogic.com/data-hub/marklogic-unit-test";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";

(:
Prepares the staging, final, and jobs databases so that a test can run in a clean environment. "clean" in this 
context is defined as: the staging and final databases only contain user and DHF artifacts, and the jobs database 
has been cleared of jobs data. 
:)
declare function prepare-databases() as empty-sequence()
{
  let $_ := (
    prepare-database($config:STAGING-DATABASE),
    prepare-database($config:FINAL-DATABASE),
    prepare-jobs-database()
  )
  return ()
};

(:
Prepare the given database for a test run by deleting all data other than user-defined and OOTB DHF artifacts.
:)
declare function prepare-database($database-name as xs:string) as empty-sequence()
{
  let $user-artifact-collections := (
    "http://marklogic.com/entity-services/models",
    "http://marklogic.com/data-hub/flow",
    "http://marklogic.com/data-hub/step-definition",
    "http://marklogic.com/data-hub/steps"
  )
  let $collections-to-preserve := ($user-artifact-collections, "hub-core-artifact")

  let $query := cts:not-query(cts:collection-query($collections-to-preserve))
  let $_ := invoke-in-database(function() {cts:uris((), (), $query) ! xdmp:document-delete(.)}, $database-name)
  return ()
};

(:
Clears the jobs collection via a collection delete. The database/forests are not cleared
in case the jobs database has other data that should remain in between test suite runs.

Provenance data is not deleted by this due to the protected collection restriction on 
provenance documents. That restriction requires either an admin user or a user with the 
ps-internal role, neither of which is recommended for running tests. User tests may instead
install their own amp to allow for the provenance collection to be deleted, assuming that is 
necessary to prepare the jobs database.
:)
declare function prepare-jobs-database() as empty-sequence()
{
  let $_ := invoke-in-database(function() {xdmp:collection-delete("Jobs")}, $config:JOB-DATABASE)
  return ()
};

declare private function invoke-in-database($function, $database-name as xs:string)
{
  xdmp:invoke-function($function,
    <options xmlns="xdmp:eval">
      <database>{xdmp:database($database-name)}</database>
    </options>
  )
};
