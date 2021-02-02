/**
 Copyright (c) 2021 MarkLogic Corporation

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

/**
 * Defines functions for describing users and roles in a fashion similar to that of the "Describe" tab in the ML Admin UI.
 */

const config = require("/com.marklogic.hub/config.sjs");

function describeRole(roleName) {
  const response = {
    roleName: roleName,
    hubVersion: config.HUBVERSION,
    markLogicVersion: xdmp.version(),
    roleNames: [],
    privilegeNames: [],
    defaultPermissions: xdmp.roleGetDefaultPermissions(roleName),
    defaultCollections: xdmp.roleGetDefaultCollections(roleName).toArray()
  };

  addRoleDataToResponse(response, xdmp.roleRoles(roleName).toArray());
  return response;
}

function describeUser(username) {
  const response = {
    username: username,
    hubVersion: config.HUBVERSION,
    markLogicVersion: xdmp.version(),
    privilegeNames: [],
    roleNames: [],
    defaultPermissions: xdmp.userGetDefaultPermissions(username),
    defaultCollections: xdmp.userGetDefaultCollections(username).toArray()
  };

  addRoleDataToResponse(response, xdmp.userRoles(username).toArray());
  return response;
}

/**
 * Adds roles, privileges, default permissions, and default collections to the response object based on each of the given role IDs.
 * The response object is expected to be created by either describeRole or describeUser.
 * 
 * @param response 
 * @param roleIds 
 */
function addRoleDataToResponse(response, roleIds) {
  roleIds.forEach(roleId => {
    const roleName = xdmp.roleName(roleId);
    response.roleNames.push(roleName);
    addPrivilegesToResponse(response, roleId);
    addDefaultPermissionsToResponse(response, roleName);
    addDefaultCollectionsToResponse(response, roleName);
  });

  response.roleNames.sort();
  response.privilegeNames.sort();
  response.defaultCollections.sort();

  addRoleNameToPermissions(response.defaultPermissions);
  sortPermissions(response.defaultPermissions);
}

function addRoleNameToPermissions(permissions) {
  permissions.forEach(perm => perm.roleName = xdmp.roleName(perm.roleId));
}

function addDefaultCollectionsToResponse(response, roleName) {
  xdmp.roleGetDefaultCollections(roleName).toArray().forEach(coll => {
    if (!response.defaultCollections.includes(coll)) {
      response.defaultCollections.push(coll);
    }
  });
}

function addDefaultPermissionsToResponse(response, roleName) {
  xdmp.roleGetDefaultPermissions(roleName).forEach(perm => {
    const found = response.defaultPermissions.find(o => {
      return o.roleId.toString() == perm.roleId.toString() && o.capability == perm.capability;
    });
    if (!found) {
      response.defaultPermissions.push(perm);
    }
  });
}

function addPrivilegesToResponse(response, roleId) {
  xdmp.rolePrivileges(roleId).toArray().forEach(privilegeId => {
    let name = xdmp.privilegeName(privilegeId);
    if (!response.privilegeNames.includes(name)) {
      response.privilegeNames.push(name);
    }
  });
}

function sortPermissions(permissionsArray) {
  permissionsArray.sort((a, b) => a.role === b.role ?
    a.capability.localeCompare(b.capability) :
    a.role.localeCompare(b.role)
  );
}

module.exports = {
  describeRole,
  describeUser
}