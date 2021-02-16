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

const temporalLib = require("/data-hub/5/temporal/hub-temporal.sjs");

function warningObject(level, message) {
  return {
    "level": level,
    "message": message
  };
}

var stepName;

const levelWarn = "warn";

const step = require('/data-hub/5/artifacts/core.sjs').getArtifact("matching", stepName);

let warnings = [];

if (step.additionalCollections) {
  if (step.targetEntityType && step.additionalCollections.includes(step.targetEntityType)) {
    warnings.push(warningObject(levelWarn, "Warning: Target Collections includes the target entity type " + step.targetEntityType));
  }

  if (step.sourceQuery && step.sourceQuery.startsWith("cts.collectionQuery")) {
    let sourceCollection = step.sourceQuery.substring(
      step.sourceQuery.lastIndexOf("[") + 2,
      step.sourceQuery.lastIndexOf("]") - 1
    );
    if (step.additionalCollections.includes(sourceCollection)) {
      warnings.push(warningObject(levelWarn, "Warning: Target Collections includes the source collection " + sourceCollection));
    }
  }

  let addlTempColls = [];
  for (let tempColl of temporalLib.getTemporalCollections()) {
    if (step.additionalCollections.includes(tempColl.toString())) {
      addlTempColls.push(tempColl);
    }
  }
  if (addlTempColls.length > 0) {
    warnings.push(warningObject(levelWarn, "Warning: Target Collections includes temporal collection(s): " + addlTempColls.join(', ')));
  }
}


warnings
