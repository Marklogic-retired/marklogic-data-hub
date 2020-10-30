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

/**
 * Queries the internal sys/sys_columns table to get information about each of the columns in the given view/schema.
 *
 * @param view required TDE view name
 * @param schema optional TDE schema name
 * @returns a JSON object for each column in a format that Spark understands as mapping to a StructField
 */
function buildSchemaFieldsBasedOnTdeColumns(view, schema) {
  let columnsSqlCondition = "table = '" + view + "'";
  if (schema) {
    columnsSqlCondition += " and schema = '" + schema + "'";
  }

  return op.fromView("sys", "sys_columns")
    .where(op.sqlCondition(columnsSqlCondition))
    .result()
    .toArray()
    .map(column => {
      const field = {
        name: column["sys.sys_columns.name"],
        type: column["sys.sys_columns.type"],
        nullable: column["sys.sys_columns.notnull"] == 0 ? true : false,
        metadata: {}
      };
      return field;
    });
}

const op = require('/MarkLogic/optic');
const partitionLib = require('partition-lib.xqy');

var inputs = fn.head(xdmp.fromJSON(inputs));

const schemaFields = buildSchemaFieldsBasedOnTdeColumns(inputs.view, inputs.schema);

const partitions = partitionLib.buildPartitions(inputs.view, inputs.schema, inputs.sqlCondition, inputs.partitionCount);

const response = {
  "schema": {
    "type": "struct",
    "fields": schemaFields
  },
  partitions
};

response;
