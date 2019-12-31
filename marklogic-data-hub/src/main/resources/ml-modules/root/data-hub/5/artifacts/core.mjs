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

const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();
// define constants for caching expensive operations
const cachedArtifacts = {};
const registeredArtifactTypes = {
    loadData: LoadData
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
    const node = artifactLibrary.getArtifactNode(artifactName, artifactVersion);
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
        const artifactNode = artifactLibrary.getArtifactNode(artifactName, artifactVersion);
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
    const artifactDirectory = getArtifactDirectory(artifactType, artifactName);
    const artifactFileExtension = getArtifactFileExtension(artifactType);
    const artifactPermissions = artifactLibrary.getPermissions();
    const artifactCollections = artifactLibrary.getCollections();
    for (const db of artifactDatabases) {
        dataHub.hubUtils.writeDocument(`${artifactDirectory}${xdmp.urlEncode(artifactName)}${artifactFileExtension}`, artifact, artifactPermissions, artifactCollections, db);
    }
    cachedArtifacts[artifactKey] = artifact;
    return artifact;
}

export function validateArtifact(artifactType, artifactName, artifact) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    return artifactLibrary.validateArtifact(artifact, artifactName);
}

function getArtifactDirectory(artifactType, artifactName) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    return artifactLibrary.getDirectory ? artifactLibrary.getDirectory(artifactName): `/${artifactType}/`;
}

function getArtifactFileExtension(artifactType) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    return artifactLibrary.getFileExtension ? artifactLibrary.getFileExtension(): `.${artifactType}.json`;
}

function getArtifactTypeLibrary(artifactType) {
    const artifactLibrary = registeredArtifactTypes[artifactType];
    if (!artifactLibrary) {
        throw new Error(`Invalid artifact type: ${artifactType}. Valid types: ${JSON.stringify(Object.keys(registeredArtifactTypes))}`)
    }
    return artifactLibrary;
}

function generateArtifactKey(artifactType, artifactName, artifactVersion = 'latest') {
    return `${artifactType}:${artifactName}:${artifactVersion}`;
}
