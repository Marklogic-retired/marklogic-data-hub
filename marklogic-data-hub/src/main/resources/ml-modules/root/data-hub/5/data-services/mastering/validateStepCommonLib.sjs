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

const temporalLib = require("/data-hub/5/temporal/hub-temporal.sjs");

const levelWarn = "warn";


const temporalCollections = temporalLib.getTemporalCollections().toArray().reduce((acc, col) => {
    acc[col] = true;
    return acc;
}, {});

function warningObject(level, message) {
    return {
        "level": level,
        "message": message
    };
}

function targetEntityCollectionWarning(targetEntityType, allCollections = []) {
    const entityTypeTitle = parseEntityTypeTitle(targetEntityType);
    if (entityTypeTitle && allCollections.includes(entityTypeTitle)) {
        return warningObject(levelWarn, "Warning: Target Collections includes the target entity type " + entityTypeTitle);
    }
}

function sourceCollectionWarning(sourceQuery, allCollections = []) {
    if (sourceQuery && sourceQuery.startsWith("cts.collectionQuery")) {
        let sourceCollection = sourceQuery.substring(
            sourceQuery.lastIndexOf("[") + 2,
            sourceQuery.lastIndexOf("]") - 1
        );
        if (allCollections.includes(sourceCollection)) {
            return warningObject(levelWarn, "Warning: Target Collections includes the source collection " + sourceCollection);
        }
    }
}

function temporalCollectionsWarning(allCollections = []) {
    let temporalCollectionOverlap = allCollections.filter((coll) => {
        return temporalCollections[coll];
    });
    if (temporalCollectionOverlap.length) {
        return warningObject(levelWarn, "Warning: Target Collections includes temporal collection(s): " + temporalCollectionOverlap.join(', '));
    }
}

function parseEntityTypeTitle(targetEntityType) {
    targetEntityType = String(targetEntityType);
    return targetEntityType.substring(targetEntityType.lastIndexOf("/") + 1);
}

module.exports = {
    targetEntityCollectionWarning,
    sourceCollectionWarning,
    temporalCollectionsWarning,
    warningObject,
    parseEntityTypeTitle
};
