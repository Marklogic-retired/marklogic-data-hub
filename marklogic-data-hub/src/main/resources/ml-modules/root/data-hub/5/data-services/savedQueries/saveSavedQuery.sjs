'use strict';
declareUpdate();

var saveQuery;
var userCollections = ["http://marklogic.com/data-hub/saved-query"];
var queryDocument = JSON.parse(saveQuery);

if (queryDocument == null || queryDocument.savedQuery == null) {
    throw Error("The request is empty or malformed");
}

if (queryDocument.savedQuery.name == null || !queryDocument.savedQuery.name) {
    throw Error("Query name is missing");
}

if (queryDocument.savedQuery.query == null || Object.keys(queryDocument.savedQuery.query) == 0) {
    throw Error("Query to be saved cannot be empty");
}

if (queryDocument.savedQuery.propertiesToDisplay == null || queryDocument.savedQuery.propertiesToDisplay.length == 0) {
    throw Error("Entity type properties to be displayed cannot be empty");
}

let id = queryDocument.savedQuery.id;
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
    let permissions = [xdmp.permission('data-hub-saved-query-reader', 'read'),
        xdmp.permission('data-hub-saved-query-writer', 'update'),
        xdmp.defaultPermissions()];
    xdmp.documentInsert(docUri, queryDocument, {
        permissions: permissions,
        collections: userCollections
    });
}

queryDocument;