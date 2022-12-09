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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-match-merge", "execute");

const stepName = external.stepName;

import common from "/data-hub/5/data-services/mastering/validateStepCommonLib.mjs";
import core from "/data-hub/5/artifacts/core.mjs";
const step = core.getArtifact("matching", stepName);

let warnings = [];

if (step.additionalCollections && step.additionalCollections.length) {
  let targetTypeWarning = common.targetEntityCollectionWarning(step.targetEntityType, step.additionalCollections);
  if (targetTypeWarning) {
    warnings.push(targetTypeWarning);
  }

  let sourceCollectionWarning = common.sourceCollectionWarning(step.sourceQuery, step.additionalCollections);
  if (sourceCollectionWarning) {
    warnings.push(sourceCollectionWarning);
  }

  let temporalCollectionsWarning = common.temporalCollectionsWarning(step.additionalCollections);
  if (temporalCollectionsWarning) {
    warnings.push(temporalCollectionsWarning);
  }
}


warnings
