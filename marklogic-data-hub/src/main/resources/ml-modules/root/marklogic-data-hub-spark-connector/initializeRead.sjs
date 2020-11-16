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

const op = require('/MarkLogic/optic');
const readLib = require("readLib.sjs");

function buildOriginalPlan(inputs, selectedColumns) {
  if (inputs.serializedPlan) {
    return op.import(inputs.serializedPlan);
  }

  // The qualifier of "" will only work for non-joins; it's intended to provide simple column names for Spark
  let originalPlan = op.fromView(inputs.schema, inputs.view, "");
  if (inputs.sqlcondition) {
    originalPlan = originalPlan.where(op.sqlCondition(inputs.sqlcondition));
  }
  if (selectedColumns) {
    originalPlan = originalPlan.select(selectedColumns);
  }
  return originalPlan;
}


var inputs = fn.head(xdmp.fromJSON(inputs));

const selectedColumns = inputs.selectedcolumns ? inputs.selectedcolumns.split(",") : null;
const originalPlan = buildOriginalPlan(inputs, selectedColumns);

// If there are no matching rows, null will be returned
const parameterizedPlan = readLib.parameterizePlan(originalPlan.export());

// Determine the partitions, only including the ones that have matching rows in them
const partitions = parameterizedPlan != null ?
  readLib.makePartitionsWithRows(parameterizedPlan, inputs.partitioncount) : [];

// If there are no partitions, no reason to build schema fields
let schemaFields = [];
if (partitions.length > 0) {
  const schemaName = readLib.getSchemaName(parameterizedPlan);
  const viewName = readLib.getViewName(parameterizedPlan);
  schemaFields = readLib.buildSchemaFieldsBasedOnTdeColumns(schemaName, viewName, selectedColumns);
}

const response = {
  "schema": {
    "type": "struct",
    "fields": schemaFields
  },
  partitions,
  parameterizedPlan
};

response;
