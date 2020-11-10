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

// This is just for testing purposes

var jobId;
var status;

const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();
const Jobs = require("/data-hub/5/impl/jobs.sjs");

const alwaysUseThisStatus = "stop-on-error";

try{
  Jobs.updateJob(datahub, jobId, alwaysUseThisStatus, null, null, null, null);
}
catch(ex){
  console.log("Failed to update job document; cause: " + ex);
}


