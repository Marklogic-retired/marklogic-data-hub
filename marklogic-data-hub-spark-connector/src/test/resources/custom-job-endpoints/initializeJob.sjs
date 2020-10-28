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

// This is just for testing purposes

var externalMetadata = externalMetadata != null ? fn.head(xdmp.fromJSON(externalMetadata)) : {};

const id = "customId";

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
  [xdmp.permission("data-hub-operator", "read"), xdmp.permission("data-hub-operator", "update")],
  ['Jobs', 'Job']
);

id;
