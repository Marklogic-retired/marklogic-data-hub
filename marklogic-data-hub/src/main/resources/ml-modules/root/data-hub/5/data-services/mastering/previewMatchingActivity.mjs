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

import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import sjsProxy from "/data-hub/core/util/sjsProxy";
import core from "/data-hub/5/artifacts/core.mjs";

const previewMatchingActivityLib = sjsProxy.requireSjsModule("/data-hub/5/mastering/preview-matching-activity-lib.xqy");

const stepName = external.stepName;
const uris = external.uris;
const sampleSize = external.sampleSize;
const restrictToUris = external.restrictToUris;
const nonMatches = external.nonMatches;

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-match-merge", "execute");


const step = core.getArtifact("matching", stepName);
const sourceQuery = hubUtils.evalInDatabase(step.sourceQuery, step.sourceDatabase);

let resultFunction = function() { return previewMatchingActivityLib.previewMatchingActivity(step, sourceQuery, uris, restrictToUris, nonMatches, sampleSize); }

if (!step.sourceDatabase || xdmp.database() === xdmp.database(step.sourceDatabase)) {
    resultFunction();
} else {
    hubUtils.invokeFunction(resultFunction, step.sourceDatabase);
}
