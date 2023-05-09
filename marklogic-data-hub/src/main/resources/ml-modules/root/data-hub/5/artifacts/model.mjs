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

import config from "/com.marklogic.hub/config.mjs";
import consts from "/data-hub/5/impl/consts.mjs";

const collections = ['http://marklogic.com/entity-services/models'];
const databases = [config.STAGINGDATABASE, config.FINALDATABASE];
const permissions = [xdmp.permission(consts.DATA_HUB_MATCHING_WRITE_ROLE, 'update'), xdmp.permission(consts.DATA_HUB_MATCHING_READ_ROLE, 'read')];
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
  return permissions;
}

function getArtifactNode(artifactName, artifactVersion) {
  const results = cts.search(cts.andQuery([cts.collectionQuery(collections[0]), cts.documentQuery(getArtifactUri(artifactName))]), ["score-zero", "unfaceted"], 0);
  return fn.head(results);
}

function getArtifactUri(artifactName) {
  return getDirectory().concat(artifactName).concat(getFileExtension());
}

function getDirectory(artifactName, artifact, artifactDirName) {
  return "/entities/";
}

function getFileExtension() {
  return ".entity.json";
}

function validateArtifact(artifact) {
  const missingProperties = requiredProperties.filter((propName) => !artifact[propName]);
  if (missingProperties.length) {
    return new Error(`Entity '${artifact.name}' is missing the following required properties: ${JSON.stringify(missingProperties)}`);
  }
  return artifact;
}

export default {
  getNameProperty,
  getCollections,
  getStorageDatabases,
  getDirectory,
  getPermissions,
  getFileExtension,
  getArtifactNode,
  validateArtifact,
  getArtifactUri
};
