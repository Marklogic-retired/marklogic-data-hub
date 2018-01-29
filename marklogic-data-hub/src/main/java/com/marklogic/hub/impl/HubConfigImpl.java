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
package com.marklogic.hub.impl;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import org.apache.commons.text.CharacterPredicate;
import org.apache.commons.text.RandomStringGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.SSLContext;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class HubConfigImpl implements HubConfig {

    private String stagingDbName = DEFAULT_STAGING_NAME;
    private String stagingHttpName = DEFAULT_STAGING_NAME;
    private Integer stagingForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    private Integer stagingPort = DEFAULT_STAGING_PORT;
    private String stagingAuthMethod = DEFAULT_AUTH_METHOD;
    private String stagingScheme = DEFAULT_SCHEME;
    private boolean stagingSimpleSsl = false;
    private SSLContext stagingSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier;
    private String stagingCertFile;
    private String stagingCertPassword;
    private String stagingExternalName;

    private String finalDbName = DEFAULT_FINAL_NAME;
    private String finalHttpName = DEFAULT_FINAL_NAME;
    private Integer finalForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    private Integer finalPort = DEFAULT_FINAL_PORT;
    private String finalAuthMethod = DEFAULT_AUTH_METHOD;
    private String finalScheme = DEFAULT_SCHEME;
    private boolean finalSimpleSsl = false;
    private SSLContext finalSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier;
    private String finalCertFile;
    private String finalCertPassword;
    private String finalExternalName;

    private String traceDbName = DEFAULT_TRACE_NAME;
    private String traceHttpName = DEFAULT_TRACE_NAME;
    private Integer traceForestsPerHost = 1;
    private Integer tracePort = DEFAULT_TRACE_PORT;
    private String traceAuthMethod = DEFAULT_AUTH_METHOD;
    private String traceScheme = DEFAULT_SCHEME;
    private boolean traceSimpleSsl = false;
    private SSLContext traceSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier traceSslHostnameVerifier;
    private String traceCertFile;
    private String traceCertPassword;
    private String traceExternalName;

    private String jobDbName = DEFAULT_JOB_NAME;
    private String jobHttpName = DEFAULT_JOB_NAME;
    private Integer jobForestsPerHost = 1;
    private Integer jobPort = DEFAULT_JOB_PORT;
    private String jobAuthMethod = DEFAULT_AUTH_METHOD;
    private String jobScheme = DEFAULT_SCHEME;
    private boolean jobSimpleSsl = false;
    private SSLContext jobSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier;
    private String jobCertFile;
    private String jobCertPassword;
    private String jobExternalName;

    private String modulesDbName = DEFAULT_MODULES_DB_NAME;
    private Integer modulesForestsPerHost = 1;

    private String triggersDbName = DEFAULT_TRIGGERS_DB_NAME;
    private Integer triggersForestsPerHost = 1;

    private String schemasDbName = DEFAULT_SCHEMAS_DB_NAME;
    private Integer schemasForestsPerHost = 1;

    private String hubRoleName = DEFAULT_ROLE_NAME;
    private String hubUserName = DEFAULT_USER_NAME;

    private String[] loadBalancerHosts;

    private String customForestPath = DEFAULT_CUSTOM_FOREST_PATH;

    private String modulePermissions = "rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute";

    private String projectDir;

    private Properties environmentProperties;

    private HubProject hubProject;

    private ManageConfig manageConfig;
    private ManageClient manageClient;
    private AdminConfig adminConfig;
    private AdminManager adminManager;

    private AppConfig appConfig;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public HubConfigImpl(String projectDir) {
        setProjectDir(new File(projectDir).getAbsolutePath());
    }
    public HubConfigImpl() {}


    public String getHost() { return appConfig.getHost(); }

    public String getStagingDbName() {
        return stagingDbName;
    }
    public void setStagingDbName(String stagingDbName) {
        this.stagingDbName = stagingDbName;
    }

    public String getStagingHttpName() {
        return stagingHttpName;
    }
    public void setStagingHttpName(String stagingHttpName) {
        this.stagingHttpName = stagingHttpName;
    }

    public Integer getStagingForestsPerHost() {
        return stagingForestsPerHost;
    }
    public void setStagingForestsPerHost(Integer stagingForestsPerHost) {
        this.stagingForestsPerHost = stagingForestsPerHost;
    }

    public Integer getStagingPort() {
        return stagingPort;
    }
    public void setStagingPort(Integer stagingPort) {
        this.stagingPort = stagingPort;
    }

    public String getStagingAuthMethod() {
        return stagingAuthMethod;
    }
    public void setStagingAuthMethod(String stagingAuthMethod) {
        this.stagingAuthMethod = stagingAuthMethod;
    }

    public String getStagingScheme() {
        return stagingScheme;
    }
    public void setStagingScheme(String stagingScheme) {
        this.stagingScheme = stagingScheme;
    }

    public boolean getStagingSimpleSsl() {
        return stagingSimpleSsl;
    }
    public void setStagingSimpleSsl(boolean stagingSimpleSsl) {
        this.stagingSimpleSsl = stagingSimpleSsl;
    }

    public SSLContext getStagingSslContext() {
        return stagingSslContext;
    }
    public void setStagingSslContext(SSLContext stagingSslContext) {
        this.stagingSslContext = stagingSslContext;
    }

    public DatabaseClientFactory.SSLHostnameVerifier getStagingSslHostnameVerifier() {
        return stagingSslHostnameVerifier;
    }
    public void setStagingSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier) {
        this.stagingSslHostnameVerifier = stagingSslHostnameVerifier;
    }

    public String getStagingCertFile() {
        return stagingCertFile;
    }
    public void setStagingCertFile(String stagingCertFile) {
        this.stagingCertFile = stagingCertFile;
    }

    public String getStagingCertPassword() {
        return stagingCertPassword;
    }
    public void setStagingCertPassword(String stagingCertPassword) {
        this.stagingCertPassword = stagingCertPassword;
    }

    public String getStagingExternalName() {
        return stagingExternalName;
    }
    public void setStagingExternalName(String stagingExternalName) {
        this.stagingExternalName = stagingExternalName;
    }

    // final
    public String getFinalDbName() {
        return finalDbName;
    }
    public void setFinalDbName(String finalDbName) {
        this.finalDbName = finalDbName;
    }

    public String getFinalHttpName() {
        return finalHttpName;
    }
    public void setFinalHttpName(String finalHttpName) {
        this.finalHttpName = finalHttpName;
    }

    public Integer getFinalForestsPerHost() {
        return finalForestsPerHost;
    }
    public void setFinalForestsPerHost(Integer finalForestsPerHost) {
        this.finalForestsPerHost = finalForestsPerHost;
    }

    public Integer getFinalPort() {
        return finalPort;
    }
    public void setFinalPort(Integer finalPort) {
        this.finalPort = finalPort;
    }

    public String getFinalAuthMethod() {
        return finalAuthMethod;
    }
    public void setFinalAuthMethod(String finalAuthMethod) {
        this.finalAuthMethod = finalAuthMethod;
    }

    public String getFinalScheme() {
        return finalScheme;
    }
    public void setFinalScheme(String finalScheme) {
        this.finalScheme = finalScheme;
    }

    public boolean getFinalSimpleSsl() {
        return finalSimpleSsl;
    }
    public void setFinalSimpleSsl(boolean finalSimpleSsl) {
        this.finalSimpleSsl = finalSimpleSsl;
    }

    public SSLContext getFinalSslContext() {
        return finalSslContext;
    }
    public void setFinalSslContext(SSLContext finalSslContext) {
        this.finalSslContext = finalSslContext;
    }

    public DatabaseClientFactory.SSLHostnameVerifier getFinalSslHostnameVerifier() {
        return finalSslHostnameVerifier;
    }
    public void setFinalSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier) {
        this.finalSslHostnameVerifier = finalSslHostnameVerifier;
    }

    public String getFinalCertFile() {
        return finalCertFile;
    }
    public void setFinalCertFile(String finalCertFile) {
        this.finalCertFile = finalCertFile;
    }

    public String getFinalCertPassword() {
        return finalCertPassword;
    }
    public void setFinalCertPassword(String finalCertPassword) {
        this.finalCertPassword = finalCertPassword;
    }

    public String getFinalExternalName() {
        return finalExternalName;
    }
    public void setFinalExternalName(String finalExternalName) {
        this.finalExternalName = finalExternalName;
    }

    // traces
    public String getTraceDbName() {
        return traceDbName;
    }
    public void setTraceDbName(String traceDbName) {
        this.traceDbName = traceDbName;
    }

    public String getTraceHttpName() {
        return traceHttpName;
    }
    public void setTraceHttpName(String traceHttpName) {
        this.traceHttpName = traceHttpName;
    }

    public Integer getTraceForestsPerHost() {
        return traceForestsPerHost;
    }
    public void setTraceForestsPerHost(Integer traceForestsPerHost) {
        this.traceForestsPerHost = traceForestsPerHost;
    }

    public Integer getTracePort() {
        return tracePort;
    }
    public void setTracePort(Integer tracePort) {
        this.tracePort = tracePort;
    }

    public String getTraceAuthMethod() {
        return traceAuthMethod;
    }
    public void setTraceAuthMethod(String traceAuthMethod) {
        this.traceAuthMethod = traceAuthMethod;
    }

    public String getTraceScheme() {
        return traceScheme;
    }
    public void setTraceScheme(String traceScheme) {
        this.traceScheme = traceScheme;
    }

    public boolean getTraceSimpleSsl() {
        return traceSimpleSsl;
    }
    public void setTraceSimpleSsl(boolean traceSimpleSsl) {
        this.traceSimpleSsl = traceSimpleSsl;
    }

    public SSLContext getTraceSslContext() {
        return traceSslContext;
    }
    public void setTraceSslContext(SSLContext traceSslContext) {
        this.traceSslContext = traceSslContext;
    }

    public DatabaseClientFactory.SSLHostnameVerifier getTraceSslHostnameVerifier() {
        return traceSslHostnameVerifier;
    }
    public void setTraceSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier traceSslHostnameVerifier) {
        this.traceSslHostnameVerifier = traceSslHostnameVerifier;
    }

    public String getTraceCertFile() {
        return traceCertFile;
    }
    public void setTraceCertFile(String traceCertFile) {
        this.traceCertFile = traceCertFile;
    }

    public String getTraceCertPassword() {
        return traceCertPassword;
    }
    public void setTraceCertPassword(String traceCertPassword) {
        this.traceCertPassword = traceCertPassword;
    }

    public String getTraceExternalName() {
        return traceExternalName;
    }
    public void setTraceExternalName(String traceExternalName) {
        this.traceExternalName = traceExternalName;
    }

    // jobs
    public String getJobDbName() {
        return jobDbName;
    }
    public void setJobDbName(String jobDbName) {
        this.jobDbName = jobDbName;
    }

    public String getJobHttpName() {
        return jobHttpName;
    }
    public void setJobHttpName(String jobHttpName) {
        this.jobHttpName = jobHttpName;
    }

    public Integer getJobForestsPerHost() {
        return jobForestsPerHost;
    }
    public void setJobForestsPerHost(Integer jobForestsPerHost) {
        this.jobForestsPerHost = jobForestsPerHost;
    }

    public Integer getJobPort() {
        return jobPort;
    }
    public void setJobPort(Integer jobPort) {
        this.jobPort = jobPort;
    }

    public String getJobAuthMethod() {
        return jobAuthMethod;
    }
    public void setJobAuthMethod(String jobAuthMethod) {
        this.jobAuthMethod = jobAuthMethod;
    }

    public String getJobScheme() {
        return jobScheme;
    }
    public void setJobScheme(String jobScheme) {
        this.jobScheme = jobScheme;
    }

    public boolean getJobSimpleSsl() {
        return jobSimpleSsl;
    }
    public void setJobSimpleSsl(boolean jobSimpleSsl) {
        this.jobSimpleSsl = jobSimpleSsl;
    }

    public SSLContext getJobSslContext() {
        return jobSslContext;
    }
    public void setJobSslContext(SSLContext jobSslContext) {
        this.jobSslContext = jobSslContext;
    }

    public DatabaseClientFactory.SSLHostnameVerifier getJobSslHostnameVerifier() {
        return jobSslHostnameVerifier;
    }
    public void setJobSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier) {
        this.jobSslHostnameVerifier = jobSslHostnameVerifier;
    }

    public String getJobCertFile() {
        return jobCertFile;
    }
    public void setJobCertFile(String jobCertFile) {
        this.jobCertFile = jobCertFile;
    }

    public String getJobCertPassword() {
        return jobCertPassword;
    }
    public void setJobCertPassword(String jobCertPassword) {
        this.jobCertPassword = jobCertPassword;
    }

    public String getJobExternalName() {
        return jobExternalName;
    }
    public void setJobExternalName(String jobExternalName) {
        this.jobExternalName = jobExternalName;
    }

    public String getModulesDbName() {
        return modulesDbName;
    }
    public void setModulesDbName(String modulesDbName) {
        this.modulesDbName = modulesDbName;
    }

    public Integer getModulesForestsPerHost() {
        return modulesForestsPerHost;
    }
    public void setModulesForestsPerHost(Integer modulesForestsPerHost) {
        this.modulesForestsPerHost = modulesForestsPerHost;
    }


    // triggers
    public String getTriggersDbName() {
        return triggersDbName;
    }
    public void setTriggersDbName(String triggersDbName) {
        this.triggersDbName = triggersDbName;
    }

    public Integer getTriggersForestsPerHost() {
        return triggersForestsPerHost;
    }
    public void setTriggersForestsPerHost(Integer triggersForestsPerHost) {
        this.triggersForestsPerHost = triggersForestsPerHost;
    }

    // schemas
    public String getSchemasDbName() {
        return schemasDbName;
    }
    public void setSchemasDbName(String schemasDbName) {
        this.schemasDbName = schemasDbName;
    }

    public Integer getSchemasForestsPerHost() {
        return schemasForestsPerHost;
    }
    public void setSchemasForestsPerHost(Integer schemasForestsPerHost) {
        this.schemasForestsPerHost = schemasForestsPerHost;
    }

    // roles and users
    public String getHubRoleName() {
        return hubRoleName;
    }
    public void setHubRoleName(String hubRoleName) {
        this.hubRoleName = hubRoleName;
    }

    public String getHubUserName() {
        return hubUserName;
    }
    public void setHubUserName(String hubUserName) {
        this.hubUserName = hubUserName;
    }


    @JsonIgnore
    public String[] getLoadBalancerHosts() {
        return loadBalancerHosts;
    }
    public void setLoadBalancerHosts(String[] loadBalancerHosts) {
        this.loadBalancerHosts = loadBalancerHosts;
    }

    @JsonIgnore
    public String getCustomForestPath() {
        return customForestPath;
    }
    public void setCustomForestPath(String customForestPath) {
        this.customForestPath = customForestPath;
    }

    @JsonIgnore
    public String getModulePermissions() {
        return modulePermissions;
    }
    public void setModulePermissions(String modulePermissions) {
        this.modulePermissions = modulePermissions;
    }

    public String getProjectDir() {
        return this.projectDir;
    }

    public void setProjectDir(String projectDir) {
        this.projectDir = projectDir;
        this.hubProject = new HubProject(projectDir);
    }

    @JsonIgnore
    public HubProject getHubProject() {
        return this.hubProject;
    }

    public void initHubProject() {
        this.hubProject.init(getCustomTokens());
    }

    @JsonIgnore
    public String getHubModulesDeployTimestampFile() {
        return Paths.get(projectDir, ".tmp", HUB_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toString();
    }

    @JsonIgnore
    public String getUserModulesDeployTimestampFile() {
        return Paths.get(projectDir, ".tmp", USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toString();
    }

    @JsonIgnore
    public File getUserContentDeployTimestampFile() {
        return Paths.get(projectDir, ".tmp", USER_CONTENT_DEPLOY_TIMESTAMPS_PROPERTIES).toFile();
    }

    public void loadConfigurationFromProperties(Properties environmentProperties) {
        this.environmentProperties = environmentProperties;

        if (this.environmentProperties != null) {
            stagingDbName = getEnvPropString(environmentProperties, "mlStagingDbName", stagingDbName);
            stagingHttpName = getEnvPropString(environmentProperties, "mlStagingAppserverName", stagingHttpName);
            stagingForestsPerHost = getEnvPropInteger(environmentProperties, "mlStagingForestsPerHost", stagingForestsPerHost);
            stagingPort = getEnvPropInteger(environmentProperties, "mlStagingPort", stagingPort);
            stagingAuthMethod = getEnvPropString(environmentProperties, "mlStagingAuth", stagingAuthMethod);
            stagingScheme = getEnvPropString(environmentProperties, "mlStagingScheme", stagingScheme);
            stagingSimpleSsl = getEnvPropBoolean(environmentProperties, "mlStagingSimpleSsl", false);
            if (stagingSimpleSsl) {
                stagingSslContext = SimpleX509TrustManager.newSSLContext();
                stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            }
            stagingCertFile = getEnvPropString(environmentProperties, "mlStagingCertFile", stagingCertFile);
            stagingCertPassword = getEnvPropString(environmentProperties, "mlStagingCertPassword", stagingCertPassword);
            stagingExternalName = getEnvPropString(environmentProperties, "mlStagingExternalName", stagingExternalName);


            finalDbName = getEnvPropString(environmentProperties, "mlFinalDbName", finalDbName);
            finalHttpName = getEnvPropString(environmentProperties, "mlFinalAppserverName", finalHttpName);
            finalForestsPerHost = getEnvPropInteger(environmentProperties, "mlFinalForestsPerHost", finalForestsPerHost);
            finalPort = getEnvPropInteger(environmentProperties, "mlFinalPort", finalPort);
            finalAuthMethod = getEnvPropString(environmentProperties, "mlFinalAuth", finalAuthMethod);
            finalScheme = getEnvPropString(environmentProperties, "mlFinalScheme", finalScheme);
            finalSimpleSsl = getEnvPropBoolean(environmentProperties, "mlFinalSimpleSsl", false);
            if (finalSimpleSsl) {
                finalSslContext = SimpleX509TrustManager.newSSLContext();
                finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            }
            finalCertFile = getEnvPropString(environmentProperties, "mlFinalCertFile", finalCertFile);
            finalCertPassword = getEnvPropString(environmentProperties, "mlFinalCertPassword", finalCertPassword);
            finalExternalName = getEnvPropString(environmentProperties, "mlFinalExternalName", finalExternalName);

            traceDbName = getEnvPropString(environmentProperties, "mlTraceDbName", traceDbName);
            traceHttpName = getEnvPropString(environmentProperties, "mlTraceAppserverName", traceHttpName);
            traceForestsPerHost = getEnvPropInteger(environmentProperties, "mlTraceForestsPerHost", traceForestsPerHost);
            tracePort = getEnvPropInteger(environmentProperties, "mlTracePort", tracePort);
            traceAuthMethod = getEnvPropString(environmentProperties, "mlTraceAuth", traceAuthMethod);
            traceScheme = getEnvPropString(environmentProperties, "mlTraceScheme", traceScheme);
            traceSimpleSsl = getEnvPropBoolean(environmentProperties, "mlTraceSimpleSsl", false);
            if (traceSimpleSsl) {
                traceSslContext = SimpleX509TrustManager.newSSLContext();
                traceSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            }
            traceCertFile = getEnvPropString(environmentProperties, "mlTraceCertFile", traceCertFile);
            traceCertPassword = getEnvPropString(environmentProperties, "mlTraceCertPassword", traceCertPassword);
            traceExternalName = getEnvPropString(environmentProperties, "mlTraceExternalName", traceExternalName);


            jobDbName = getEnvPropString(environmentProperties, "mlJobDbName", jobDbName);
            jobHttpName = getEnvPropString(environmentProperties, "mlJobAppserverName", jobHttpName);
            jobForestsPerHost = getEnvPropInteger(environmentProperties, "mlJobForestsPerHost", jobForestsPerHost);
            jobPort = getEnvPropInteger(environmentProperties, "mlJobPort", jobPort);
            jobAuthMethod = getEnvPropString(environmentProperties, "mlJobAuth", jobAuthMethod);
            jobScheme = getEnvPropString(environmentProperties, "mlJobScheme", jobScheme);
            jobSimpleSsl = getEnvPropBoolean(environmentProperties, "mlJobSimpleSsl", false);
            if (jobSimpleSsl) {
                jobSslContext = SimpleX509TrustManager.newSSLContext();
                jobSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            }
            jobCertFile = getEnvPropString(environmentProperties, "mlJobCertFile", jobCertFile);
            jobCertPassword = getEnvPropString(environmentProperties, "mlJobCertPassword", jobCertPassword);
            jobExternalName = getEnvPropString(environmentProperties, "mlJobExternalName", jobExternalName);

            customForestPath = getEnvPropString(environmentProperties, "mlCustomForestPath", customForestPath);

            modulesDbName = getEnvPropString(environmentProperties, "mlModulesDbName", modulesDbName);
            modulesForestsPerHost = getEnvPropInteger(environmentProperties, "mlModulesForestsPerHost", modulesForestsPerHost);
            modulePermissions = getEnvPropString(environmentProperties, "mlModulePermissions", modulePermissions);

            triggersDbName = getEnvPropString(environmentProperties, "mlTriggersDbName", triggersDbName);
            triggersForestsPerHost = getEnvPropInteger(environmentProperties, "mlTriggersForestsPerHost", triggersForestsPerHost);

            schemasDbName = getEnvPropString(environmentProperties, "mlSchemasDbName", schemasDbName);
            schemasForestsPerHost = getEnvPropInteger(environmentProperties, "mlSchemasForestsPerHost", schemasForestsPerHost);

            hubRoleName = getEnvPropString(environmentProperties, "mlHubUserRole", hubRoleName);
            hubUserName = getEnvPropString(environmentProperties, "mlHubUserName", hubUserName);

            String lbh = getEnvPropString(environmentProperties, "mlLoadBalancerHosts", null);
            if (lbh != null && lbh.length() > 0) {
                loadBalancerHosts = lbh.split(",");
            }

            projectDir = getEnvPropString(environmentProperties, "hubProjectDir", projectDir);

            logger.info("Hub Project Dir: " + projectDir);
        }
        else {
            logger.error("Missing environmentProperties");
        }
    }

    @JsonIgnore
    public ManageConfig getManageConfig() {
        return manageConfig;
    }
    public void setManageConfig(ManageConfig manageConfig) {
        this.manageConfig = manageConfig;
    }

    @JsonIgnore
    public ManageClient getManageClient() {
        return manageClient;
    }
    public void setManageClient(ManageClient manageClient) {
        this.manageClient = manageClient;
    }

    @JsonIgnore
    public AdminConfig getAdminConfig() { return adminConfig; }
    public void setAdminConfig(AdminConfig adminConfig) { this.adminConfig = adminConfig; }

    @JsonIgnore
    public AdminManager getAdminManager() {
        return adminManager;
    }
    public void setAdminManager(AdminManager adminManager) { this.adminManager = adminManager; }

    public DatabaseClient newAppServicesClient() {
        return getAppConfig().newAppServicesDatabaseClient(null);
    }

    /**
     * Creates a new DatabaseClient for accessing the Staging database
     * @return - a DatabaseClient
     */
    public DatabaseClient newStagingClient() {
        return newStagingClient(stagingDbName);
    }

    public DatabaseClient newStagingClient(String databaseName) {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), stagingPort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(databaseName);
        config.setSecurityContextType(SecurityContextType.valueOf(stagingAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(stagingSslHostnameVerifier);
        config.setSslContext(stagingSslContext);
        config.setCertFile(stagingCertFile);
        config.setCertPassword(stagingCertPassword);
        config.setExternalName(stagingExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    /**
     * Creates a new DatabaseClient for accessing the Final database
     * @return - a DatabaseClient
     */
    public DatabaseClient newFinalClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), finalPort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(finalDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(finalSslHostnameVerifier);
        config.setSslContext(finalSslContext);
        config.setCertFile(finalCertFile);
        config.setCertPassword(finalCertPassword);
        config.setExternalName(finalExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    /**
     * Creates a new DatabaseClient for accessing the Job database
     * @return - a DatabaseClient
     */
    public DatabaseClient newJobDbClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), jobPort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(jobDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(jobAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(jobSslHostnameVerifier);
        config.setSslContext(jobSslContext);
        config.setCertFile(jobCertFile);
        config.setCertPassword(jobCertPassword);
        config.setExternalName(jobExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    /**
     * Creates a new DatabaseClient for accessing the Trace database
     * @return - a DatabaseClient
     */
    public DatabaseClient newTraceDbClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), tracePort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(traceDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(traceAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(traceSslHostnameVerifier);
        config.setSslContext(traceSslContext);
        config.setCertFile(traceCertFile);
        config.setCertPassword(traceCertPassword);
        config.setExternalName(traceExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    /**
     * Creates a new DatabaseClient for accessing the Hub Modules database
     * @return - a DatabaseClient
     */
    public DatabaseClient newModulesDbClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), stagingPort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(appConfig.getModulesDatabaseName());
        config.setSecurityContextType(SecurityContextType.valueOf(stagingAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(stagingSslHostnameVerifier);
        config.setSslContext(stagingSslContext);
        config.setCertFile(stagingCertFile);
        config.setCertPassword(stagingCertPassword);
        config.setExternalName(stagingExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    @JsonIgnore
    public Path getHubPluginsDir() {
        return hubProject.getHubPluginsDir();
    }

    @JsonIgnore
    public Path getHubEntitiesDir() { return hubProject.getHubEntitiesDir(); }

    @JsonIgnore
    public Path getHubConfigDir() {
        return hubProject.getHubConfigDir();
    }

    @JsonIgnore
    public Path getHubDatabaseDir() {
        return hubProject.getHubDatabaseDir();
    }

    @JsonIgnore
    public Path getHubServersDir() {
        return hubProject.getHubServersDir();
    }

    @JsonIgnore
    public Path getHubSecurityDir() {
        return hubProject.getHubSecurityDir();
    }

    @JsonIgnore
    public Path getUserSecurityDir() {
        return hubProject.getUserSecurityDir();
    }

    @JsonIgnore
    public Path getUserConfigDir() {
        return hubProject.getUserConfigDir();
    }

    @JsonIgnore
    public Path getUserDatabaseDir() {
        return hubProject.getUserDatabaseDir();
    }

    @JsonIgnore
    public Path getEntityDatabaseDir() {
        return hubProject.getEntityDatabaseDir();
    }

    @JsonIgnore
    public Path getUserServersDir() {
        return hubProject.getUserServersDir();
    }

    @JsonIgnore
    public Path getHubMimetypesDir() {
        return hubProject.getHubMimetypesDir();
    }

    @JsonIgnore
    public AppConfig getAppConfig() {
        return appConfig;
    }


    public void setAppConfig(AppConfig config) {
        setAppConfig(config, false);
    }

    public void setAppConfig(AppConfig config, boolean skipUpdate) {
        this.appConfig = config;
        if (!skipUpdate) {
            updateAppConfig(this.appConfig);
        }
    }

    public String getJarVersion() throws IOException {
        Properties properties = new Properties();
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("version.properties");
        properties.load(inputStream);
        String version = (String)properties.get("version");

        // this lets debug builds work from an IDE
        if (version.equals("${project.version}")) {
            version = "0.1.2";
        }
        return version;
    }

    private Map<String, String> getCustomTokens() {
        AppConfig appConfig = getAppConfig();
        return getCustomTokens(appConfig, appConfig.getCustomTokens());
    }

    private Map<String, String> getCustomTokens(AppConfig appConfig, Map<String, String> customTokens) {
        customTokens.put("%%mlHost%%", appConfig.getHost());
        customTokens.put("%%mlStagingAppserverName%%", stagingHttpName);
        customTokens.put("\"%%mlStagingPort%%\"", stagingPort.toString());
        customTokens.put("%%mlStagingDbName%%", stagingDbName);
        customTokens.put("%%mlStagingForestsPerHost%%", stagingForestsPerHost.toString());
        customTokens.put("%%mlStagingAuth%%", stagingAuthMethod);

        customTokens.put("%%mlFinalAppserverName%%", finalHttpName);
        customTokens.put("\"%%mlFinalPort%%\"", finalPort.toString());
        customTokens.put("%%mlFinalDbName%%", finalDbName);
        customTokens.put("%%mlFinalForestsPerHost%%", finalForestsPerHost.toString());
        customTokens.put("%%mlFinalAuth%%", finalAuthMethod);

        customTokens.put("%%mlTraceAppserverName%%", traceHttpName);
        customTokens.put("\"%%mlTracePort%%\"", tracePort.toString());
        customTokens.put("%%mlTraceDbName%%", traceDbName);
        customTokens.put("%%mlTraceForestsPerHost%%", traceForestsPerHost.toString());
        customTokens.put("%%mlTraceAuth%%", traceAuthMethod);

        customTokens.put("%%mlJobAppserverName%%", jobHttpName);
        customTokens.put("\"%%mlJobPort%%\"", jobPort.toString());
        customTokens.put("%%mlJobDbName%%", jobDbName);
        customTokens.put("%%mlJobForestsPerHost%%", jobForestsPerHost.toString());
        customTokens.put("%%mlJobAuth%%", jobAuthMethod);

        customTokens.put("%%mlModulesDbName%%", modulesDbName);
        customTokens.put("%%mlModulesForestsPerHost%%", modulesForestsPerHost.toString());

        customTokens.put("%%mlTriggersDbName%%", triggersDbName);
        customTokens.put("%%mlTriggersForestsPerHost%%", triggersForestsPerHost.toString());

        customTokens.put("%%mlSchemasDbName%%", schemasDbName);
        customTokens.put("%%mlSchemasForestsPerHost%%", schemasForestsPerHost.toString());

        customTokens.put("%%mlHubUserRole%%", hubRoleName);
        customTokens.put("%%mlHubUserName%%", hubUserName);

        // random password for hub user
        RandomStringGenerator randomStringGenerator = new RandomStringGenerator.Builder().withinRange(33, 126).filteredBy((CharacterPredicate) codePoint -> (codePoint != 92 && codePoint != 34)).build();
        customTokens.put("%%mlHubUserPassword%%", randomStringGenerator.generate(20));

        customTokens.put("%%mlCustomForestPath%%", customForestPath);

        if (environmentProperties != null) {
            Enumeration keyEnum = environmentProperties.propertyNames();
            while (keyEnum.hasMoreElements()) {
                String key = (String) keyEnum.nextElement();
                if (key.matches("^ml[A-Z].+") && !customTokens.containsKey(key)) {
                    customTokens.put("%%" + key + "%%", (String) environmentProperties.get(key));
                }
            }
        }

        return customTokens;
    }

    private void updateAppConfig(AppConfig config) {
        config.setRestPort(stagingPort);
        config.setModulesDatabaseName(modulesDbName);

        config.setTriggersDatabaseName(triggersDbName);
        config.setSchemasDatabaseName(schemasDbName);
        config.setModulesDatabaseName(modulesDbName);

        config.setReplaceTokensInModules(true);
        config.setUseRoxyTokenPrefix(false);
        config.setModulePermissions(modulePermissions);

        HashMap<String, Integer> forestCounts = new HashMap<>();
        forestCounts.put(stagingDbName, stagingForestsPerHost);
        forestCounts.put(finalDbName, finalForestsPerHost);
        forestCounts.put(traceDbName, traceForestsPerHost);
        forestCounts.put(jobDbName, jobForestsPerHost);
        forestCounts.put(modulesDbName, modulesForestsPerHost);
        forestCounts.put(triggersDbName, triggersForestsPerHost);
        forestCounts.put(schemasDbName, schemasForestsPerHost);
        config.setForestCounts(forestCounts);

        ConfigDir configDir = new ConfigDir(getUserConfigDir().toFile());
        config.setConfigDir(configDir);

        config.setSchemasPath(getUserConfigDir().resolve("schemas").toString());

        Map<String, String> customTokens = getCustomTokens(config, config.getCustomTokens());

        if (environmentProperties != null) {
            Enumeration keyEnum = environmentProperties.propertyNames();
            while (keyEnum.hasMoreElements()) {
                String key = (String) keyEnum.nextElement();
                if (key.matches("^ml[A-Z].+") && !customTokens.containsKey(key)) {
                    customTokens.put("%%" + key + "%%", (String) environmentProperties.get(key));
                }
            }
        }


        try {
            String version = getJarVersion();
            customTokens.put("%%mlHubVersion%%", version);
        }
        catch(IOException e) {
            e.printStackTrace();
        }

        appConfig = config;
    }

    private String getEnvPropString(Properties environmentProperties, String key, String fallback) {
        String value = environmentProperties.getProperty(key);
        if (value == null) {
            value = fallback;
        }
        return value;
    }

    private int getEnvPropInteger(Properties environmentProperties, String key, int fallback) {
        String value = environmentProperties.getProperty(key);
        int res;
        if (value != null) {
            res = Integer.parseInt(value);
        }
        else {
            res = fallback;
        }
        return res;
    }

    private boolean getEnvPropBoolean(Properties environmentProperties, String key, boolean fallback) {
        String value = environmentProperties.getProperty(key);
        boolean res;
        if (value != null) {
            res = Boolean.parseBoolean(value);
        }
        else {
            res = fallback;
        }
        return res;
    }
}
