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

const collections = ['http://marklogic.com/data-hub/steps/merging', 'http://marklogic.com/data-hub/steps'];
const databases = [config.STAGINGDATABASE, config.FINALDATABASE];
const permissions =
  [
    xdmp.permission(consts.DATA_HUB_MATCHING_WRITE_ROLE, 'update'),
    xdmp.permission(consts.DATA_HUB_MATCHING_READ_ROLE, 'read')
  ];
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

function getFileExtension() {
  return '.step.json';
}

function getDirectory() {
  return "/steps/merging/";
}

function getArtifactNode(artifactName, artifactVersion) {
  const results = cts.search(cts.andQuery([cts.collectionQuery(collections[0]), cts.documentQuery(getArtifactUri(artifactName))]));
  return fn.head(results);
}

function getArtifactUri(artifactName){
  return getDirectory().concat(artifactName).concat(getFileExtension());
}

function validateArtifact(artifact) {
    return artifact;
}

function defaultArtifact(artifactName) {
  const defaultPermissions = 'data-hub-common,read,data-hub-common,update';
  let artifact = {
    // defaulting to batch size one, since a single match summary document updates multiple other documents
    batchSize: 1,
    sourceDatabase: config.FINALDATABASE,
    targetDatabase: config.FINALDATABASE,
    permissions: defaultPermissions,
    targetEntity: "Change this to a valid entity type name; e.g. Customer",
    sourceQuery: "cts.collectionQuery('mastering-summary')",
    provenanceGranularityLevel: 'coarse',
    collections: [],
    targetFormat: "json"
  };
  artifact["mergeRules"] = artifact.mergeRules || [];
  artifact["mergeStrategies"] = artifact.mergeStrategies || [];
  artifact["targetCollections"] = artifact.targetCollections || {
    "onMerge": { "add": [], "remove": [] },
    "onNoMatch": { "add": [], "remove": [] },
    "onArchive": { "add": [], "remove": [] },
    "onNotification": { "add": [], "remove": [] }
  };
  return artifact;
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
