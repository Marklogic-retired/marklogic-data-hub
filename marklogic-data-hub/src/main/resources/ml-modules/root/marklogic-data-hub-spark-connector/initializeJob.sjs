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

var externalMetadata = externalMetadata != null ? fn.head(xdmp.fromJSON(externalMetadata)) : {};

const config = require("/com.marklogic.hub/config.sjs");

const id = sem.uuidString();

//Adding this function to make it compatible with Datahub 5.2.x as this function doesn't exist <5.3.X.
function buildJobPermissions(config) {
  let permissionsString = config.JOBPERMISSIONS;
  let permissions = xdmp.defaultPermissions().concat([xdmp.permission(config.FLOWDEVELOPERROLE, 'update'), xdmp.permission(config.FLOWOPERATORROLE, 'update')]);
  if (permissionsString != null && permissionsString.indexOf("mlJobPermissions") < 0) {
    let tokens = permissionsString.split(",");
    for (let i = 0; i < tokens.length; i += 2) {
      permissions.push(xdmp.permission(tokens[i], tokens[i + 1]));
    }
  }
  return permissions;
}

xdmp.documentInsert(
  "/jobs/" + id + ".json",
  {
    job: {
      jobId: id,
      user: xdmp.getCurrentUser(),
      jobStatus: "started",
      timeStarted: fn.currentDateTime(),
      externalMetadata
    }
  },
  buildJobPermissions(config),
  ['Jobs', 'Job']
);

id;
