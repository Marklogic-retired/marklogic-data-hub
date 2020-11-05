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

var inputs = fn.head(xdmp.fromJSON(inputs));

const viewName = inputs.view;
const schemaName = inputs.schema;

// Use an empty qualifier to ensure "simple" names without view/schema in them are returned
// Will likely need to modify once joins are supported
let originalPlan = op.fromView(schemaName, viewName, "");
if (inputs.sqlCondition) {
  originalPlan = originalPlan.where(op.sqlCondition(inputs.sqlCondition));
}

// If there are no matching rows, null will be returned
const parameterizedPlan = readLib.parameterizePlan(originalPlan.export());

// Determine the partitions, only including the ones that have matching rows in them
const partitions = parameterizedPlan != null ?
  readLib.makePartitionsWithRows(parameterizedPlan, inputs.partitionCount) : [];

// If there are no partitions, no reason to build schema fields
const schemaFields = partitions.length > 0 ?
  readLib.buildSchemaFieldsBasedOnTdeColumns(schemaName, viewName) : [];

const response = {
  "schema": {
    "type": "struct",
    "fields": schemaFields
  },
  partitions,
  parameterizedPlan
};

response;
