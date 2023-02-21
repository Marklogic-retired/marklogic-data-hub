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
 * Feature that handles the mapping transformation of the artifacts.
 */
import core from "/data-hub/5/artifacts/core.mjs";
import mappingModule from "/data-hub/5/artifacts/mapping.mjs";
import consts from "/data-hub/5/impl/consts.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

const INFO_EVENT = consts.TRACE_CORE;

function onArtifactSave(artifactType, artifactName) {
    try{
        const artifact = core.getArtifact(artifactType, artifactName);
        if(artifact.stepDefinitionType == "mapping"){

               let nodeURI =  mappingModule.getArtifactUri(artifactName)
                //Invoke mappingJSONtoXML with the URI
                invokeService(nodeURI);
        }
    } catch (ex) {
        hubUtils.hubTrace(INFO_EVENT, `Unable to generate mapping transform;  ${artifactName}; Reason: ${ex.message}`);
        return false;
    }
    hubUtils.hubTrace(INFO_EVENT, `End of processing mapping transform for ${artifactName}`);
    return true;
}

function onArtifactDelete(artifactType, artifactName) {
    try{
        const artifact = core.getArtifact(artifactType, artifactName);
        if(artifact.stepDefinitionType == "mapping"){

            let nodeURI =  mappingModule.getArtifactUri(artifactName)
            //Invoke cleanUpMapping with the URI
            invokeServiceClean(nodeURI);
        }
    } catch (ex) {
        hubUtils.hubTrace(INFO_EVENT, `Failed to clean up;  ${artifactName}; Reason: ${ex.message}`);
        return false;
    }
    hubUtils.hubTrace(INFO_EVENT, `End of clean up for ${artifactName}`);
    return true;
}


function invokeService(uri) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/triggers/mapping/mappingJSONtoXML.sjs",
        {uri}
    ));
}

function invokeServiceClean(uri) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/triggers/mapping/cleanUpMapping.sjs",
        {uri}
    ));
}



export default {
    onArtifactSave,
    onArtifactDelete
};
