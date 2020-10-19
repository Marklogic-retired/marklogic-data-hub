/**
 Copyright (c) 2020 MarkLogic Corporation
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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-mapping", "execute");

const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");

let mlFunctions = esMappingLib.getMarkLogicMappingFunctions();
let xpathFunctions = esMappingLib.getXpathMappingFunctions();
let mappingFunctions = mlFunctions.concat(xpathFunctions);
mappingFunctions.sort(function(funcA, funcB) {
  var nameA = String(funcA.functionName).toLowerCase();
  var nameB = String(funcB.functionName).toLowerCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
});
