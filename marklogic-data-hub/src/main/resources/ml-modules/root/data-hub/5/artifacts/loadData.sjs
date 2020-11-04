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

const collections = ['http://marklogic.com/data-hub/steps/ingestion', 'http://marklogic.com/data-hub/steps'];
const databases = [dataHub.config.STAGINGDATABASE, dataHub.config.FINALDATABASE];
const permissions = [xdmp.permission(dataHub.consts.DATA_HUB_LOAD_DATA_WRITE_ROLE, 'update'), xdmp.permission(dataHub.consts.DATA_HUB_LOAD_DATA_READ_ROLE, 'read')];
const requiredProperties = ['name', 'sourceFormat', 'targetFormat'];

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
    if(artifact.hasOwnProperty('outputURIReplacement') && artifact.hasOwnProperty('outputURIPrefix')){
      xdmp.trace(consts.TRACE_STEP, `Ingestion step ${artifact.name}'s 'outputURIReplacement' property will be unset as 'outputURIPrefix' is being set`);
      delete artifact.outputURIReplacement;
    }

    return artifact;
}

function defaultArtifact(artifactName) {
  const defaultPermissions = 'data-hub-common,read,data-hub-common,update';
  return {
    headers: {
      createdOn: "currentDateTime",
      createdBy: "currentUser"
    },
    collections: [artifactName],
    permissions: defaultPermissions,
    batchSize: 100
  };
}

function getFileExtension() {
  return '.step.json';
}

function getDirectory() {
  return "/steps/ingestion/";
}

module.exports = {
  getNameProperty,
  getCollections,
  getStorageDatabases,
  getPermissions,
  getArtifactNode,
  validateArtifact,
  defaultArtifact,
  getFileExtension,
  getDirectory
};
