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

const op = require('/MarkLogic/optic');
const partitionLib = require('/marklogic-data-hub-spark-connector/partition-lib.xqy');

var endpointState = fn.head(xdmp.fromJSON(endpointState));
var endpointConstants = fn.head(xdmp.fromJSON(endpointConstants));

const results = [endpointState];

const partitionNumber = endpointConstants.partitionNumber;
const partition = endpointConstants.initializationResponse.partitions[partitionNumber];
const optimizationlevel = endpointConstants.optimizationlevel;

if (endpointState.batchNumber <= partition.batchCount) {
  // Determine the min/max rowID of the current batch number
  const batch = partitionLib.getPartitionBatch(partition, endpointState.batchNumber);

  // Run the parameterized plan, constraining it to the min and max row ID of the current batch
  const thePlan = op.import(endpointConstants.initializationResponse.parameterizedPlan);
  if(optimizationlevel >= 0) {
    thePlan.prepare(optimizationlevel);
  }
    thePlan.result(null, {
        "MIN_ROW_ID": batch.min,
        "MAX_ROW_ID": batch.max
      })
      .toArray()
      .forEach(row => results.push(row));

  endpointState.batchNumber = endpointState.batchNumber + 1;
}

Sequence.from(results);
