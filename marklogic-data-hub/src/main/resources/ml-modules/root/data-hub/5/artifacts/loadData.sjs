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

const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");

const collections = ['http://marklogic.com/data-hub/steps/ingestion', 'http://marklogic.com/data-hub/steps'];
const databases = [config.STAGINGDATABASE, config.FINALDATABASE];
const permissions = [xdmp.permission(consts.DATA_HUB_LOAD_DATA_WRITE_ROLE, 'update'), xdmp.permission(consts.DATA_HUB_LOAD_DATA_READ_ROLE, 'read')];
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
  const results = cts.search(cts.andQuery([cts.collectionQuery(collections[0]), cts.documentQuery(getArtifactUri(artifactName))]));
  return fn.head(results);
}

function getArtifactUri(artifactName){
  return getDirectory().concat(artifactName).concat(getFileExtension());
}

function validateArtifact(artifact) {
    const missingProperties = requiredProperties.filter((propName) => !artifact[propName]);
    if (missingProperties.length) {
        return new Error(`Ingestion step '${artifact.name}' is missing the following required properties: ${JSON.stringify(missingProperties)}`);
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
      sources: [{name: artifactName}],
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
