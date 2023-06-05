/*
 * Copyright 2021 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const temporal = require("/MarkLogic/temporal.xqy");



function getTemporalCollections() {
  return temporal.collections();
}

function createIndex() {
  xdmp.invokeFunction(function () {
    const admin = require("/MarkLogic/admin");
    let config = admin.getConfiguration();
    let elementRangeIndexes = [
      admin.databaseRangeElementIndex("dateTime", "", "systemStart", "", fn.false()),
      admin.databaseRangeElementIndex("dateTime", "", "systemEnd", "", fn.false())]
    elementRangeIndexes.forEach((elementRangeIndex) => {
      try {
        config = admin.databaseAddRangeElementIndex(config, xdmp.database(), elementRangeIndex);
      } catch (e) {
      }
    });
    admin.saveConfiguration(config);
  },{update: "true"});
}

function createAxis() {
  xdmp.invokeFunction(function () {
    try {
      temporal.axisCreate("system", cts.elementReference("systemStart", "type=dateTime"), cts.elementReference("systemEnd", "type=dateTime"));
    } catch (e) {
    }
  }, {update: "true"});
}

function createCollection(temporalCollection) {
  xdmp.invokeFunction(function () {
    temporal.collectionCreate(temporalCollection, "system");
  }, {update: "true"});
}

function prepareTemporalSourceQuery(sourceQuery) {

  let sourceCollections = sourceQuery.match(/(['"]).*?\1/g)
  if (sourceCollections && sourceCollections.length > 0) {
    sourceCollections = sourceCollections.map(c => {
      return c.slice(1, -1);
    });

    const hasLatest = sourceCollections.find(c => "latest" === c);
    if (!hasLatest || hasLatest.length == 0) {
      const temporalCollectionMap = getTemporalCollections().toArray().reduce((collectionMap, collectionName) => {
        collectionMap[collectionName] = true;
        return collectionMap;
      }, {});
      if (temporalCollectionMap.length > 0) {
        const temporalCollections = sourceCollections.find(collection => temporalCollectionMap[collection]);
        if (temporalCollections && temporalCollections.length > 0) {
          return `cts.andQuery([${sourceQuery},cts.collectionQuery('latest')])`;
        }
      }
    }
  }
  return sourceQuery;
}

export default {
  getTemporalCollections: import.meta.amp(getTemporalCollections),
  createIndex: import.meta.amp(createIndex),
  createAxis: import.meta.amp(createAxis),
  createCollection: import.meta.amp(createCollection),
  prepareTemporalSourceQuery: prepareTemporalSourceQuery
}

