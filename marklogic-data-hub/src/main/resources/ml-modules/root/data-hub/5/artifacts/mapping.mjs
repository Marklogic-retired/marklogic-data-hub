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
import hubEs from "/data-hub/5/impl/hub-es.mjs";

const collections = ['http://marklogic.com/data-hub/steps/mapping', 'http://marklogic.com/data-hub/steps', 'http://marklogic.com/data-hub/mappings'];
const databases = [config.STAGINGDATABASE, config.FINALDATABASE];
const permissions = [xdmp.permission(consts.DATA_HUB_MAPPING_WRITE_ROLE, 'update'), xdmp.permission(consts.DATA_HUB_MAPPING_READ_ROLE, 'read')];
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
  const results = cts.search(cts.andQuery([cts.collectionQuery(collections[0]), cts.documentQuery(getArtifactUri(artifactName))]), ["score-zero", "unfaceted"], 0);
  return fn.head(results);
}

function getArtifactUri(artifactName) {
  return getDirectory().concat(artifactName).concat(getFileExtension());
}

function validateArtifact(artifact) {
  const missingProperties = requiredProperties.filter((propName) => !artifact[propName]);
  if (missingProperties.length) {
    return new Error(`Mapping '${artifact.name}' is missing the following required properties: ${JSON.stringify(missingProperties)}`);
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
  const defaultSourceRecordScope = 'instanceOnly';
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
    targetFormat: "json",
    attachSourceDocument: false,
    sourceRecordScope: defaultSourceRecordScope
  };
}

export default {
  getNameProperty,
  getCollections,
  getStorageDatabases,
  getPermissions,
  getArtifactNode,
  getDirectory,
  validateArtifact,
  defaultArtifact,
  getFileExtension,
  getArtifactUri
};
