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

const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

const currentDatabaseName = xdmp.databaseName(xdmp.database());

function calculateMergingActivity(step)
{
    let sourceDatabaseName = step.sourceDatabase || currentDatabaseName;
    if (sourceDatabaseName !== currentDatabaseName) {
        return hubUtils.invokeFunction(function () {
            return internalCalculateMergingActivity(step);
        }, sourceDatabaseName);
    } else {
        return internalCalculateMergingActivity(step);
    }
}

function internalCalculateMergingActivity(step)
{
    const targetEntityType = step.targetEntity || step.targetEntityType;
    let query = null;
    if (targetEntityType) {
        let entityTypeTitle = targetEntityType;
        if (targetEntityType.includes('/')) {
            entityTypeTitle = require("/data-hub/5/impl/entity-lib.sjs").getEntityTypeIdParts(targetEntityType).entityTypeTitle;
        }
        query = cts.collectionQuery(entityTypeTitle);
    }
    const sourceNames = cts.values(cts.fieldReference('datahubSourceName'), null, null, query).toArray();
    return {
        sourceNames
    };
}
module.exports = {
    calculateMergingActivity
};
