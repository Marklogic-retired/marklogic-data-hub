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

import DocPermission from "./doc-permissions.mjs";
import Mapping from './mapping.mjs';
import ProtectedCollections from './protected-collections.mjs';
import Provenance from './provenance.mjs';
import SchemaValidation from './schema-validation.mjs';
import Temporal from './temporal.mjs';

// define constants for caching expensive operations
const registeredFeatures = {
  docPermission: DocPermission,
  mapping: Mapping,
  protectedCollections: ProtectedCollections,
  provenance: Provenance,
  schemaValidation: SchemaValidation,
  temporal: Temporal
};




function getFeatures() {
  return registeredFeatures;
}

function getFeatureMethod(featureName, featureMethod) {
  return registeredFeatures[featureName][featureMethod];
}

function invokeFeatureMethods(stepExecutionContext, contentArray, method) {
  const flowStep = stepExecutionContext.flowStep;
  let targetEntityType = flowStep.options.targetEntity || flowStep.options.targetEntityType;
  let model = null;
  if (targetEntityType) {
    const modelNode = entityLib.findModelForEntityTypeId(targetEntityType);
    model = fn.exists(modelNode) ? modelNode.toObject() : null;
  }
  const features = Object.keys(featuresCore.getFeatures());
  features.forEach(feat => {
    const funct = featuresCore.getFeatureMethod(feat, method);
    if (funct) {
      funct(stepExecutionContext, model, contentArray);
    }
  });
}

export default {
  getFeatures,
  getFeatureMethod,
  invokeFeatureMethods
};
