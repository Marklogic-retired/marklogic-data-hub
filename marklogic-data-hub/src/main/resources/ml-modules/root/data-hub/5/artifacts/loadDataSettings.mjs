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

const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');

// define constants for caching expensive operations
const dataHub = DataHubSingleton.instance();

const collections = ['http://marklogic.com/data-hub/load-data-artifact/settings'];
const databases = [dataHub.config.STAGINGDATABASE, dataHub.config.FINALDATABASE];
const permissions = [xdmp.permission(dataHub.consts.DATA_HUB_DEVELOPER_ROLE, 'update'), xdmp.permission(dataHub.consts.DATA_HUB_OPERATOR_ROLE, 'read')];
const requiredProperties = ['artifactName', 'targetDatabase'];

export function getArtifactNameProperty() {
    return 'artifactName';
}

export function getTargetDatabaseProperty() {
    return 'targetDatabase';
}

export function getCollections() {
    return collections;
}

export function getStorageDatabases() {
    return databases;
}

export function getPermissions() {
    return permissions;
}

export function getFileExtension() {
    return '.settings.json';
}

export function getArtifactSettingNode(artifactName, artifactVersion) {
    // Currently there is no versioning for loadData artifacts
    const result = cts.search(cts.andQuery([cts.collectionQuery(collections[0]), cts.jsonPropertyValueQuery('artifactName', artifactName)]));
    return fn.head(result);
}

export function validateArtifact(artifact) {
    const missingProperties = requiredProperties.filter((propName) => !artifact[propName]);
    if (missingProperties.length) {
        return new Error(`Missing the following required properties: ${JSON.stringify(missingProperties)}`);
    }
    return artifact;
}
