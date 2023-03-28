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

const temporal = require("/MarkLogic/temporal.xqy");

const INFO_EVENT = consts.TRACE_CORE;
const DEBUG_EVENT = consts.TRACE_CORE_DEBUG;
const DEBUG_ENABLED = xdmp.traceEnabled(DEBUG_EVENT);

function logDebug(message) {
    if (DEBUG_ENABLED) {
        hubUtils.hubTrace(DEBUG_EVENT, message);
    }
}

function getModelFeatures(model, artifactName) {
    if(model.definitions && model.definitions[artifactName] && model.definitions[artifactName].features) {
        return model.definitions[artifactName].features;
    }
    return undefined;
}
function onArtifactPublish (artifactType, artifactName) {
  const artifact = core.getArtifact(artifactType, artifactName);
  let features = artifact.features;
  if("model" === artifactType) {
    const modelFeature = getModelFeatures(artifact, artifactName);
    features = modelFeature? modelFeature : features;
  }

  if (!features || !features["temporal"]) {
      logDebug(`Temporal feature: Disabled for artifact ${artifactName} of type ${artifactType}.`);
      return;
  } else if (!features["temporal"].collection) {
      logDebug( `Temporal feature: Missing temporal collection for artifact ${artifactName} of type ${artifactType}.`);
      return;
  }

  const temporalCollection = features["temporal"].collection;
  if (getTemporalCollection(temporalCollection).length === 0){
    hubUtils.hubTrace(INFO_EVENT, `Temporal feature: Creating temporal collection ${temporalCollection}.`);

    createIndexes();
    hubUtils.hubTrace(INFO_EVENT,`Temporal feature: Created indexes for temporal collection ${temporalCollection}.`);
    createAxes();
    hubUtils.hubTrace(INFO_EVENT, `Temporal feature: Created temporal axis for temporal collection ${temporalCollection}.`);

    xdmp.invokeFunction(function () {
      temporal.collectionCreate(temporalCollection, "system", "valid");
    }, {update: "true"});

    hubUtils.hubTrace(INFO_EVENT, `Temporal feature: Created temporal collection ${temporalCollection}.`);
  }

}

function createIndexes() {
  xdmp.invokeFunction(function () {
    const admin = require("/MarkLogic/admin");
    let config = admin.getConfiguration();
    let dbid = xdmp.database();
    let rangespecs = [
      admin.databaseRangeElementIndex("dateTime", "", "validStart", "", fn.false()),
      admin.databaseRangeElementIndex("dateTime", "", "validEnd", "", fn.false()),
      admin.databaseRangeElementIndex("dateTime", "", "systemStart", "", fn.false()),
      admin.databaseRangeElementIndex("dateTime", "", "systemEnd", "", fn.false())];
    rangespecs.forEach((rangespec) => {
      try {
        config = admin.databaseAddRangeElementIndex(config, dbid, rangespec);
      } catch (e) {
        hubUtils.hubTrace(INFO_EVENT, `Temporal feature: There was an issue adding an index: ${e}.`);
      }
    });
    admin.saveConfiguration(config);
  });
}

function createAxes() {
  xdmp.invokeFunction(function () {
    try {
      temporal.axisCreate("valid",
        cts.elementReference("systemStart", "type=dateTime"), cts.elementReference("systemEnd", "type=dateTime"));
    } catch (e) {
      hubUtils.hubTrace(INFO_EVENT, `Temporal feature: There was an issue creating axis 'valid': ${e}.`);
    }
    try {
      temporal.axisCreate("system",
        cts.elementReference("systemStart", "type=dateTime"), cts.elementReference("systemEnd", "type=dateTime"));
    } catch (e) {
      hubUtils.hubTrace(INFO_EVENT, `Temporal feature: There was an issue creating axis 'system': ${e}.`);
    }
  });

}

function onBuildInstanceQuery(stepContext, model, sourceQuery) {
  if (!stepContext.features || !stepContext.features["temporal"]) {
    return;
  }
  return cts.andQuery([sourceQuery, cts.collectionQuery("latest")]);
}

function onInstanceSave(stepContext, model, contentArray) {
  const flowStep = stepContext.flowStep;
  if (!flowStep.features || !flowStep.features["temporal"]) {
      return;
  }
  const temporalCollection = flowStep.features["temporal"].collection;
  hubUtils.hubTrace(INFO_EVENT, `Temporal feature: Updating temporal for documents of model ${model} with collection ${temporalCollection}.`);

  try {
      flowUtils.writeContentArray(contentArray);
  } catch (e) {
      hubUtils.hubTrace(INFO_EVENT, `Temporal feature: There was an issue inserting documents in step ${flowStep.name} using collection ${temporalCollection}: ${e}`);
  }
}

function onInstanceDelete(stepContext, model, contentArray) {
  const flowStep = stepContext.flowStep;
  if (!flowStep.features || !flowStep.features["temporal"]) {
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
