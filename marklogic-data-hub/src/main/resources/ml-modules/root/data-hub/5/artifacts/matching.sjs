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
const Security = require("/data-hub/5/impl/security.sjs");

// define constants for caching expensive operations
const dataHub = DataHubSingleton.instance();

const collections = ['http://marklogic.com/data-hub/steps/matching', 'http://marklogic.com/data-hub/steps'];
const databases = [dataHub.config.STAGINGDATABASE, dataHub.config.FINALDATABASE];
const permissions =
  [
    xdmp.permission(dataHub.consts.DATA_HUB_MATCHING_WRITE_ROLE, 'update'),
    xdmp.permission(dataHub.consts.DATA_HUB_MATCHING_READ_ROLE, 'read')
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
  return "/steps/matching/";
}

function getArtifactNode(artifactName, artifactVersion) {
    const results = cts.search(cts.andQuery([cts.collectionQuery(collections[0]), cts.jsonPropertyValueQuery('name', artifactName)]));
    return fn.head(results);
}

function validateArtifact(artifact) {
    return artifact;
}

function defaultArtifact(artifactName) {
  const defaultPermissions = 'data-hub-common,read,data-hub-common,update';
  let artifact = {
    batchSize: 100,
    threadCount: 1,
    sourceDatabase: dataHub.config.FINALDATABASE,
    targetDatabase: dataHub.config.FINALDATABASE,
    targetEntity: "Change this to a valid entity type name; e.g. Customer",
    sourceQuery: "cts.collectionQuery('Change this to a valid collection name; e.g. Customer')",
    collections: [
      "mastering-summary"
    ],
    permissions: defaultPermissions,
    targetFormat: "json"
  };

  if (Security.currentUserHasRole("hub-central-match-merge-writer")) {
    artifact["matchRulesets"] = artifact.matchRulesets || [];
    artifact["thresholds"] = artifact.thresholds || [];
  }
  else {
    artifact["matchOptions"] = {
      dataFormat: "json",
      propertyDefs: {
        property: []
      },
      algorithms: {
        algorithm: []
      },
      collections: {
        content: []
      },
      scoring: {
        add: [],
        expand: [],
        reduce: []
      },
      actions: {
        action: []
      },
      thresholds: {
        threshold: []
      },
      tuning: {
        maxScan: 200
      }
    }
  }

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
