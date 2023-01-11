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

import core from "/data-hub/5/artifacts/core.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import sec from "/MarkLogic/security.xqy";

const INFO_EVENT = consts.TRACE_CORE;
const DEBUG_EVENT = consts.TRACE_CORE_DEBUG;
const DEBUG_ENABLED = xdmp.traceEnabled(DEBUG_EVENT);

function protectCollections(collections, permissions) {
    collections.forEach(coll => {
        try {
            if (DEBUG_ENABLED) {
                hubUtils.hubTrace(DEBUG_EVENT, `Protecting collection ${coll}`);
            }
            sec.protectCollection(coll, permissions);
        } catch(e) {
            xdmp.log("ANI " + e.message);
            hubUtils.hubTrace(INFO_EVENT, `Could not protect collection ${coll}; Reason: ${e.message}`);
        }
    })
}

function onArtifactPublish (artifactType, artifactName) {
    const artifact = core.getArtifact(artifactType, artifactName);

    if( featureEnabled(artifact) ) {
        hubUtils.hubTrace(INFO_EVENT, `Processing protected collections feature for ${artifactName}`);

        // where do I get the permissions in this case?
        const permissions = artifact.features["protectedCollections"].permissions;
        const collection = artifactName;
        if(artifact.collections && !artifact.collections.includes(collection)) {
            artifact.collections.push(collection);
        }
        //confirm that the collection is protected
        protectCollections([collection], permissions);
        hubUtils.hubTrace(INFO_EVENT, `Finished processing protected collections feature for ${artifactName}`);
    }
}

function onInstanceSave(stepContext, model, contentObject) {
    const modelName = model.info.title;
    if(featureEnabled(model.definitions[modelName])) {
        hubUtils.hubTrace(INFO_EVENT, `Processing protected collections feature for an instance of ${modelName} while running ${stepContext.name}`);
        const feature = model.definitions[modelName].features["protectedCollections"];
        const permissions = feature.permissions;
        const collections =  feature.collections;

        // add collections to the contentObject if it doesn't have them
        const contentCollections = contentObject.context.collections || [];
        let newCollections = [];
        if (Array.isArray(contentCollections)) {
            collections.forEach(coll => {
                if( !content.context.collections.includes(coll) ) {
                    newCollections.push(coll);
                }
            })
            contentObject.context.collections = contentCollections.concat(newCollections);
        } else {
            contentObject.context.collections = collections;
        }

        //confirm that the collections are protected
        protectCollections(collections, permissions);
        hubUtils.hubTrace(INFO_EVENT, `Finished processing protected collections feature for an instance of ${modelName} while running ${stepContext.name}`);
    }
}

function featureEnabled(artifact) {
    if (artifact.features && artifact.features["protectedCollections"]) {
        return artifact.features["protectedCollections"].enabled ? artifact.features["protectedCollections"].enabled : false
    }
    return false;
}

export default {
    onArtifactPublish,
    onInstanceSave
};
