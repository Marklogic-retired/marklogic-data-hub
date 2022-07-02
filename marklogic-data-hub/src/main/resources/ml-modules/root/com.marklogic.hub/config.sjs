module.exports = {
  // Staging Database Properties
  STAGINGDATABASE: "%%mlStagingDbName%%",
  STAGING_PORT: "%%mlStagingPort%%",
  STAGING_AUTH: "%%mlStagingAuth%%",
  STAGING_SSL: "%%mlStagingSimpleSsl%%",
  STAGING_CERT_FILE: "%%mlStagingCertFile%%",
  STAGING_CERT_PASSWORD: "%%mlStagingCertPassword%%",
  STAGING_EXTERNAL_NAME: "%%mlStagingExternalName%%",
  STAGINGSCHEMASDATABASE: "%%mlStagingSchemasDbName%%",
  STAGINGTRIGGERSDATABASE: "%%mlStagingTriggersDbName%%",

  // Final Database Properties
  FINALDATABASE: "%%mlFinalDbName%%",
  FINAL_PORT: "%%mlFinalPort%%",
  FINAL_AUTH: "%%mlFinalAuth%%",
  FINAL_SSL: "%%mlFinalSimpleSsl%%",
  FINAL_CERT_FILE: "%%mlFinalCertFile%%",
  FINAL_CERT_PASSWORD: "%%mlFinalCertPassword%%",
  FINAL_EXTERNAL_NAME: "%%mlFinalExternalName%%",
  FINALSCHEMASDATABASE: "%%mlFinalSchemasDbName%%",
  FINALTRIGGERSDATABASE: "%%mlFinalTriggersDbName%%",

  // Jobs Database Properties
  JOBDATABASE: "%%mlJobDbName%%",
  JOB_PORT: "%%mlJobPort%%",
  JOB_AUTH: "%%mlJobAuth%%",
  JOB_SSL: "%%mlJobSimpleSsl%%",
  JOB_CERT_FILE: "%%mlJobCertFile%%",
  JOB_CERT_PASSWORD: "%%mlJobCertPassword%%",
  JOB_EXTERNAL_NAME: "%%mlJobExternalName%%",

  // Modules Database Properties
  MODULESDATABASE: "%%mlModulesDbName%%",
  MODULE_PERMISSIONS: "%%mlModulePermissions%%",

  // Trace Database Properties
  TRACEDATABASE: "%%mlJobDbName%%",

  // Hub Properties
  HUBVERSION: "%%mlHubVersion%%",
  HUBLOGLEVEL: "%%mlHubLogLevel%%",
  FLOWOPERATORROLE: "%%mlFlowOperatorRole%%",
  FLOWDEVELOPERROLE: "%%mlFlowDeveloperRole%%",
  JOBPERMISSIONS: "%%mlJobPermissions%%",
  HUB_SSL: "%%hubSsl%%",
  HUB_DHS: "%%hubDhs%%"
};
