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

// No privilege required: This endpoint is called by the spark connector.

// This is a prototype and not intended for client use yet

var endpointState; // jsonDocument?

var input;         // jsonDocument*
declareUpdate();

const ingest = require("/data-hub/5/builtins/steps/ingestion/default/main.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const HubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const state = fn.head(xdmp.fromJSON(endpointState));

const temporal = require("/MarkLogic/temporal.xqy");
const temporalLib = require("/data-hub/5/temporal/hub-temporal.sjs");

const work = fn.head(xdmp.fromJSON(workUnit));

const uriPrefix = work.uriprefix != null ? work.uriprefix : "";

const collections = work.collections != null ? work.collections.split(',') : [];
const temporalCollections = temporalLib.getTemporalCollections().toArray().reduce((acc, col) => {
    acc[col] = true;
    return acc;
}, {});

let temporalCollection = collections.concat(collections).find((col) => temporalCollections[col]);


const permissions = work.permissions != null ? work.permissions : 'data-hub-common,read,data-hub-common,update'
const permissionsArray = new HubUtils().parsePermissions(permissions);

const headers = {};
headers.createdOn = consts.CURRENT_DATE_TIME
headers.createdBy = consts.CURRENT_USER

if(work.sourcename != null || work.sourcetype != null){
  const sources = [];
  const source = {};
  source.name = work.sourcename
  source.datahubSourceType = work.sourcetype
  sources[0] = source;
  headers.sources = sources
}

var inputArray;
if (input instanceof Sequence) {
  inputArray = input.toArray().map(item => fn.head(xdmp.fromJSON(item)));
} else if (input instanceof Document) {
  inputArray = [fn.head(xdmp.fromJSON(input))];
} else {
  // Assumed to be an array at this point, which is the case for unit tests
  inputArray = fn.head(xdmp.fromJSON(input));
}

inputArray.forEach(record => {

  const uri = (uriPrefix) +  sem.uuidString() + '.json';
  record = ingest.main({uri: uri, value: record}, {
    outputFormat: consts.JSON, headers: headers
  }).value;
  if(temporalCollection) {
    const collectionsReservedForTemporal = ['latest', uri];
    temporal.documentInsert(
            temporalCollection,
            uri,
            record,
            {
              permissions: permissionsArray,
              collections: collections.filter((col) => !(temporalCollections[col] || collectionsReservedForTemporal.includes(col)))
            }
    );
  } else {
    xdmp.documentInsert(
        uri,
        record,
        {
          permissions: permissionsArray,
          collections: collections
        }
      );
  }
});

const returnValue = (fn.count(input) > 0) ? state : null;

returnValue;
