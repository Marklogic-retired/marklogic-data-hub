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
const config = require("/com.marklogic.hub/config.sjs");

function findStepResponses(query) {
  const start = query.start;
  const pageLength = query.pageLength;
  const sortColumn = query.sortOrder && query.sortOrder.length ? query.sortOrder[0].propertyName : undefined;
  const sortDirection = query.sortOrder && query.sortOrder.length ? query.sortOrder[0].sortDirection : undefined;
  const selectedFacets = query.facets;
  const response = {};
  const orderByConstraint = [];

  if(sortColumn) {
    orderByConstraint.push(sortDirection === 'ascending' ? op.asc(sortColumn) : op.desc(sortColumn));
  }

  if(sortColumn !== 'startTime') {
    orderByConstraint.push(op.desc('startTime'));
  }

  const whereClause = buildWhereClause(selectedFacets);
  const totalCountQuery = 'select count(*) as total from Job.StepResponse ' + whereClause;
  const jobsDataQuery = 'select Job.StepResponse.stepName as stepName,' +
      'Job.StepResponse.stepDefinitionType as stepDefinitionType,' +
      'Job.StepResponse.jobStatus as jobStatus,' +
      'Job.StepResponse.entityName as entityName,' +
      'Job.StepResponse.stepStartTime as startTime,' +
      'Job.StepResponse.stepEndTime - Job.StepResponse.stepStartTime as duration,' +
      'Job.StepResponse.successfulItemCount as successfulItemCount,' +
      'Job.StepResponse.failedItemCount as failedItemCount,' +
      'Job.StepResponse.user as user,' +
      'Job.StepResponse.jobId as jobId,' +
      'Job.StepResponse.flowName as flowName' +
      ' from Job.StepResponse ' + whereClause;

  const totalCount = op.fromSQL(totalCountQuery).result().toObject();
  const jobsDataResults = op.fromSQL(jobsDataQuery).orderBy(orderByConstraint).offset(pageLength * (start-1)).limit(pageLength).result();

  response["total"] = totalCount[0]["total"];
  response["start"] = start;
  response["pageLength"] = pageLength;
  response["results"] = jobsDataResults.toObject();
  response["facets"] = computeFacets(whereClause);

  return response;
}

function buildWhereClause(selectedFacets) {
  if(!selectedFacets || !Object.keys(selectedFacets).length) {
    return "";
  }

  let whereClause = "WHERE";
  Object.keys(selectedFacets).forEach((facetType, index, keys) => {
    if(facetType === 'startTime') {
      const betweenCondition = selectedFacets[facetType].map(element => "'".concat(element.replace(/'/g, "''")).concat("'"));
      whereClause = whereClause + " " + "Job.StepResponse.stepStartTime" + " BETWEEN " + betweenCondition[0] + "AND " + betweenCondition[1];
    } else {
      const inCondition = selectedFacets[facetType].map(element => "'".concat(element.replace(/'/g, "''")).concat("'")).join();
      whereClause = whereClause + " " + "Job.StepResponse.".concat(facetType) + " IN (" + inCondition + ")";
    }

    if(index < keys.length-1) {
      whereClause = whereClause.concat(" ").concat("AND");
    }
  });
  return whereClause;
}

function computeFacets(whereClause) {
  const queries = buildFacetQueries(whereClause);
  const facets = {};

  Object.keys(queries).forEach(column => {
    const query = queries[column];
    const results = xdmp.sql(query, ["map", "optimize=0"]).toObject();
    facets[column] = results.map(result => result[column]);
  });
  return facets;
}

function buildFacetQueries(whereClause) {
  const tableName = "Job.StepResponse";
  const facetableColumns = ["Job.StepResponse.stepDefinitionType", "Job.StepResponse.jobStatus", "Job.StepResponse.entityName",
    "Job.StepResponse.stepName", "Job.StepResponse.flowName"];
  const queries = {};

  facetableColumns.forEach(column => {
    const simplifiedColumnName = column.split(".").pop();
    const selectStatement = "SELECT DISTINCT(" + column + ") AS " + simplifiedColumnName + " from " + tableName;
    const limitClause = "LIMIT 25";
    queries[simplifiedColumnName] = selectStatement.concat(" ").concat(whereClause).concat(" ").concat(limitClause);
  });
  return queries;
}

function installJobTemplates() {
  const stepResponseTemplate = {
    "template": {
      "description": "Defines a row for each step response in a Job document",
      "context": "/job/stepResponses/*",
      "collections": [
        "Job"
      ],
      "rows": [
        {
          "schemaName": "Job",
          "viewName": "StepResponse",
          "columns": [
            {
              "name": "jobId",
              "scalarType": "string",
              "val": "../../jobId/string()",
              "nullable":false
            },
            {
              "name": "user",
              "scalarType": "string",
              "val": "../../user/string()",
              "nullable":true
            },
            {
              "name": "flowName",
              "scalarType": "string",
              "val": "../../flow/string()",
              "nullable":true
            },
            {
              "name": "stepName",
              "scalarType": "string",
              "val": "./stepName/string()",
              "nullable":true
            },
            {
              "name": "stepDefinitionType",
              "scalarType": "string",
              "val": "./stepDefinitionType/string()",
              "nullable":true
            },
            {
              "name": "jobStatus",
              "scalarType": "string",
              "val": "../../jobStatus/string()",
              "nullable":true
            },
            {
              "name": "entityName",
              "scalarType": "string",
              "val": "./tokenize(targetEntityType/string(),'/')[last()]",
              "nullable": true
            },
            {
              "name": "stepStatus",
              "scalarType": "string",
              "val": "./status/string()",
              "nullable":true
            },
            {
              "name": "stepStartTime",
              "scalarType": "dateTime",
              "val": "./stepStartTime",
              "nullable":true
            },
            {
              "name": "stepEndTime",
              "scalarType": "dateTime",
              "val": "./stepEndTime",
              "nullable":true
            },
            {
              "name": "failedItemCount",
              "scalarType": "int",
              "val": "./failedEvents",
              "nullable":true
            },
            {
              "name": "successfulItemCount",
              "scalarType": "int",
              "val": "./successfulEvents",
              "nullable":true
            }
          ]
        }
      ]
    }
  };

  const templateUri = '/hub-template/StepResponse.json';
  const permissions = [
    xdmp.permission('data-hub-job-monitor', 'read'),
    xdmp.permission('data-hub-developer', 'update'),
    xdmp.permission('data-hub-common', 'read')
  ];
  const collections = ["hub-template", "http://marklogic.com/xdmp/tde"];

  insertDocument(templateUri, stepResponseTemplate, permissions, collections, config.STAGINGSCHEMASDATABASE);
  insertDocument(templateUri, stepResponseTemplate, permissions, collections, config.FINALSCHEMASDATABASE);

}

function insertDocument(uri, content, permissions, collections, targetDatabase) {
  xdmp.invokeFunction(
      function() {
        declareUpdate();
        xdmp.documentInsert(uri, content, {
              permissions: permissions,
              collections: collections
            }
        )
      },
      {database: xdmp.database(targetDatabase)}
  )
}

module.exports = {
  findStepResponses,
  installJobTemplates
};
