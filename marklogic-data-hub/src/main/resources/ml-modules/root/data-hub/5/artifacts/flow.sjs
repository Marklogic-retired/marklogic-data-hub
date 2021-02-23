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
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

const collections = ['http://marklogic.com/data-hub/flow'];
const databases = [config.STAGINGDATABASE, config.FINALDATABASE];
const requiredProperties = ['name'];

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
  let permsString = "%%mlFlowPermissions%%";
  // Default to the given string in case the above token has not been replaced
  permsString = permsString.indexOf("%mlFlowPermissions%") > -1 ?
    "data-hub-flow-reader,read,data-hub-flow-writer,update" :
    permsString;
  return hubUtils.parsePermissions(permsString);
}

function getFileExtension() {
    return '.flow.json';
}

function getDirectory() {
  return "/flows/";
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
        return new Error(`Flow '${artifact.name}' is missing the following required properties: ${JSON.stringify(missingProperties)}`);
    }
    return artifact;
}

module.exports = {
  getNameProperty,
  getCollections,
  getStorageDatabases,
  getPermissions,
  getFileExtension,
  getArtifactNode,
  getDirectory,
  validateArtifact
};
