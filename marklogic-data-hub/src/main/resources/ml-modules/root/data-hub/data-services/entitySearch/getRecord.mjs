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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-entity-model", "execute");

import entitySearchLib from "/data-hub/5/entities/entity-search-lib";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";

function getDocumentType(nodeKind) {
  if (nodeKind === 'object') return 'json';
  if (nodeKind === 'element') return 'xml';
  if (nodeKind === 'text') return 'text';
  return 'binary';
}

const docUri = external.docUri;

const doc = cts.doc(docUri);
if (!doc) {
  httpUtils.throwNotFound("Could not find record with URI: " + docUri);
}

let permissions = xdmp.documentGetPermissions(docUri);
if (permissions) {
  permissions.forEach(permission => { permission.roleName = xdmp.roleName(permission.roleId)})
}
const recordType = getDocumentType(xdmp.nodeKind(doc.root));
const entityInstanceDetails = entitySearchLib.getEntityInstanceDetails(doc);
const entityInstanceProperties = entityInstanceDetails != null ? entityInstanceDetails.properties : null;
const entityName = entityInstanceDetails ? entityInstanceDetails["entityName"] : null;

const record = {
  "data": doc,
  "docUri": docUri,
  "recordType": recordType,
  "recordMetadata": xdmp.documentGetMetadata(docUri),
  "collections": xdmp.documentGetCollections(docUri),
  "permissions": permissions,
  "quality": cts.quality(doc),
  "documentProperties": xdmp.documentProperties(docUri),
  "entityInstanceProperties": entityInstanceProperties,
  "sources": entitySearchLib.getEntitySources(doc),
  "history": entitySearchLib.getRecordHistory(docUri),
  "documentSize": entitySearchLib.getDocumentSize(doc)
};

if(entityName) {
  const unmergeDetails = entitySearchLib.fetchUnmergeDetails(doc, entityName);
  record["unmerge"] = unmergeDetails["unmerge"];
  record["unmergeUris"] = unmergeDetails["unmergeUris"];
  record["matchStepName"] = unmergeDetails["matchStepName"] ? unmergeDetails["matchStepName"] : undefined;
}

record;
