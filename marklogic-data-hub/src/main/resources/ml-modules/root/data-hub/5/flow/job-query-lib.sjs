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
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
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

function sanitizeSqlValue(value) {
  return "'".concat(value.replace(/'/g, "''")).concat("'");
}

function buildDateTimeSqlCondition(fieldName, beginTime, endTime) {
  const fullFieldName = "Job.StepResponse.".concat(fieldName);
  if (beginTime && endTime) {
    const betweenConditionParts = [beginTime, endTime].map(element => sanitizeSqlValue(element));
    return fullFieldName + " BETWEEN " + betweenConditionParts[0] + "AND " + betweenConditionParts[1];
  } else if (beginTime || endTime) {
    const condition = beginTime ? " >= " : " <= ";
    const sanitizedValue = sanitizeSqlValue(beginTime || endTime);
    return fullFieldName + condition + sanitizedValue;
  }
}

function buildWhereClause(selectedFacets) {
  if(!selectedFacets || !Object.keys(selectedFacets).length) {
    return "";
  }

  let whereClause = "WHERE";
  Object.keys(selectedFacets).forEach((facetType, index, keys) => {
    if (facetType === 'startTime') {
      const beginTime = selectedFacets[facetType][0];
      const endTime = selectedFacets[facetType][1];
      const dateTimeCondition = buildDateTimeSqlCondition('stepStartTime', beginTime, endTime);
      if (dateTimeCondition) {
        whereClause = whereClause + " " + dateTimeCondition;
      }
    } else {
      const inCondition = selectedFacets[facetType].map(element => sanitizeSqlValue(element)).join();
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
    let results = xdmp.sql(query, ["map", "optimize=0"]).toObject();
    results = results.map(result => {
      return {
        "name": result[column] ? result[column] : undefined,
        "value": result[column] ? result[column] : undefined
      }
    });
    facets[column] = {
      "type": "xs:string",
      "facetValues": results
    };
  });
  return facets;
}

function buildFacetQueries(whereClause) {
  const tableName = "Job.StepResponse";
  const facetableColumns = ["Job.StepResponse.stepDefinitionType", "Job.StepResponse.jobStatus",
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

function getMatchingPropertyValues(facetValuesSearchQuery) {
  const facetName = facetValuesSearchQuery.facetName;
  const searchTerm = facetValuesSearchQuery.searchTerm;
  const limit = facetValuesSearchQuery.limit ? facetValuesSearchQuery.limit : 10 ;
  let updatedSearchTerm = searchTerm.replace(/%/g, "|%").concat('%');
  updatedSearchTerm = sanitizeSqlValue(updatedSearchTerm);
  let matchingPropertiesQuery = 'select DISTINCT(Job.StepResponse.' + facetName + ') AS ' + facetName +
      ' FROM Job.StepResponse WHERE ' + 'Job.StepResponse.' + facetName + ' like ' + updatedSearchTerm + ' LIMIT ' + limit;
  let results = xdmp.sql(matchingPropertiesQuery, ["map", "optimize=0"]).toObject();
  const deficit = limit - results.length;
  if(deficit) {
    updatedSearchTerm = '_%'.concat(searchTerm.replace(/%/g, "|%")).concat('%');
    updatedSearchTerm = sanitizeSqlValue(updatedSearchTerm);
    matchingPropertiesQuery = 'select DISTINCT(Job.StepResponse.' + facetName + ') AS ' + facetName +
        ' FROM Job.StepResponse WHERE ' + 'Job.StepResponse.' + facetName + ' like ' + updatedSearchTerm + ' LIMIT ' + limit;
    results = results.concat(xdmp.sql(matchingPropertiesQuery, ["map", "optimize=0"]).toObject());
  }
  return results.map(result => result[facetName]);
}

function valuesExist(values) {
  return (values && values.length !== 0);
}

function buildJobDocumentQuery({jobId, jobStatus, flowName, stepName, stepDefinitionType, startTimeBegin, startTimeEnd, endTimeBegin, endTimeEnd, user}) {
  const queries = [cts.collectionQuery('Job')];
  // TODO investigate more scalable cts queries using the triple index
  if (valuesExist(jobId)) {
    queries.push(cts.jsonPropertyValueQuery('jobId', jobId));
  }
  if (valuesExist(jobStatus)) {
    queries.push(cts.jsonPropertyValueQuery('jobStatus', jobStatus));
  }
  if (valuesExist(flowName)) {
    queries.push(cts.jsonPropertyValueQuery('flow', flowName));
  }
  if (valuesExist(stepName)) {
    queries.push(cts.jsonPropertyValueQuery('stepName', stepName));
  }
  if (valuesExist(stepDefinitionType)) {
    queries.push(cts.jsonPropertyValueQuery('stepDefinitionType', stepDefinitionType));
  }
  if (valuesExist(startTimeBegin)) {
    queries.push(cts.rangeQuery(cts.elementReference(xs.QName("timeStarted"), ["type=dateTime"]), '>=', xs.dateTime(startTimeBegin)));
  }
  if (valuesExist(startTimeEnd)) {
    queries.push(cts.rangeQuery(cts.elementReference(xs.QName("timeStarted"), ["type=dateTime"]), '<=', xs.dateTime(startTimeEnd)));
  }
  if (valuesExist(endTimeBegin)) {
    queries.push(cts.rangeQuery(cts.elementReference(xs.QName("timeEnded"), ["type=dateTime"]), '>=', xs.dateTime(endTimeBegin)));
  }
  if (valuesExist(endTimeEnd)) {
    queries.push(cts.rangeQuery(cts.elementReference(xs.QName("timeEnded"), ["type=dateTime"]), '<=', xs.dateTime(endTimeEnd)));
  }
  if (valuesExist(user)) {
    queries.push(cts.jsonPropertyValueQuery('user', user));
  }
  return cts.andQuery(queries);
}

function findJobs(parameters) {
  const finalQuery = buildJobDocumentQuery(parameters);
  const total = cts.estimate(finalQuery);
  const {start = 1, pageLength = 100} = parameters;
  // Use fragment plan to ensure we are a paginating on job document rather than step response row
  const fragmentPlan = op.fromView('Job','StepResponse', 'fragmentIds', op.fragmentIdCol('fragmentId1'))
      .groupBy(op.fragmentIdCol('fragmentId1'), [op.min('firstStartTime',op.col('stepStartTime')),op.max('lastEndTime',op.col('stepEndTime'))])
      .where(finalQuery)
      .orderBy([op.desc('firstStartTime')])
      .offset(pageLength * (start-1)).limit(pageLength);
  const stepResponses = op.fromView('Job','StepResponse', 'stepResponses', op.fragmentIdCol('fragmentId2'));
  // Join stepResponses plan to fragmentPlan and construct JSON Objects
  const jsonPlan = fragmentPlan.joinInner(stepResponses,op.on(op.fragmentIdCol('fragmentId1'),op.fragmentIdCol('fragmentId2')))
      .select([op.fragmentIdCol('fragmentId1'),op.col('firstStartTime'),
        op.as('job',
          op.jsonObject([
            op.prop('jobId', op.jsonString(op.col('jobId'))),
            op.prop('jobStatus', op.jsonString(op.col('jobStatus'))),
            op.prop('user', op.jsonString(op.col('user'))),
            op.prop('flowName', op.jsonString(op.col('flowName'))),
            op.prop('startTime', op.jsonString(op.col('firstStartTime'))),
            op.prop('endTime', op.jsonString(op.col('lastEndTime'))),
            op.prop('stepResponses', op.jsonArray([op.jsonObject([
              op.prop('stepName', op.jsonString(op.col('stepName'))),
              op.prop('stepDefinitionType', op.jsonString(op.col('stepDefinitionType'))),
              op.prop('stepStatus', op.jsonString(op.col('stepStatus'))),
              op.prop('stepStartTime', op.jsonString(op.col('stepStartTime'))),
              op.prop('stepEndTime', op.jsonString(op.col('stepEndTime'))),
              op.prop('failedItemCount', op.jsonNumber(op.col('failedItemCount'))),
              op.prop('successfulItemCount', op.jsonNumber(op.col('successfulItemCount')))
            ])]))
          ])
      )])
      .orderBy([op.desc('firstStartTime'), op.fragmentIdCol('fragmentId1')])
      // Consolidate JSON Objects that are for the same JobId
      .reduce((previous, result) => {
        const job = result.job.toObject();
        if (Array.isArray(previous)) {
          const lastJob = previous[previous.length - 1];
          if (lastJob.jobId === job.jobId) {
            lastJob.stepResponses.push(job.stepResponses[0]);
          } else {
            previous.push(job);
          }
          return previous;
        }
        return [job];
      });
  return {
    total,
    start,
    pageLength,
    // normalizing to array so even a single result return as an array
    results: hubUtils.normalizeToArray(jsonPlan.result())
  };
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
  findJobs,
  findStepResponses,
  getMatchingPropertyValues,
  installJobTemplates
};
