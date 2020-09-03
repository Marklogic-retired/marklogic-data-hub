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
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
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
import java.util.function.Consumer;

@JsonAutoDetect(
    fieldVisibility = JsonAutoDetect.Visibility.PROTECTED_AND_PUBLIC,
    getterVisibility = JsonAutoDetect.Visibility.ANY,
    setterVisibility = JsonAutoDetect.Visibility.ANY
)
public class HubConfigImpl implements HubConfig
{
    private HubProject hubProject;

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

    private String hubLogLevel;

    // these hold runtime credentials for flows.
    private String mlUsername = null;
    private String mlPassword = null;

    // This name makes it sound like it's more important than it is; as of 5.3.0, it only impacts the legacy MlcpRunner
    // and thus only impacts running DHF 4 input flows. Otherwise, it is ignored.
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

    /**
     * These are set when calling loadConfigurationFromProperties, if their corresponding properties exist. They are then
     * used when calling addDhfPropertiesToCustomTokens so that their values can be used instead of randomly-generated
     * passwords.
     */
    @JsonIgnore
    private String flowOperatorPasswordFromProperties;
    @JsonIgnore
    private String flowDeveloperPasswordFromProperties;

    // Defines functions for consuming properties from a PropertySource
    private Map<String, Consumer<String>> propertyConsumerMap;

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
        this.manageConfig = manageConfigToReuse != null ? manageConfigToReuse : new DefaultManageConfigFactory(propertySource).newManageConfig();
        this.adminConfig = adminConfigToReuse != null ? adminConfigToReuse : new DefaultAdminConfigFactory(propertySource).newAdminConfig();

        // Apply DHF properties
        if (propertyConsumerMap == null) {
            initializePropertyConsumerMap();
        }
        for (String propertyName : propertyConsumerMap.keySet()) {
            String value = propertySource.getProperty(propertyName);
            if (value != null) {
                propertyConsumerMap.get(propertyName).accept(value);
            }
        }
        instantiateSslObjects();

        // Now update the AppConfig based on the applied DHF property values
        setAppConfig(this.appConfig, false);

        // And recreate these in case the AdminConfig/ManageConfig objects were updated when DHF properties were applied,
        // as this will force the underlying RestTemplate objects to be updated
        setAdminManager(new AdminManager(this.adminConfig));
        setManageClient(new ManageClient(this.manageConfig));
    }

    protected HubProject requireHubProject() {
        Assert.notNull(hubProject, "A HubProject has not been set, and thus this operation cannot be performed");
        return hubProject;
    }

    public void createProject(String projectDirString) {
        requireHubProject().createProject(projectDirString);
    }

    public String getHost() { return appConfig != null ? appConfig.getHost() : host; }

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
    private void instantiateSslObjects() {
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

    @Deprecated
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
        customTokens.put("%%mlStagingPort%%", stagingPort.toString());
        customTokens.put("%%mlStagingDbName%%", stagingDbName);
        customTokens.put("%%mlStagingForestsPerHost%%", stagingForestsPerHost.toString());
        customTokens.put("%%mlStagingAuth%%", stagingAuthMethod);

        customTokens.put("%%mlFinalAppserverName%%", finalHttpName);
        customTokens.put("%%mlFinalPort%%", finalPort.toString());
        customTokens.put("%%mlFinalDbName%%", finalDbName);
        customTokens.put("%%mlFinalForestsPerHost%%", finalForestsPerHost.toString());
        customTokens.put("%%mlFinalAuth%%", finalAuthMethod);

        customTokens.put("%%mlJobAppserverName%%", jobHttpName);
        customTokens.put("%%mlJobPort%%", jobPort.toString());
        customTokens.put("%%mlJobDbName%%", jobDbName);
        customTokens.put("%%mlJobForestsPerHost%%", jobForestsPerHost.toString());
        customTokens.put("%%mlJobAuth%%", jobAuthMethod);

        customTokens.put("%%mlModulesDbName%%", modulesDbName);
        customTokens.put("%%mlModulesForestsPerHost%%", modulesForestsPerHost.toString());

        customTokens.put("%%mlStagingTriggersDbName%%", stagingTriggersDbName);
        customTokens.put("%%mlStagingTriggersForestsPerHost%%", stagingTriggersForestsPerHost.toString());

        customTokens.put("%%mlFinalTriggersDbName%%", finalTriggersDbName);
        customTokens.put("%%mlFinalTriggersForestsPerHost%%", finalTriggersForestsPerHost.toString());

        customTokens.put("%%mlStagingSchemasDbName%%", stagingSchemasDbName);
        customTokens.put("%%mlStagingSchemasForestsPerHost%%", stagingSchemasForestsPerHost.toString());

        customTokens.put("%%mlFinalSchemasDbName%%", finalSchemasDbName);
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

    /**
     * Applies values that, prior to 5.3.0, were stored in the dhf-defaults.properties file that was available from the
     * classpath. Note that this only applies property values to "simple" properties of this class - it does not
     * instantiate, but rather nulls out, the AppConfig, AdminConfig, ManageConfig, AdminManager, and ManageClient
     * properties of this class. The expectation that is that applyProperties must be invoked in order for an instance
     * of this class to be truly usable - in particular, so that a username/password can be provided so that connections
     * can be made to various ML interfaces.
     */
    public void applyDefaultPropertyValues() {
        appConfig = null;
        adminConfig = null;
        manageConfig = null;
        adminManager = null;
        manageClient = null;

        host = "localhost";
        hubLogLevel = "default";
        isHostLoadBalancer = false;
        isProvisionedEnvironment = false;

        stagingDbName = "data-hub-STAGING";
        stagingHttpName = "data-hub-STAGING";
        stagingForestsPerHost = 3;
        stagingPort = 8010;
        stagingAuthMethod = "digest";
        stagingSimpleSsl = false;
        stagingSslContext = null;
        stagingSslHostnameVerifier = null;
        stagingCertFile = null;
        stagingCertPassword = null;
        stagingExternalName = null;
        stagingTrustManager = null;

        finalDbName = "data-hub-FINAL";
        finalHttpName = "data-hub-FINAL";
        finalForestsPerHost = 3;
        finalPort = 8011;
        finalAuthMethod = "digest";
        finalSimpleSsl = false;
        finalSslContext = null;
        finalSslHostnameVerifier = null;
        finalCertFile = null;
        finalCertPassword = null;
        finalExternalName = null;
        finalTrustManager = null;

        jobDbName = "data-hub-JOBS";
        jobHttpName = "data-hub-JOBS";
        jobForestsPerHost = 4;
        jobPort = 8013;
        jobAuthMethod = "digest";
        jobSimpleSsl = false;
        jobSslContext = null;
        jobSslHostnameVerifier = null;
        jobCertFile = null;
        jobCertPassword = null;
        jobExternalName = null;
        jobTrustManager = null;

        modulesDbName = "data-hub-MODULES";
        modulesForestsPerHost = 1;
        stagingTriggersDbName = "data-hub-staging-TRIGGERS";
        stagingTriggersForestsPerHost = 1;
        finalTriggersDbName = "data-hub-final-TRIGGERS";
        finalTriggersForestsPerHost = 1;
        stagingSchemasDbName = "data-hub-staging-SCHEMAS";
        stagingSchemasForestsPerHost = 1;
        finalSchemasDbName = "data-hub-final-SCHEMAS";
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
        modulePermissions = "data-hub-module-reader,read,data-hub-module-reader,execute,data-hub-module-writer,update,rest-extension-user,execute";
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
        propertyConsumerMap = new LinkedHashMap<>();

        // These "convenience" properties set applied first so that the property values can still be overridden via the
        // property keys specific to them
        propertyConsumerMap.put("hubDhs", prop -> {
            if (Boolean.parseBoolean(prop)) {
                isProvisionedEnvironment = true;
                isHostLoadBalancer = true;
                appConfig.setAppServicesPort(8010);
                appConfig.setAppServicesSecurityContextType(SecurityContextType.BASIC);
                appConfig.setAppServicesSslContext(null);
                appConfig.setAppServicesSslHostnameVerifier(null);
                appConfig.setAppServicesTrustManager(null);
                manageConfig.setScheme("http");
                manageConfig.setConfigureSimpleSsl(false);
                finalAuthMethod = "basic";
                stagingAuthMethod = "basic";
                jobAuthMethod = "basic";
            }
        });

        propertyConsumerMap.put("hubSsl", prop -> {
            if (Boolean.parseBoolean(prop)) {
                appConfig.setSimpleSslConfig();
                appConfig.setAppServicesSimpleSslConfig();
                manageConfig.setScheme("https");
                manageConfig.setConfigureSimpleSsl(true);
                finalSimpleSsl = true;
                stagingSimpleSsl = true;
                jobSimpleSsl = true;
            }
        });

        propertyConsumerMap.put("mlUsername", prop -> mlUsername = prop);
        propertyConsumerMap.put("mlPassword", prop -> mlPassword = prop);

        propertyConsumerMap.put("mlDHFVersion", prop -> {
            logger.warn("mlDHFVersion no longer has any impact starting in version 5.3.0. You may safely remove this from your properties file.");
        });

        propertyConsumerMap.put("mlHost", prop -> setHost(prop));
        propertyConsumerMap.put("mlIsHostLoadBalancer", prop -> isHostLoadBalancer = Boolean.parseBoolean(prop));
        propertyConsumerMap.put("mlLoadBalancerHosts", prop ->
            logger.warn("mlLoadBalancerHosts was deprecated in version 4.0.1 and does not have any impact on Data Hub functionality. " +
                "It can be safely removed from your set of properties."));
        propertyConsumerMap.put("mlIsProvisionedEnvironment", prop -> isProvisionedEnvironment = Boolean.parseBoolean(prop));

        propertyConsumerMap.put("mlStagingAppserverName", prop -> stagingHttpName = prop);
        propertyConsumerMap.put("mlStagingPort", prop -> stagingPort = Integer.parseInt(prop));
        propertyConsumerMap.put("mlStagingDbName", prop -> stagingDbName = prop);
        propertyConsumerMap.put("mlStagingForestsPerHost", prop -> stagingForestsPerHost = Integer.parseInt(prop));
        propertyConsumerMap.put("mlStagingAuth", prop -> stagingAuthMethod = prop);
        propertyConsumerMap.put("mlStagingSimpleSsl", prop -> stagingSimpleSsl = Boolean.parseBoolean(prop));
        propertyConsumerMap.put("mlStagingCertFile", prop -> stagingCertFile = prop);
        propertyConsumerMap.put("mlStagingCertPassword", prop -> stagingCertPassword = prop);
        propertyConsumerMap.put("mlStagingExternalName", prop -> stagingExternalName = prop);

        propertyConsumerMap.put("mlFinalAppserverName", prop -> finalHttpName = prop);
        propertyConsumerMap.put("mlFinalPort", prop -> finalPort = Integer.parseInt(prop));
        propertyConsumerMap.put("mlFinalDbName", prop -> finalDbName = prop);
        propertyConsumerMap.put("mlFinalForestsPerHost", prop -> finalForestsPerHost = Integer.parseInt(prop));
        propertyConsumerMap.put("mlFinalAuth", prop -> finalAuthMethod = prop);
        propertyConsumerMap.put("mlFinalSimpleSsl", prop -> finalSimpleSsl = Boolean.parseBoolean(prop));
        propertyConsumerMap.put("mlFinalCertFile", prop -> finalCertFile = prop);
        propertyConsumerMap.put("mlFinalCertPassword", prop -> finalCertPassword = prop);
        propertyConsumerMap.put("mlFinalExternalName", prop -> finalExternalName = prop);

        propertyConsumerMap.put("mlJobAppserverName", prop -> jobHttpName = prop);
        propertyConsumerMap.put("mlJobPort", prop -> jobPort = Integer.parseInt(prop));
        propertyConsumerMap.put("mlJobDbName", prop -> jobDbName = prop);
        propertyConsumerMap.put("mlJobForestsPerHost", prop -> jobForestsPerHost = Integer.parseInt(prop));
        propertyConsumerMap.put("mlJobAuth", prop -> jobAuthMethod = prop);
        propertyConsumerMap.put("mlJobSimpleSsl", prop -> jobSimpleSsl = Boolean.parseBoolean(prop));
        propertyConsumerMap.put("mlJobCertFile", prop -> jobCertFile = prop);
        propertyConsumerMap.put("mlJobCertPassword", prop -> jobCertPassword = prop);
        propertyConsumerMap.put("mlJobExternalName", prop -> jobExternalName = prop);

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
        propertyConsumerMap.put("mlFlowOperatorPassword", prop -> flowOperatorPasswordFromProperties = prop);
        propertyConsumerMap.put("mlFlowDeveloperRole", prop -> flowDeveloperRoleName = prop);
        propertyConsumerMap.put("mlFlowDeveloperUserName", prop -> flowDeveloperUserName = prop);
        propertyConsumerMap.put("mlFlowDeveloperPassword", prop -> flowDeveloperPasswordFromProperties = prop);

        propertyConsumerMap.put("mlHubLogLevel", prop -> hubLogLevel = prop);

        propertyConsumerMap.put("mlEntityModelPermissions", prop -> entityModelPermissions = prop);
        propertyConsumerMap.put("mlFlowPermissions", prop -> flowPermissions = prop);
        propertyConsumerMap.put("mlJobPermissions", prop -> jobPermissions = prop);
        propertyConsumerMap.put("mlMappingPermissions", prop -> mappingPermissions = prop);
        propertyConsumerMap.put("mlModulePermissions", prop -> modulePermissions = prop);
        propertyConsumerMap.put("mlStepDefinitionPermissions", prop -> stepDefinitionPermissions = prop);
    }

    /**
     * For clients - such as the spark/glue connector - that must deal with only lowercase property names, this method
     * can be called to register every property consumer under the lowercased version of its property name.
     */
    public void registerLowerCasedPropertyConsumers() {
        if (propertyConsumerMap == null) {
            initializePropertyConsumerMap();
        }
        Set<String> propertyNames = new HashSet<>(propertyConsumerMap.keySet());
        propertyNames.forEach(propertyName -> propertyConsumerMap.put(propertyName.toLowerCase(), propertyConsumerMap.get(propertyName)));
    }

    /**
     *
     * @return
     */
    public HubClient newHubClient() {
        Map<DatabaseKind, String> databaseNames = new HashMap<>();
        databaseNames.put(DatabaseKind.STAGING, stagingDbName);
        databaseNames.put(DatabaseKind.FINAL, finalDbName);
        databaseNames.put(DatabaseKind.JOB, jobDbName);
        databaseNames.put(DatabaseKind.MODULES, modulesDbName);
        databaseNames.put(DatabaseKind.STAGING_TRIGGERS, stagingTriggersDbName);
        databaseNames.put(DatabaseKind.STAGING_SCHEMAS, stagingSchemasDbName);
        databaseNames.put(DatabaseKind.FINAL_TRIGGERS, finalTriggersDbName);
        databaseNames.put(DatabaseKind.FINAL_SCHEMAS, finalSchemasDbName);

        return new HubClientImpl(this, databaseNames);
    }
}
