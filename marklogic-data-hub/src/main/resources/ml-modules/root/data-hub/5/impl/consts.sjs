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
  DEFAULT_FORMAT: "json",

  //predefined option headers that can be evaluated at run-time
  CURRENT_DATE_TIME: "currentDateTime",
  CURRENT_USER: "currentUser",

  //predefined metadata
  CREATED_ON: "createdOn",
  CREATED_BY: "createdBy",

  CREATED_IN_FLOW: "createdInFlow",
  CREATED_BY_STEP: "createdByStep",

  PROPERY_KEY_MAP: new Map([
    ["currentDateTime", "currentDateTime"],
    ["createdOn", "currentDateTime"],
    ["currentUser", "currentUser"],
    ["createdBy", "currentUser"]
  ])
};
