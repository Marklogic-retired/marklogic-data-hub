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

var docUri;
const record = {};
const doc = cts.doc(docUri);

if(doc) {
    const nodeKind = xdmp.nodeKind(doc.root);
    record["data"] = doc;
    record["recordMetadata"] = xdmp.documentGetMetadata(docUri);
    record["isHubEntityInstance"] = entitySearchLib.isHubEntityInstance(docUri);
    record["recordType"] = getDocumentType(nodeKind);
    record["sources"] = entitySearchLib.getEntitySources(docUri);
}

function getDocumentType(nodeKind) {
    if(nodeKind === 'object') {
        return 'json';
    }

    if(nodeKind === 'element') {
        return 'xml';
    }

    if(nodeKind === 'text') {
        return 'text';
    }

    return 'binary';
}

record;