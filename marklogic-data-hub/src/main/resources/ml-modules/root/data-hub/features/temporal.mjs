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

function onArtifactPublish (artifactType, artifactName) {
    return true;
}

function onBuildInstanceQuery(stepContext, model, sourceQuery) {
    return true;
}

function onInstanceSave(stepContext, model, contentObject) {
    return true;
}

function onInstanceDelete(stepContext, model, contentObject) {
    return true;
}

export {
    onArtifactPublish,
    onBuildInstanceQuery,
    onInstanceSave,
    onInstanceDelete
};
