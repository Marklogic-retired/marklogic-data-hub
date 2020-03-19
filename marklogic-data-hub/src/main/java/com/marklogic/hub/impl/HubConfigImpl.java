/*
 * Copyright 2012-2019 MarkLogic Corporation
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
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.error.InvalidDBOperationError;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.mgmt.DefaultManageConfigFactory;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.function.Consumer;

@JsonAutoDetect(
    fieldVisibility = JsonAutoDetect.Visibility.PROTECTED_AND_PUBLIC,
    getterVisibility = JsonAutoDetect.Visibility.ANY,
    setterVisibility = JsonAutoDetect.Visibility.ANY)
@Component
@PropertySource({"classpath:dhf-defaults.properties"})
public class HubConfigImpl implements HubConfig
{
    @Autowired
    private HubProject hubProject;

    @Autowired
    private Environment environment;

    // a set of properties to use for legacy token replacement.
    Properties projectProperties = null;

    protected String host;

    protected String stagingDbName;
    protected String stagingHttpName;
    protected Integer stagingForestsPerHost;
    protected Integer stagingPort;
    protected String stagingAuthMethod;
    private Boolean stagingSimpleSsl;

    private SSLContext stagingSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier;
    private String stagingCertFile;
    private String stagingCertPassword;
    private String stagingExternalName;
    private X509TrustManager stagingTrustManager;


    protected String finalDbName;
    protected String finalHttpName;
    protected Integer finalForestsPerHost;
    protected Integer finalPort;
    protected String finalAuthMethod;

    private Boolean finalSimpleSsl;
    private SSLContext finalSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier;
    private String finalCertFile;
    private String finalCertPassword;
    private String finalExternalName;
    private X509TrustManager finalTrustManager;


    protected String jobDbName;
    protected String jobHttpName;
    protected Integer jobForestsPerHost;
    protected Integer jobPort;
    protected String jobAuthMethod;

    private Boolean jobSimpleSsl;
    private SSLContext jobSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier;
    private String jobCertFile;
    private String jobCertPassword;
    private String jobExternalName;
    private X509TrustManager jobTrustManager;


    protected String modulesDbName;
    protected Integer modulesForestsPerHost;
    protected String stagingTriggersDbName;
    protected Integer stagingTriggersForestsPerHost;
    protected String finalTriggersDbName;
    protected Integer finalTriggersForestsPerHost;
    protected String stagingSchemasDbName;
    protected Integer stagingSchemasForestsPerHost;
    protected String finalSchemasDbName;
    protected Integer finalSchemasForestsPerHost;


    private String flowOperatorRoleName;
    private String flowOperatorUserName;

    private String flowDeveloperRoleName;
    private String flowDeveloperUserName;

    private String DHFVersion;

    private String hubLogLevel;

    // these hold runtime credentials for flows.
    private String mlUsername = null;
    private String mlPassword = null;

    private String loadBalancerHost;
    private Boolean isHostLoadBalancer;

    private Boolean isProvisionedEnvironment;

    protected String customForestPath;

    protected String modulePermissions;

    private String mappingPermissions;
    private String flowPermissions;
    private String stepDefinitionPermissions;
    private String entityModelPermissions;
    private String jobPermissions;

    private ManageConfig manageConfig;
    private ManageClient manageClient;
    private AdminConfig adminConfig;
    private AdminManager adminManager;

    private AppConfig appConfig;

    private static final Logger logger = LoggerFactory.getLogger(HubConfigImpl.class);

    // By default, DHF uses gradle-local.properties for your local environment.
    private String envString = "local";

    // Defines functions for consuming properties from a PropertySource
    private Map<String, Consumer<String>> propertyConsumerMap;

    /**
     * No-arg constructor that does not initialize any HubConfigImpl property values. The expectation is that these will
     * be set via a Spring Environment.
     */
    public HubConfigImpl() {
        projectProperties = new Properties();
    }

    /**
     * Constructor for when using this object outside of a Spring container, but a HubProject and Spring Environment are
     * still needed.
     *
     * @param hubProject
     * @param environment
     */
    public HubConfigImpl(HubProject hubProject, Environment environment) {
        this();
        this.hubProject = hubProject;
        this.environment = environment;
    }

    /**
     * Static method for a new instance of HubConfigImpl based on default DHF property values with no dependency on
     * Spring or on project files. The no-arg constructor is already reserved for use within a Spring container, where
     * default values are expected to be set via the Spring Environment.
     *
     * @return
     */
    public static HubConfigImpl withDefaultProperties() {
        HubConfigImpl hubConfig = new HubConfigImpl();
        hubConfig.applyDefaultProperties();
        return hubConfig;
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
        applyDefaultProperties();
        setHost(host);
        setMlUsername(mlUsername);
        setMlPassword(mlPassword);
    }

    /**
     * When this class is not used in a Spring environment, this method is used to apply properties for the
     * dhf-defaults.properties file to initialize an instance of this class.
     */
    public void applyDefaultProperties() {
        Properties props = new Properties();
        try {
            props.load(new ClassPathResource("dhf-defaults.properties").getInputStream());
        } catch (IOException ex) {
            throw new RuntimeException("Unable to initialize HubConfigImpl; could not find dhf-defaults.properties on the classpath; cause: " + ex.getMessage(), ex);
        }
        applyProperties(new SimplePropertySource(props));
    }

    /**
     * Applies properties in the given property source to this instance. This allows for an instance of HubConfigImpl
     * to be populated via properties from any source, such as a command line program or an external orchestration tool,
     * as opposed to just from a Spring Environment.
     *
     * Note that this differs substantially from how loadConfigurationFromProperties works. That function's behavior
     * depends on whether a field has a value or not. This method is intended to set a field's value regardless of
     * whether it has a value or not.
     *
     * @param propertySource
     */
    public void applyProperties(com.marklogic.mgmt.util.PropertySource propertySource) {
        if (propertyConsumerMap == null) {
            // This is necessary because some old DHF tests "reset" all the properties in the HubConfigImpl object,
            // which results in propertyConsumerMap being nulled out. In the real world, it's unlikely that
            // propertyConsumerMap will ever be null after an instance of this class is instantiated.
            initializePropertyConsumerMap();
        }

        for (String propertyName : propertyConsumerMap.keySet()) {
            String value = propertySource.getProperty(propertyName);
            if (value != null) {
                propertyConsumerMap.get(propertyName).accept(value);
            }
        }

        hydrateConfigs();
    }

    protected HubProject requireHubProject() {
        Assert.notNull(hubProject, "A HubProject has not been set, and thus this operation cannot be performed");
        return hubProject;
    }

    public void createProject(String projectDirString) {
        requireHubProject().createProject(projectDirString);
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
            case STAGING_MODULES:
                name = modulesDbName;
                break;
            case FINAL_MODULES:
                name = modulesDbName;
                break;
            case STAGING_TRIGGERS:
                name = stagingTriggersDbName;
                break;
            case FINAL_TRIGGERS:
                name = finalTriggersDbName;
                break;
            case STAGING_SCHEMAS:
                name = stagingSchemasDbName;
                break;
            case FINAL_SCHEMAS:
                name = finalSchemasDbName;
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
            case STAGING_MODULES:
                modulesDbName = dbName;
                break;
            case FINAL_MODULES:
                modulesDbName = dbName;
                break;
            case STAGING_TRIGGERS:
                stagingTriggersDbName = dbName;
                break;
            case FINAL_TRIGGERS:
                finalTriggersDbName = dbName;
                break;
            case STAGING_SCHEMAS:
                stagingSchemasDbName = dbName;
                break;
            case FINAL_SCHEMAS:
                finalSchemasDbName = dbName;
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
            case JOB:
                sslContext = this.jobSslContext;
                break;
            case TRACE:
                sslContext = this.jobSslContext;
                break;
            case FINAL:
                sslContext = this.finalSslContext;
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
            case JOB:
                this.jobSslContext = sslContext;
                break;
            case TRACE:
                this.jobSslContext = sslContext;
                break;
            case FINAL:
                this.finalSslContext = sslContext;
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
            case JOB:
                sslHostnameVerifier = this.jobSslHostnameVerifier;
                break;
            case TRACE:
                sslHostnameVerifier = this.jobSslHostnameVerifier;
                break;
            case FINAL:
                sslHostnameVerifier = this.finalSslHostnameVerifier;
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
            case JOB:
                this.jobSslHostnameVerifier = sslHostnameVerifier;
                break;
            case TRACE:
                this.jobSslHostnameVerifier = sslHostnameVerifier;
                break;
            case FINAL:
                this.finalSslHostnameVerifier = sslHostnameVerifier;
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

    public X509TrustManager getTrustManager(DatabaseKind kind) {
        switch (kind) {
            case STAGING:
                return this.stagingTrustManager;
            case JOB:
                return this.jobTrustManager;
            case FINAL:
                return this.finalTrustManager;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    @Override
    public void setTrustManager(DatabaseKind kind, X509TrustManager trustManager) {
        switch (kind) {
            case STAGING:
                this.stagingTrustManager = trustManager;
                break;
            case JOB:
                this.jobTrustManager = trustManager;
                break;
            case FINAL:
                this.finalTrustManager = trustManager;
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
                simple = this.stagingSimpleSsl;
                break;
            case JOB:
                simple = this.jobSimpleSsl;
                break;
            case TRACE:
                simple = this.jobSimpleSsl;
                break;
            case FINAL:
                simple = this.finalSimpleSsl;
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
            case JOB:
                this.jobSimpleSsl = simpleSsl;
                break;
            case TRACE:
                this.jobSimpleSsl = simpleSsl;
                break;
            case FINAL:
                this.finalSimpleSsl = simpleSsl;
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
            case JOB:
                certFile = this.jobCertFile;
                break;
            case TRACE:
                certFile = this.jobCertFile;
                break;
            case FINAL:
                certFile = this.finalCertFile;
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
            case JOB:
                this.jobCertFile = certFile;
                break;
            case TRACE:
                this.jobCertFile = certFile;
                break;
            case FINAL:
                this.finalCertFile = certFile;
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
            case JOB:
                certPass = this.jobCertPassword;
                break;
            case TRACE:
                certPass = this.jobCertPassword;
                break;
            case FINAL:
                certPass = this.finalCertPassword;
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
            case JOB:
                this.jobCertPassword = certPassword;
                break;
            case TRACE:
                this.jobCertPassword = certPassword;
                break;
            case FINAL:
                this.finalCertPassword = certPassword;
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
            case JOB:
                name = this.jobExternalName;
                break;
            case TRACE:
                name = this.jobExternalName;
                break;
            case FINAL:
                name = this.finalExternalName;
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
            case JOB:
                this.jobExternalName = externalName;
                break;
            case TRACE:
                this.jobExternalName = externalName;
                break;
            case FINAL:
                this.finalExternalName = externalName;
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

    // impl only pending refactor to Flow Component
    @JsonIgnore
    public String getMlUsername() {
        return mlUsername;
    }
    // impl only pending refactor to Flow Component
    @JsonIgnore
    public String getMlPassword() {
        return mlPassword;
    }

    public void setHost(String host ) {
        this.host = host;
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
        this.mlUsername = mlUsername;
    }

    public void setMlPassword(String mlPassword) {
        this.mlPassword = mlPassword;
    }



    @JsonIgnore
    @Override  public String getLoadBalancerHost() {
        return loadBalancerHost;
    }

    @Override
    public Boolean getIsHostLoadBalancer(){
        return isHostLoadBalancer;
    }

    @Override
    public Boolean getIsProvisionedEnvironment(){
        return isProvisionedEnvironment;
    }

    @Override
    public void setIsProvisionedEnvironment(boolean isProvisionedEnvironment) {
        this.isProvisionedEnvironment = isProvisionedEnvironment;
    }

    public void setLoadBalancerHost(String loadBalancerHost) {
        this.loadBalancerHost = loadBalancerHost;
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

    public void setModulePermissions(String modulePermissions) {
        this.modulePermissions = modulePermissions;
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

    /**
     * After setting properties, this method must be invoked to instantiate SSL objects in case any of the SSL-related
     * properties have been set to true.
     */
    public void hydrateConfigs() {
        if (stagingSimpleSsl != null && stagingSimpleSsl) {
            stagingSslContext = SimpleX509TrustManager.newSSLContext();
            stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            stagingTrustManager = new SimpleX509TrustManager();
        }
        if (finalSimpleSsl != null && finalSimpleSsl) {
            finalSslContext = SimpleX509TrustManager.newSSLContext();
            finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            finalTrustManager = new SimpleX509TrustManager();
        }
        if (jobSimpleSsl != null && jobSimpleSsl) {
            jobSslContext = SimpleX509TrustManager.newSSLContext();
            jobSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            jobTrustManager = new SimpleX509TrustManager();
        }
        if (isHostLoadBalancer != null){
            if (isHostLoadBalancer) {
                if (host != null && loadBalancerHost != null){
                    logger.warn("\"mlLoadBalancerHosts\" is a deprecated property. When \"mlIsHostLoadBalancer\" is set to \"true\"properties, the value specified for \"mlHost\" will be used as the load balancer.");
                    if (!host.equals(loadBalancerHost)) {
                        throw new DataHubConfigurationException("\"mlLoadBalancerHosts\" must be the same as \"mlHost\"");
                    }
                    else {
                        loadBalancerHost = host;
                    }
                }
            }
            else {
                if (loadBalancerHost != null){
                    throw new DataHubConfigurationException("\"mlIsHostLoadBalancer\" must not be false if you are using \"mlLoadBalancerHosts\"");
                }
            }
        }
        else{
            if (host != null && loadBalancerHost != null){
                if (!host.equals(loadBalancerHost)) {
                    throw new DataHubConfigurationException("\"mlLoadBalancerHosts\" must be the same as \"mlHost\"");
                }
                else {
                    isHostLoadBalancer = true;
                    loadBalancerHost = host;
                }
            }
            else {
                isHostLoadBalancer = false;
            }
        }
    }

    @JsonIgnore
    public void refreshProject() {
        loadConfigurationFromProperties(null, true);
    }

    /**
     * Expected to be used when an instance of this class is managed by a Spring container, as it depends on a Spring
     * environment object being set.
     *
     * This method also operates in one of two ways for each field. If a field value is null, it is set based on the
     * value in the incoming Properties object, or based on the Spring environment as a fallback. But if the field value
     * is already set, then its value is stored in the class's projectProperties field.
     *
     * @param properties
     * @param loadGradleProperties
     */
    public void loadConfigurationFromProperties(Properties properties, boolean loadGradleProperties) {
        if (environment == null) {
            throw new RuntimeException("Unable to load configuration from properties, the Spring environment object is null");
        }

        projectProperties = new Properties();

        /**
         * The primary use case for this block of code is when an instance of this class is used in the QuickStart
         * application, where properties are read from a Gradle properties file but Gradle itself is not used. In a
         * Gradle environment, properties will have already been loaded and processed by the Gradle properties plugin,
         * and they should be in the incoming Properties object.
         */
        if (loadGradleProperties) {
            if (logger.isInfoEnabled()) {
                logger.info("Loading properties from gradle.properties");
            }
            File file = requireHubProject().getProjectDir().resolve("gradle.properties").toFile();
            loadPropertiesFromFile(file, projectProperties);

            if (envString != null) {
                File envPropertiesFile = requireHubProject().getProjectDir().resolve("gradle-" + envString + ".properties").toFile();
                if (envPropertiesFile != null && envPropertiesFile.exists()) {
                    if (logger.isInfoEnabled()) {
                        logger.info("Loading additional properties from " + envPropertiesFile.getAbsolutePath());
                    }
                    loadPropertiesFromFile(envPropertiesFile, projectProperties);
                    requireHubProject().setUserModulesDeployTimestampFile(envString + "-" + USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES);
                }
            }
        }

        if (properties != null){
            properties.forEach(projectProperties::put);
        }

        if (host == null) {
            // Can't call setHost here because the AppConfig needs to be "hydrated", which will happen later in this method
            host = getEnvPropString(projectProperties, "mlHost", environment.getProperty("mlHost"));
        }
        else {
            projectProperties.setProperty("mlHost", host);
        }

        if (stagingDbName == null) {
            stagingDbName = getEnvPropString(projectProperties, "mlStagingDbName", environment.getProperty("mlStagingDbName"));
        }
        else {
            projectProperties.setProperty("mlStagingDbName", stagingDbName);
        }

        if (stagingHttpName == null) {
            stagingHttpName = getEnvPropString(projectProperties, "mlStagingAppserverName", environment.getProperty("mlStagingAppserverName"));
        }
        else {
            projectProperties.setProperty("mlStagingAppserverName", stagingHttpName);
        }

        if (stagingForestsPerHost == null) {
            stagingForestsPerHost = getEnvPropInteger(projectProperties, "mlStagingForestsPerHost", Integer.parseInt(environment.getProperty("mlStagingForestsPerHost")));
        }
        else {
            projectProperties.setProperty("mlStagingForestsPerHost", stagingForestsPerHost.toString());
        }

        if (stagingPort == null) {
            stagingPort = getEnvPropInteger(projectProperties, "mlStagingPort", Integer.parseInt(environment.getProperty("mlStagingPort")));
        }
        else {
            projectProperties.setProperty("mlStagingPort", stagingPort.toString());
        }

        if (stagingAuthMethod == null) {
            stagingAuthMethod = getEnvPropString(projectProperties, "mlStagingAuth", environment.getProperty("mlStagingAuth"));
        }
        else {
            projectProperties.setProperty("mlStagingAuth", stagingAuthMethod);
        }

        if (stagingSimpleSsl == null) {
            stagingSimpleSsl = getEnvPropBoolean(projectProperties, "mlStagingSimpleSsl", false);
        }
        else {
            projectProperties.setProperty("mlStagingSimpleSsl", stagingSimpleSsl.toString());
        }

        if (stagingCertFile == null) {
            stagingCertFile = getEnvPropString(projectProperties, "mlStagingCertFile", stagingCertFile);
        }
        else {
            projectProperties.setProperty("mlStagingCertFile", stagingCertFile);
        }

        if (stagingCertPassword == null) {
            stagingCertPassword = getEnvPropString(projectProperties, "mlStagingCertPassword", stagingCertPassword);
        }
        else {
            projectProperties.setProperty("mlStagingCertPassword", stagingCertPassword);
        }

        if (stagingExternalName == null) {
            stagingExternalName = getEnvPropString(projectProperties, "mlStagingExternalName", stagingExternalName);
        }
        else {
            projectProperties.setProperty("mlStagingExternalName", stagingExternalName);
        }


        if (finalDbName == null) {
            finalDbName = getEnvPropString(projectProperties, "mlFinalDbName", environment.getProperty("mlFinalDbName"));
        }
        else {
            projectProperties.setProperty("mlFinalDbName", finalDbName);
        }

        if (finalHttpName == null) {
            finalHttpName = getEnvPropString(projectProperties, "mlFinalAppserverName", environment.getProperty("mlFinalAppserverName"));
        }
        else {
            projectProperties.setProperty("mlFinalAppserverName", finalHttpName);
        }

        if (finalForestsPerHost == null) {
            finalForestsPerHost = getEnvPropInteger(projectProperties, "mlFinalForestsPerHost", Integer.parseInt(environment.getProperty("mlFinalForestsPerHost")));
        }
        else {
            projectProperties.setProperty("mlFinalForestsPerHost", finalForestsPerHost.toString());
        }

        if (finalPort == null) {
            finalPort = getEnvPropInteger(projectProperties, "mlFinalPort", Integer.parseInt(environment.getProperty("mlFinalPort")));
        }
        else {
            projectProperties.setProperty("mlFinalPort", finalPort.toString());
        }

        if (finalAuthMethod == null) {
            finalAuthMethod = getEnvPropString(projectProperties, "mlFinalAuth", environment.getProperty("mlFinalAuth"));
        }
        else {
            projectProperties.setProperty("mlFinalAuth", finalAuthMethod);
        }

        if (finalSimpleSsl == null) {
            finalSimpleSsl = getEnvPropBoolean(projectProperties, "mlFinalSimpleSsl", false);
        }
        else {
            projectProperties.setProperty("mlFinalSimpleSsl", finalSimpleSsl.toString());
        }

        if (finalCertFile == null) {
            finalCertFile = getEnvPropString(projectProperties, "mlFinalCertFile", finalCertFile);
        }
        else {
            projectProperties.setProperty("mlFinalCertFile", finalCertFile);
        }

        if (finalCertPassword == null) {
            finalCertPassword = getEnvPropString(projectProperties, "mlFinalCertPassword", finalCertPassword);
        }
        else {
            projectProperties.setProperty("mlFinalCertPassword", finalCertPassword);
        }

        if (finalExternalName == null) {
            finalExternalName = getEnvPropString(projectProperties, "mlFinalExternalName", finalExternalName);
        }
        else {
            projectProperties.setProperty("mlFinalExternalName", finalExternalName);
        }

        if (jobDbName == null) {
            jobDbName = getEnvPropString(projectProperties, "mlJobDbName", environment.getProperty("mlJobDbName"));
        }
        else {
            projectProperties.setProperty("mlJobDbName", jobDbName);
        }

        if (jobHttpName == null) {
            jobHttpName = getEnvPropString(projectProperties, "mlJobAppserverName", environment.getProperty("mlJobAppserverName"));
        }
        else {
            projectProperties.setProperty("mlJobAppserverName", jobHttpName);
        }

        if (jobForestsPerHost == null) {
            jobForestsPerHost = getEnvPropInteger(projectProperties, "mlJobForestsPerHost", Integer.parseInt(environment.getProperty("mlJobForestsPerHost")));
        }
        else {
            projectProperties.setProperty("mlJobForestsPerHost", jobForestsPerHost.toString());
        }

        if (jobPort == null) {
            jobPort = getEnvPropInteger(projectProperties, "mlJobPort", Integer.parseInt(environment.getProperty("mlJobPort")));
        }
        else {
            projectProperties.setProperty("mlJobPort", jobPort.toString());
        }

        if (jobAuthMethod == null) {
            jobAuthMethod = getEnvPropString(projectProperties, "mlJobAuth", environment.getProperty("mlJobAuth"));
        }
        else {
            projectProperties.setProperty("mlJobAuth", jobAuthMethod);
        }

        if (jobSimpleSsl == null) {
            jobSimpleSsl = getEnvPropBoolean(projectProperties, "mlJobSimpleSsl", false);
        }
        else {
            projectProperties.setProperty("mlJobSimpleSsl", jobSimpleSsl.toString());
        }

        if (jobCertFile == null) {
            jobCertFile = getEnvPropString(projectProperties, "mlJobCertFile", jobCertFile);
        }
        else {
            projectProperties.setProperty("mlJobCertFile", jobCertFile);
        }

        if (jobCertPassword == null) {
            jobCertPassword = getEnvPropString(projectProperties, "mlJobCertPassword", jobCertPassword);
        }
        else {
            projectProperties.setProperty("mlJobCertPassword", jobCertPassword);
        }

        if (jobExternalName == null) {
            jobExternalName = getEnvPropString(projectProperties, "mlJobExternalName", jobExternalName);
        }
        else {
            projectProperties.setProperty("mlJobExternalName", jobExternalName);
        }

        if (customForestPath == null) {
            customForestPath = getEnvPropString(projectProperties, "mlCustomForestPath", environment.getProperty("mlCustomForestPath"));
        }
        else {
            projectProperties.setProperty("mlCustomForestPath", customForestPath);
        }

        if (modulesDbName == null) {
            modulesDbName = getEnvPropString(projectProperties, "mlModulesDbName", environment.getProperty("mlModulesDbName"));
        }
        else {
            projectProperties.setProperty("mlModulesDbName", modulesDbName);
        }

        if (modulesForestsPerHost == null) {
            modulesForestsPerHost = getEnvPropInteger(projectProperties, "mlModulesForestsPerHost", Integer.parseInt(environment.getProperty("mlModulesForestsPerHost")));
        }
        else {
            projectProperties.setProperty("mlModulesForestsPerHost", modulesForestsPerHost.toString());
        }

        if (stagingTriggersDbName == null) {
            stagingTriggersDbName = getEnvPropString(projectProperties, "mlStagingTriggersDbName", environment.getProperty("mlStagingTriggersDbName"));
        }
        else {
            projectProperties.setProperty("mlStagingTriggersDbName", stagingTriggersDbName);
        }

        if (stagingTriggersForestsPerHost == null) {
            stagingTriggersForestsPerHost = getEnvPropInteger(projectProperties, "mlStagingTriggersForestsPerHost", Integer.parseInt(environment.getProperty("mlStagingTriggersForestsPerHost")));
        }
        else {
            projectProperties.setProperty("mlStagingTriggersForestsPerHost", stagingTriggersForestsPerHost.toString());
        }

        if (finalTriggersDbName == null) {
            finalTriggersDbName = getEnvPropString(projectProperties, "mlFinalTriggersDbName", environment.getProperty("mlFinalTriggersDbName"));
        }
        else {
            projectProperties.setProperty("mlFinalTriggersDbName", finalTriggersDbName);
        }

        if (finalTriggersForestsPerHost == null) {
            finalTriggersForestsPerHost = getEnvPropInteger(projectProperties, "mlFinalTriggersForestsPerHost", Integer.parseInt(environment.getProperty("mlFinalTriggersForestsPerHost")));
        }
        else {
            projectProperties.setProperty("mlFinalTriggersForestsPerHost", finalTriggersForestsPerHost.toString());
        }

        if (stagingSchemasDbName == null) {
            stagingSchemasDbName = getEnvPropString(projectProperties, "mlStagingSchemasDbName", environment.getProperty("mlStagingSchemasDbName"));
        }
        else {
            projectProperties.setProperty("mlStagingSchemasDbName", stagingSchemasDbName);
        }

        if (stagingSchemasForestsPerHost == null) {
            stagingSchemasForestsPerHost = getEnvPropInteger(projectProperties, "mlStagingSchemasForestsPerHost", Integer.parseInt(environment.getProperty("mlStagingSchemasForestsPerHost")));
        }
        else {
            projectProperties.setProperty("mlStagingSchemasForestsPerHost", stagingSchemasForestsPerHost.toString());
        }

        if (finalSchemasDbName == null) {
            finalSchemasDbName = getEnvPropString(projectProperties, "mlFinalSchemasDbName", environment.getProperty("mlFinalSchemasDbName"));
        }
        else {
            projectProperties.setProperty("mlFinalSchemasDbName", finalSchemasDbName);
        }

        if (finalSchemasForestsPerHost == null) {
            finalSchemasForestsPerHost = getEnvPropInteger(projectProperties, "mlFinalSchemasForestsPerHost", Integer.parseInt(environment.getProperty("mlFinalSchemasForestsPerHost")));
        }
        else {
            projectProperties.setProperty("mlFinalSchemasForestsPerHost", finalSchemasForestsPerHost.toString());
        }

        if (flowOperatorRoleName == null) {
            flowOperatorRoleName = getEnvPropString(projectProperties, "mlFlowOperatorRole", environment.getProperty("mlFlowOperatorRole"));
        }
        else {
            projectProperties.setProperty("mlFlowOperatorRole", flowOperatorRoleName);
        }

        if (flowOperatorUserName == null) {
            flowOperatorUserName = getEnvPropString(projectProperties, "mlFlowOperatorUserName", environment.getProperty("mlFlowOperatorUserName"));
        }
        else {
            projectProperties.setProperty("mlFlowOperatorUserName", flowOperatorUserName);
        }

        if (flowDeveloperRoleName == null) {
            flowDeveloperRoleName = getEnvPropString(projectProperties, "mlFlowDeveloperRole", environment.getProperty("mlFlowDeveloperRole"));
        }
        else {
            projectProperties.setProperty("mlFlowDeveloperRole", flowDeveloperRoleName);
        }

        if (flowDeveloperUserName == null) {
            flowDeveloperUserName = getEnvPropString(projectProperties, "mlFlowDeveloperUserName", environment.getProperty("mlFlowDeveloperUserName"));
        }
        else {
            projectProperties.setProperty("mlFlowDeveloperUserName", flowDeveloperUserName);
        }

        if (modulePermissions == null) {
            modulePermissions = getEnvPropString(projectProperties, "mlModulePermissions", environment.getProperty("mlModulePermissions"));
        }
        else {
            projectProperties.setProperty("mlModulePermissions", modulePermissions);
        }

        if (entityModelPermissions == null) {
            entityModelPermissions = getEnvPropString(projectProperties, "mlEntityModelPermissions", environment.getProperty("mlEntityModelPermissions"));
        }
        else {
            projectProperties.setProperty("mlEntityModelPermissions", entityModelPermissions);
        }

        if (mappingPermissions == null) {
            mappingPermissions = getEnvPropString(projectProperties, "mlMappingPermissions", environment.getProperty("mlMappingPermissions"));
        }
        else {
            projectProperties.setProperty("mlMappingPermissions", mappingPermissions);
        }

        if (flowPermissions == null) {
            flowPermissions = getEnvPropString(projectProperties, "mlFlowPermissions", environment.getProperty("mlFlowPermissions"));
        }
        else {
            projectProperties.setProperty("mlFlowPermissions", flowPermissions);
        }

        if (stepDefinitionPermissions == null) {
            stepDefinitionPermissions = getEnvPropString(projectProperties, "mlStepDefinitionPermissions", environment.getProperty("mlStepDefinitionPermissions"));
        }
        else {
            projectProperties.setProperty("mlStepDefinitionPermissions", stepDefinitionPermissions);
        }

        if (jobPermissions == null) {
            jobPermissions = getEnvPropString(projectProperties, "mlJobPermissions", environment.getProperty("mlJobPermissions"));
        }
        else {
            projectProperties.setProperty("mlJobPermissions", jobPermissions);
        }

        DHFVersion = getEnvPropString(projectProperties, "mlDHFVersion", environment.getProperty("mlDHFVersion"));

        //make sure we include a log level here
        if (hubLogLevel == null) {
            hubLogLevel = getEnvPropString(projectProperties, "mlHugLogLevel", environment.getProperty("mlHugLogLevel"));
        }
        else {
            projectProperties.setProperty("mlHubLogLevel", hubLogLevel);
        }

        // this is a runtime username/password for running flows
        // could be factored away with FlowRunner
        if (mlUsername == null) {
            mlUsername = getEnvPropString(projectProperties, "mlUsername", mlUsername);
        }
        else {
            projectProperties.setProperty("mlUsername", mlUsername);
        }

        if (mlPassword == null) {
            mlPassword = getEnvPropString(projectProperties, "mlPassword", mlPassword);
        }
        else {
            projectProperties.setProperty("mlPassword", mlPassword);
        }

        if (loadBalancerHost == null) {
            loadBalancerHost = getEnvPropString(projectProperties, "mlLoadBalancerHosts", null);
        }
        else {
            projectProperties.setProperty("mlLoadBalancerHosts", loadBalancerHost);
        }

        if (isHostLoadBalancer == null) {
            isHostLoadBalancer = getEnvPropBoolean(projectProperties, "mlIsHostLoadBalancer", Boolean.parseBoolean(environment.getProperty("mlIsHostLoadBalancer")));
        }
        else {
            projectProperties.setProperty("mlIsHostLoadBalancer", isHostLoadBalancer.toString());
        }

        if (isProvisionedEnvironment == null) {
            isProvisionedEnvironment = getEnvPropBoolean(projectProperties, "mlIsProvisionedEnvironment", false);
        }
        else {
            projectProperties.setProperty("mlIsProvisionedEnvironment", isProvisionedEnvironment.toString());
        }

        // Need to do this first so that objects like the final SSL objects are set before hydrating AppConfig
        hydrateConfigs();

        hydrateAppConfigs(projectProperties);
    }

    protected void hydrateAppConfigs(Properties properties) {
        com.marklogic.mgmt.util.PropertySource propertySource = properties::getProperty;

        if (appConfig != null) {
            // Still need to call this since the setter also "updates" appConfig with DHF-specific values
            setAppConfig(appConfig);
        } else {
            setAppConfig(new DefaultAppConfigFactory(propertySource).newAppConfig());
        }

        if (adminConfig == null) {
            setAdminConfig(new DefaultAdminConfigFactory(propertySource).newAdminConfig());
        }
        if (adminManager == null) {
            setAdminManager(new AdminManager(getAdminConfig()));
        }
        if (manageConfig == null) {
            setManageConfig(new DefaultManageConfigFactory(propertySource).newManageConfig());
        }
        if (manageClient == null) {
            setManageClient(new ManageClient(getManageConfig()));
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

    @Override
    public DatabaseClient newStagingClient() {
        return newStagingClient(stagingDbName);
    }

    public DatabaseClient newStagingClient(String dbName) {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), stagingPort, getMlUsername(), getMlPassword());
        if (dbName != null) {
            config.setDatabase(dbName);
        }
        config.setSecurityContextType(SecurityContextType.valueOf(stagingAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(stagingSslHostnameVerifier);
        config.setSslContext(stagingSslContext);
        config.setCertFile(stagingCertFile);
        config.setCertPassword(stagingCertPassword);
        config.setExternalName(stagingExternalName);
        config.setTrustManager(stagingTrustManager);
        if (isHostLoadBalancer) {
            config.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
        }
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    @Override
    // this method uses STAGING appserver but FINAL database.
    // it's only use is for reverse flows, which need to use staging modules.
    public DatabaseClient newReverseFlowClient() {
        return newStagingClient(finalDbName);
    }

    @Override
    public DatabaseClient newFinalClient() {
        return newFinalClient(finalDbName);
    }

    @Override
    public DatabaseClient newFinalClient(String dbName) {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), finalPort, getMlUsername(), getMlPassword());
        if (dbName != null) {
            config.setDatabase(dbName);
        }
        config.setSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(finalSslHostnameVerifier);
        config.setSslContext(finalSslContext);
        config.setCertFile(finalCertFile);
        config.setCertPassword(finalCertPassword);
        config.setExternalName(finalExternalName);
        config.setTrustManager(finalTrustManager);
        if (isHostLoadBalancer) {
            config.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
        }
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    public DatabaseClient newJobDbClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), jobPort, mlUsername, mlPassword);
        config.setDatabase(jobDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(jobAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(jobSslHostnameVerifier);
        config.setSslContext(jobSslContext);
        config.setCertFile(jobCertFile);
        config.setCertPassword(jobCertPassword);
        config.setExternalName(jobExternalName);
        config.setTrustManager(jobTrustManager);
        if (isHostLoadBalancer) {
            config.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
        }
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    public DatabaseClient newTraceDbClient() {
        return newJobDbClient();
    }

    public DatabaseClient newModulesDbClient() {
        AppConfig appConfig = getAppConfig();
        // this has to be finalPort because final is a stock REST API.
        // staging will not be; but its rewriter isn't loaded yet.
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), finalPort, mlUsername, mlPassword);
        config.setDatabase(appConfig.getModulesDatabaseName());
        config.setSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(finalSslHostnameVerifier);
        config.setSslContext(finalSslContext);
        config.setCertFile(finalCertFile);
        config.setCertPassword(finalCertPassword);
        config.setExternalName(finalExternalName);
        config.setTrustManager(finalTrustManager);
        if (isHostLoadBalancer) {
            config.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
        }
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
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
    public Path getStepsDirByType(StepDefinition.StepDefinitionType type) {
        return requireHubProject().getStepsDirByType(type);
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
        Properties properties = new Properties();
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("version.properties")) {
            properties.load(inputStream);
        } catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        String version = (String)properties.get("version");

        // this lets debug builds work from an IDE
        if (version.equals("${project.version}")) {
            version = "5.3-SNAPSHOT";
        }
        return version;
    }

    @Override public String getDHFVersion() {

        return this.DHFVersion;
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
        if (environment == null) {
            throw new RuntimeException("Unable to add DHF properties to custom tokens map because the Spring environment object is null");
        }

        Map<String, String> customTokens = appConfig.getCustomTokens();
        customTokens.put("%%mlHost%%", appConfig == null ? environment.getProperty("mlHost") : appConfig.getHost());
        customTokens.put("%%mlStagingAppserverName%%", stagingHttpName == null ? environment.getProperty("mlStagingAppserverName") : stagingHttpName);
        customTokens.put("%%mlStagingPort%%", stagingPort == null ? environment.getProperty("mlStagingPort") : stagingPort.toString());
        customTokens.put("%%mlStagingDbName%%", stagingDbName == null ? environment.getProperty("mlStagingDbName") : stagingDbName);
        customTokens.put("%%mlStagingForestsPerHost%%", stagingForestsPerHost == null ? environment.getProperty("mlStagingForestsPerHost") : stagingForestsPerHost.toString());
        customTokens.put("%%mlStagingAuth%%", stagingAuthMethod == null ? environment.getProperty("mlStagingAuth") : stagingAuthMethod);

        customTokens.put("%%mlFinalAppserverName%%", finalHttpName == null ? environment.getProperty("mlFinalAppserverName") : finalHttpName);
        customTokens.put("%%mlFinalPort%%", finalPort == null ? environment.getProperty("mlFinalPort") : finalPort.toString());
        customTokens.put("%%mlFinalDbName%%", finalDbName == null ? environment.getProperty("mlFinalDbName") : finalDbName);
        customTokens.put("%%mlFinalForestsPerHost%%", finalForestsPerHost == null ? environment.getProperty("mlFinalForestsPerHost") : finalForestsPerHost.toString());
        customTokens.put("%%mlFinalAuth%%", finalAuthMethod == null ? environment.getProperty("mlFinalAuth") : finalAuthMethod);


        customTokens.put("%%mlJobAppserverName%%", jobHttpName == null ? environment.getProperty("mlJobAppserverName") : jobHttpName);
        customTokens.put("%%mlJobPort%%", jobPort == null ? environment.getProperty("mlJobPort") : jobPort.toString());
        customTokens.put("%%mlJobDbName%%", jobDbName == null ? environment.getProperty("mlJobDbName") : jobDbName);
        customTokens.put("%%mlJobForestsPerHost%%", jobForestsPerHost == null ? environment.getProperty("mlJobForestsPerHost") : jobForestsPerHost.toString());
        customTokens.put("%%mlJobAuth%%", jobAuthMethod == null ? environment.getProperty("mlJobAuth") : jobAuthMethod);

        customTokens.put("%%mlModulesDbName%%", modulesDbName == null ? environment.getProperty("mlModulesDbName") : modulesDbName);
        customTokens.put("%%mlModulesForestsPerHost%%", modulesForestsPerHost == null ? environment.getProperty("mlModulesForestsPerHost") : modulesForestsPerHost.toString());

        customTokens.put("%%mlStagingTriggersDbName%%", stagingTriggersDbName == null ? environment.getProperty("mlStagingTriggersDbName") : stagingTriggersDbName);
        customTokens.put("%%mlStagingTriggersForestsPerHost%%", stagingTriggersForestsPerHost == null ? environment.getProperty("mlStagingTriggersForestsPerHost") : stagingTriggersForestsPerHost.toString());

        customTokens.put("%%mlFinalTriggersDbName%%", finalTriggersDbName == null ? environment.getProperty("mlFinalTriggersDbName") : finalTriggersDbName);
        customTokens.put("%%mlFinalTriggersForestsPerHost%%", finalTriggersForestsPerHost == null ? environment.getProperty("mlFinalTriggersForestsPerHost") : finalTriggersForestsPerHost.toString());

        customTokens.put("%%mlStagingSchemasDbName%%", stagingSchemasDbName == null ? environment.getProperty("mlStagingSchemasDbName") : stagingSchemasDbName);
        customTokens.put("%%mlStagingSchemasForestsPerHost%%", stagingSchemasForestsPerHost == null ? environment.getProperty("mlStagingSchemasForestsPerHost") : stagingSchemasForestsPerHost.toString());

        customTokens.put("%%mlFinalSchemasDbName%%", finalSchemasDbName == null ? environment.getProperty("mlFinalSchemasDbName") : finalSchemasDbName);
        customTokens.put("%%mlFinalSchemasForestsPerHost%%", finalSchemasForestsPerHost == null ? environment.getProperty("mlFinalSchemasForestsPerHost") : finalSchemasForestsPerHost.toString());

        customTokens.put("%%mlFlowOperatorRole%%", flowOperatorRoleName == null ? environment.getProperty("mlFlowOperatorRole") : flowOperatorRoleName);
        customTokens.put("%%mlFlowOperatorUserName%%", flowOperatorUserName == null ? environment.getProperty("mlFlowOperatorUserName") : flowOperatorUserName);

        customTokens.put("%%mlFlowDeveloperRole%%", flowDeveloperRoleName == null ? environment.getProperty("mlFlowDeveloperRole") : flowDeveloperRoleName);
        customTokens.put("%%mlFlowDeveloperUserName%%", flowDeveloperUserName == null ? environment.getProperty("mlFlowDeveloperUserName") : flowDeveloperUserName);


        // random password for hub user
        RandomStringGenerator randomStringGenerator = new RandomStringGenerator.Builder().withinRange(33, 126).filteredBy((CharacterPredicate) codePoint -> (codePoint != 92 && codePoint != 34)).build();
        customTokens.put("%%mlFlowOperatorPassword%%", randomStringGenerator.generate(20));
        // and another random password for hub Admin User
        customTokens.put("%%mlFlowDeveloperPassword%%", randomStringGenerator.generate(20));

        customTokens.put("%%mlJobPermissions%%", jobPermissions == null ? environment.getProperty("mlJobPermissions") : jobPermissions);

        customTokens.put("%%mlCustomForestPath%%", customForestPath == null ? environment.getProperty("mlCustomForestPath") : customForestPath);

        //version of DHF the user INTENDS to use
        customTokens.put("%%mlDHFVersion%%", getJarVersion());

        //logging level of hub debug messages
        customTokens.put("%%mlHubLogLevel%%", hubLogLevel == null ? environment.getProperty("mlHubLogLevel") : hubLogLevel);

        // in a load-from-properties situation we don't want a random string...
        if (projectProperties.containsKey("mlFlowOperatorPassword")) {
            customTokens.put("%%mlFlowOperatorPassword%%", projectProperties.getProperty("mlFlowOperatorPassword"));
        }
        if (projectProperties.containsKey("mlFlowDeveloperPassword")) {
            customTokens.put("%%mlFlowDeveloperPassword%%", projectProperties.getProperty("mlFlowDeveloperPassword"));
        }
    }

    /**
     * Makes DHF-specific updates to the AppConfig, after it's been constructed by ml-gradle.
     *
     * @param config
     */
    private void updateAppConfig(AppConfig config) {
        if (host != null) {
            config.setHost(host);
        }

        // If the user hasn't set the app name then override it to "DHF" instead of "my-app"
        if ("my-app".equals(config.getName())) {
            config.setName("DHF");
        }

        // DHF never needs the default REST server provided by ml-gradle
        config.setNoRestServer(true);

        applyFinalConnectionSettingsToMlGradleDefaultRestSettings(config);

        config.setTriggersDatabaseName(finalTriggersDbName);
        config.setSchemasDatabaseName(finalSchemasDbName);
        config.setModulesDatabaseName(modulesDbName);
        config.setContentDatabaseName(finalDbName);

        config.setReplaceTokensInModules(true);
        config.setUseRoxyTokenPrefix(false);
        config.setModulePermissions(modulePermissions);

        if (envString != null) {
            String defaultPath = config.getModuleTimestampsPath();
            int index = defaultPath.lastIndexOf("/") + 1;
            config.setModuleTimestampsPath(defaultPath.substring(0, index) + envString + "-" + defaultPath.substring(index));
        }

        Map<String, Integer> forestCounts = config.getForestCounts();
        forestCounts.put(jobDbName, jobForestsPerHost);
        forestCounts.put(modulesDbName, modulesForestsPerHost);
        forestCounts.put(stagingDbName, stagingForestsPerHost);
        forestCounts.put(stagingTriggersDbName, stagingTriggersForestsPerHost);
        forestCounts.put(stagingSchemasDbName, stagingSchemasForestsPerHost);
        forestCounts.put(finalDbName, finalForestsPerHost);
        forestCounts.put(finalTriggersDbName, finalTriggersForestsPerHost);
        forestCounts.put(finalSchemasDbName, finalSchemasForestsPerHost);
        config.setForestCounts(forestCounts);

        initializeConfigDirs(config);

        initializeModulePaths(config);

        config.setSchemaPaths(List.of(getUserSchemasDir().toString()));

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
        if (finalAuthMethod != null) {
            config.setRestSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        }
        config.setRestPort(finalPort);
        config.setRestCertFile(finalCertFile);
        config.setRestCertPassword(finalCertPassword);
        config.setRestExternalName(finalExternalName);
        config.setRestSslContext(finalSslContext);
        config.setRestSslHostnameVerifier(finalSslHostnameVerifier);
        config.setRestTrustManager(finalTrustManager);
    }

    private String getEnvPropString(Properties properties, String key, String fallback) {
        String value = properties.getProperty(key);
        if (value == null) {
            value = fallback;
        }
        return value;
    }

    private int getEnvPropInteger(Properties properties, String key, int fallback) {
        String value = properties.getProperty(key);
        int res;
        if (value != null) {
            res = Integer.parseInt(value);
        }
        else {
            res = fallback;
        }
        return res;
    }

    private boolean getEnvPropBoolean(Properties properties, String key, boolean fallback) {
        String value = properties.getProperty(key);
        boolean res;
        if (value != null) {
            res = Boolean.parseBoolean(value);
        }
        else {
            res = fallback;
        }
        return res;
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

    public String getStagingSchemasDbName() {
        return this.stagingSchemasDbName;
    }

    public String getStagingTriggersDbName() {
        return this.stagingTriggersDbName;
    }

    // Only used by QS for login
    public void resetAppConfigs() {
        appConfig = null;
        adminConfig = null;
        adminManager = null;
        manageConfig = null;
        manageClient = null;
    }

    public void resetHubConfigs() {
        stagingDbName = null;
        stagingHttpName = null;
        stagingForestsPerHost = null;
        stagingPort = null;
        stagingAuthMethod = null;
        stagingSimpleSsl = null;

        stagingSslContext = null;
        stagingSslHostnameVerifier = null;
        stagingCertFile = null;
        stagingCertPassword = null;
        stagingExternalName = null;
        stagingTrustManager = null;

        finalDbName = null;
        finalHttpName = null;
        finalForestsPerHost = null;
        finalPort = null;
        finalAuthMethod = null;

        finalSimpleSsl = null;
        finalSslContext = null;
        finalSslHostnameVerifier = null;
        finalCertFile = null;
        finalCertPassword = null;
        finalExternalName = null;
        finalTrustManager = null;

        jobDbName = null;
        jobHttpName = null;
        jobForestsPerHost = null;
        jobPort = null;
        jobAuthMethod = null;

        jobSimpleSsl = null;
        jobSslContext = null;
        jobSslHostnameVerifier = null;
        jobCertFile = null;
        jobCertPassword = null;
        jobExternalName = null;
        jobTrustManager = null;

        modulesDbName = null;
        modulesForestsPerHost = null;
        stagingTriggersDbName = null;
        stagingTriggersForestsPerHost = null;
        finalTriggersDbName = null;
        finalTriggersForestsPerHost = null;
        stagingSchemasDbName = null;
        stagingSchemasForestsPerHost = null;
        finalSchemasDbName = null;
        finalSchemasForestsPerHost = null;

        flowOperatorRoleName = null;
        flowOperatorUserName = null;

        flowDeveloperRoleName = null;
        flowDeveloperUserName = null;

        customForestPath = null;
        modulePermissions = null;
        entityModelPermissions = null;
        mappingPermissions = null;
        stepDefinitionPermissions = null;
        flowPermissions = null;
        jobPermissions = null;
        hubLogLevel = null;
        loadBalancerHost = null;
        isHostLoadBalancer = null;
    }

    /**
     * Defines functions for consuming properties from a PropertySource. This differs substantially from
     * loadConfigurationFromProperties, as that function's behavior depends on whether a field has a value or not.
     */
    protected void initializePropertyConsumerMap() {
        propertyConsumerMap = new LinkedHashMap<>();

        propertyConsumerMap.put("mlDHFVersion", prop -> DHFVersion = prop);
        propertyConsumerMap.put("mlHost", prop -> setHost(prop));
        propertyConsumerMap.put("mlIsHostLoadBalancer", prop -> isHostLoadBalancer = Boolean.parseBoolean(prop));
        propertyConsumerMap.put("mlIsProvisionedEnvironment", prop -> isProvisionedEnvironment = Boolean.parseBoolean(prop));

        propertyConsumerMap.put("mlStagingAppserverName", prop -> stagingHttpName = prop);
        propertyConsumerMap.put("mlStagingPort", prop -> stagingPort = Integer.parseInt(prop));
        propertyConsumerMap.put("mlStagingDbName", prop -> stagingDbName = prop);
        propertyConsumerMap.put("mlStagingForestsPerHost", prop -> stagingForestsPerHost = Integer.parseInt(prop));
        propertyConsumerMap.put("mlStagingAuth", prop -> stagingAuthMethod = prop);
        propertyConsumerMap.put("mlStagingSimpleSsl", prop -> stagingSimpleSsl = Boolean.parseBoolean(prop));

        propertyConsumerMap.put("mlFinalAppserverName", prop -> finalHttpName = prop);
        propertyConsumerMap.put("mlFinalPort", prop -> finalPort = Integer.parseInt(prop));
        propertyConsumerMap.put("mlFinalDbName", prop -> finalDbName = prop);
        propertyConsumerMap.put("mlFinalForestsPerHost", prop -> finalForestsPerHost = Integer.parseInt(prop));
        propertyConsumerMap.put("mlFinalAuth", prop -> finalAuthMethod = prop);
        propertyConsumerMap.put("mlFinalSimpleSsl", prop -> finalSimpleSsl = Boolean.parseBoolean(prop));

        propertyConsumerMap.put("mlJobAppserverName", prop -> jobHttpName = prop);
        propertyConsumerMap.put("mlJobPort", prop -> jobPort = Integer.parseInt(prop));
        propertyConsumerMap.put("mlJobDbName", prop -> jobDbName = prop);
        propertyConsumerMap.put("mlJobForestsPerHost", prop -> jobForestsPerHost = Integer.parseInt(prop));
        propertyConsumerMap.put("mlJobAuth", prop -> jobAuthMethod = prop);
        propertyConsumerMap.put("mlJobSimpleSsl", prop -> jobSimpleSsl = Boolean.parseBoolean(prop));

        propertyConsumerMap.put("mlModulesDbName", prop -> modulesDbName = prop);
        propertyConsumerMap.put("mlModulesForestsPerHost", prop -> modulesForestsPerHost = Integer.parseInt(prop));

        propertyConsumerMap.put("mlStagingTriggersDbName", prop -> stagingTriggersDbName = prop);
        propertyConsumerMap.put("mlStagingTriggersForestsPerHost", prop -> stagingTriggersForestsPerHost = Integer.parseInt(prop));
        propertyConsumerMap.put("mlStagingSchemasDbName", prop -> stagingSchemasDbName = prop);
        propertyConsumerMap.put("mlStagingSchemasForestsPerHost", prop -> stagingSchemasForestsPerHost = Integer.parseInt(prop));

        propertyConsumerMap.put("mlFinalTriggersDbName", prop -> finalTriggersDbName = prop);
        propertyConsumerMap.put("mlFinalTriggersForestsPerHost", prop -> finalTriggersForestsPerHost = Integer.parseInt(prop));
        propertyConsumerMap.put("mlFinalSchemasDbName", prop -> finalSchemasDbName = prop);
        propertyConsumerMap.put("mlFinalSchemasForestsPerHost", prop -> finalSchemasForestsPerHost = Integer.parseInt(prop));

        propertyConsumerMap.put("mlCustomForestPath", prop -> customForestPath = prop);

        propertyConsumerMap.put("mlFlowOperatorRole", prop -> flowOperatorRoleName = prop);
        propertyConsumerMap.put("mlFlowOperatorUserName", prop -> flowOperatorUserName = prop);
        propertyConsumerMap.put("mlFlowDeveloperRole", prop -> flowDeveloperRoleName = prop);
        propertyConsumerMap.put("mlFlowDeveloperUserName", prop -> flowDeveloperUserName = prop);

        propertyConsumerMap.put("mlHubLogLevel", prop -> hubLogLevel = prop);

        propertyConsumerMap.put("mlEntityModelPermissions", prop -> entityModelPermissions = prop);
        propertyConsumerMap.put("mlFlowPermissions", prop -> flowPermissions = prop);
        propertyConsumerMap.put("mlJobPermissions", prop -> jobPermissions = prop);
        propertyConsumerMap.put("mlMappingPermissions", prop -> mappingPermissions = prop);
        propertyConsumerMap.put("mlModulePermissions", prop -> modulePermissions = prop);
        propertyConsumerMap.put("mlStepDefinitionPermissions", prop -> stepDefinitionPermissions = prop);
    }
}
