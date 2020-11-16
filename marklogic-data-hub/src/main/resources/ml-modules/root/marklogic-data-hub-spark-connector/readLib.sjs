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

const partitionLib = require('partition-lib.xqy');

/**
 * Parameterize the given plan with a where clause that constrains on a min and max rowID. If no rows are found that
 * match the given plan, then null is returned.
 *
 * By parameterizing the plan, it can then be used by the partition reader endpoint to constrain on a set of row IDs
 * without knowing anything about the actual query in the plan. It just needs to set the min and max rowID params for
 * each batch within its given partition.
 *
 * @param originalPlan
 * @returns {{$optic: {args: (*|*[]), ns: *, fn: *}}|null}
 */
function parameterizePlan(originalPlan) {
  const schemaName = getSchemaName(originalPlan);
  const viewName = getViewName(originalPlan);
  const tableId = findTableId(schemaName, viewName);

  if (tableId == null) {
    return null;
  }

  return makeParameterizedPlan(originalPlan, tableId);
}

/**
 * Given a tableId, parameterizes the original plan by adding a where clause that constrains on a min and max rowID.
 *
 * @param originalPlan
 * @param tableId
 * @returns {{$optic: {args: (*|*[]), ns: *, fn: *}}}
 */
function makeParameterizedPlan(originalPlan, tableId) {
  // Construct a new plan with the "from" operator and the rowID where clause
  const updatedPlan = {
    "$optic": makeArg("op", "operators", [
      getFromOperator(originalPlan),
      makeArg("op", "where",
        makeArg("op", "and", [
          makeRowIdComparator(tableId, "ge", "MIN"),
          makeRowIdComparator(tableId, "le", "MAX")
        ])
      )
    ])
  };

  // Add all of the original plan's other arguments to the updated plan
  originalPlan["$optic"].args.slice(1).forEach(arg => {
    updatedPlan["$optic"].args.push(arg);
  });

  return updatedPlan;
}

/**
 * The "from" operator is assumed to always be the first arg in a plan.
 *
 * @param thePlan
 * @returns {string | RemoteObject}
 */
function getFromOperator(thePlan) {
  return thePlan["$optic"].args[0];
}

/**
 * Convenience function for getting the name of a schema from a plan. Since the schema is optional, this may return
 * null.
 *
 * @param thePlan
 * @returns {string | RemoteObject}
 */
function getSchemaName(thePlan) {
  return getFromOperator(thePlan).args[0];
}

/**
 * Convenience function for getting the name of a view from a plan.
 *
 * @param thePlan
 * @returns {string | RemoteObject}
 */
function getViewName(thePlan) {
  return getFromOperator(thePlan).args[1];
}

/**
 * Returns the tableId (sometimes called "view ID") associated with the given schema and view.
 *
 * @param schema optional
 * @param view required
 * @returns {*|string|null}
 */
function findTableId(schema, view) {
  const result = fn.head(op.fromView(schema, view).limit(1)
    .select(op.as("tableId", op.fn.string(op.col("rowID"))))
    .result());
  return result ? result.tableId.split(":")[0] : null;
}

/**
 * Convenience function for constructing an argument in a serialized JSON plan.
 *
 * @param ns
 * @param fn
 * @param args
 * @returns {{args: (*|*[]), ns: *, fn: *}}
 */
function makeArg(ns, fn, args) {
  args = Array.isArray(args) ? args : [args];
  return {ns, fn, args};
}

/**
 * Convenience function for building a "le" or "ge" clause on rowID.
 *
 * @param tableId
 * @param comparator "le" or "ge"
 * @param paramPrefix "MIN" or "MAX"
 * @returns {{args: (*|*[]), ns: *, fn: *}}
 */
function makeRowIdComparator(tableId, comparator, paramPrefix) {
  return makeArg("op", comparator, [
    makeArg("op", "col", makeArg("xs", "string", "rowID")),
    makeArg("sql", "rowID", [
      makeArg("fn", "concat", [
        makeArg("xs", "string", tableId + ":"),
        makeArg("op", "param", makeArg("xs", "string", paramPrefix + "_ROW_ID"))
      ])
    ])
  ]);
}

/**
 * Queries the internal sys/sys_columns table to get information about each of the columns in the given view/schema.
 *
 * @param schemaName optional TDE schema name
 * @param viewName required TDE view name
 * @param selectedColumns optional array of selected columns (null array means all columns)
 * @returns a JSON object for each column in a format that Spark understands as mapping to a StructField
 */
function buildSchemaFieldsBasedOnTdeColumns(schemaName, viewName, selectedColumns) {
  let columnsSqlCondition = "table = '" + viewName + "'";
  if (schemaName) {
    columnsSqlCondition += " and schema = '" + schemaName + "'";
  }

  const schemaFields = [];

  op.fromView("sys", "sys_columns")
    .where(op.sqlCondition(columnsSqlCondition))
    .result().toArray().forEach(column => {
    const columnName = column["sys.sys_columns.name"];
    if (selectedColumns == null || selectedColumns.includes(columnName)) {
      schemaFields.push({
        name: columnName,
        type: column["sys.sys_columns.type"],
        nullable: column["sys.sys_columns.notnull"] == 0 ? true : false,
        metadata: {}
      });
    }
  });

  return schemaFields;
}

/**
 * For the given plan, first divide it up into partitions based on the partitionCount (this uses the XQuery library to
 * handle unsignedLong math). Then for each partition, use the parameterizedPlan to determine if there are any matching
 * rows within the row ID boundaries for the partition. If so, return it with the rowCount added to the partition. If
 * not, discard it.
 *
 * @param parameterizedPlan
 * @param partitionCount
 * @returns {[]}
 */
function makePartitionsWithRows(parameterizedPlan, partitionCount) {
  const groupByPlan = op.import(parameterizedPlan).groupBy(null, op.count("rowCount"));

  // Will make this configurable soon. Assuming 10k rows in a batch is reasonable for now, knowing that Optic
  // can often retrieve far larger amounts in less than a second.
  // The purpose of batchSize is to give the user another mechanism for controlling how many rows are returned on
  // average by a call to the readRows endpoint. For example, if a partition has 100m matching rows in it, it is likely
  // not desirable to return all of those in a single call to readRows. The batchSize is then used to split the partition
  // up into N batches, such that instead of 100m rows, each call may return on average a more acceptable number of rows
  // from a performane perspective.
  const batchSize = 10000;

  // Determine which partitions contain rows
  const partitions = [];
  partitionLib.makePartitions(partitionCount).forEach(partition => {
    const rowCount = getRowCountForPartition(groupByPlan, partition);
    if (rowCount > 0) {
      partition.rowCount = rowCount;
      partitionLib.addBatchInfoToPartition(partition, batchSize);
      partitions.push(partition);
    }
  });

  return partitions;
}

function getRowCountForPartition(groupByPlan, partition) {
  try {
    return fn.head(groupByPlan.result(null, {
      "MIN_ROW_ID": partition.min,
      "MAX_ROW_ID": partition.max
    })).rowCount;
  } catch (e) {
    // Can't use ds-util, as we want to support DHF 5.2.x
    fn.error(null, 'RESTAPI-SRVEXERR', Sequence.from([400,
      "Unable to get row count for partition, which may be due to invalid user input; cause: " + e.message]));
  }
}

module.exports = {
  buildSchemaFieldsBasedOnTdeColumns,
  getSchemaName,
  getViewName,
  makePartitionsWithRows,
  parameterizePlan
}
