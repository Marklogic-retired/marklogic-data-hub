'use strict';

const op = require('/MarkLogic/optic');
const partitionLib = require('/marklogic-data-hub-spark-connector/partition-lib.xqy');

var endpointState = fn.head(xdmp.fromJSON(endpointState));
var endpointConstants = fn.head(xdmp.fromJSON(endpointConstants));

const results = [endpointState];

if (endpointState.batchNumber <= endpointConstants.partition.batchCount) {
  const batch = partitionLib.getPartitionBatch(endpointConstants.partition, endpointState.batchNumber);

  const rowMin = endpointConstants.partition.viewID + ":" + batch.min;
  const rowMax = endpointConstants.partition.viewID + ":" + batch.max;

  // This will work for non-joins
  const qualifier = "";

  // Note that rowID will not be part of the results; it needs to be selected though so the where clause can constrain on it
  const selectColumns = ["rowID"];
  endpointConstants.sparkSchema.fields.forEach(field => {
    selectColumns.push(field.name);
  });

  let accessPlan = op.fromView(endpointConstants.schema, endpointConstants.view, qualifier)
    .select(selectColumns)
    .where(op.and(
      op.ge(op.col("rowID"), op.sql.rowID(rowMin)),
      op.le(op.col("rowID"), op.sql.rowID(rowMax))
    ));

  if (endpointConstants.sqlCondition) {
    accessPlan = accessPlan.where(op.sqlCondition(endpointConstants.sqlCondition));
  }

  const rows = accessPlan.result().toArray();
  rows.forEach(row => results.push(row));
  endpointState.batchNumber = endpointState.batchNumber + 1;
}

Sequence.from(results);
