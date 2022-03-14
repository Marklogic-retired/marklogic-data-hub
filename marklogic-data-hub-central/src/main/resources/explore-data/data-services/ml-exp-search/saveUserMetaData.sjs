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
declareUpdate();

var userMetaData;
userMetaData = userMetaData.toObject();
const userId = userMetaData.userId;
const metaDocUri = "/user-meta-data/" + userId + ".json";
const defaultMetaDataDoc = {
  "userId": userId,
  "recentVisits": {

  },
  "recentSearches": {

  }
};
const userCollections = ["http://marklogic.com/entity-viewer/user-meta-data"];
const userPermissions = [
  xdmp.permission('rest-admin', 'read'),
  xdmp.permission('rest-admin', 'update'),
  xdmp.permission('rest-admin', 'execute'),
  xdmp.permission('rest-reader', 'read'),
  xdmp.permission('rest-writer', 'read'),
  xdmp.permission('rest-writer', 'update'),
  xdmp.defaultPermissions()
];

function updateRecentVisits(metaDataDoc, recentVisits) {
  let recordId = recentVisits["recordId"];
  metaDataDoc["recentVisits"][recordId] = fn.currentDateTime();
}

function updateRecentSearches(metaDataDoc, recentSearches) {
  let queryId = JSON.stringify(recentSearches["query"]);
  metaDataDoc["recentSearches"][queryId] = recentSearches;
  metaDataDoc["recentSearches"][queryId]["timeStamp"] = fn.currentDateTime();
}

function insertMetaDataRecord(metaDataRecord) {
  xdmp.documentInsert(metaDocUri, metaDataRecord, {
    permissions: userPermissions,
    collections: userCollections
  });
}

function updateMetaData() {
  const docAlreadyExists = fn.docAvailable(metaDocUri);
  const metaDataRecord = docAlreadyExists ? cts.doc(metaDocUri).toObject() : defaultMetaDataDoc;

  if(userMetaData["recentVisits"] && Object.keys(userMetaData["recentVisits"]).length !== 0) {
    updateRecentVisits(metaDataRecord, userMetaData["recentVisits"]);
  }

  if(userMetaData["recentSearches"] && Object.keys(userMetaData["recentSearches"]).length !== 0) {
    updateRecentSearches(metaDataRecord, userMetaData["recentSearches"]);
  }

  if(docAlreadyExists) {
    xdmp.nodeReplace(cts.doc(metaDocUri), metaDataRecord);
  } else {
    insertMetaDataRecord(metaDataRecord);
  }
}

updateMetaData();



