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

const LoadData = require('./loadData');
const Flows = require('./flows');
const StepDefs = require('./stepDefinitions');
const Mappings = require('./mappings');

const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();
// define constants for caching expensive operations
const cachedArtifacts = {};
const registeredArtifactTypes = {
    loadData: LoadData,
    flows: Flows,
    stepDefinitions: StepDefs,
    mappings: Mappings
};

function getTypesInfo() {
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

function getArtifacts(artifactType) {
    const queries = [];
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    for (const coll of artifactLibrary.getCollections()) {
        queries.push(cts.collectionQuery(coll));
    }
    if (queries.length) {
        if (artifactType == "loadData") {
            return cts.search(cts.andQuery(queries)).toArray();
        } else {
            return getArtifactsGroupByEntity(queries)
        }
    }
    return [];
}

function getArtifactsGroupByEntity(queries) {
    const entityNames = getEntityNames();
    const artifacts = cts.search(cts.andQuery(queries.concat(cts.jsonPropertyValueQuery("targetEntity", entityNames)))).toArray();
    const artifactsByEntity = artifacts.map(e => e.toObject()).reduce((res, e) => {
            res[e.targetEntity] = res[e.targetEntity] || {entityType : e.targetEntity};
            res[e.targetEntity].artifacts = res[e.targetEntity].artifacts || [];
            res[e.targetEntity].artifacts.push(e);
            return res;
        }, {});

    const entityWithoutArtifacts = [];
    for (const ename of entityNames) {
        if (!artifactsByEntity[ename]) {
            entityWithoutArtifacts.push(ename);
        }
    }
    const allArtifactsByEntity = Object.keys(artifactsByEntity).map(e => artifactsByEntity[e]);
    for (const e of entityWithoutArtifacts) {
        allArtifactsByEntity.push({entityType : e, artifacts : []});
    }
    return allArtifactsByEntity;
}

function deleteArtifact(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactKey = generateArtifactKey(artifactType, artifactName, artifactVersion);
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);

    // Currently there is no versioning for loadData artifacts
    const node = getArtifactNode(artifactType, artifactName, artifactVersion);

    for (const db of artifactLibrary.getStorageDatabases()) {
        dataHub.hubUtils.deleteDocument(xdmp.nodeUri(node), db);
    }
    delete cachedArtifacts[artifactKey];
    if (artifactType != 'loadData') {
        return { success: true };
    }
    //delete related config file if existed
    return deleteArtifactSettings(artifactType, artifactName, artifactVersion);
}

function getArtifact(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactKey = generateArtifactKey(artifactType, artifactName, artifactVersion);
    if (!cachedArtifacts[artifactKey]) {
        const artifactLibrary =  getArtifactTypeLibrary(artifactType);
        const artifactNode = getArtifactNode(artifactType, artifactName, artifactVersion);
        cachedArtifacts[artifactKey] = artifactNode.toObject();
    }
    return cachedArtifacts[artifactKey];
}

function setArtifact(artifactType, artifactName, artifact) {
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

function getArtifactSettings(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactSettingKey = generateArtifactKey(artifactType + 'Settings', artifactName);
    if (!cachedArtifacts[artifactSettingKey]) {
        const artifactLibrary = getArtifactTypeLibrary(artifactType);
        const settingCollection = `http://marklogic.com/data-hub/${artifactType}/settings`;

        const settingNode = artifactLibrary.getArtifactSettingNode(settingCollection, artifactName, artifactVersion);

        if (fn.empty(settingNode)) {
            return {};
        }
        cachedArtifacts[artifactSettingKey] = settingNode.toObject();
    }
    return cachedArtifacts[artifactSettingKey];
}

function setArtifactSettings(artifactType, artifactName, settings) {
    const requiredProperties = ['artifactName', 'targetDatabase'];
    let validSettings = validateArtifactSettings(settings, requiredProperties);
    if (validSettings instanceof Error) {
        throw new Error(`Invalid artifact settings with error message: ${validSettings.message}`);
    }
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const artifactDatabases = artifactLibrary.getStorageDatabases();
    const artifactDirectory = getArtifactDirectory(artifactType, artifactName, settings);
    const artifactFileExtension = '.settings.json';
    const artifactPermissions = artifactLibrary.getPermissions();
    const settingCollections = [`http://marklogic.com/data-hub/${artifactType}/settings`];
    settings.lastUpdated = fn.string(fn.currentDateTime());

    for (const db of artifactDatabases) {
        dataHub.hubUtils.writeDocument(`${artifactDirectory}${xdmp.urlEncode(artifactName)}${artifactFileExtension}`, settings, artifactPermissions, settingCollections, db);
    }
    const artifactSettingKey = generateArtifactKey(artifactType + 'Settings', artifactName);
    cachedArtifacts[artifactSettingKey] = settings;
    return settings;
}

function validateArtifact(artifactType, artifactName, artifact) {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const validatedArtifact = artifactLibrary.validateArtifact(artifact, artifactName);
    if (validatedArtifact instanceof Error) {
        returnErrToClient(400, 'BAD REQUEST', validatedArtifact.message);
    }
    return validatedArtifact;
}

function getArtifactNode(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactLibrary = getArtifactTypeLibrary(artifactType);
    const node = artifactLibrary.getArtifactNode(artifactName, artifactVersion);
    if (fn.empty(node)) {
        returnErrToClient(404, 'Not found!');
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

function returnErrToClient(statusCode, statusMsg, body) {
    fn.error(null, 'RESTAPI-SRVEXERR',
        Sequence.from([statusCode, statusMsg, body]));
}

function validateArtifactSettings(settings, requiredProperties) {
    const missingProperties = requiredProperties.filter((propName) => !settings[propName]);
    if (missingProperties.length) {
        return new Error(`Missing the following required properties: ${JSON.stringify(missingProperties)}`);
    }
    return settings;
}

function deleteArtifactSettings(artifactType, artifactName, artifactVersion = 'latest') {
    const artifactLibrary =  getArtifactTypeLibrary(artifactType);
    const settingCollection = `http://marklogic.com/data-hub/${artifactType}/settings`;

    const settingNode = artifactLibrary.getArtifactSettingNode(settingCollection, artifactName,
        artifactVersion);

    if (!fn.empty(settingNode)) {
        for (const db of artifactLibrary.getStorageDatabases()) {
            dataHub.hubUtils.deleteDocument(xdmp.nodeUri(settingNode), db);
        }
    }

    const artifactSettingKey = generateArtifactKey(artifactType + 'Settings',
        artifactName);
    if (cachedArtifacts[artifactSettingKey]) {
        delete cachedArtifacts[artifactSettingKey];
    }
    return { success: true };
}

function getEntityNames() {
    return cts.search(cts.collectionQuery("http://marklogic.com/entity-services/models")).toArray().map(e => e.xpath("//info//title"));
}

module.exports = {
    getTypesInfo,
    getArtifacts,
    deleteArtifact,
    getArtifact,
    setArtifact,
    getArtifactSettings,
    setArtifactSettings,
    validateArtifact
};
