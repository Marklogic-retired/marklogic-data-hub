/**
 Copyright (c) 2022 MarkLogic Corporation

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

import config from "/com.marklogic.hub/config.mjs";

function saveHubConfigInDocumentsDatabase() {
  const uri = "/data-hub/5/datahubConfig.json";
  const hubConfig = {
    "mlStagingDbName": config.STAGINGDATABASE,
    "mlStagingPort": config.STAGING_PORT,
    "mlStagingAuth":config.STAGING_AUTH,
    "mlStagingSimpleSsl": config.STAGING_SSL,
    "mlStagingCertFile": config.STAGING_CERT_FILE,
    "mlStagingCertPassword": config.STAGING_CERT_PASSWORD,
    "mlStagingExternalName": config.STAGING_EXTERNAL_NAME,
    "mlStagingAppserverName": config.STAGING_APP_SERVER_NAME,

    "mlFinalDbName": config.FINALDATABASE,
    "mlFinalPort": config.FINAL_PORT,
    "mlFinalAuth": config.FINAL_AUTH,
    "mlFinalSimpleSsl": config.FINAL_SSL,
    "mlFinalCertFile": config.FINAL_CERT_FILE,
    "mlFinalCertPassword": config.FINAL_CERT_PASSWORD,
    "mlFinalExternalName": config.FINAL_EXTERNAL_NAME,
    "mlFinalAppserverName": config.FINAL_APP_SERVER_NAME,

    "mlJobDbName": config.JOBDATABASE,
    "mlJobPort": config.JOB_PORT,
    "mlJobAuth": config.JOB_AUTH,
    "mlJobSimpleSsl": config.JOB_SSL,
    "mlJobCertFile": config.JOB_CERT_FILE,
    "mlJobCertPassword": config.JOB_CERT_PASSWORD,
    "mlJobExternalName": config.JOB_EXTERNAL_NAME,
    "mlJobAppserverName": config.JOB_APP_SERVER_NAME,

    "mlModulesDbName": config.MODULESDATABASE,
    "mlStagingTriggersDbName": config.STAGINGTRIGGERSDATABASE,
    "mlStagingSchemasDbName": config.STAGINGSCHEMASDATABASE,
    "mlFinalTriggersDbName": config.FINALTRIGGERSDATABASE,
    "mlFinalSchemasDbName": config.FINALSCHEMASDATABASE,

    "mlModulePermissions": config.MODULE_PERMISSIONS,
    "hubDhs": config.HUB_DHS,
    "hubSsl": config.HUB_SSL
  };

  const permissions = [
    xdmp.permission('rest-reader', 'read'),
    xdmp.permission('rest-writer', 'update'),
    xdmp.permission('data-hub-common', 'read')
  ];

  const collections = ["marklogic-data-hub-config", "hub-core-module"];
  xdmp.invokeFunction(
    function() {
      declareUpdate();
      xdmp.documentInsert(uri, hubConfig, {
          permissions: permissions,
          collections: collections
        }
      )
    },
    {database: xdmp.modulesDatabase()}
  );
}

export default {
    saveHubConfigInDocumentsDatabase
};
