/**
 Copyright 2012-2019 MarkLogic Corporation

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

const temporal = require("/MarkLogic/temporal.xqy");

const temporalCollections = temporal.collections().toArray().reduce((acc, col) => {
    acc[col] = true;
    return acc;
}, {});
let basePermissions = external.permissions;
for (let content of external.writeQueue) {
    let context = (content.context||{});
    let permissions = (basePermissions || []).concat((context.permissions||[]));
    let existingCollections = xdmp.documentGetCollections(content.uri);
    let collections = fn.distinctValues(Sequence.from(external.baseCollections.concat((context.collections||[])))).toArray();
    let metadata = context.metadata;
    let temporalCollection = collections.concat(existingCollections).find((col) => temporalCollections[col]);
    let isDeleteOp = !!content['$delete'];
    if (isDeleteOp) {
        if (fn.docAvailable(content.uri)) {
            if (temporalCollection) {
                temporal.documentDelete(temporalCollection, content.uri);
            } else {
                xdmp.documentDelete(content.uri);
            }
        }
    } else {
        if (temporalCollection) {
            // temporalDocURI is managed by the temporal package and must not be carried forward.
            if (metadata) {
                delete metadata.temporalDocURI;
            }
            temporal.documentInsert(temporalCollection, content.uri, content.value,
                {
                    permissions,
                    collections: collections.filter((col) => !temporalCollections[col]),
                    metadata
                }
            );
        } else {
            xdmp.documentInsert(content.uri, content.value, {permissions, collections, metadata});
        }
    }
}
let writeInfo = {
    transaction: xdmp.transaction(),
    dateTime: fn.currentDateTime()
};
writeInfo;
