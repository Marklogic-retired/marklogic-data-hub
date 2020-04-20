/**
 Copyright 2012-2020 MarkLogic Corporation

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

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const roleIdToName = (roleID) => xdmp.roleName(roleID);
const currentRoles = xdmp.getCurrentRoles().toArray().map(String);
let currentRoleNames = currentRoles.map(roleIdToName);

const manageAdminRolesMustAllMatched = ['manage-admin', 'security'].map((roleName) => String(xdmp.role(roleName)));
const hasManageAdminAndSecurity = manageAdminRolesMustAllMatched.every((role) => currentRoles.indexOf(role) !== -1);

if (currentRoleNames.includes('admin')) {
  currentRoleNames = xdmp.roles().toArray().map(roleIdToName);
}

const response = {
  "authorities": [],
  "roles": []
};

if (currentRoleNames.includes('admin') || hasManageAdminAndSecurity) {
  response.authorities.push('canInstallDataHub');
}

const typesInfo = Artifacts.getTypesInfo();
for (const artifactTypeInfo of typesInfo) {
  const type = artifactTypeInfo.type;
  const writeAuthority = `canWrite${type.substr(0,1).toUpperCase()}${type.substr(1)}`;

  if (artifactTypeInfo.userCanUpdate) {
    response.authorities.push(writeAuthority);
  }

  const readAuthority = `canRead${type.substr(0,1).toUpperCase()}${type.substr(1)}`;

  if (artifactTypeInfo.userCanRead) {
    response.authorities.push(readAuthority);
  }
}

if (currentRoleNames.includes("hub-central-downloader")) {
  response.authorities.push("canDownloadConfigurationFiles");
}

response.roles = currentRoleNames.filter(roleName => fn.startsWith(roleName, "data-hub"));

response;
