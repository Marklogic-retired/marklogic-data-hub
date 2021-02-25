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

const test = require("/test/test-helper.xqy");

const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();

[
  test.assertNotEqual(null, dataHub.flow.flowUtils.createContentAsObject(),
    "This test is verifying that datahub.flow.flowUtils is still a valid reference. " +
    "flow-utils was converted into a regular library module in 5.5, but because the " +
    "scaffolded custom step code refers to datahub.flow.flowUtils, we need to ensure " +
    "that reference is still valid.")
]
