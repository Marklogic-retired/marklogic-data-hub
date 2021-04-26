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

declareUpdate();

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/delete-jobs", "execute");

const jobs = require("/data-hub/5/impl/jobs.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

const DEFAULT_BATCH_SIZE = 250;

var endpointState;
var endpointConstants;

const constants = fn.head(xdmp.fromJSON(endpointConstants));
const retainDuration = constants.retainDuration;

if(retainDuration == null || !xdmp.castableAs( "http://www.w3.org/2001/XMLSchema", "duration", retainDuration)) {
  httpUtils.throwBadRequest("retainDuration must be a duration in the format of PnYnM or PnDTnHnMnS.");
}

const initialState = endpointState.toObject() || {
  deleted: 0,
  retainStart: fn.currentDateTime().subtract(xs.duration(retainDuration)),
  remaining: true,
};

const batchSize = (constants.batchSize == null || constants.batchSize == 0)
  ? DEFAULT_BATCH_SIZE
  : constants.batchSize;

const uriOptions = batchSize == null ? [] : [ `limit=${batchSize}` ];
const jobQuery = cts.andQuery([
  cts.collectionQuery(['Job']),
  cts.rangeQuery(cts.jsonPropertyReference('timeEnded', ['type=dateTime']), '<', initialState.retainStart),
  // only want jobs that have finished - there can be very long running jobs
  cts.jsonPropertyValueQuery('jobStatus', [ 'finished', 'failed' ])
]);

const jobIds = cts.values(cts.jsonPropertyReference('jobId'), null, uriOptions, jobQuery).toArray();

const batchUriQuery = cts.andQuery([
  cts.collectionQuery([ 'Batch' ]),
  cts.rangeQuery(cts.jsonPropertyReference('jobId'), '=', jobIds)
]);
const batchUrisToDelete = cts.uris(null, uriOptions, batchUriQuery).toArray();
let urisToDelete;
let remaining;
if(batchUrisToDelete.length > 0) {
  urisToDelete = batchUrisToDelete;
  remaining = true;
} else {
  const remainingJobCount = cts.estimate(jobQuery);
  const jobUriQuery = cts.andQuery([
    cts.collectionQuery([ 'Job' ]),
    cts.rangeQuery(cts.jsonPropertyReference('jobId'), '=', jobIds)
  ]);
  const jobUrisToDelete = cts.uris(null, null, jobUriQuery).toArray();
  urisToDelete = jobUrisToDelete;
  remaining = remainingJobCount > jobUrisToDelete.length;
}

jobs.deleteJobs(urisToDelete);

const deleted = urisToDelete.length;
let res = remaining
  ? { deleted: deleted + initialState.deleted, remaining, retainStart: initialState.retainStart }
  : null;

res;
