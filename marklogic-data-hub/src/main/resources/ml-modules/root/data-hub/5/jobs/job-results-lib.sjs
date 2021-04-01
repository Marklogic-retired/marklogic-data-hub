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

function getJobData(start, pageLength, sortColumn, sortDirection) {
  let orderByConstraint = op.desc('startTime');
  if(sortColumn) {
    orderByConstraint = sortDirection === 'ascending' ? op.asc(sortColumn) : op.desc(sortColumn);
  }

  const response = {};
  const totalCountQuery = 'select count(*) as total from Job.jobMonitor';
  const jobsDataQuery = 'select Job.jobMonitor.stepName as stepName,' +
      'Job.jobMonitor.stepType as stepType,' +
      'Job.jobMonitor.stepStatus as status,' +
      'Job.jobMonitor.targetEntityType as entityName,' +
      'Job.jobMonitor.stepStartTime as startTime,' +
      'Job.jobMonitor.stepEndTime - Job.jobMonitor.stepStartTime as duration,' +
      'Job.jobMonitor.successfulEvents as successfulEvents,' +
      'Job.jobMonitor.failedEvents as failedEvents,' +
      'Job.jobMonitor.userId as userId,' +
      'Job.jobMonitor.jobId as jobId,' +
      'Job.jobMonitor.flowName as flowName' +
      ' from Job.jobMonitor';

  const totalCount = op.fromSQL(totalCountQuery).result().toObject();
  const jobsDataResults = op.fromSQL(jobsDataQuery).orderBy(orderByConstraint).offset(pageLength * (start-1)).limit(pageLength).result();

  response["total"] = totalCount[0]["total"];
  response["start"] = start;
  response["pageLength"] = pageLength;
  response["results"] = jobsDataResults.toObject();

  return response;
}

module.exports = {
  getJobData
};
