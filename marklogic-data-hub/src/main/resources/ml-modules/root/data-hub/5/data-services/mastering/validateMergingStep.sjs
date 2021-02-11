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

const validateMergeLib = require("/data-hub/5/data-services/mastering/validateMergingStepLib.sjs");

var stepName;

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-match-merge", "execute");

const common = require("/data-hub/5/data-services/mastering/validateStepCommonLib.sjs");
const step = require('/data-hub/5/artifacts/core.sjs').getArtifact("merging", stepName);

let warnings = [];
let targetCollections = Object.assign({onArchive:[], onNoMatch:[], onMerge:[], onNotification:[], onAuditing:[]}, step.targetCollections);
let allCollections = []
    .concat(step.collections)
    .concat(step.additionalCollections)
    .concat(targetCollections.onArchive)
    .concat(targetCollections.onNoMatch)
    .concat(targetCollections.onMerge)
    .concat(targetCollections.onNotification)
    .concat(targetCollections.onAuditing)
if (allCollections.length) {
    let targetTypeWarning = common.targetEntityCollectionWarning(step.targetEntityType, allCollections);
    if (targetTypeWarning) {
        warnings.push(targetTypeWarning);
    }

    let sourceCollectionWarning = common.sourceCollectionWarning(step.targetEntityType, allCollections);
    if (sourceCollectionWarning) {
        warnings.push(sourceCollectionWarning);
    }

    let temporalCollectionsWarning = common.temporalCollectionsWarning(allCollections);
    if (temporalCollectionsWarning) {
        warnings.push(temporalCollectionsWarning);
    }
}

let propertyWarnings = validateMergeLib.propertiesWarning(step);
if (propertyWarnings) {
    warnings.push(propertyWarnings);
}

warnings;
