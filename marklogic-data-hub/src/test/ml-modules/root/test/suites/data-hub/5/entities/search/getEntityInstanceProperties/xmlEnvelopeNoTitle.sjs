/**
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
 */
'use strict';

const entitySearchLib = require("/data-hub/5/entities/entity-search-lib.sjs");
const test = require("/test/test-helper.xqy");

const doc = fn.head(xdmp.unquote(`<envelope xmlns='http://marklogic.com/entity-services'>
    <instance>
      <info><notATitle>MyEntity</notATitle></info>
      <ex:MyEntity xmlns:ex='org:example'><ex:myProperty>myValue</ex:myProperty></ex:MyEntity>
    </instance>
  </envelope>`));

const props = entitySearchLib.getEntityInstanceProperties(doc);

const assertions = [
  test.assertEqual(null, props, "The properties should be null because info/title is missing")
];

assertions
