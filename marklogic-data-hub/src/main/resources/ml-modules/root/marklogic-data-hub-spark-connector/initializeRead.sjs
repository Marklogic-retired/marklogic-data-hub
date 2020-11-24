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

/**
 * Build an Optic plan based on the user's inputs.
 * 
 * @param inputs
 * @returns {*|void|string}
 */
function buildPlanBasedOnUserInputs(inputs) {
  if (inputs.serializedPlan) {
    return op.import(inputs.serializedPlan);
  }

  // The qualifier of "" will only work for non-joins; it's intended to provide simple column names for Spark
  let thePlan = op.fromView(inputs.schema, inputs.view, "");
  if (inputs.sqlcondition) {
    thePlan = thePlan.where(op.sqlCondition(inputs.sqlcondition));
  }

  const selectedColumns = getSelectedColumnsFromUserInputs(inputs);
  if (selectedColumns) {
    thePlan = thePlan.select(selectedColumns);
  }

  return thePlan;
}

function getSelectedColumnsFromUserInputs(inputs) {
  return inputs.selectedcolumns ? inputs.selectedcolumns.split(",") : null;
}

/**
 * If sparkschema is not provided by the user, then a schema is dynamically generated based on the parameterized
 * plan and any columns selected by the user.
 *
 * @param inputs
 * @param parameterizedPlan
 * @param partitions
 * @returns {{type: string, fields: (*|*[])}|undefined}
 */
function buildSparkSchema(inputs, parameterizedPlan, partitions) {
  if (inputs.sparkschema) {
    return readCustomSparkSchemaAsJson(inputs);
  }
  let fields = [];
  const someMatchingRowsExist = partitions.length > 0;
  if (someMatchingRowsExist) {
    fields = buildSchemaFieldsFromParameterizedPlan(parameterizedPlan, getSelectedColumnsFromUserInputs(inputs));
  }
  return {"type": "struct", fields};
}

/**
 * Builds the array of Spark schema fields based on the parameterized plan and the optional array of selected columns.
 *
 * @param parameterizedPlan
 * @param selectedColumns
 * @returns {*}
 */
function buildSchemaFieldsFromParameterizedPlan(parameterizedPlan, selectedColumns) {
  const schemaName = readLib.getSchemaName(parameterizedPlan);
  const viewName = readLib.getViewName(parameterizedPlan);
  return readLib.buildSchemaFieldsBasedOnTdeColumns(schemaName, viewName, selectedColumns);
}

/**
 * If user provides a custom Spark schema as a string, throw a nice error if it's not valid JSON.
 *
 * @param inputs
 * @returns {*|this|this}
 */
function readCustomSparkSchemaAsJson(inputs) {
  try {
    return fn.head(xdmp.fromJsonString(inputs.sparkschema));
  } catch (e) {
    // Can't use http-utils.sjs as we want to support 5.2.x
    fn.error(null, 'RESTAPI-SRVEXERR', Sequence.from([400, "Unable to read 'sparkschema' input as JSON; cause: " + e.message]));
  }
}


var inputs = fn.head(xdmp.fromJSON(inputs));

// Based on the user inputs, build an Optic plan
const originalPlan = buildPlanBasedOnUserInputs(inputs);

// Now parameterize the plan so it can be used to query for maching rows in partitions.
// Null may be returned here, which means there are no matching rows.
const parameterizedPlan = readLib.parameterizePlan(originalPlan.export());

// Determine the partitions, only including the ones that have matching rows in them
const partitions = parameterizedPlan != null ? readLib.makePartitionsWithRows(parameterizedPlan, inputs.numpartitions) : [];

const sparkSchema = buildSparkSchema(inputs, parameterizedPlan, partitions);

const response = {
  sparkSchema,
  partitions,
  parameterizedPlan
};

response;
