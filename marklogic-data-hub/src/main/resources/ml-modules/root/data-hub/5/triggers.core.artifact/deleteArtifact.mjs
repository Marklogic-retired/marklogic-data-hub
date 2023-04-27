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

import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import featuresCore from "/data-hub/features/core.mjs";

const uri = external.uri;
try {
    //get artifact name from the URI.
    const start = uri.lastIndexOf("/") + 1;
    const end = uri.indexOf(".");
    const artifactName = uri.substring(start, end);

    //get artifact type from the URI.
    const typeExtension = uri.split('.')[1];
    let artifactType = typeExtension == "entity" ? "model" : "step";
    //if is a step I take it from stepDefinitionType property
    if(artifactType == "step"){
        const artifact = fn.head(fn.doc(uri)).toObject();
        artifactType =  artifact.stepDefinitionType;
    }
    invokeFeatureMethods(artifactType, artifactName, "onArtifactDelete");

} catch (e) {
    httpUtils.throwBadRequestWithArray(["Error running onArtifactDelete on features at URI: " + uri + "; cause: " + e.message, xdmp.toJsonString(e.stackFrames)]);
}

function invokeFeatureMethods(artifactType, artifactName, method) {
    const features = Object.keys(featuresCore.getFeatures());
    features.forEach(feat => {
        const funct = featuresCore.getFeatureMethod(feat, method);
        if (funct) {
            funct(artifactType, artifactName);
        }
    });
}
