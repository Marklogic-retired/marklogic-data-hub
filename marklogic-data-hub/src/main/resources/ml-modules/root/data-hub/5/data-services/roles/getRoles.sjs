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

const currentRoles = xdmp.getCurrentRoles().toArray();
const isDataHubRole = (roleName) => fn.startsWith(roleName, 'data-hub');
const roleIdToName = (roleID) => xdmp.roleName(roleID);
let currentRoleNames = currentRoles.map(roleIdToName);
if (currentRoleNames.includes('admin')) {
  currentRoleNames = xdmp.roles().toArray().map(roleIdToName);
}

currentRoleNames.filter(isDataHubRole);
