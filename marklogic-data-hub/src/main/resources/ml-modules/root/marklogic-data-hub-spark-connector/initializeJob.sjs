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

declareUpdate();

// No privilege required: This endpoint is called by the spark connector.

var sparkMetadata = sparkMetadata != null ? fn.head(xdmp.fromJSON(sparkMetadata)) : {};

const config = require("/com.marklogic.hub/config.sjs");
const Jobs = require("/data-hub/5/impl/jobs.sjs");
const jobs = new Jobs.Jobs(config);

const id = sem.uuidString();

xdmp.documentInsert(
  "/jobs/" + id + ".json",
  {
    job: {
      jobId: id,
      user: xdmp.getCurrentUser(),
      jobStatus: "started",
      timeStarted: fn.currentDateTime(),
      sparkMetadata
    }
  },
  jobs.buildJobPermissions(config),
  ['Jobs', 'Job']
);

id;
