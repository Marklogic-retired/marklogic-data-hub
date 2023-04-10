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

/*
* Returns the feature that are always enabled. They do not use flags.
* */
function getExtraFeatures() {
    const features = {
        "mapping": { "enabled" : true},
        "schemaValidation": { "enabled" : true},
        "provenance": { "enabled" : true}
    };
    return features;
}

function getModelFeatures(model, artifactName) {
  if(model.definitions && model.definitions[artifactName] && model.definitions[artifactName].features) {
    return model.definitions[artifactName].features;
  }
  return undefined;
}

/*
* Returns the feature from the stepContext or the model. If in both the feature is disabled then we return undefined.
* */
function getFeatureFromContext(stepContext, model, featureName) {
  let modelFeature = undefined;
  if (model) {
    const modelFeatures = getModelFeatures(model, model.info.title);
    if (modelFeatures && modelFeatures[featureName]) {
      modelFeature = modelFeatures[featureName];
    }
  }

  let stepFeature = undefined;
  if (stepContext && stepContext.features && stepContext.features[featureName]) {
    stepFeature = stepContext.features[featureName];
  }
  if (stepFeature && stepFeature.enabled) {
    return stepFeature;
  } else if (modelFeature && modelFeature.enabled) {
    return modelFeature;
  }
  return undefined;
}

export default {
  getExtraFeatures,
  getModelFeatures,
  getFeatureFromContext
};
