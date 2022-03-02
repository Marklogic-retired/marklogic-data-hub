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

var recentlyVisitedRecord;
recentlyVisitedRecord = recentlyVisitedRecord.toObject();

const userCollections = ["http://marklogic.com/entity-viewer/user-meta-data"];
const metaDocUri = "/user-meta-data/" + recentlyVisitedRecord.user + ".json";

function updateRecord() {
  const query = cts.andQuery([cts.collectionQuery(userCollections), cts.jsonPropertyValueQuery("user", recentlyVisitedRecord.user)]);
  const recordUri = recentlyVisitedRecord.recordUri;
  if (cts.exists(query) && fn.doc(metaDocUri)) {
    const record = cts.doc(metaDocUri).toObject();
    let recentlyVisited = record.recentlyVisitedRecords;
    recentlyVisited[recordUri] = fn.currentDateTime();
    xdmp.nodeReplace(cts.doc(metaDocUri), record);
  } else {
    const record = {
      "user": recentlyVisitedRecord.user,
      "recentlyVisitedRecords": {
        [recordUri]: fn.currentDateTime()
      }
    }
    insertDocument(record);
  }
}

function insertDocument(userMetaDataRecord) {
  const permissions = [
    xdmp.permission('rest-admin', 'read'),
    xdmp.permission('rest-admin', 'update'),
    xdmp.permission('rest-admin', 'execute'),
    xdmp.permission('rest-reader', 'read'),
    xdmp.permission('rest-writer', 'read'),
    xdmp.permission('rest-writer', 'update'),
    xdmp.defaultPermissions()
  ];

  xdmp.documentInsert(metaDocUri, userMetaDataRecord, {
    permissions: permissions,
    collections: userCollections
  });
}

updateRecord();
