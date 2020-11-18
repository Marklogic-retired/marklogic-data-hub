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

declareUpdate();

xdmp.securityAssert("http://marklogic.com/data-hub/hub-central/privileges/save-entity-query", "execute");

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

var saveQuery;
var userCollections = ["http://marklogic.com/data-hub/saved-query"];
var queryDocument = JSON.parse(saveQuery);

if (queryDocument == null || queryDocument.savedQuery == null) {
    httpUtils.throwBadRequest("The request is empty or malformed");
}

if (queryDocument.savedQuery.name == null || !queryDocument.savedQuery.name) {
    httpUtils.throwBadRequest("Query name is required");
}

if (queryDocument.savedQuery.query == null || Object.keys(queryDocument.savedQuery.query) == 0) {
    httpUtils.throwBadRequest("Query to be saved cannot be empty");
}

if (queryDocument.savedQuery.propertiesToDisplay == null || queryDocument.savedQuery.propertiesToDisplay.length == 0) {
    httpUtils.throwBadRequest("Entity type properties to be displayed cannot be empty");
}

const id = queryDocument.savedQuery.id;
const positiveQuery = cts.andQuery([cts.collectionQuery("http://marklogic.com/data-hub/saved-query"), cts.jsonPropertyValueQuery("name", queryDocument.savedQuery.name),
    cts.jsonPropertyValueQuery("owner", xdmp.getCurrentUser())]);
const negativeQuery = cts.documentQuery("/saved-queries/" + id + ".json");
const queryNameExists = cts.exists(cts.andNotQuery(positiveQuery, negativeQuery));
if(queryNameExists) {
    httpUtils.throwBadRequest(`You already have a saved query with a name of ${queryDocument.savedQuery.name}`);
}

if (cts.doc("/saved-queries/" + id + ".json")) {
    queryDocument.savedQuery.systemMetadata.lastUpdatedBy = xdmp.getCurrentUser();
    queryDocument.savedQuery.systemMetadata.lastUpdatedDateTime = fn.currentDateTime();
    xdmp.nodeReplace(cts.doc("/saved-queries/" + id + ".json"), queryDocument);
} else {
    queryDocument.savedQuery.id = sem.uuidString();
    queryDocument.savedQuery.owner = xdmp.getCurrentUser();
    queryDocument.savedQuery.systemMetadata = {
        "createdBy": xdmp.getCurrentUser(),
        "createdDateTime": fn.currentDateTime(),
        "lastUpdatedBy": xdmp.getCurrentUser(),
        "lastUpdatedDateTime": fn.currentDateTime()
    };
    insertDocument(queryDocument);
}

function insertDocument(queryDocument) {
    let docUri = "/saved-queries/" + queryDocument.savedQuery.id + ".json";
    let permissions = [xdmp.permission('data-hub-saved-query-user', 'read'),
        xdmp.permission('data-hub-saved-query-user', 'update'),
        xdmp.defaultPermissions()];
    xdmp.documentInsert(docUri, queryDocument, {
        permissions: permissions,
        collections: userCollections
    });
}

queryDocument;
