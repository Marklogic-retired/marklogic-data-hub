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
xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-mapping", "execute");

const artifacts = require('/data-hub/5/artifacts/core.sjs')

var stepName;
const mappingStep = artifacts.getArtifact("mapping", stepName);
let response = [{"name": "$URI", "description": "The URI of the source document"}];
const modulePath = mappingStep.mappingParametersModulePath;
if (modulePath) {
  try {
    const userParams = require(modulePath)["getParameterDefinitions"](mappingStep);
    userParams.forEach(userParam => userParam.name = "$" + userParam.name);
    response = response.concat(userParams);
    response.sort((a, b) => (a.name > b.name) ? 1 : -1);
  } catch (error) {
    throw Error(`Unable to fetch references in module '${modulePath}'; cause: ${error.message}`);
  }
}
response
