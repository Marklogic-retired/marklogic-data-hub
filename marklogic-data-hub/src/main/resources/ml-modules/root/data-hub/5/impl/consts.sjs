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

const FLOW_COLLECTION = "http://marklogic.com/data-hub/flow";
const ENTITY_MODEL_COLLECTION = "http://marklogic.com/entity-services/models";
const LOAD_DATA_COLLECTION = "http://marklogic.com/data-hub/load-data-artifact";
const LOAD_DATA_SETTINGS_COLLECTION = "http://marklogic.com/data-hub/loadData/settings";
const MAPPING_ARTIFACT_COLLECTION = "http://marklogic.com/data-hub/mappings";
const MAPPING_SETTINGS_COLLECTION = "http://marklogic.com/data-hub/mapping/settings";
const MATCHING_ARTIFACT_COLLECTION = "http://marklogic.com/data-hub/matching-artifact";
const MATCHING_SETTINGS_COLLECTION = "http://marklogic.com/data-hub/matching/settings";
const STEP_DEFINITION_COLLECTION = "http://marklogic.com/data-hub/step-definition";

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
  ]),

  DATA_HUB_OPERATOR_ROLE: "data-hub-operator",
  DATA_HUB_DEVELOPER_ROLE: "data-hub-developer",
  DATA_HUB_LOAD_DATA_READ_ROLE: "data-hub-load-data-reader",
  DATA_HUB_LOAD_DATA_WRITE_ROLE: "data-hub-load-data-writer",
  DATA_HUB_MAPPING_READ_ROLE: "data-hub-mapping-reader",
  DATA_HUB_MAPPING_WRITE_ROLE: "data-hub-mapping-writer",
  DATA_HUB_MATCHING_READ_ROLE: "data-hub-match-merge-reader",
  DATA_HUB_MATCHING_WRITE_ROLE: "data-hub-match-merge-writer",

  HUB_ARTIFACT_COLLECTION: "hub-core-artifact",

  FLOW_COLLECTION,
  ENTITY_MODEL_COLLECTION,
  LOAD_DATA_COLLECTION,
  LOAD_DATA_SETTINGS_COLLECTION,
  MAPPING_ARTIFACT_COLLECTION,
  MAPPING_SETTINGS_COLLECTION,
  MATCHING_ARTIFACT_COLLECTION,
  MATCHING_SETTINGS_COLLECTION,
  STEP_DEFINITION_COLLECTION,

  USER_ARTIFACT_COLLECTIONS: [
    FLOW_COLLECTION,
    ENTITY_MODEL_COLLECTION,
    LOAD_DATA_COLLECTION,
    LOAD_DATA_SETTINGS_COLLECTION,
    MAPPING_ARTIFACT_COLLECTION,
    MAPPING_SETTINGS_COLLECTION,
    MATCHING_ARTIFACT_COLLECTION,
    MATCHING_SETTINGS_COLLECTION,
    STEP_DEFINITION_COLLECTION
  ],

  // Define all DH trace events here
  TRACE_STEP: "data-hub-step"
};
