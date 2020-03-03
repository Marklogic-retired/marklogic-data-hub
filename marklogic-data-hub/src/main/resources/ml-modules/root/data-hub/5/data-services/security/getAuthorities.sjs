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

const defaultManageRoles = ['admin', 'data-hub-environment-manager'].map((roleName) => String(xdmp.role(roleName)));
const manageRolesMustAllMatched = ['manage-admin', 'security'].map((roleName) => String(xdmp.role(roleName)));

let hasManagerRole = defaultManageRoles.some((role) => currentRoles.includes(role));
if (!hasManagerRole) {
  hasManagerRole = manageRolesMustAllMatched.every((role) => currentRoles.indexOf(role) !== -1);
}

if (currentRoleNames.includes('admin')) {
  currentRoleNames = xdmp.roles().toArray().map(roleIdToName);
}
const datahubRoles  = currentRoleNames.filter((roleName) => fn.startsWith(roleName, 'data-hub'));

const privileges = {
  "authorities": [],
  "roles": []
};

if (hasManagerRole) {
  privileges.authorities.push('canInstallDataHub');
}

const typesInfo = Artifacts.getTypesInfo();
for (const artifactTypeInfo of typesInfo) {
  const type = artifactTypeInfo.type;
  const writeAuthority = `canWrite${type.substr(0,1).toUpperCase()}${type.substr(1)}`;

  if (artifactTypeInfo.userCanUpdate) {
    privileges.authorities.push(writeAuthority);
  }

  const readAuthority = `canRead${type.substr(0,1).toUpperCase()}${type.substr(1)}`;

  if (artifactTypeInfo.userCanRead) {
    privileges.authorities.push(readAuthority);
  }
}

datahubRoles.forEach(role => privileges.roles.push(role))

privileges;
