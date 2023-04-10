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

/**
 * Feature that handles the temporal logic of the artifacts and instances.
 */

import temporalLib from "/data-hub/5/temporal/hub-temporal.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import flowUtils from '/data-hub/5/impl/flow-utils.mjs';
import consts from "/data-hub/5/impl/consts.mjs";
import core from "/data-hub/5/artifacts/core.mjs";
import featuresUtils from "./features-util.mjs";

const temporal = require("/MarkLogic/temporal.xqy");

const INFO_EVENT = consts.TRACE_CORE;
const DEBUG_EVENT = consts.TRACE_CORE_DEBUG;
const DEBUG_ENABLED = xdmp.traceEnabled(DEBUG_EVENT);

function logDebug(message) {
    if (DEBUG_ENABLED) {
        hubUtils.hubTrace(DEBUG_EVENT, message);
    }
}

function onArtifactPublish (artifactType, artifactName) {
  const artifact = core.getArtifact(artifactType, artifactName);
  let features = artifact.features;
  if("model" === artifactType) {
    const modelFeature = featuresUtils.getModelFeatures(artifact, artifactName);
    features = modelFeature? modelFeature : features;
  }
  const temporalFeature = features? features['temporal'] : undefined;
  if (!features || !temporalFeature || !temporalFeature.enabled) {
      logDebug(`Temporal feature: Disabled for artifact ${artifactName} of type ${artifactType}.`);
      return;
  } else if (!temporalFeature.collection) {
      logDebug( `Temporal feature: Missing temporal collection for artifact ${artifactName} of type ${artifactType}.`);
      return;
  }

  const temporalCollection = temporalFeature.collection;
  if (getTemporalCollection(temporalCollection).length === 0){
    hubUtils.hubTrace(INFO_EVENT, `Temporal feature: Creating temporal collection ${temporalCollection}.`);

    temporalLib.createIndex();
    hubUtils.hubTrace(INFO_EVENT,`Temporal feature: Created indexes for temporal collection ${temporalCollection}.`);

    temporalLib.createAxis();
    hubUtils.hubTrace(INFO_EVENT, `Temporal feature: Created temporal axis for temporal collection ${temporalCollection}.`);

    temporalLib.createCollection(temporalCollection);
    hubUtils.hubTrace(INFO_EVENT, `Temporal feature: Created temporal collection ${temporalCollection}.`);
  }

}

function onBuildInstanceQuery(stepContext, model, sourceQuery) {
  const temporalFeature = featuresUtils.getFeatureFromContext(stepContext, model, "temporal");
  if (temporalFeature) {
    return `cts.andQuery([${sourceQuery},cts.collectionQuery('latest')])`;
  }

  return sourceQuery;
}

function onInstanceSave(stepContext, model, contentArray) {
  const flowStep = stepContext.flowStep;
  const temporalFeature = featuresUtils.getFeatureFromContext(flowStep, model, "temporal");
  if (!temporalFeature) {
    return;
  }
  const temporalCollection = temporalFeature.collection;
  hubUtils.hubTrace(INFO_EVENT, `Temporal feature: Updating temporal for documents of model ${model} with collection ${temporalCollection}.`);

  try {
      flowUtils.writeContentArray(contentArray);
  } catch (e) {
      hubUtils.hubTrace(INFO_EVENT, `Temporal feature: There was an issue inserting documents in step ${flowStep.name} using collection ${temporalCollection}: ${e}`);
  }
}

function onInstanceDelete(stepContext, model, contentArray) {
  const flowStep = stepContext.flowStep;
  const temporalFeature = featuresUtils.getFeatureFromContext(flowStep, model, "temporal");
  if (!temporalFeature) {
      return;
  }
  const temporalCollection = flowStep.features["temporal"].collection;
  hubUtils.hubTrace(INFO_EVENT, `Temporal feature: Deleting temporal for documents of model ${model} with collection ${temporalCollection}.`);

  try {
      flowUtils.writeContentArray(contentArray);
  } catch (e) {
      hubUtils.hubTrace(INFO_EVENT, `Temporal feature: There was an issue deleting documents from temporal collection ${temporalCollection}: ${e}`);
  }
}


function getTemporalCollection(tempCollection) {
    const temporalCollections = temporalLib.getTemporalCollections().toArray();
    return temporalCollections.filter((col) => fn.string(col) === tempCollection);
}

export default {
    onArtifactPublish,
    onBuildInstanceQuery,
    onInstanceSave,
    onInstanceDelete
};
