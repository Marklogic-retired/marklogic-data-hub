/**
  Copyright 2012-2019 MarkLogic Corporation

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
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function get(context, params) {
  let jobId = params["jobid"];
  let status = params["status"];
  let flow = params["flow-name"];
  let flowNames = params["flowNames"];
  let latest = params["latest"];

  let resp = null;

  if(fn.exists(jobId) && fn.exists(status)) {
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Invalid request"]));
  }
  else if(fn.exists(jobId)) {
    resp = datahub.jobs.getJobDocWithId(jobId);
  }
  else if(fn.exists(status)) {
    resp = datahub.jobs.getJobDocs(status);
  }
  else if (fn.exists(flowNames)) {
    resp = datahub.jobs.getJobDocsForFlows(flowNames);
  }
  else if (fn.exists(flow)) {
    resp = datahub.jobs.getJobDocsByFlow(flow);
  }
  else if (fn.exists(latest)) {
    resp = datahub.jobs.getLastestJobDocPerFlow();
  }
  else{
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Incorrect options"]));
  }

  return resp;
};


function post(context, params, input) {
  let jobId = params["jobid"];
  let status = params["status"];
  let flow = params["flow-name"];
  let step = params["step"];
  let lastCompleted = params["lastCompleted"];
  let stepResponse = params["stepResponse"];

  let resp = null;
  let jobDoc = datahub.jobs.getJobDocWithId(jobId);
  if(jobDoc) {
    jobDoc.job.jobStatus = status;
    //update job status at the end of flow run
    if(status === "finished"|| status === "finished_with_errors" || status === "failed"|| status === "canceled"|| status === "stop-on-error") {
      jobDoc.job.timeEnded = fn.currentDateTime();
    }
    //update job doc before and after step run
    else {
        jobDoc.job.lastAttemptedStep = step;
        if(lastCompleted) {
          jobDoc.job.lastCompletedStep = lastCompleted;
        }
        if(! jobDoc.job.stepResponses[step]){
          jobDoc.job.stepResponses[step] = {};
          jobDoc.job.stepResponses[step].stepStartTime = fn.currentDateTime();
          jobDoc.job.stepResponses[step].status = "running step " + step;
        }
        else {
          let tempTime = jobDoc.job.stepResponses[step].stepStartTime;
          jobDoc.job.stepResponses[step]  = JSON.parse(stepResponse);
          let stepResp = jobDoc.job.stepResponses[step];
          stepResp.stepStartTime = tempTime;
          stepResp.stepEndTime = fn.currentDateTime();
          let stepDef = fn.head(datahub.hubUtils.queryLatest(function () {
              return datahub.flow.step.getStepByNameAndType(stepResp.stepDefinitionName, stepResp.stepDefinitionType);
            },
            datahub.config.FINALDATABASE
          ));
          let jobsReportFun = datahub.flow.step.makeFunction(datahub.flow, 'jobReport', stepDef.modulePath);
          if (jobsReportFun) {
            let flowStep = fn.head(datahub.hubUtils.queryLatest(function () {
                return datahub.flow.getFlow(stepResp.flowName).steps[step];
              },
              datahub.config.FINALDATABASE
            ));
            let options = Object.assign({}, stepDef.options, flowStep.options);
            let jobReport = fn.head(datahub.hubUtils.queryLatest(function () {
                return jobsReportFun(jobId, stepResp, options);
              },
              options.targetDatabase || datahub.config.FINALDATABASE
            ));
            if (jobReport) {
              datahub.hubUtils.writeDocument(`/jobs/reports/${stepResp.flowName}/${step}/${jobId}.json`, jobReport, datahub.jobs.jobsPermissions, ['Jobs','JobReport'], datahub.config.JOBDATABASE);
            }
          }
        }
    }

    //Update the job doc
    datahub.hubUtils.writeDocument("/jobs/"+ jobId +".json", jobDoc, datahub.jobs.jobsPermissions, ['Jobs','Job'], datahub.config.JOBDATABASE);
    resp = jobDoc;
  }
  else {
    if(fn.exists(jobId) && fn.exists(flow)) {
      datahub.jobs.createJob(flow, jobId);
    }
    else {
      fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Incorrect options"]));
    }
  }
  return resp;
};

function put(context, params, input) {};

function deleteFunction(context, params) {};

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
