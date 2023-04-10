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
 * Feature that handles the document permissions of the artifacts and instances.
 */

import consts from "/data-hub/5/impl/consts.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import featuresUtils from "./features-util.mjs";

const INFO_EVENT = consts.TRACE_CORE;

function onArtifactSave(artifactType, artifactName) {
    //Complete in upcoming stories
    return true;
}

function onArtifactPublish(artifactType, artifactName) {
    //Complete in upcoming stories
    return true;
}

function onInstanceSave(context, model, contentArray) {
    let permissions = [];
    const stepContext = context.flowStep;
    if (!model) {
        return contentArray;
    }

    const feature = featuresUtils.getFeatureFromContext(stepContext, model, 'docPermission');
    if(feature) {
      const modelName = model.info.title;
      hubUtils.hubTrace(INFO_EVENT, `Processing doc permission feature for an instance of ${modelName} while running ${stepContext.name}`);
      permissions = feature.permissions;
      addPermissionsToObject(permissions, contentArray);
    }
    hubUtils.hubTrace(INFO_EVENT, `Finished processing doc permission feature `);
    return contentArray;
}

function addPermissionsToObject(permissions, contentArray) {
    // add permissions to the contentObject
    contentArray.forEach(contentObject => {
    const permissionsArray = hubUtils.parsePermissions(permissions);
    contentObject.context.permissions = contentObject.context.permissions.concat(permissionsArray);
    });
}


export default {
    onArtifactSave,
    onArtifactPublish,
    onInstanceSave
};
