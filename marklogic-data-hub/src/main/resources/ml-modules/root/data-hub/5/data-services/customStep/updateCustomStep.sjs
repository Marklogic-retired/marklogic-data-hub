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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-custom", "execute");

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const consts = require("/data-hub/5/impl/consts.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

var stepProperties;

stepProperties = stepProperties.toObject();
const stepName = stepProperties.name;

// check step already exists
Artifacts.getArtifact("custom", stepName);

xdmp.trace(consts.TRACE_STEP, `Updating custom step ${stepName}`);

// unpackage additionalSettings field given by UI
var additionalSettings = stepProperties.additionalSettings;
Object.assign(stepProperties, additionalSettings);
delete stepProperties.additionalSettings;

// save updated step
Artifacts.setArtifact("custom", stepName, stepProperties);