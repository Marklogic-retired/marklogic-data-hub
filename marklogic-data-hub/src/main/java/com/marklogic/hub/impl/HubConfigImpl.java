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

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.error.InvalidDBOperationError;
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

@JsonAutoDetect(
    fieldVisibility = JsonAutoDetect.Visibility.PROTECTED_AND_PUBLIC,
    getterVisibility = JsonAutoDetect.Visibility.ANY,
    setterVisibility = JsonAutoDetect.Visibility.ANY)
public class HubConfigImpl implements HubConfig {

    protected String stagingDbName = DEFAULT_STAGING_NAME;
    protected String stagingHttpName = DEFAULT_STAGING_NAME;
    protected Integer stagingForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    protected Integer stagingPort = DEFAULT_STAGING_PORT;
    protected String stagingAuthMethod = DEFAULT_AUTH_METHOD;
    private String stagingScheme = DEFAULT_SCHEME;
    private boolean stagingSimpleSsl = false;
    private SSLContext stagingSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier;
    private String stagingCertFile;
    private String stagingCertPassword;
    private String stagingExternalName;

    protected String finalDbName = DEFAULT_FINAL_NAME;
    protected String finalHttpName = DEFAULT_FINAL_NAME;
    protected Integer finalForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    protected Integer finalPort = DEFAULT_FINAL_PORT;
    protected String finalAuthMethod = DEFAULT_AUTH_METHOD;
    private String finalScheme = DEFAULT_SCHEME;
    private boolean finalSimpleSsl = false;
    private SSLContext finalSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier;
    private String finalCertFile;
    private String finalCertPassword;
    private String finalExternalName;

    protected String jobDbName = DEFAULT_JOB_NAME;
    protected String jobHttpName = DEFAULT_JOB_NAME;
    protected Integer jobForestsPerHost = 1;
    protected Integer jobPort = DEFAULT_JOB_PORT;
    protected String jobAuthMethod = DEFAULT_AUTH_METHOD;
    private String jobScheme = DEFAULT_SCHEME;
    private boolean jobSimpleSsl = false;
    private SSLContext jobSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier;
    private String jobCertFile;
    private String jobCertPassword;
    private String jobExternalName;

    protected String modulesDbName = DEFAULT_MODULES_DB_NAME;
    protected Integer modulesForestsPerHost = 1;

    protected String triggersDbName = DEFAULT_TRIGGERS_DB_NAME;
    protected Integer triggersForestsPerHost = 1;

    protected String schemasDbName = DEFAULT_SCHEMAS_DB_NAME;
    protected Integer schemasForestsPerHost = 1;

    private String hubRoleName = DEFAULT_ROLE_NAME;
    private String hubUserName = DEFAULT_USER_NAME;

    // these hold runtime credentials for flows.
    private String mlUsername = null;
    private String mlPassword = null;

    private String[] loadBalancerHosts;

    protected String customForestPath = DEFAULT_CUSTOM_FOREST_PATH;
    protected String modulePermissions = "rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute";

    private String projectDir;

    private Properties environmentProperties;

    private HubProject hubProject;

    private ManageConfig manageConfig;
    private ManageClient manageClient;
    private AdminConfig adminConfig;
    private AdminManager adminManager;

    private AppConfig appConfig;

    private static final Logger logger = LoggerFactory.getLogger(HubConfigImpl.class);

    public HubConfigImpl() {
    }

    public HubConfigImpl(String projectDir) {
        setProjectDir(new File(projectDir).getAbsolutePath());
    }


    public String getHost() { return appConfig.getHost(); }

    @Override public String getDbName(DatabaseKind kind){
        String name;
        switch (kind) {
            case STAGING:
                name = stagingDbName;
                break;
            case FINAL:
                name = finalDbName;
                break;
            case JOB:
                name = jobDbName;
                break;
            case TRACE:
                name = jobDbName;
                break;
            case MODULES:
                name = modulesDbName;
                break;
            case TRIGGERS:
                name = triggersDbName;
                break;
            case SCHEMAS:
                name = schemasDbName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab database name");
        }
        return name;
    }

    @Override public void setDbName(DatabaseKind kind, String dbName){
        switch (kind) {
            case STAGING:
                stagingDbName = dbName;
                break;
            case FINAL:
                finalDbName = dbName;
                break;
            case JOB:
                jobDbName = dbName;
                break;
            case TRACE:
                jobDbName = dbName;
                break;
            case MODULES:
                modulesDbName = dbName;
                break;
            case TRIGGERS:
                triggersDbName = dbName;
                break;
            case SCHEMAS:
                schemasDbName = dbName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set database name");
        }
    }

    @Override public String getHttpName(DatabaseKind kind){
        String name;
        switch (kind) {
            case STAGING:
                name = stagingHttpName;
                break;
            case FINAL:
                name = finalHttpName;
                break;
            case JOB:
                name = jobHttpName;
                break;
            case TRACE:
                name = jobHttpName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab http name");
        }
        return name;
    }

    @Override public void setHttpName(DatabaseKind kind, String httpName){
        switch (kind) {
            case STAGING:
                stagingHttpName = httpName;
                break;
            case FINAL:
                finalHttpName = httpName;
                break;
            case JOB:
                jobHttpName = httpName;
                break;
            case TRACE:
                jobHttpName = httpName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set http name");
        }
    }

    @Override public Integer getForestsPerHost(DatabaseKind kind){
        Integer forests;
        switch (kind) {
            case STAGING:
                forests = stagingForestsPerHost;
                break;
            case FINAL:
                forests = finalForestsPerHost;
                break;
            case JOB:
                forests = jobForestsPerHost;
                break;
            case TRACE:
                forests = jobForestsPerHost;
                break;
            case MODULES:
                forests = modulesForestsPerHost;
                break;
            case TRIGGERS:
                forests = triggersForestsPerHost;
                break;
            case SCHEMAS:
                forests = schemasForestsPerHost;
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab count of forests per host");
        }
        return forests;
    }

    @Override public void setForestsPerHost(DatabaseKind kind, Integer forestsPerHost){
        switch (kind) {
            case STAGING:
                stagingForestsPerHost = forestsPerHost;
                break;
            case FINAL:
                finalForestsPerHost = forestsPerHost;
                break;
            case JOB:
                jobForestsPerHost = forestsPerHost;
                break;
            case TRACE:
                jobForestsPerHost = forestsPerHost;
                break;
            case MODULES:
                modulesForestsPerHost = forestsPerHost;
                break;
            case TRIGGERS:
                triggersForestsPerHost = forestsPerHost;
                break;
            case SCHEMAS:
                schemasForestsPerHost = forestsPerHost;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set count of forests per host");
        }
    }

    @Override public Integer getPort(DatabaseKind kind){
        Integer port;
        switch (kind) {
            case STAGING:
                port = stagingPort;
                break;
            case FINAL:
                port = finalPort;
                break;
            case JOB:
                port = jobPort;
                break;
            case TRACE:
                port = jobPort;
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab app port");
        }
        return port;
    }

    @Override public void setPort(DatabaseKind kind, Integer port){
        switch (kind) {
            case STAGING:
                stagingPort = port;
                break;
            case FINAL:
                finalPort = port;
                break;
            case JOB:
                jobPort = port;
                break;
            case TRACE:
                jobPort = port;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set app port");
        }
    }


    @Override public SSLContext getSslContext(DatabaseKind kind) {
        SSLContext sslContext;
        switch (kind) {
            case STAGING:
                sslContext = this.stagingSslContext;
                break;
            case FINAL:
                sslContext = this.finalSslContext;
                break;
            case JOB:
                sslContext = this.jobSslContext;
                break;
            case TRACE:
                sslContext = this.jobSslContext;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get ssl context");
        }
        return sslContext;
    }

    @Override public void setSslContext(DatabaseKind kind, SSLContext sslContext) {
        switch (kind) {
            case STAGING:
                this.stagingSslContext = sslContext;
                break;
            case FINAL:
                this.finalSslContext= sslContext;
                break;
            case JOB:
                this.jobSslContext = sslContext;
                break;
            case TRACE:
                this.jobSslContext = sslContext;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set ssl context");
        }
    }

    @Override public DatabaseClientFactory.SSLHostnameVerifier getSslHostnameVerifier(DatabaseKind kind) {
        DatabaseClientFactory.SSLHostnameVerifier sslHostnameVerifier;
        switch (kind) {
            case STAGING:
                sslHostnameVerifier = this.stagingSslHostnameVerifier;
                break;
            case FINAL:
                sslHostnameVerifier = this.finalSslHostnameVerifier;
                break;
            case JOB:
                sslHostnameVerifier = this.jobSslHostnameVerifier;
                break;
            case TRACE:
                sslHostnameVerifier = this.jobSslHostnameVerifier;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get ssl hostname verifier");
        }
        return sslHostnameVerifier;
    }

    @Override public void setSslHostnameVerifier(DatabaseKind kind, DatabaseClientFactory.SSLHostnameVerifier sslHostnameVerifier) {
        switch (kind) {
            case STAGING:
                this.stagingSslHostnameVerifier = sslHostnameVerifier;
                break;
            case FINAL:
                this.finalSslHostnameVerifier = sslHostnameVerifier;
                break;
            case JOB:
                this.jobSslHostnameVerifier = sslHostnameVerifier;
                break;
            case TRACE:
                this.jobSslHostnameVerifier = sslHostnameVerifier;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set ssl hostname verifier");
        }
    }

    @Override public String getAuthMethod(DatabaseKind kind){
        String authMethod;
        switch (kind) {
            case STAGING:
                authMethod = this.stagingAuthMethod;
                break;
            case FINAL:
                authMethod = this.finalAuthMethod;
                break;
            case JOB:
                authMethod = this.jobAuthMethod;
                break;
            case TRACE:
                authMethod = this.jobAuthMethod;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get auth method");
        }
        return authMethod;
    }

    @Override public void setAuthMethod(DatabaseKind kind, String authMethod) {
        switch (kind) {
            case STAGING:
                this.stagingAuthMethod = authMethod;
                break;
            case FINAL:
                this.finalAuthMethod = authMethod;
                break;
            case JOB:
                this.jobAuthMethod = authMethod;
                break;
            case TRACE:
                this.jobAuthMethod = authMethod;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    @Override public String getScheme(DatabaseKind kind){
        String scheme;
        switch (kind) {
            case STAGING:
                scheme = this.stagingScheme;
                break;
            case FINAL:
                scheme = this.finalScheme;
                break;
            case JOB:
                scheme = this.jobScheme;
                break;
            case TRACE:
                scheme = this.jobScheme;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get scheme");
        }
        return scheme;
    }

    @Override public void setScheme(DatabaseKind kind, String scheme) {
        switch (kind) {
            case STAGING:
                this.stagingScheme = scheme;
                break;
            case FINAL:
                this.finalScheme = scheme;
                break;
            case JOB:
                this.jobScheme = scheme;
                break;
            case TRACE:
                this.jobScheme = scheme;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    @Override public boolean getSimpleSsl(DatabaseKind kind){
        boolean simple;
        switch (kind) {
            case STAGING:
                simple = this.stagingSimpleSsl;
                break;
            case FINAL:
                simple = this.finalSimpleSsl;
                break;
            case JOB:
                simple = this.jobSimpleSsl;
                break;
            case TRACE:
                simple = this.jobSimpleSsl;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get simple ssl");
        }
        return simple;
    }

    @Override public void setSimpleSsl(DatabaseKind kind, Boolean simpleSsl) {
        switch (kind) {
            case STAGING:
                this.stagingSimpleSsl = simpleSsl;
                break;
            case FINAL:
                this.finalSimpleSsl = simpleSsl;
                break;
            case JOB:
                this.jobSimpleSsl = simpleSsl;
                break;
            case TRACE:
                this.jobSimpleSsl = simpleSsl;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set simple ssl");
        }
    }

    @Override public String getCertFile(DatabaseKind kind){
        String certFile;
        switch (kind) {
            case STAGING:
                certFile = this.stagingCertFile;
                break;
            case FINAL:
                certFile = this.finalCertFile;
                break;
            case JOB:
                certFile = this.jobCertFile;
                break;
            case TRACE:
                certFile = this.jobCertFile;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get cert file");
        }
        return certFile;
    }

    @Override public void setCertFile(DatabaseKind kind, String certFile) {
        switch (kind) {
            case STAGING:
                this.stagingCertFile = certFile;
                break;
            case FINAL:
                this.finalCertFile = certFile;
                break;
            case JOB:
                this.jobCertFile = certFile;
                break;
            case TRACE:
                this.jobCertFile = certFile;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set certificate file");
        }
    }

    @Override public String getCertPassword(DatabaseKind kind){
        String certPass;
        switch (kind) {
            case STAGING:
                certPass = this.stagingCertPassword;
                break;
            case FINAL:
                certPass = this.finalCertPassword;
                break;
            case JOB:
                certPass = this.jobCertPassword;
                break;
            case TRACE:
                certPass = this.jobCertPassword;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get cert password");
        }
        return certPass;
    }

    @Override public void setCertPass(DatabaseKind kind, String certPassword) {
        switch (kind) {
            case STAGING:
                this.stagingCertPassword = certPassword;
                break;
            case FINAL:
                this.finalCertPassword = certPassword;
                break;
            case JOB:
                this.jobCertPassword = certPassword;
                break;
            case TRACE:
                this.jobCertPassword = certPassword;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set certificate password");
        }
    }

    @Override public String getExternalName(DatabaseKind kind){
        String name;
        switch (kind) {
            case STAGING:
                name = this.stagingExternalName;
                break;
            case FINAL:
                name = this.finalExternalName;
                break;
            case JOB:
                name = this.jobExternalName;
                break;
            case TRACE:
                name = this.jobExternalName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get external name");
        }
        return name;
    }

    @Override public void setExternalName(DatabaseKind kind, String externalName) {
        switch (kind) {
            case STAGING:
                this.stagingExternalName = externalName;
                break;
            case FINAL:
                this.finalExternalName = externalName;
                break;
            case JOB:
                this.jobExternalName = externalName;
                break;
            case TRACE:
                this.jobExternalName = externalName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    // roles and users
    @Override public String getHubRoleName() {
        return hubRoleName;
    }
    @Override public void setHubRoleName(String hubRoleName) {
        this.hubRoleName = hubRoleName;
    }

    @Override public String getHubUserName() {
        return hubUserName;
    }

    // impl only pending refactor to Flow Component
    public String getMlUsername() {
        return mlUsername;
    }
    // impl only pending refactor to Flow Component
    public String getMlPassword() {
        return mlPassword;
    }
    @Override  public void setHubUserName(String hubUserName) {
        this.hubUserName = hubUserName;
    }


    @JsonIgnore
    @Override  public String[] getLoadBalancerHosts() {
        return loadBalancerHosts;
    }
    public void setLoadBalancerHosts(String[] loadBalancerHosts) {
        this.loadBalancerHosts = loadBalancerHosts;
    }

    @Override public String getCustomForestPath() {
        return customForestPath;
    }
    public void setCustomForestPath(String customForestPath) {
        this.customForestPath = customForestPath;
    }

    @Override public String getModulePermissions() {
        return modulePermissions;
    }
    public void setModulePermissions(String modulePermissions) {
        this.modulePermissions = modulePermissions;
    }

    @Override public String getProjectDir() {
        return this.projectDir;
    }

    @Override public void setProjectDir(String projectDir) {
        this.projectDir = projectDir;
        this.hubProject = HubProject.create(projectDir);
    }

    @JsonIgnore
    @Override  public HubProject getHubProject() {
        return this.hubProject;
    }

    @Override  public void initHubProject() {
        this.hubProject.init(getCustomTokens());
    }

    @JsonIgnore
    @Override  public String getHubModulesDeployTimestampFile() {
        return Paths.get(projectDir, ".tmp", HUB_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toString();
    }

    @JsonIgnore
    @Override public String getUserModulesDeployTimestampFile() {
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


            // this is a runtime username/password for running flows
            // could be factored away with FlowRunner
            mlUsername = getEnvPropString(environmentProperties, "mlUsername", mlUsername);
            mlPassword = getEnvPropString(environmentProperties, "mlPassword", mlPassword);

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
        return getAppConfig().newAppServicesDatabaseClient(stagingDbName);
    }

    public DatabaseClient newStagingManageClient() {
        return newStagingManageClient(stagingDbName);
    }

    @Override
    public DatabaseClient newStagingClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), stagingPort, getMlUsername(), getMlPassword());
        config.setDatabase(stagingDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(stagingAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(stagingSslHostnameVerifier);
        config.setSslContext(stagingSslContext);
        config.setCertFile(stagingCertFile);
        config.setCertPassword(stagingCertPassword);
        config.setExternalName(stagingExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    @Override
    public DatabaseClient newFinalClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), finalPort, getMlUsername(), getMlPassword());
        config.setDatabase(finalDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(finalSslHostnameVerifier);
        config.setSslContext(finalSslContext);
        config.setCertFile(finalCertFile);
        config.setCertPassword(finalCertPassword);
        config.setExternalName(finalExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    public DatabaseClient newStagingManageClient(String databaseName) {
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

    public DatabaseClient newFinalManageClient() {
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

    public DatabaseClient newTraceDbClient() {
        return newJobDbClient();
    }

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
    @Override public Path getHubPluginsDir() {
        return hubProject.getHubPluginsDir();
    }

    @JsonIgnore
    @Override public Path getHubEntitiesDir() { return hubProject.getHubEntitiesDir(); }

    @JsonIgnore
    @Override public Path getHubConfigDir() {
        return hubProject.getHubConfigDir();
    }

    @JsonIgnore
    @Override public Path getHubDatabaseDir() {
        return hubProject.getHubDatabaseDir();
    }

    @JsonIgnore
    @Override public Path getHubServersDir() {
        return hubProject.getHubServersDir();
    }

    @JsonIgnore
    @Override public Path getHubSecurityDir() {
        return hubProject.getHubSecurityDir();
    }

    @JsonIgnore
    @Override public Path getUserSecurityDir() {
        return hubProject.getUserSecurityDir();
    }

    @JsonIgnore
    @Override public Path getUserConfigDir() {
        return hubProject.getUserConfigDir();
    }

    @JsonIgnore
    @Override public Path getUserDatabaseDir() {
        return hubProject.getUserDatabaseDir();
    }

    @JsonIgnore
    @Override public Path getEntityDatabaseDir() {
        return hubProject.getEntityDatabaseDir();
    }

    @JsonIgnore
    @Override public Path getUserServersDir() {
        return hubProject.getUserServersDir();
    }

    @JsonIgnore
    @Override public AppConfig getAppConfig() {
        return appConfig;
    }


    @Override public void setAppConfig(AppConfig config) {
        setAppConfig(config, false);
    }

    @Override public void setAppConfig(AppConfig config, boolean skipUpdate) {
        this.appConfig = config;
        if (!skipUpdate) {
            updateAppConfig(this.appConfig);
        }
    }

    @Override public String getJarVersion() {
        Properties properties = new Properties();
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("version.properties");
        try {
            properties.load(inputStream);
        } catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        String version = (String)properties.get("version");

        // this lets debug builds work from an IDE
        if (version.equals("${project.version}")) {
            version = "3.0.0";
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


        String version = getJarVersion();
        customTokens.put("%%mlHubVersion%%", version);

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
