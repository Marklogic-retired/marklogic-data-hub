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
import consts from "/data-hub/5/impl/consts.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
const sec = require("/MarkLogic/security.xqy");

const INFO_EVENT = consts.TRACE_CORE;
const DEBUG_EVENT = consts.TRACE_CORE_DEBUG;
const DEBUG_ENABLED = xdmp.traceEnabled(DEBUG_EVENT);

function protectCollections(collections, permissions) {
    collections.forEach(coll => {
        try {
            if (DEBUG_ENABLED) {
                hubUtils.hubTrace(DEBUG_EVENT, `Protecting collection ${coll}`);
            }
            let permissionsSplit = permissions.split(",");
            if (permissionsSplit.length % 2 !== 0) {
                hubUtils.hubTrace(INFO_EVENT, `While adding protected collections, cannot protect collection ${coll}. Invalid permissions: ${permissions}`);
            } else {
                let permissionsSec = [];
                for (let i = 0; i < permissionsSplit.length; i++) {
                    permissionsSec.push(xdmp.permission(permissionsSplit[i], permissionsSplit[++i], "element"));
                }
                sec.protectCollection(coll, permissionsSec);
            }
        } catch(e) {
            hubUtils.hubTrace(INFO_EVENT, `Could not protect collection ${coll}; Reason: ${e.message}`);
        }
    })
}

function onArtifactPublish (artifactType, artifactName) {
    const artifact = core.getArtifact(artifactType, artifactName);
    if(!artifact && featureEnabled(artifact)) {
        //we need to get the permissions from somewhere else later
        const permissions = "data-hub-common,read,data-hub-common,update";
        const collection = artifactName;
        if (artifact.collections && !artifact.collections.includes(collection)) {
            artifact.collections.push(collection);
        }

        //confirm that the collection is protected
        protectCollections([collection], permissions);
        hubUtils.hubTrace(INFO_EVENT, `Finished processing protected collections feature for ${artifactName}`);
    }
}

function onInstanceSave(context, model, contentArray) {
    let permissions = [];
    let collections = []
    const stepContext = context.flowStep;
    if (!model) {
        return contentArray;
    }

    let flagAddCollectionsToObject = false;
    if(featureEnabled(stepContext)) {
        hubUtils.hubTrace(INFO_EVENT, `Processing protected collections feature for an instance while running ${stepContext.name}`);

        const stepFeature = stepContext.features["protectedCollections"]
        if (stepFeature.permissions) {
            permissions = stepFeature.permissions;
        }
        if (stepFeature.collections) {
            collections = stepFeature.collections;
        }
        flagAddCollectionsToObject = true;
    }


    const modelName = model.info.title;
    if(featureEnabled(model.definitions[modelName]))
    {
        hubUtils.hubTrace(INFO_EVENT, `Processing protected collections feature for an instance of ${modelName}`);

        const modelFeature = model.definitions[modelName].features["protectedCollections"];
        if (modelFeature.permissions) {
            permissions = modelFeature.permissions;
        }
        if (modelFeature.collections) {
            collections = modelFeature.collections;
        }
        flagAddCollectionsToObject = true;
    }
    if (flagAddCollectionsToObject){

        addCollectionsToObject(collections, permissions, contentArray);
    }

    hubUtils.hubTrace(INFO_EVENT, `Finished processing protected collections feature for an instance of ${modelName} while running ${stepContext.name}`);

    //TODO verify if we should return
    return contentArray;
}

function featureEnabled(artifact) {
    if (artifact.features["protectedCollections"]) {
        return artifact.features["protectedCollections"].enabled ? artifact.features["protectedCollections"].enabled : false
    }
    return false;
}

function addCollectionsToObject(collections, permissions, contentArray) {
    if(Array.isArray(collections) && collections.length > 0) {

        // add collections to the contentObject if it doesn't have them
        contentArray.forEach(contentObject => {
            const contentCollections = contentObject.context.collections || [];
            let newCollections = [];
            if (Array.isArray(contentCollections)) {
                collections.forEach(coll => {
                    if (!contentObject.context.collections.includes(coll)) {
                        newCollections.push(coll);
                    }
                })
                contentObject.context.collections = contentCollections.concat(newCollections);
            } else {
                contentObject.context.collections = collections;
            }
        });
        //confirm that the collections are protected
        protectCollections(collections, permissions);
    }
}

export default {
    onArtifactPublish,
    onInstanceSave
};
