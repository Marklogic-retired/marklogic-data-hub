/**
 Copyright 2012-2019 MarkLogic Corporation

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

import * as LoadData from './loadData';
import * as Flows from './flows';
import * as StepDefs from './stepDefinitions'

const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();
// define constants for caching expensive operations
const cachedArtifacts = {};
const registeredArtifactTypes = {
    loadData: LoadData,
    flows: Flows,
    stepDefinitions: StepDefs
};

export function getTypesInfo() {
    const typesInfo = [];
    for (const artifactType of Object.keys(registeredArtifactTypes)) {
        if (registeredArtifactTypes.hasOwnProperty(artifactType)) {
            const artifactLibrary = registeredArtifactTypes[artifactType];
            typesInfo.push({
                type: artifactType,
                storageDatabases: artifactLibrary.getStorageDatabases(),
                collections: artifactLibrary.getCollections(),
                fileExtension: getArtifactFileExtension(artifactType),
                directory: getArtifactDirectory(artifactType),
                nameProperty: artifactLibrary.getNameProperty(),
                versionProperty: artifactLibrary.getVersionProperty()
            });
        }
    }
    return typesInfo;
}

export function getArtifacts(artifactType) {
    const artifacts = [];
    const queriesForAnd = [];
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    for (const coll of artifactLibrary.getCollections()) {
        queriesForAnd.push(cts.collectionQuery(coll));
    }
    if (queriesForAnd.length) {
        const results = cts.search(queriesForAnd.length > 1 ? cts.andQuery(queriesForAnd) : queriesForAnd[0]);
        for (const result of results) {
            artifacts.push(result.toObject());
        }
    }
    return artifacts;
}

export function deleteArtifact(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactKey = generateArtifactKey(artifactType, artifactName, artifactVersion);
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    // Currently there is no versioning for loadData artifacts
    const node = getArtifactNode(artifactType, artifactName, artifactVersion);
    for (const db of artifactLibrary.getStorageDatabases()) {
        dataHub.hubUtils.deleteDocument(xdmp.nodeUri(node), db);
    }
    delete cachedArtifacts[artifactKey];
    return { success: true };
}

export function getArtifact(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactKey = generateArtifactKey(artifactType, artifactName, artifactVersion);
    if (!cachedArtifacts[artifactKey]) {
        const artifactLibrary =  getArtifactTypeLibrary(artifactType);
        const artifactNode = getArtifactNode(artifactType, artifactName, artifactVersion);
        cachedArtifacts[artifactKey] = artifactNode.toObject();
    }
    return cachedArtifacts[artifactKey];
}

export function setArtifact(artifactType, artifactName, artifact) {
    const artifactKey = generateArtifactKey(artifactType, artifactName);
    let validArtifact = validateArtifact(artifactType, artifactName, artifact) || artifact;
    if (validArtifact instanceof Error) {
        throw new Error(`Invalid artifact with error message: ${validArtifact.message}`);
    }
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const artifactDatabases = artifactLibrary.getStorageDatabases();
    const artifactDirectory = getArtifactDirectory(artifactType, artifactName, artifact);
    const artifactFileExtension = getArtifactFileExtension(artifactType);
    const artifactPermissions = artifactLibrary.getPermissions();
    const artifactCollections = artifactLibrary.getCollections();
    artifact.lastUpdated = fn.string(fn.currentDateTime());
    for (const db of artifactDatabases) {
        dataHub.hubUtils.writeDocument(`${artifactDirectory}${xdmp.urlEncode(artifactName)}${artifactFileExtension}`, artifact, artifactPermissions, artifactCollections, db);
    }
    cachedArtifacts[artifactKey] = artifact;
    return artifact;
}

export function validateArtifact(artifactType, artifactName, artifact) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const validatedArtifact = artifactLibrary.validateArtifact(artifact, artifactName);
    if (validatedArtifact instanceof Error) {
        returnErrToClient(400, 'BAD REQUEST', validatedArtifact.message);
    }
    return validatedArtifact;
}

export function linkToStepOptions(flowName, stepID, artifactType, artifactName, artifactVersion = 'latest') {
    return linkToStepOptionsOperation('addLink', flowName, stepID, artifactType, artifactName, artifactVersion);
}

export function removeLinkToStepOptions(flowName, stepID, artifactType, artifactName, artifactVersion = 'latest') {
    return linkToStepOptionsOperation('removeLink', flowName, stepID, artifactType, artifactName, artifactVersion);
}

function linkToStepOptionsOperation(operation, flowName, stepID, artifactType, artifactName, artifactVersion = 'latest') {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    // getting artifact object so 404 will be thrown if artifact isn't found
    // also, we can have the extension library handle latest version logic, if necessary
    const artifactObject = getArtifactNode(artifactType, artifactName, artifactVersion).toObject();
    artifactVersion = artifactLibrary.getVersionProperty() ? artifactObject[artifactLibrary.getVersionProperty()] : artifactVersion;


    const flowDatabases =  getArtifactTypeLibrary('flows').getStorageDatabases();
    const flowNode = getArtifactNode('flows', flowName);
    const stepName = stepID.substring(0, stepID.lastIndexOf('-'));
    const stepType = stepID.substring(stepID.lastIndexOf('-') + 1).toLowerCase();
    const stepOptionsXPath = dataHub.hubUtils.xquerySanitizer`/steps/*[name eq "${stepName}"][lower-case(stepDefinitionType) eq "${stepType}"]/options`;
    const stepOptionsNode = fn.head(flowNode.xpath(stepOptionsXPath));
    if (fn.empty(stepOptionsNode)) {
        returnErrToClient(404, 'NOT FOUND', `Step "${stepID}" options of flow "${flowName}" not found!`);
    }
    let stepOptionsObject = stepOptionsNode.toObject();
    if (operation === 'addLink') {
        if (artifactLibrary.linkToOptions) {
            stepOptionsObject = artifactLibrary.linkToOptions(stepOptionsObject, artifactName, artifactVersion);
        } else {
            stepOptionsObject = defaultArtifactLinkFunction(artifactType, stepOptionsObject, artifactName, artifactVersion);
        }
    } else if (operation === 'removeLink') {
        if (artifactLibrary.removeLinkToOptions) {
            stepOptionsObject = artifactLibrary.removeLinkToOptions(stepOptionsObject, artifactName, artifactVersion);
        } else {
            stepOptionsObject = defaultRemoveArtifactLinkFunction(artifactType, stepOptionsObject, artifactName, artifactVersion);
        }
    }
    const flowURI = xdmp.nodeUri(flowNode);
    for (const db of flowDatabases) {
        dataHub.hubUtils.updateNodePath(flowURI, stepOptionsXPath, stepOptionsObject, db);
    }
    // returning the updated flow object so the file can be updated in the project directory
    const flowObject = flowNode.toObject();
    const stepNumber = fn.string(fn.nodeName(stepOptionsNode.xpath('..')));
    flowObject.steps[stepNumber].options = stepOptionsObject;
    return flowObject;
}

function defaultArtifactLinkFunction(artifactType, existingOptions, artifactName, artifactVersion) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const linkObject = {
        [artifactLibrary.getNameProperty()]: artifactName
    };
    const versionProperty = artifactLibrary.getVersionProperty();
    if (versionProperty)  {
        linkObject[versionProperty] = artifactVersion;
    }
    existingOptions[artifactType] = linkObject;
    return existingOptions;
}

function defaultRemoveArtifactLinkFunction(artifactType, existingOptions, artifactName, artifactVersion) {
    delete existingOptions[artifactType];
    return existingOptions;
}

function getArtifactNode(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactLibrary = getArtifactTypeLibrary(artifactType);
    const node = artifactLibrary.getArtifactNode(artifactName, artifactVersion);
    if (fn.empty(node)) {
        returnErrToClient(404, 'NOT FOUND');
    }
    return node;
}

function getArtifactDirectory(artifactType, artifactName, artifact) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    return artifactLibrary.getDirectory ? artifactLibrary.getDirectory(artifactName, artifact): `/${artifactType}/`;
}

function getArtifactFileExtension(artifactType) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    return artifactLibrary.getFileExtension ? artifactLibrary.getFileExtension(): `.${artifactType}.json`;
}

function getArtifactTypeLibrary(artifactType) {
    const artifactLibrary = registeredArtifactTypes[artifactType];
    if (!artifactLibrary) {
        returnErrToClient(400, 'BAD REQUEST', `Invalid artifact type: ${artifactType}. Valid types: ${JSON.stringify(Object.keys(registeredArtifactTypes))}`)
    }
    return artifactLibrary;
}

function generateArtifactKey(artifactType, artifactName, artifactVersion = 'latest') {
    return `${artifactType}:${artifactName}:${artifactVersion}`;
}

function returnErrToClient(statusCode, statusMsg, body)
{
    fn.error(null, 'RESTAPI-SRVEXERR',
        Sequence.from([statusCode, statusMsg, body]));
}
