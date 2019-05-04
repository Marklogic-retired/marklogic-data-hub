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

module.exports = {
  XQUERY: "xqy",
  JAVASCRIPT: "sjs",
  XML: "xml",
  JSON: "json",
  BINARY: "binary",
  TEXT: 'text',
  DEFAULT_FORMAT: "json",

  //predefined functions, may want to break this out soon
  CURRENT_DATE_TIME: "currentDateTime",
  CURRENT_USER: "currentUser",

  //predefined metadata may want to break this out soon
  CREATED_ON: "datahubCreatedOn",
  CREATED_BY: "datahubCreatedBy",

  CREATED_IN_FLOW: "datahubCreatedInFlow",
  CREATED_BY_STEP: "datahubCreatedByStep",

  CREATED_BY_JOB: "datahubCreatedByJob",

  PROPERTY_KEY_MAP: new Map([
    ["currentDateTime", "currentDateTime"],
    ["createdOn", "currentDateTime"],
    ["datahubCreatedOn", "currentDateTime"],
    ["currentUser", "currentUser"],
    ["createdBy", "currentUser"],
    ["datahubCreatedBy", "currentUser"]
  ])
};
