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

const collections = ['http://marklogic.com/data-hub/mapping-artifact'];
const databases = [dataHub.config.STAGINGDATABASE, dataHub.config.FINALDATABASE];
const permissions = [xdmp.permission(dataHub.consts.DATA_HUB_MAPPING_WRITE_ROLE, 'update'), xdmp.permission(dataHub.consts.DATA_HUB_MAPPING_READ_ROLE, 'read')];
const requiredProperties = ['name', 'targetEntityType', 'selectedSource'];

function getNameProperty() {
    return 'name';
}

function getEntityNameProperty() {
    return 'targetEntityType';
}

function getSelectedSourceProperty() {
    return 'selectedSource';
}

function getVersionProperty() {
    return null;
}

function getCollections() {
    return collections;
}

function getStorageDatabases() {
    return databases;
}

function getPermissions() {
    return permissions;
}

function getArtifactNode(artifactName, artifactVersion) {
    // Currently there is no versioning for loadData artifacts
    const results = cts.search(cts.andQuery([cts.collectionQuery(collections[0]), cts.jsonPropertyValueQuery('name', artifactName)]));
    return fn.head(results);
}

function validateArtifact(artifact) {
  const missingProperties = requiredProperties.filter((propName) => !artifact[propName]);
  if (missingProperties.length) {
    return new Error(`Missing the following required properties: ${JSON.stringify(missingProperties)}`);
  }

  const mappingWithSameNameButDifferentEntityTypeExists = cts.exists(cts.andQuery([
    cts.collectionQuery(collections[0]),
    cts.jsonPropertyValueQuery(getNameProperty(), artifact.name),
    cts.notQuery(cts.jsonPropertyValueQuery(getEntityNameProperty(), artifact.targetEntityType))
  ]));
  if (mappingWithSameNameButDifferentEntityTypeExists) {
    return new Error(`A mapping with the same name but for a different entity type already exists. Please choose a different name.`);
  }

  return artifact;
}

function getArtifactSettingNode(collectionName, artifactName, artifactVersion) {
  // Currently there is no versioning for loadData artifacts
  const results = cts.search(cts.andQuery([cts.collectionQuery(collectionName), cts.jsonPropertyValueQuery('artifactName', artifactName)]));
  return fn.head(results);
}

module.exports = {
    getNameProperty,
    getVersionProperty,
    getCollections,
    getStorageDatabases,
    getPermissions,
    getArtifactNode,
    validateArtifact,
    getArtifactSettingNode
};
