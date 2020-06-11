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
const ds = require("/data-hub/5/data-services/ds-utils.sjs");

const hubCentralPrivilegePrefix = 'hub-central:';

const ampedGetDataHubPrivileges = module.amp(function ampedGetDataHubPrivileges() {
  const userName = xdmp.getCurrentUser();
  const dataHubPrivilegeNames = xdmp.userPrivileges(userName).toArray().map((priv) => xdmp.privilegeName(priv))
      .filter((privName) => fn.startsWith(privName, hubCentralPrivilegePrefix));
  return dataHubPrivilegeNames;
});

class Security {

  getDataHubAuthorities() {
    return ampedGetDataHubPrivileges()
        .map((privName) => fn.substringAfter(privName,hubCentralPrivilegePrefix));
  }

  dataHubAuthorityAssert(dataHubAuthority, msg = `${xdmp.getCurrentUser()} user doesn't have authority ${dataHubAuthority}`) {
    const dataHubPrivilege = `http://marklogic.com/data-hub/hub-central/privileges/${fn.lowerCase(fn.replace(dataHubAuthority, '([a-z])([A-Z])', '$1-$2'))}`;
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

    const currentRoleNames = xdmp.getCurrentRoles().toArray().map(roleId => xdmp.roleName(roleId));
    if(currentRoleNames.includes("data-hub-operator")){
      response.authorities.push('operator');
    }

    return response;
  }
}

module.exports = Security;

module.exports.ampedGetDataHubPrivileges = ampedGetDataHubPrivileges;
