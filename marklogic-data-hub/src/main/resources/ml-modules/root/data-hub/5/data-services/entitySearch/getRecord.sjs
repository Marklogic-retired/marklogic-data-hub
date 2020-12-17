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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-entity-model", "execute");

const entitySearchLib = require("/data-hub/5/entities/entity-search-lib.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

function getDocumentType(nodeKind) {
  if (nodeKind === 'object') return 'json';
  if (nodeKind === 'element') return 'xml';
  if (nodeKind === 'text') return 'text';
  return 'binary';
}

var docUri;

const doc = cts.doc(docUri);
if (!doc) {
  httpUtils.throwNotFound("Could not find record with URI: " + docUri);
}

const record = {
  "data": doc,
  "recordType": getDocumentType(xdmp.nodeKind(doc.root)),
  "recordMetadata": xdmp.documentGetMetadata(docUri),
  "isHubEntityInstance": entitySearchLib.isHubEntityInstance(docUri),
  "sources": entitySearchLib.getEntitySources(docUri),
  "history": entitySearchLib.getRecordHistory(docUri),
  "documentSize": entitySearchLib.getDocumentSize(cts.doc(docUri))
};

record;
