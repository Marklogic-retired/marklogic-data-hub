/**
 Copyright (c) 2020 MarkLogic Corporation

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
const hubEs = require("/data-hub/5/impl/hub-es.sjs");

const collections = ['http://marklogic.com/data-hub/steps/mapping', 'http://marklogic.com/data-hub/steps', 'http://marklogic.com/data-hub/mappings'];
const databases = [dataHub.config.STAGINGDATABASE, dataHub.config.FINALDATABASE];
const permissions = [xdmp.permission(dataHub.consts.DATA_HUB_MAPPING_WRITE_ROLE, 'update'), xdmp.permission(dataHub.consts.DATA_HUB_MAPPING_READ_ROLE, 'read')];
const requiredProperties = ['name', 'targetEntityType', 'selectedSource'];

function getNameProperty() {
    return 'name';
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

function getFileExtension() {
  return '.step.json';
}

function getDirectory() {
  return "/steps/mapping/";
}

function getArtifactNode(artifactName, artifactVersion) {
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
    cts.notQuery(cts.jsonPropertyValueQuery("targetEntityType", artifact.targetEntityType))
  ]));
  if (mappingWithSameNameButDifferentEntityTypeExists) {
    return new Error(`A mapping with the same name but for a different entity type already exists. Please choose a different name.`);
  }

  return artifact;
}

function defaultArtifact(artifactName, entityTypeId) {
  const defaultCollections =  [artifactName];
  const defaultPermissions = 'data-hub-common,read,data-hub-common,update';
  const defaultValidateEntity = 'doNotValidate';
  if (entityTypeId) {
    // look for Entity Service Title, if not found will use the ID
    defaultCollections.push(hubEs.findEntityServiceTitle(entityTypeId) || entityTypeId);
  }
  return {
    collections: defaultCollections,
    additionalCollections: [],
    permissions: defaultPermissions,
    batchSize: 100,
    validateEntity: defaultValidateEntity,
    targetFormat: "json"
  };
}

module.exports = {
    getNameProperty,
    getCollections,
    getStorageDatabases,
    getPermissions,
    getArtifactNode,
    getDirectory,
    validateArtifact,
    defaultArtifact,
    getFileExtension
};
