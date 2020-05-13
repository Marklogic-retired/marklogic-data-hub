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
const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const ds = require("/data-hub/5/data-services/ds-utils.sjs");

const dataHubPrivilegePrefix = 'data-hub:';

const ampedGetDataHubPrivileges = module.amp(function ampedGetDataHubPrivileges() {
  const userName = xdmp.getCurrentUser();
  const dataHubPrivilegeNames = xdmp.userPrivileges(userName).toArray().map((priv) => xdmp.privilegeName(priv))
      .filter((privName) => fn.startsWith(privName, dataHubPrivilegePrefix));
  return dataHubPrivilegeNames;
});

class Security {

  getDataHubAuthorities() {
    return ampedGetDataHubPrivileges()
        .map((privName) => fn.substringAfter(privName,dataHubPrivilegePrefix));
  }

  dataHubAuthorityAssert(dataHubAuthority, msg = `${xdmp.getCurrentUser()} user doesn't have authority ${dataHubAuthority}`) {
    const dataHubPrivilege = `http://marklogic.com/data-hub/privileges/${fn.lowerCase(fn.replace(dataHubAuthority, '([a-z])([A-Z])', '$1-$2'))}`;
    try {
      xdmp.securityAssert(dataHubPrivilege,'execute');
    } catch (e) {
      xdmp.log(`Security assertion failed for ${dataHubAuthority}. Exception: ${e.toString()}`, 'warning');
      ds.throwForbidden(msg);
    }
  }

  getRolesAndAuthorities() {
    const response = {
      "authorities": this.getDataHubAuthorities()
    };

    // Blacklist of artifact authorities already implemented the correct way
    const authorityBlacklist = ['readMapping'];
    // TODO Below logic will go away in favor of privileges
    const typesInfo = Artifacts.getTypesInfo();
    for (const artifactTypeInfo of typesInfo) {
      const type = artifactTypeInfo.type;
      const writeAuthority = `write${type.substr(0,1).toUpperCase()}${type.substr(1)}`;

      if (artifactTypeInfo.userCanUpdate && !authorityBlacklist.includes(writeAuthority)) {
        response.authorities.push(writeAuthority);
      }

      const readAuthority = `read${type.substr(0,1).toUpperCase()}${type.substr(1)}`;

      if (artifactTypeInfo.userCanRead && !authorityBlacklist.includes(readAuthority)) {
        response.authorities.push(readAuthority);
      }
    }
    const currentRoleNames = xdmp.getCurrentRoles().toArray().map(roleId => xdmp.roleName(roleId));
    if(currentRoleNames.includes("data-hub-operator")){
      response.authorities.push('operator');
    }

    return response;
  }
}

module.exports = Security;

module.exports.ampedGetDataHubPrivileges = ampedGetDataHubPrivileges;
