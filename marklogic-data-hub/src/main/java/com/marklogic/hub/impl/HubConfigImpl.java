/*
 * Copyright (c) 2020 MarkLogic Corporation
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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.DefaultAppConfigFactory;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.HubClientConfig;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.error.InvalidDBOperationError;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.admin.DefaultAdminConfigFactory;
import com.marklogic.mgmt.util.SimplePropertySource;
import org.apache.commons.text.CharacterPredicate;
import org.apache.commons.text.RandomStringGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.*;

/**
 * Extends HubConfigImpl to define all Data Hub properties, including those specific to deploying DHF.
 */
@JsonAutoDetect(
    fieldVisibility = JsonAutoDetect.Visibility.PROTECTED_AND_PUBLIC,
    getterVisibility = JsonAutoDetect.Visibility.ANY,
    setterVisibility = JsonAutoDetect.Visibility.ANY
)
public class HubConfigImpl extends HubClientConfig implements HubConfig
{
    private HubProject hubProject;

    // Fields that are protected are expected to be serialized by JSON and are not expected to have public no-arg setters

    protected String stagingHttpName;
    protected Integer stagingForestsPerHost;

    protected String finalHttpName;
    protected Integer finalForestsPerHost;

    protected String jobHttpName;
    protected Integer jobForestsPerHost;

    protected Integer modulesForestsPerHost;

    protected Integer stagingTriggersForestsPerHost;
    protected Integer finalTriggersForestsPerHost;
    protected Integer stagingSchemasForestsPerHost;
    protected Integer finalSchemasForestsPerHost;

    private String flowOperatorRoleName;
    private String flowOperatorUserName;

    private String flowDeveloperRoleName;
    private String flowDeveloperUserName;

    private String hubLogLevel;

    private Boolean isProvisionedEnvironment;

    protected String customForestPath;

    private String mappingPermissions;
    private String flowPermissions;
    private String stepDefinitionPermissions;
    private String entityModelPermissions;
    private String jobPermissions;

    private ManageClient manageClient;
    private AdminConfig adminConfig;
    private AdminManager adminManager;

    private AppConfig appConfig;

    private static final Logger logger = LoggerFactory.getLogger(HubConfigImpl.class);

    // By default, DHF uses gradle-local.properties for your local environment.
    private String envString = "local";

    /**
     * These are set when calling loadConfigurationFromProperties, if their corresponding properties exist. They are then
     * used when calling addDhfPropertiesToCustomTokens so that their values can be used instead of randomly-generated
     * passwords.
     */
    @JsonIgnore
    private String flowOperatorPasswordFromProperties;
    @JsonIgnore
    private String flowDeveloperPasswordFromProperties;

    /**
     * Constructs a HubConfigImpl with a default set of property values.
     */
    public HubConfigImpl() {
        applyDefaultPropertyValues();
    }

    /**
     * Constructor for when using this object outside of a Spring container, but a HubProject is still needed.
     *
     * @param hubProject
     */
    public HubConfigImpl(HubProject hubProject) {
        this();
        this.hubProject = hubProject;
    }

    /**
     * As of 5.3.0, this is now equivalent to the default constructor, as the default constructor now applies the
     * default property values that this method had been doing. So there's no need to call this; just use the
     * default constructor.
     *
     * @return
     */
    @Deprecated
    public static HubConfigImpl withDefaultProperties() {
        return new HubConfigImpl();
    }

    /**
     * Convenience method for instantiating a HubConfigImpl with its default property values and then overlaying the
     * values specified in the given Properties object. Note that because this calls applyProperties, the various
     * *Config objects - e.g. AppConfig - will be instantiated. It is thus expected, though not required, that the
     * given Properties object defines mlUsername and mlPassword.
     *
     * Also note that because a HubProject is not being provided via this method, any initialization logic pertaining
     * to the existence of a project will not be applied.
     *
     * @param props
     * @return
     */
    public static HubConfigImpl withProperties(Properties props) {
        HubConfigImpl config = new HubConfigImpl();
        config.applyProperties(new SimplePropertySource(props));
        return config;
    }

    /**
     * Provides a minimally-configured instance of HubConfigImpl based on DHF default properties, with no dependency
     * on Spring or on project files.
     *
     * @param host
     * @param mlUsername
     * @param mlPassword
     */
    public HubConfigImpl(String host, String mlUsername, String mlPassword) {
        this();

        Properties props = new Properties();
        props.setProperty("mlHost", host);
        props.setProperty("mlUsername", mlUsername);
        props.setProperty("mlPassword", mlPassword);
        applyProperties(new SimplePropertySource(props));
    }

    /**
     * Applies properties in the given properties to this instance. Will create new AppConfig, ManageConfig, and
     * AdminConfig objects based on these properties.
     *
     * @param properties
     */
    public void applyProperties(Properties properties) {
        applyProperties(new SimplePropertySource(properties));
    }

    /**
     * Applies properties in the given property source to this instance. Will create new AppConfig, ManageConfig, and
     * AdminConfig objects based on these properties.
     *
     * @param propertySource
     */
    public void applyProperties(com.marklogic.mgmt.util.PropertySource propertySource) {
        applyProperties(propertySource, null, null, null);
    }

    /**
     * Applies properties in the given property source to this instance. Reuses the *Config objects passed into it if
     * they're not null. This is essential for the DH Gradle plugin, where these objects are created before the DH
     * Gradle plugin calls this method, and they cannot be recreated, they can only be modified.
     *
     * @param propertySource
     * @param appConfigToReuse
     * @param manageConfigToReuse
     * @param adminConfigToReuse
     */
    public void applyProperties(com.marklogic.mgmt.util.PropertySource propertySource, AppConfig appConfigToReuse,
                                ManageConfig manageConfigToReuse, AdminConfig adminConfigToReuse) {

        // Ensure these are non-null before applying DHF properties, as some DHF properties may wish to modify these
        // config objects
        this.appConfig = appConfigToReuse != null ? appConfigToReuse : new DefaultAppConfigFactory(propertySource).newAppConfig();
        this.adminConfig = adminConfigToReuse != null ? adminConfigToReuse : new DefaultAdminConfigFactory(propertySource).newAdminConfig();

        // Apply DHF properties defined by parent class and this class
        super.applyProperties(propertyName -> propertySource.getProperty(propertyName), manageConfigToReuse);

        // Now update the AppConfig based on the applied DHF property values
        setAppConfig(this.appConfig, false);

        // And recreate these in case the AdminConfig/ManageConfig objects were updated when DHF properties were applied,
        // as this will force the underlying RestTemplate objects to be updated
        setAdminManager(new AdminManager(this.adminConfig));
        setManageClient(new ManageClient(getManageConfig()));
    }

    protected HubProject requireHubProject() {
        Assert.notNull(hubProject, "A HubProject has not been set, and thus this operation cannot be performed");
        return hubProject;
    }

    public void createProject(String projectDirString) {
        requireHubProject().createProject(projectDirString);
    }

    public String getHost() { return appConfig != null ? appConfig.getHost() : super.getHost(); }

    @Override public String getDbName(DatabaseKind kind){
        String name;
        switch (kind) {
            case STAGING:
                name = getStagingDbName();
                break;
            case FINAL:
                name = getFinalDbName();
                break;
            case JOB:
                name = getJobDbName();
                break;
            case TRACE:
                name = getJobDbName();
                break;
            case MODULES:
                name = super.getModulesDbName();
                break;
            case STAGING_MODULES:
                name = super.getModulesDbName();
                break;
            case FINAL_MODULES:
                name = super.getModulesDbName();
                break;
            case STAGING_TRIGGERS:
                name = getStagingTriggersDbName();
                break;
            case FINAL_TRIGGERS:
                name = getFinalTriggersDbName();
                break;
            case STAGING_SCHEMAS:
                name = getStagingSchemasDbName();
                break;
            case FINAL_SCHEMAS:
                name = getFinalSchemasDbName();
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab database name");
        }
        return name;
    }

    @Override public void setDbName(DatabaseKind kind, String dbName){
        switch (kind) {
            case STAGING:
                setStagingDbName(dbName);
                break;
            case FINAL:
                setFinalDbName(dbName);
                break;
            case JOB:
                setJobDbName(dbName);
                break;
            case TRACE:
                setJobDbName(dbName);
                break;
            case MODULES:
                setModulesDbName(dbName);
                break;
            case STAGING_MODULES:
                setModulesDbName(dbName);
                break;
            case FINAL_MODULES:
                setModulesDbName(dbName);
                break;
            case STAGING_TRIGGERS:
                setStagingTriggersDbName(dbName);
                break;
            case FINAL_TRIGGERS:
                setFinalTriggersDbName(dbName);
                break;
            case STAGING_SCHEMAS:
                setStagingSchemasDbName(dbName);
                break;
            case FINAL_SCHEMAS:
                setFinalSchemasDbName(dbName);
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
            case STAGING_MODULES:
                forests = modulesForestsPerHost;
                break;
            case FINAL_MODULES:
                forests = modulesForestsPerHost;
                break;
            case STAGING_TRIGGERS:
                forests = stagingTriggersForestsPerHost;
                break;
            case FINAL_TRIGGERS:
                forests = finalTriggersForestsPerHost;
                break;
            case STAGING_SCHEMAS:
                forests = stagingSchemasForestsPerHost;
                break;
            case FINAL_SCHEMAS:
                forests = finalSchemasForestsPerHost;
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
            case STAGING_MODULES:
                modulesForestsPerHost = forestsPerHost;
                break;
            case FINAL_MODULES:
                modulesForestsPerHost = forestsPerHost;
                break;
            case STAGING_TRIGGERS:
                stagingTriggersForestsPerHost = forestsPerHost;
                break;
            case FINAL_TRIGGERS:
                finalTriggersForestsPerHost = forestsPerHost;
                break;
            case STAGING_SCHEMAS:
                stagingSchemasForestsPerHost = forestsPerHost;
                break;
            case FINAL_SCHEMAS:
                finalSchemasForestsPerHost = forestsPerHost;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set count of forests per host");
        }
    }

    @Override public Integer getPort(DatabaseKind kind){
        Integer port;
        switch (kind) {
            case STAGING:
                port = getStagingPort();
                break;
            case FINAL:
                port = getFinalPort();
                break;
            case JOB:
                port = getJobPort();
                break;
            case TRACE:
                port = getJobPort();
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab app port");
        }
        return port;
    }

    @Override public void setPort(DatabaseKind kind, Integer port){
        switch (kind) {
            case STAGING:
                setStagingPort(port);
                break;
            case FINAL:
                setFinalPort(port);
                break;
            case JOB:
                setJobPort(port);
                break;
            case TRACE:
                setJobPort(port);
                break;
            default:
                throw new InvalidDBOperationError(kind, "set app port");
        }
    }


    @Override public SSLContext getSslContext(DatabaseKind kind) {
        SSLContext sslContext;
        switch (kind) {
            case STAGING:
                sslContext = getStagingSslContext();
                break;
            case JOB:
                sslContext = getJobSslContext();
                break;
            case TRACE:
                sslContext = getJobSslContext();
                break;
            case FINAL:
                sslContext = getFinalSslContext();
                break;
            default:
                throw new InvalidDBOperationError(kind, "get ssl context");
        }
        return sslContext;
    }

    @Override public void setSslContext(DatabaseKind kind, SSLContext sslContext) {
        switch (kind) {
            case STAGING:
                setStagingSslContext(sslContext);
                break;
            case JOB:
                setJobSslContext(sslContext);
                break;
            case TRACE:
                setJobSslContext(sslContext);
                break;
            case FINAL:
                setFinalSslContext(sslContext);
                break;
            default:
                throw new InvalidDBOperationError(kind, "set ssl context");
        }
    }

    @Override public DatabaseClientFactory.SSLHostnameVerifier getSslHostnameVerifier(DatabaseKind kind) {
        DatabaseClientFactory.SSLHostnameVerifier sslHostnameVerifier;
        switch (kind) {
            case STAGING:
                sslHostnameVerifier = getStagingSslHostnameVerifier();
                break;
            case JOB:
                sslHostnameVerifier = getJobSslHostnameVerifier();
                break;
            case TRACE:
                sslHostnameVerifier = getJobSslHostnameVerifier();
                break;
            case FINAL:
                sslHostnameVerifier = getFinalSslHostnameVerifier();
                break;
            default:
                throw new InvalidDBOperationError(kind, "get ssl hostname verifier");
        }
        return sslHostnameVerifier;
    }

    @Override public void setSslHostnameVerifier(DatabaseKind kind, DatabaseClientFactory.SSLHostnameVerifier sslHostnameVerifier) {
        switch (kind) {
            case STAGING:
                setStagingSslHostnameVerifier(sslHostnameVerifier);
                break;
            case JOB:
                setJobSslHostnameVerifier(sslHostnameVerifier);
                break;
            case TRACE:
                setJobSslHostnameVerifier(sslHostnameVerifier);
                break;
            case FINAL:
                setFinalSslHostnameVerifier(sslHostnameVerifier);
                break;
            default:
                throw new InvalidDBOperationError(kind, "set ssl hostname verifier");
        }
    }

    @Override public String getAuthMethod(DatabaseKind kind){
        String authMethod;
        switch (kind) {
            case STAGING:
                authMethod = getStagingAuthMethod();
                break;
            case FINAL:
                authMethod = getFinalAuthMethod();
                break;
            case JOB:
                authMethod = getJobAuthMethod();
                break;
            case TRACE:
                authMethod = getJobAuthMethod();
                break;
            default:
                throw new InvalidDBOperationError(kind, "get auth method");
        }
        return authMethod;
    }

    @Override public void setAuthMethod(DatabaseKind kind, String authMethod) {
        switch (kind) {
            case STAGING:
                setStagingAuthMethod(authMethod);
                break;
            case FINAL:
                setFinalAuthMethod(authMethod);
                break;
            case JOB:
                setJobAuthMethod(authMethod);
                break;
            case TRACE:
                setJobAuthMethod(authMethod);
                break;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    public X509TrustManager getTrustManager(DatabaseKind kind) {
        switch (kind) {
            case STAGING:
                return getStagingTrustManager();
            case JOB:
                return getJobTrustManager();
            case FINAL:
                return getFinalTrustManager();
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    @Override
    public void setTrustManager(DatabaseKind kind, X509TrustManager trustManager) {
        switch (kind) {
            case STAGING:
                setStagingTrustManager(trustManager);
                break;
            case JOB:
                setJobTrustManager(trustManager);
                break;
            case FINAL:
                setFinalTrustManager(trustManager);
                break;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    @Deprecated
    @Override public String getScheme(DatabaseKind kind){
        return null;
    }

    @Deprecated
    @Override public void setScheme(DatabaseKind kind, String scheme) {
    }

    @Override public boolean getSimpleSsl(DatabaseKind kind){
        boolean simple;
        switch (kind) {
            case STAGING:
                simple = getStagingSimpleSsl();
                break;
            case JOB:
                simple = getJobSimpleSsl();
                break;
            case TRACE:
                simple = getJobSimpleSsl();
                break;
            case FINAL:
                simple = getFinalSimpleSsl();
                break;
            default:
                throw new InvalidDBOperationError(kind, "get simple ssl");
        }
        return simple;
    }

    @Override public void setSimpleSsl(DatabaseKind kind, Boolean simpleSsl) {
        switch (kind) {
            case STAGING:
                setStagingSimpleSsl(simpleSsl);
                break;
            case JOB:
                setJobSimpleSsl(simpleSsl);
                break;
            case TRACE:
                setJobSimpleSsl(simpleSsl);
                break;
            case FINAL:
                setFinalSimpleSsl(simpleSsl);
                break;
            default:
                throw new InvalidDBOperationError(kind, "set simple ssl");
        }
    }

    @Override public String getCertFile(DatabaseKind kind){
        String certFile;
        switch (kind) {
            case STAGING:
                certFile = getStagingCertFile();
                break;
            case JOB:
                certFile = getJobCertFile();
                break;
            case TRACE:
                certFile = getJobCertFile();
                break;
            case FINAL:
                certFile = getFinalCertFile();
                break;
            default:
                throw new InvalidDBOperationError(kind, "get cert file");
        }
        return certFile;
    }

    @Override public void setCertFile(DatabaseKind kind, String certFile) {
        switch (kind) {
            case STAGING:
                setStagingCertFile(certFile);
                break;
            case JOB:
                setJobCertFile(certFile);
                break;
            case TRACE:
                setJobCertFile(certFile);
                break;
            case FINAL:
                setFinalCertFile(certFile);
                break;
            default:
                throw new InvalidDBOperationError(kind, "set certificate file");
        }
    }

    @Override public String getCertPassword(DatabaseKind kind){
        String certPass;
        switch (kind) {
            case STAGING:
                certPass = getStagingCertPassword();
                break;
            case JOB:
                certPass = getJobCertPassword();
                break;
            case TRACE:
                certPass = getJobCertPassword();
                break;
            case FINAL:
                certPass = getFinalCertPassword();
                break;
            default:
                throw new InvalidDBOperationError(kind, "get cert password");
        }
        return certPass;
    }

    @Override public void setCertPass(DatabaseKind kind, String certPassword) {
        switch (kind) {
            case STAGING:
                setStagingCertPassword(certPassword);
                break;
            case JOB:
                setJobCertPassword(certPassword);
                break;
            case TRACE:
                setJobCertPassword(certPassword);
                break;
            case FINAL:
                setFinalCertPassword(certPassword);
                break;
            default:
                throw new InvalidDBOperationError(kind, "set certificate password");
        }
    }

    @Override public String getExternalName(DatabaseKind kind){
        String name;
        switch (kind) {
            case STAGING:
                name = getStagingExternalName();
                break;
            case JOB:
                name = getJobExternalName();
                break;
            case TRACE:
                name = getJobExternalName();
                break;
            case FINAL:
                name = getFinalExternalName();
                break;
            default:
                throw new InvalidDBOperationError(kind, "get external name");
        }
        return name;
    }

    @Override public void setExternalName(DatabaseKind kind, String externalName) {
        switch (kind) {
            case STAGING:
                setStagingExternalName(externalName);
                break;
            case JOB:
                setJobExternalName(externalName);
                break;
            case TRACE:
                setJobExternalName(externalName);
                break;
            case FINAL:
                setFinalExternalName(externalName);
                break;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    // roles and users
    @Override public String getFlowOperatorRoleName() {
        return flowOperatorRoleName;
    }
    @Override public void setFlowOperatorRoleName(String flowOperatorRoleName) {
        this.flowOperatorRoleName = flowOperatorRoleName;
    }

    @Override public String getFlowOperatorUserName() {
        return flowOperatorUserName;
    }
    @Override  public void setFlowOperatorUserName(String flowOperatorUserName) {
        this.flowOperatorUserName = flowOperatorUserName;
    }

    @Override public String getFlowDeveloperRoleName() {
        return flowDeveloperRoleName;
    }
    @Override public void setFlowDeveloperRoleName(String flowDeveloperRoleName) {
        this.flowDeveloperRoleName = flowDeveloperRoleName;
    }

    @Override public String getFlowDeveloperUserName() {
        return flowDeveloperUserName;
    }
    @Override  public void setFlowDeveloperUserName(String flowDeveloperUserName) {
        this.flowDeveloperUserName = flowDeveloperUserName;
    }

    @JsonIgnore
    public String getMlUsername() {
        return getUsername();
    }

    @JsonIgnore
    public String getMlPassword() {
        return getPassword();
    }

    public void setHost(String host ) {
        super.setHost(host);
        /**
         * It's not clear why HubConfig has its own 'host' property, as that's already defined on AppConfig. But since
         * getHost returns appConfig.getHost, then it follows that when setHost is called, both this class's 'host'
         * property and the AppConfig should be modified.
         */
        if (appConfig != null) {
            appConfig.setHost(host);
        } else {
            appConfig = new AppConfig();
            appConfig.setHost(host);
        }
    }

    public void setMlUsername(String mlUsername) {
        setUsername(mlUsername);
    }

    public void setMlPassword(String mlPassword) {
        setPassword(mlPassword);
    }

    @Override
    public Boolean getIsProvisionedEnvironment(){
        return isProvisionedEnvironment;
    }

    @Override
    public void setIsProvisionedEnvironment(boolean isProvisionedEnvironment) {
        this.isProvisionedEnvironment = isProvisionedEnvironment;
    }

    @Override public String getCustomForestPath() {
        return customForestPath;
    }
    public void setCustomForestPath(String customForestPath) {
        this.customForestPath = customForestPath;
    }

    @Override
    public String getEntityModelPermissions() {
        return entityModelPermissions;
    }

    @Override
    public String getFlowPermissions() {
        return flowPermissions;
    }

    @Override
    public String getMappingPermissions() {
        return mappingPermissions;
    }

    @Override
    public String getStepDefinitionPermissions() {
        return stepDefinitionPermissions;
    }

    public String getJobPermissions() {
        return jobPermissions;
    }

    public void setJobPermissions(String jobPermissions) {
        this.jobPermissions = jobPermissions;
    }


    @Override
    @Deprecated
    public String getProjectDir() {
        return requireHubProject().getProjectDirString();
    }

    @Override
    @Deprecated
    public void setProjectDir(String projectDir) {
        createProject(projectDir);
    }

    public void setEntityModelPermissions(String entityModelPermissions) {
        this.entityModelPermissions = entityModelPermissions;
    }

    public void setFlowPermissions(String flowPermissions) {
        this.flowPermissions = flowPermissions;
    }

    public void setMappingPermissions(String mappingPermissions) {
        this.mappingPermissions = mappingPermissions;
    }

    public void setStepDefinitionPermissions(String stepDefinitionPermissions) {
        this.stepDefinitionPermissions = stepDefinitionPermissions;
    }

    @JsonIgnore
    @Override  public HubProject getHubProject() {
        return this.hubProject;
    }

    public void setHubProject(HubProject hubProject) {
        this.hubProject = hubProject;
    }

    @Override  public void initHubProject() {
        if (appConfig == null) {
            appConfig = new DefaultAppConfigFactory().newAppConfig();
        }
        addDhfPropertiesToCustomTokens(appConfig);
        this.requireHubProject().init(appConfig.getCustomTokens());
    }

    @Override
    @Deprecated
    public String getHubModulesDeployTimestampFile() {
        return requireHubProject().getHubModulesDeployTimestampFile();
    }

    @Override
    @Deprecated
    public String getUserModulesDeployTimestampFile() {
        return requireHubProject().getUserModulesDeployTimestampFile();
    }

    @JsonIgnore
    public void refreshProject() {
        loadConfigurationFromProperties(null, true);
    }

    /**
     * Use this when you need to apply properties, and you likely also want to load properties from Gradle files.
     * As of 5.3.0, this is really only intended for use within QuickStart, which depends on getting properties from
     * Gradle file. All other clients likely can just call applyProperties directly.
     *
     * @param userProperties
     * @param loadGradleProperties
     */
    public void loadConfigurationFromProperties(Properties userProperties, boolean loadGradleProperties) {
        Properties gradleAndUserProperties = new Properties();

        // Add values in gradle.properties and gradle-*.properties if necessary
        if (loadGradleProperties) {
            if (logger.isInfoEnabled()) {
                logger.info("Loading properties from gradle.properties");
            }
            File file = requireHubProject().getProjectDir().resolve("gradle.properties").toFile();
            loadPropertiesFromFile(file, gradleAndUserProperties);

            if (envString != null) {
                File envPropertiesFile = requireHubProject().getProjectDir().resolve("gradle-" + envString + ".properties").toFile();
                if (envPropertiesFile != null && envPropertiesFile.exists()) {
                    if (logger.isInfoEnabled()) {
                        logger.info("Loading additional properties from " + envPropertiesFile.getAbsolutePath());
                    }
                    loadPropertiesFromFile(envPropertiesFile, gradleAndUserProperties);
                    requireHubProject().setUserModulesDeployTimestampFile(envString + "-" + USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES);
                }
            }
        }

        // Add values from userProperties
        if (userProperties != null){
            userProperties.forEach(gradleAndUserProperties::put);
        }

        applyProperties(new SimplePropertySource(gradleAndUserProperties));
    }

    @JsonIgnore
    @Override
    public ManageConfig getManageConfig() {
        return super.getManageConfig();
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
        return getAppConfig().newAppServicesDatabaseClient(getStagingDbName());
    }

    @Override
    public DatabaseClient newStagingClient() {
        return newStagingClient(getStagingDbName());
    }

    @Override
    // this method uses STAGING appserver but FINAL database.
    // it's only use is for reverse flows, which need to use staging modules.
    public DatabaseClient newReverseFlowClient() {
        return newStagingClient(getFinalDbName());
    }

    @Override
    public DatabaseClient newFinalClient() {
        return newFinalClient(getFinalDbName());
    }

    @Deprecated
    public DatabaseClient newTraceDbClient() {
        return newJobDbClient();
    }

    @JsonIgnore
    @Override public Path getModulesDir() {
        return requireHubProject().getModulesDir();
    }

    @JsonIgnore
    public Path getHubProjectDir() { return requireHubProject().getProjectDir(); }

    @JsonIgnore
    @Override public Path getHubPluginsDir() {
        return requireHubProject().getHubPluginsDir();
    }

    @JsonIgnore
    @Override public Path getHubEntitiesDir() { return requireHubProject().getHubEntitiesDir(); }

    @JsonIgnore
    @Override public Path getHubMappingsDir() { return requireHubProject().getHubMappingsDir(); }

    @JsonIgnore
    @Override
    public Path getStepDefinitionPath(StepDefinition.StepDefinitionType type) {
        return requireHubProject().getStepDefinitionPath(type);
    }

    @JsonIgnore
    @Override public Path getHubConfigDir() {
        return requireHubProject().getHubConfigDir();
    }

    @JsonIgnore
    @Override public Path getHubDatabaseDir() {
        return requireHubProject().getHubDatabaseDir();
    }

    @JsonIgnore
    @Override public Path getHubServersDir() {
        return requireHubProject().getHubServersDir();
    }

    @JsonIgnore
    @Override public Path getHubSecurityDir() {
        return requireHubProject().getHubSecurityDir();
    }

    @JsonIgnore
    @Override public Path getUserSecurityDir() {
        return requireHubProject().getUserSecurityDir();
    }

    @JsonIgnore
    @Override public Path getUserConfigDir() {
        return requireHubProject().getUserConfigDir();
    }

    @JsonIgnore
    @Override public Path getUserDatabaseDir() {
        return requireHubProject().getUserDatabaseDir();
    }

    @JsonIgnore
    @Override public Path getUserSchemasDir() { return requireHubProject().getUserSchemasDir(); }

    @JsonIgnore
    @Override public Path getEntityDatabaseDir() {
        return requireHubProject().getEntityDatabaseDir();
    }

    @Override
    public Path getFlowsDir() {
        return requireHubProject().getFlowsDir();
    }

    @Override
    public Path getStepDefinitionsDir() {
        return requireHubProject().getStepDefinitionsDir();
    }

    @JsonIgnore
    @Override public Path getUserServersDir() {
        return requireHubProject().getUserServersDir();
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
        return VersionInfo.getBuildVersion();
    }

    @Override public String getHubLogLevel() {

        return this.hubLogLevel;
    }

    /**
     * Populates the custom tokens map in the given AppConfig object. For each field, if its value is set, then that value
     * is stored in the custom tokens map. Else, an attempt is made to retrieve a value for the field from the Spring
     * Environment. Thus, the expectation is that this class is used in a Spring context where a Spring Environment
     * object is set.
     *
     * @param appConfig
     */
    protected void addDhfPropertiesToCustomTokens(AppConfig appConfig) {
        Map<String, String> customTokens = appConfig.getCustomTokens();
        customTokens.put("%%mlHost%%", appConfig.getHost());
        customTokens.put("%%mlStagingAppserverName%%", stagingHttpName);
        customTokens.put("%%mlStagingPort%%", getStagingPort().toString());
        customTokens.put("%%mlStagingDbName%%", getStagingDbName());
        customTokens.put("%%mlStagingForestsPerHost%%", stagingForestsPerHost.toString());
        customTokens.put("%%mlStagingAuth%%", getStagingAuthMethod());

        customTokens.put("%%mlFinalAppserverName%%", finalHttpName);
        customTokens.put("%%mlFinalPort%%", getFinalPort().toString());
        customTokens.put("%%mlFinalDbName%%", getFinalDbName());
        customTokens.put("%%mlFinalForestsPerHost%%", finalForestsPerHost.toString());
        customTokens.put("%%mlFinalAuth%%", getFinalAuthMethod());

        customTokens.put("%%mlJobAppserverName%%", jobHttpName);
        customTokens.put("%%mlJobPort%%", getJobPort().toString());
        customTokens.put("%%mlJobDbName%%", getJobDbName());
        customTokens.put("%%mlJobForestsPerHost%%", jobForestsPerHost.toString());
        customTokens.put("%%mlJobAuth%%", getJobAuthMethod());

        customTokens.put("%%mlModulesDbName%%", getModulesDbName());
        customTokens.put("%%mlModulesForestsPerHost%%", modulesForestsPerHost.toString());

        customTokens.put("%%mlStagingTriggersDbName%%", getStagingTriggersDbName());
        customTokens.put("%%mlStagingTriggersForestsPerHost%%", stagingTriggersForestsPerHost.toString());

        customTokens.put("%%mlFinalTriggersDbName%%", getFinalTriggersDbName());
        customTokens.put("%%mlFinalTriggersForestsPerHost%%", finalTriggersForestsPerHost.toString());

        customTokens.put("%%mlStagingSchemasDbName%%", getStagingSchemasDbName());
        customTokens.put("%%mlStagingSchemasForestsPerHost%%", stagingSchemasForestsPerHost.toString());

        customTokens.put("%%mlFinalSchemasDbName%%", getFinalSchemasDbName());
        customTokens.put("%%mlFinalSchemasForestsPerHost%%", finalSchemasForestsPerHost.toString());

        customTokens.put("%%mlFlowOperatorRole%%", flowOperatorRoleName);
        customTokens.put("%%mlFlowOperatorUserName%%", flowOperatorUserName);

        customTokens.put("%%mlFlowDeveloperRole%%", flowDeveloperRoleName);
        customTokens.put("%%mlFlowDeveloperUserName%%", flowDeveloperUserName);

        RandomStringGenerator randomStringGenerator = new RandomStringGenerator.Builder().withinRange(33, 126).filteredBy((CharacterPredicate) codePoint -> (codePoint != 92 && codePoint != 34)).build();
        if (StringUtils.hasText(flowOperatorPasswordFromProperties)) {
            customTokens.put("%%mlFlowOperatorPassword%%", flowOperatorPasswordFromProperties);
        } else {
            customTokens.put("%%mlFlowOperatorPassword%%", randomStringGenerator.generate(20));
        }
        if (StringUtils.hasText(flowDeveloperPasswordFromProperties)) {
            customTokens.put("%%mlFlowDeveloperPassword%%", flowDeveloperPasswordFromProperties);
        } else {
            customTokens.put("%%mlFlowDeveloperPassword%%", randomStringGenerator.generate(20));
        }

        customTokens.put("%%mlJobPermissions%%", jobPermissions);
        customTokens.put("%%mlFlowPermissions%%", flowPermissions);
        customTokens.put("%%mlEntityModelPermissions%%", entityModelPermissions);
        customTokens.put("%%mlStepDefinitionPermissions%%", stepDefinitionPermissions);

        customTokens.put("%%mlCustomForestPath%%", customForestPath);

        //logging level of hub debug messages
        customTokens.put("%%mlHubLogLevel%%", hubLogLevel);
    }

    /**
     * Makes DHF-specific updates to the AppConfig, after it's been constructed by ml-gradle.
     *
     * @param config
     */
    private void updateAppConfig(AppConfig config) {
        final String superHost = super.getHost();
        if (superHost != null) {
            config.setHost(superHost);
        }

        // If the user hasn't set the app name then override it to "DHF" instead of "my-app"
        if ("my-app".equals(config.getName())) {
            config.setName("DHF");
        }

        // DHF never needs the default REST server provided by ml-gradle
        config.setNoRestServer(true);

        applyFinalConnectionSettingsToMlGradleDefaultRestSettings(config);

        config.setTriggersDatabaseName(getFinalTriggersDbName());
        config.setSchemasDatabaseName(getFinalSchemasDbName());
        config.setModulesDatabaseName(getModulesDbName());
        config.setContentDatabaseName(getFinalDbName());

        config.setReplaceTokensInModules(true);
        config.setUseRoxyTokenPrefix(false);
        config.setModulePermissions(getModulePermissions());

        if (envString != null) {
            String defaultPath = config.getModuleTimestampsPath();
            int index = defaultPath.lastIndexOf("/") + 1;
            config.setModuleTimestampsPath(defaultPath.substring(0, index) + envString + "-" + defaultPath.substring(index));
        }

        Map<String, Integer> forestCounts = config.getForestCounts();
        forestCounts.put(getJobDbName(), jobForestsPerHost);
        forestCounts.put(getModulesDbName(), modulesForestsPerHost);
        forestCounts.put(getStagingDbName(), stagingForestsPerHost);
        forestCounts.put(getStagingTriggersDbName(), stagingTriggersForestsPerHost);
        forestCounts.put(getStagingSchemasDbName(), stagingSchemasForestsPerHost);
        forestCounts.put(getFinalDbName(), finalForestsPerHost);
        forestCounts.put(getFinalTriggersDbName(), finalTriggersForestsPerHost);
        forestCounts.put(getFinalSchemasDbName(), finalSchemasForestsPerHost);
        config.setForestCounts(forestCounts);

        // In Hub Central, a HubProject will not exist, so no need to do these things
        if (hubProject != null) {
            initializeConfigDirs(config);
            initializeModulePaths(config);
            config.setSchemaPaths(List.of(getUserSchemasDir().toString()));
        }

        addDhfPropertiesToCustomTokens(config);

        String version = getJarVersion();
        config.getCustomTokens().put("%%mlHubVersion%%", version);

        appConfig = config;
    }

    /**
     * ml-app-deployer defaults to a single config path of src/main/ml-config. If that's still the only path present,
     * it's overridden with the DHF defaults - src/main/hub-internal-config first, then src/main/ml-config second, with
     * both of those being relative to the DHF project directory.
     *
     * But if the config paths have been customized - most likely via mlConfigPaths in gradle.properties - then this
     * method just ensures that they're relative to the DHF project directory.
     *
     * @param config an AppConfig object
     */
    protected void initializeConfigDirs(AppConfig config) {
        final String defaultConfigPath = String.join(File.separator, "src", "main", "ml-config");

        boolean configDirsIsSetToTheMlAppDeployerDefault = config.getConfigDirs().size() == 1 && config.getConfigDirs().get(0).getBaseDir().toString().endsWith(defaultConfigPath);

        if (configDirsIsSetToTheMlAppDeployerDefault) {
            List<ConfigDir> configDirs = new ArrayList<>();
            configDirs.add(new ConfigDir(getHubConfigDir().toFile()));
            configDirs.add(new ConfigDir(getUserConfigDir().toFile()));
            config.setConfigDirs(configDirs);
        }
        else {
            // Need to make each custom config dir relative to the project dir
            List<ConfigDir> configDirs = new ArrayList<>();
            for (ConfigDir configDir : config.getConfigDirs()) {
                File f = getHubProject().getProjectDir().resolve(configDir.getBaseDir().toString()).normalize().toAbsolutePath().toFile();
                configDirs.add(new ConfigDir(f));
            }
            config.setConfigDirs(configDirs);
        }

        if (logger.isInfoEnabled()) {
            config.getConfigDirs().forEach(configDir -> logger.info("Config path: " + configDir.getBaseDir().getAbsolutePath()));
        }
    }

    /**
     * Need to initialize every module path as being relative to the current project directory.
     *
     * @param config an AppConfig object
     */
    protected void initializeModulePaths(AppConfig config) {
        List<String> modulePaths = new ArrayList<>();
        Path projectDir = getHubProject().getProjectDir();
        for (String modulePath : config.getModulePaths()) {
            modulePaths.add(projectDir.resolve(modulePath).normalize().toAbsolutePath().toString());
        }
        config.setModulePaths(modulePaths);
        if (logger.isInfoEnabled()) {
            logger.info("Module paths: " + modulePaths);
        }
    }

    /**
     * This is needed so that mlFinal* properties that configure the connection to the final REST server are also used
     * for any feature in ml-gradle that expects to use the same mlRest* properties. For example, LoadModulesCommand
     * uses those properties to construct a DatabaseClient for loading modules; we want to ensure that the properties
     * mirror the mlFinal* properties.
     *
     * @param config
     */
    private void applyFinalConnectionSettingsToMlGradleDefaultRestSettings(AppConfig config) {
        if (getFinalAuthMethod() != null) {
            config.setRestSecurityContextType(SecurityContextType.valueOf(getFinalAuthMethod().toUpperCase()));
        }
        if (Boolean.TRUE.equals(isProvisionedEnvironment)) {
            config.setRestConnectionType(DatabaseClient.ConnectionType.GATEWAY);
            config.setAppServicesConnectionType(DatabaseClient.ConnectionType.GATEWAY);
        }
        config.setRestPort(getFinalPort());
        config.setRestCertFile(getFinalCertFile());
        config.setRestCertPassword(getFinalCertPassword());
        config.setRestExternalName(getFinalExternalName());
        config.setRestSslContext(getFinalSslContext());
        config.setRestSslHostnameVerifier(getFinalSslHostnameVerifier());
        config.setRestTrustManager(getFinalTrustManager());
    }

    @JsonIgnore
    public String getInfo()
    {

        try {
            return new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(this);
        }
        catch(Exception e)
        {
            throw new DataHubConfigurationException("Your datahub configuration could not serialize");

        }

    }

    /**
     * It is not expected that a client would use this, as it would be partially re-inventing what the Gradle
     * properties plugin does. But it is being preserved for backwards compatibility in case any clients prior to
     * 4.1 were using HubConfigBuilder.withPropertiesFromEnvironment.
     *
     * @param environment a string name for environment
     * @return a hubconfig object
     */
    @JsonIgnore
    public HubConfig withPropertiesFromEnvironment(String environment) {
        this.envString = environment;
        requireHubProject().setUserModulesDeployTimestampFile(envString + "-" + USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES);
        return this;
    }

    // TODO Can try HubInfoTask to see what this returns
    public String toString() {
        return getInfo();
    }

    // loads properties from a .properties file
    private void loadPropertiesFromFile(File propertiesFile, Properties loadedProperties) {
        InputStream is;
        try {
            if (propertiesFile.exists()) {
                is = new FileInputStream(propertiesFile);
                loadedProperties.load(is);
                is.close();
            }
        }
        catch (IOException e) {
            throw new DataHubProjectException("No properties file found in project " + requireHubProject().getProjectDirString());
        }
    }

    /**
     * Applies values that, prior to 5.3.0, were stored in the dhf-defaults.properties file that was available from the
     * classpath. Note that this only applies property values to "simple" properties of this class - it does not
     * instantiate, but rather nulls out, the AppConfig, AdminConfig, ManageConfig, AdminManager, and ManageClient
     * properties of this class. The expectation that is that applyProperties must be invoked in order for an instance
     * of this class to be truly usable - in particular, so that a username/password can be provided so that connections
     * can be made to various ML interfaces.
     */
    public void applyDefaultPropertyValues() {
        super.applyDefaultPropertyValues();
        appConfig = null;
        adminConfig = null;
        adminManager = null;
        manageClient = null;

        hubLogLevel = "default";
        isProvisionedEnvironment = false;

        stagingHttpName = "data-hub-STAGING";
        stagingForestsPerHost = 3;

        finalHttpName = "data-hub-FINAL";
        finalForestsPerHost = 3;

        jobHttpName = "data-hub-JOBS";
        jobForestsPerHost = 4;

        modulesForestsPerHost = 1;
        stagingTriggersForestsPerHost = 1;
        finalTriggersForestsPerHost = 1;
        stagingSchemasForestsPerHost = 1;
        finalSchemasForestsPerHost = 1;

        flowOperatorRoleName = "flow-operator-role";
        flowOperatorUserName = "flow-operator";
        flowDeveloperRoleName = "flow-developer-role";
        flowDeveloperUserName = "flow-developer";

        customForestPath = "forests";

        applyDefaultPermissionPropertyValues();
    }

    /**
     * This is called by applyDefaultPropertyValues, but is separate for testing purposes.
     */
    public void applyDefaultPermissionPropertyValues() {
        entityModelPermissions = "data-hub-entity-model-reader,read,data-hub-entity-model-writer,update";
        mappingPermissions = "data-hub-mapping-reader,read,data-hub-mapping-writer,update";
        stepDefinitionPermissions = "data-hub-step-definition-reader,read,data-hub-step-definition-writer,update";
        flowPermissions = "data-hub-flow-reader,read,data-hub-flow-writer,update";
        jobPermissions = "data-hub-job-reader,read,data-hub-job-internal,update";
    }

    /**
     * Defines functions for consuming properties from a PropertySource. This differs substantially from
     * loadConfigurationFromProperties, as that function's behavior depends on whether a field has a value or not.
     */
    protected void initializePropertyConsumerMap() {
        super.initializePropertyConsumerMap();

        // These "convenience" properties set applied first so that the property values can still be overridden via the
        // property keys specific to them
        getPropertyConsumerMap().put("hubDhs", prop -> {
            if (Boolean.parseBoolean(prop)) {
                configureForDhs();
                isProvisionedEnvironment = true;
                appConfig.setAppServicesPort(8010);
                appConfig.setAppServicesSecurityContextType(SecurityContextType.BASIC);
                appConfig.setAppServicesSslContext(null);
                appConfig.setAppServicesSslHostnameVerifier(null);
                appConfig.setAppServicesTrustManager(null);
            }
        });

        getPropertyConsumerMap().put("hubSsl", prop -> {
            if (Boolean.parseBoolean(prop)) {
                configureSimpleSsl();
                appConfig.setSimpleSslConfig();
                appConfig.setAppServicesSimpleSslConfig();
            }
        });

        getPropertyConsumerMap().put("mlHost", prop -> setHost(prop));
        getPropertyConsumerMap().put("mlIsProvisionedEnvironment", prop -> isProvisionedEnvironment = Boolean.parseBoolean(prop));

        getPropertyConsumerMap().put("mlStagingAppserverName", prop -> stagingHttpName = prop);
        getPropertyConsumerMap().put("mlStagingForestsPerHost", prop -> stagingForestsPerHost = Integer.parseInt(prop));

        getPropertyConsumerMap().put("mlFinalAppserverName", prop -> finalHttpName = prop);
        getPropertyConsumerMap().put("mlFinalForestsPerHost", prop -> finalForestsPerHost = Integer.parseInt(prop));

        getPropertyConsumerMap().put("mlJobAppserverName", prop -> jobHttpName = prop);
        getPropertyConsumerMap().put("mlJobForestsPerHost", prop -> jobForestsPerHost = Integer.parseInt(prop));

        getPropertyConsumerMap().put("mlModulesForestsPerHost", prop -> modulesForestsPerHost = Integer.parseInt(prop));

        getPropertyConsumerMap().put("mlStagingTriggersForestsPerHost", prop -> stagingTriggersForestsPerHost = Integer.parseInt(prop));
        getPropertyConsumerMap().put("mlStagingSchemasForestsPerHost", prop -> stagingSchemasForestsPerHost = Integer.parseInt(prop));

        getPropertyConsumerMap().put("mlFinalTriggersForestsPerHost", prop -> finalTriggersForestsPerHost = Integer.parseInt(prop));
        getPropertyConsumerMap().put("mlFinalSchemasForestsPerHost", prop -> finalSchemasForestsPerHost = Integer.parseInt(prop));

        getPropertyConsumerMap().put("mlCustomForestPath", prop -> customForestPath = prop);

        getPropertyConsumerMap().put("mlFlowOperatorRole", prop -> flowOperatorRoleName = prop);
        getPropertyConsumerMap().put("mlFlowOperatorUserName", prop -> flowOperatorUserName = prop);
        getPropertyConsumerMap().put("mlFlowOperatorPassword", prop -> flowOperatorPasswordFromProperties = prop);
        getPropertyConsumerMap().put("mlFlowDeveloperRole", prop -> flowDeveloperRoleName = prop);
        getPropertyConsumerMap().put("mlFlowDeveloperUserName", prop -> flowDeveloperUserName = prop);
        getPropertyConsumerMap().put("mlFlowDeveloperPassword", prop -> flowDeveloperPasswordFromProperties = prop);

        getPropertyConsumerMap().put("mlHubLogLevel", prop -> hubLogLevel = prop);

        getPropertyConsumerMap().put("mlEntityModelPermissions", prop -> entityModelPermissions = prop);
        getPropertyConsumerMap().put("mlFlowPermissions", prop -> flowPermissions = prop);
        getPropertyConsumerMap().put("mlJobPermissions", prop -> jobPermissions = prop);
        getPropertyConsumerMap().put("mlMappingPermissions", prop -> mappingPermissions = prop);
        getPropertyConsumerMap().put("mlStepDefinitionPermissions", prop -> stepDefinitionPermissions = prop);
    }

    /**
     *
     * @return
     */
    public HubClient newHubClient() {
        return new HubClientImpl(this);
    }
}
