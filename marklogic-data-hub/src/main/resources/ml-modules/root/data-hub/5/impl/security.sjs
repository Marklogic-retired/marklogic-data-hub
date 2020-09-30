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

const roleToAuthorityMap = {
  "hub-central-clear-user-data": "clearUserData",
  "hub-central-custom-reader": ["readCustom", "readStepDefinition"],
  "hub-central-downloader": "downloadProjectFiles",
  "hub-central-entity-exporter": "exportEntityInstances",
  "hub-central-entity-model-reader": "readEntityModel",
  "hub-central-entity-model-writer": "writeEntityModel",
  "hub-central-flow-writer": "writeFlow",
  "hub-central-load-reader": "readIngestion",
  "hub-central-load-writer": "writeIngestion",
  "hub-central-mapping-reader": "readMapping",
  "hub-central-mapping-writer": "writeMapping",
  "hub-central-match-merge-reader": ["readMatching", "readMerging"],
  "hub-central-match-merge-writer": ["writeMatching", "writeMerging"],
  "hub-central-saved-query-user": "savedQueryUser",
  "hub-central-step-runner": ["runStep", "readFlow"],
  "hub-central-user": "loginToHubCentral"
};

function getAuthorities() {
  const authorities = [];
  xdmp.getCurrentRoles().toArray().forEach(roleId => {
    const roleName = xdmp.roleName(roleId);
    if (roleToAuthorityMap.hasOwnProperty(roleName)) {
      const roleAuthorities = roleToAuthorityMap[roleName];
      if (Array.isArray(roleAuthorities)) {
        roleAuthorities.forEach(authority => authorities.push(authority));
      } else {
        authorities.push(roleAuthorities);
      }
    }
  });
  return authorities;
}

module.exports = {
  getAuthorities
};
