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

const xqyModules = {};


/*
 * XQuery code cannot be directly imported into JavaScript modules. This proxy provides a way to access marklogic-unit-test helper
 * functions in a JavaScript friendly (e.g., assertExists instead of assert-exists) without duplicating the test-helper code.
 */
function requireXqyModule(modulePath) {
  return require(modulePath);
}

export default {
  requireXqyModule,
  requireModule: requireXqyModule
}