'use strict';

const op = require('/MarkLogic/optic');
const partitionLib = require('/marklogic-data-hub-spark-connector/partition-lib.xqy');

var endpointState = fn.head(xdmp.fromJSON(endpointState));
var endpointConstants = fn.head(xdmp.fromJSON(endpointConstants));

const results = [endpointState];

const partitionNumber = endpointConstants.partitionNumber;
const partition = endpointConstants.initializationResponse.partitions[partitionNumber];

if (endpointState.batchNumber <= partition.batchCount) {
  // Determine the min/max rowID of the current batch number
  const batch = partitionLib.getPartitionBatch(partition, endpointState.batchNumber);

  // Run the parameterized plan, constraining it to the min and max row ID of the current batch
  op.import(endpointConstants.initializationResponse.parameterizedPlan)
    .result(null, {
      "MIN_ROW_ID": batch.min,
      "MAX_ROW_ID": batch.max
    })
    .toArray()
    .forEach(row => results.push(row));

  endpointState.batchNumber = endpointState.batchNumber + 1;
}

Sequence.from(results);
