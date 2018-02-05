/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;

import javax.net.ssl.SSLContext;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

/**
 * A class for passing around the Data Hub's Configuration
 */
public interface HubConfig {

    String HUB_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES = "hub-modules-deploy-timestamps.properties";
    String USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES = "user-modules-deploy-timestamps.properties";
    String USER_CONTENT_DEPLOY_TIMESTAMPS_PROPERTIES = "user-content-deploy-timestamps.properties";

    String HUB_CONFIG_DIR = "hub-internal-config";
    String USER_CONFIG_DIR = "user-config";
    String ENTITY_CONFIG_DIR = "entity-config";
    String STAGING_ENTITY_SEARCH_OPTIONS_FILE = "staging-entity-options.xml";
    String FINAL_ENTITY_SEARCH_OPTIONS_FILE = "final-entity-options.xml";

    String DEFAULT_STAGING_NAME = "data-hub-STAGING";
    String DEFAULT_FINAL_NAME = "data-hub-FINAL";
    String DEFAULT_TRACE_NAME = "data-hub-TRACING";
    String DEFAULT_JOB_NAME = "data-hub-JOBS";
    String DEFAULT_MODULES_DB_NAME = "data-hub-MODULES";
    String DEFAULT_TRIGGERS_DB_NAME = "data-hub-TRIGGERS";
    String DEFAULT_SCHEMAS_DB_NAME = "data-hub-SCHEMAS";

    String DEFAULT_ROLE_NAME = "data-hub-role";
    String DEFAULT_USER_NAME = "data-hub-user";

    Integer DEFAULT_STAGING_PORT = 8010;
    Integer DEFAULT_FINAL_PORT = 8011;
    Integer DEFAULT_TRACE_PORT = 8012;
    Integer DEFAULT_JOB_PORT = 8013;

    String DEFAULT_AUTH_METHOD = "digest";

    String DEFAULT_SCHEME = "http";

    Integer DEFAULT_FORESTS_PER_HOST = 4;

    String DEFAULT_CUSTOM_FOREST_PATH = "forests";

    String getHost();

    // staging
    String getStagingDbName();
    void setStagingDbName(String stagingDbName);

    String getStagingHttpName();
    void setStagingHttpName(String stagingHttpName);

    Integer getStagingForestsPerHost();
    void setStagingForestsPerHost(Integer stagingForestsPerHost);

    Integer getStagingPort();
    void setStagingPort(Integer stagingPort);

    String getStagingAuthMethod();
    void setStagingAuthMethod(String stagingAuthMethod);

    String getStagingScheme();
    void setStagingScheme(String stagingScheme);

    boolean getStagingSimpleSsl();
    void setStagingSimpleSsl(boolean stagingSimpleSsl);

    @JsonIgnore
    SSLContext getStagingSslContext();
    void setStagingSslContext(SSLContext stagingSslContext);

    @JsonIgnore
    DatabaseClientFactory.SSLHostnameVerifier getStagingSslHostnameVerifier();
    void setStagingSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier);

    String getStagingCertFile();
    void setStagingCertFile(String stagingCertFile);

    String getStagingCertPassword();
    void setStagingCertPassword(String stagingCertPassword);

    String getStagingExternalName();
    void setStagingExternalName(String stagingExternalName);

    // final
    String getFinalDbName();
    void setFinalDbName(String finalDbName);

    String getFinalHttpName();
    void setFinalHttpName(String finalHttpName);

    Integer getFinalForestsPerHost();
    void setFinalForestsPerHost(Integer finalForestsPerHost);

    Integer getFinalPort();
    void setFinalPort(Integer finalPort);

    String getFinalAuthMethod();
    void setFinalAuthMethod(String finalAuthMethod);

    String getFinalScheme();
    void setFinalScheme(String finalScheme);

    @JsonIgnore
    boolean getFinalSimpleSsl();
    void setFinalSimpleSsl(boolean finalSimpleSsl);

    @JsonIgnore
    SSLContext getFinalSslContext();
    void setFinalSslContext(SSLContext finalSslContext);

    DatabaseClientFactory.SSLHostnameVerifier getFinalSslHostnameVerifier();
    void setFinalSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier);

    String getFinalCertFile();
    void setFinalCertFile(String finalCertFile);

    String getFinalCertPassword();
    void setFinalCertPassword(String finalCertPassword);

    String getFinalExternalName();
    void setFinalExternalName(String finalExternalName);

    // traces
    String getTraceDbName();
    void setTraceDbName(String traceDbName);

    String getTraceHttpName();
    void setTraceHttpName(String traceHttpName);

    Integer getTraceForestsPerHost();
    void setTraceForestsPerHost(Integer traceForestsPerHost);

    Integer getTracePort();
    void setTracePort(Integer tracePort);

    String getTraceAuthMethod();
    void setTraceAuthMethod(String traceAuthMethod);

    String getTraceScheme();
    void setTraceScheme(String traceScheme);

    @JsonIgnore
    boolean getTraceSimpleSsl();
    void setTraceSimpleSsl(boolean traceSimpleSsl);

    @JsonIgnore
    SSLContext getTraceSslContext();
    void setTraceSslContext(SSLContext traceSslContext);

    DatabaseClientFactory.SSLHostnameVerifier getTraceSslHostnameVerifier();
    void setTraceSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier traceSslHostnameVerifier);

    String getTraceCertFile();
    void setTraceCertFile(String traceCertFile);

    String getTraceCertPassword();
    void setTraceCertPassword(String traceCertPassword);

    String getTraceExternalName();
    void setTraceExternalName(String traceExternalName);

    // jobs
    String getJobDbName();
    void setJobDbName(String jobDbName);

    String getJobHttpName();
    void setJobHttpName(String jobHttpName);

    Integer getJobForestsPerHost();
    void setJobForestsPerHost(Integer jobForestsPerHost);

    Integer getJobPort();
    void setJobPort(Integer jobPort);

    String getJobAuthMethod();
    void setJobAuthMethod(String jobAuthMethod);

    String getJobScheme();
    void setJobScheme(String jobScheme);

    boolean getJobSimpleSsl();
    void setJobSimpleSsl(boolean jobSimpleSsl);

    @JsonIgnore
    SSLContext getJobSslContext();
    void setJobSslContext(SSLContext jobSslContext);

    @JsonIgnore
    DatabaseClientFactory.SSLHostnameVerifier getJobSslHostnameVerifier();
    void setJobSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier);

    String getJobCertFile();
    void setJobCertFile(String jobCertFile);

    String getJobCertPassword();
    void setJobCertPassword(String jobCertPassword);

    String getJobExternalName();
    void setJobExternalName(String jobExternalName);

    String getModulesDbName();
    void setModulesDbName(String modulesDbName);

    Integer getModulesForestsPerHost();
    void setModulesForestsPerHost(Integer modulesForestsPerHost);


    // triggers
    String getTriggersDbName();
    void setTriggersDbName(String triggersDbName);

    Integer getTriggersForestsPerHost();
    void setTriggersForestsPerHost(Integer triggersForestsPerHost);

    // schemas
    String getSchemasDbName();
    void setSchemasDbName(String schemasDbName);

    Integer getSchemasForestsPerHost();
    void setSchemasForestsPerHost(Integer schemasForestsPerHost);

    // roles and users
    String getHubRoleName();
    void setHubRoleName(String hubRoleName);

    String getHubUserName();
    void setHubUserName(String hubUserName);


    String[] getLoadBalancerHosts();
    void setLoadBalancerHosts(String[] loadBalancerHosts);

    String getCustomForestPath();
    void setCustomForestPath(String customForestPath);

    String getModulePermissions();
    void setModulePermissions(String modulePermissions);

    String getProjectDir();
    void setProjectDir(String projectDir);

    @JsonIgnore
    HubProject getHubProject();

    void initHubProject();

    @JsonIgnore
    String getHubModulesDeployTimestampFile();
    @JsonIgnore
    String getUserModulesDeployTimestampFile();
    @JsonIgnore
    File getUserContentDeployTimestampFile();

    @JsonIgnore
    ManageConfig getManageConfig();
    void setManageConfig(ManageConfig manageConfig);
    @JsonIgnore
    ManageClient getManageClient();
    void setManageClient(ManageClient manageClient);

    @JsonIgnore
    AdminConfig getAdminConfig();
    void setAdminConfig(AdminConfig adminConfig);
    @JsonIgnore
    AdminManager getAdminManager();
    void setAdminManager(AdminManager adminManager);

    DatabaseClient newAppServicesClient();

    /**
     * Creates a new DatabaseClient for accessing the Staging database
     * @return - a DatabaseClient
     */
     DatabaseClient newStagingClient();

     DatabaseClient newStagingClient(String databaseName);

    /**
     * Creates a new DatabaseClient for accessing the Final database
     * @return - a DatabaseClient
     */
    DatabaseClient newFinalClient();

    /**
     * Creates a new DatabaseClient for accessing the Job database
     * @return - a DatabaseClient
     */
    DatabaseClient newJobDbClient();

    /**
     * Creates a new DatabaseClient for accessing the Trace database
     * @return - a DatabaseClient
     */
    DatabaseClient newTraceDbClient();

    /**
     * Creates a new DatabaseClient for accessing the Hub Modules database
     * @return - a DatabaseClient
     */
    DatabaseClient newModulesDbClient();

    @JsonIgnore
    Path getHubPluginsDir();
    @JsonIgnore
    Path getHubEntitiesDir();

    @JsonIgnore
    Path getHubConfigDir();
    @JsonIgnore
    Path getHubDatabaseDir();
    @JsonIgnore
    Path getHubServersDir();
    @JsonIgnore
    Path getHubSecurityDir();
    @JsonIgnore
    Path getUserSecurityDir();
    @JsonIgnore
    Path getUserConfigDir();
    @JsonIgnore
    Path getUserDatabaseDir();
    @JsonIgnore
    Path getEntityDatabaseDir();
    @JsonIgnore
    Path getUserServersDir();
    @JsonIgnore
    Path getHubMimetypesDir();

    @JsonIgnore
    AppConfig getAppConfig();
    void setAppConfig(AppConfig config);

    void setAppConfig(AppConfig config, boolean skipUpdate);

    String getJarVersion() throws IOException;
}
