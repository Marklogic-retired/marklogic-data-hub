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
import com.marklogic.hub.job.impl.JobMonitorImpl;
import com.marklogic.hub.legacy.impl.LegacyFlowManagerImpl;
import com.marklogic.hub.step.Step;
import com.marklogic.mgmt.DefaultManageConfigFactory;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.admin.DefaultAdminConfigFactory;
import org.apache.commons.text.CharacterPredicate;
import org.apache.commons.text.RandomStringGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;

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

    @Autowired
    LegacyFlowManagerImpl flowManager;
    @Autowired
    DataHubImpl dataHub;
    @Autowired
    Versions versions;
    @Autowired
    JobMonitorImpl jobMonitor;


    protected String host;

    protected String stagingDbName;
    protected String stagingHttpName;
    protected Integer stagingForestsPerHost;
    protected Integer stagingPort;
    protected String stagingAuthMethod;
    private String stagingScheme;
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
    private String finalScheme;

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
    private String jobScheme;

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


    private String hubRoleName;
    private String hubUserName;

    private String hubAdminRoleName;
    private String hubAdminUserName;

    private String DHFVersion;

    // these hold runtime credentials for flows.
    private String mlUsername = null;
    private String mlPassword = null;

    private String loadBalancerHost;
    private Boolean isHostLoadBalancer;

    private Boolean isProvisionedEnvironment;

    protected String customForestPath;

    protected String modulePermissions;

    private ManageConfig manageConfig;
    private ManageClient manageClient;
    private AdminConfig adminConfig;
    private AdminManager adminManager;

    private AppConfig appConfig;

    private static final Logger logger = LoggerFactory.getLogger(HubConfigImpl.class);

    private ObjectMapper objmapper;

    // By default, DHF uses gradle-local.properties for your local environment.
    private String envString = "local";

    public HubConfigImpl() {
        objmapper = new ObjectMapper();
        projectProperties = new Properties();
    }


    public void createProject(String projectDirString) {
        hubProject.createProject(projectDirString);
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

    public void setMlUsername(String mlUsername) {
        this.mlUsername = mlUsername;
    }

    public void setMlPassword(String mlPassword) {
        this.mlPassword = mlPassword;
    }
    @Override  public void setHubUserName(String hubUserName) {
        this.hubUserName = hubUserName;
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
    @Deprecated
    public String getProjectDir() {
        return hubProject.getProjectDirString();
    }

    @Override
    @Deprecated
    public void setProjectDir(String projectDir) {
        createProject(projectDir);
    }

    public void setModulePermissions(String modulePermissions) {
        this.modulePermissions = modulePermissions;
    }

    @JsonIgnore
    @Override  public HubProject getHubProject() {
        return this.hubProject;
    }

    @Override  public void initHubProject() {
        this.hubProject.init(getCustomTokens());
    }

    @Override
    @Deprecated
    public String getHubModulesDeployTimestampFile() {
        return hubProject.getHubModulesDeployTimestampFile();
    }

    @Override
    @Deprecated
    public String getUserModulesDeployTimestampFile() {
        return hubProject.getUserModulesDeployTimestampFile();
    }


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


    public void loadConfigurationFromProperties(){
        loadConfigurationFromProperties(null, true);
    }

    public void loadConfigurationFromProperties(Properties properties, boolean loadGradleProperties) {
        projectProperties = new Properties();

        /*
         * Not sure if this code should still be here. We don't want to do this in a Gradle environment because the
         * properties have already been loaded and processed by the Gradle properties plugin, and they should be in
         * the incoming Properties object. So the use case for this would be when there's a gradle.properties file
         * available but Gradle isn't being used.
         */
        if (loadGradleProperties) {
            if (logger.isInfoEnabled()) {
                logger.info("Loading properties from gradle.properties");
            }
            File file = hubProject.getProjectDir().resolve("gradle.properties").toFile();
            loadPropertiesFromFile(file, projectProperties);

            if (envString != null) {
                File envPropertiesFile = hubProject.getProjectDir().resolve("gradle-" + envString + ".properties").toFile();
                if (envPropertiesFile != null && envPropertiesFile.exists()) {
                    if (logger.isInfoEnabled()) {
                        logger.info("Loading additional properties from " + envPropertiesFile.getAbsolutePath());
                    }
                    loadPropertiesFromFile(envPropertiesFile, projectProperties);
                    hubProject.setUserModulesDeployTimestampFile(envString + "-" + USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES);
                }
            }
        }

        if (properties != null){
            properties.forEach(projectProperties::put);
        }

        if (host == null) {
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

        if (stagingScheme == null) {
            stagingScheme = getEnvPropString(projectProperties, "mlStagingScheme", environment.getProperty("mlStagingScheme"));
        }
        else {
            projectProperties.setProperty("mlStagingScheme", stagingScheme);
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

        if (finalScheme == null) {
            finalScheme = getEnvPropString(projectProperties, "mlFinalScheme", environment.getProperty("mlFinalScheme"));
        }
        else {
            projectProperties.setProperty("mlFinalScheme", finalScheme);
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

        if (jobScheme == null) {
            jobScheme = getEnvPropString(projectProperties, "mlJobScheme", environment.getProperty("mlJobScheme"));
        }
        else {
            projectProperties.setProperty("mlJobScheme", jobScheme);
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

        if (hubRoleName == null) {
            hubRoleName = getEnvPropString(projectProperties, "mlHubUserRole", environment.getProperty("mlHubUserRole"));
        }
        else {
            projectProperties.setProperty("mlHubUserRole", hubRoleName);
        }

        if (hubUserName == null) {
            hubUserName = getEnvPropString(projectProperties, "mlHubUserName", environment.getProperty("mlHubUserName"));
        }
        else {
            projectProperties.setProperty("mlHubUserName", hubUserName);
        }

        if (hubAdminRoleName == null) {
            hubAdminRoleName = getEnvPropString(projectProperties, "mlHubAdminRole", environment.getProperty("mlHubAdminRole"));
        }
        else {
            projectProperties.setProperty("mlHubAdminRole", hubAdminRoleName);
        }

        if (hubAdminUserName == null) {
            hubAdminUserName = getEnvPropString(projectProperties, "mlHubAdminUserName", environment.getProperty("mlHubAdminUserName"));
        }
        else {
            projectProperties.setProperty("mlHubAdminUserName", hubAdminUserName);
        }

        if (modulePermissions == null) {
            modulePermissions = getEnvPropString(projectProperties, "mlModulePermissions", environment.getProperty("mlModulePermissions"));
        }
        else {
            projectProperties.setProperty("mlModulePermissions", modulePermissions);
        }

        DHFVersion = getEnvPropString(projectProperties, "mlDHFVersion", environment.getProperty("mlDHFVersion"));

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

    private void hydrateAppConfigs(Properties properties) {
        com.marklogic.mgmt.util.PropertySource propertySource = properties::getProperty;
        hydrateAppConfigs(propertySource);
    }

    private void hydrateAppConfigs(Environment environment) {
        com.marklogic.mgmt.util.PropertySource propertySource = environment::getProperty;
        hydrateAppConfigs(propertySource);
    }

    private void hydrateAppConfigs(com.marklogic.mgmt.util.PropertySource propertySource) {
        if (appConfig != null) {
            setAppConfig(appConfig);
        }
        else {
            setAppConfig(new DefaultAppConfigFactory(propertySource).newAppConfig());
        }

        if (adminConfig != null) {
            setAdminConfig(adminConfig);
        }
        else {
            setAdminConfig(new DefaultAdminConfigFactory(propertySource).newAdminConfig());
        }

        if (adminManager != null) {
            setAdminManager(adminManager);
        }
        else {
            setAdminManager(new AdminManager(getAdminConfig()));
        }

        if (manageConfig != null) {
            setManageConfig(manageConfig);
        }
        else {
            setManageConfig(new DefaultManageConfigFactory(propertySource).newManageConfig());
        }

        if (manageClient != null) {
            setManageClient(manageClient);
        }
        else {
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

    private DatabaseClient newStagingClient(String dbName) {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), stagingPort, getMlUsername(), getMlPassword());
        config.setDatabase(dbName);
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
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), finalPort, getMlUsername(), getMlPassword());
        config.setDatabase(finalDbName);
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
        return hubProject.getModulesDir();
    }

    @JsonIgnore
    public Path getHubProjectDir() { return hubProject.getProjectDir(); }

    @JsonIgnore
    @Override public Path getHubPluginsDir() {
        return hubProject.getHubPluginsDir();
    }

    @JsonIgnore
    @Override public Path getHubEntitiesDir() { return hubProject.getHubEntitiesDir(); }

    @JsonIgnore
    @Override public Path getHubMappingsDir() { return hubProject.getHubMappingsDir(); }

    @JsonIgnore
    @Override
    public Path getStepsDirByType(Step.StepType type) {
        return hubProject.getStepsDirByType(type);
    }

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
    @Override public Path getUserSchemasDir() { return hubProject.getUserSchemasDir(); }

    @JsonIgnore
    @Override public Path getEntityDatabaseDir() {
        return hubProject.getEntityDatabaseDir();
    }

    @Override
    public Path getFlowsDir() { return hubProject.getFlowsDir();   }

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
            version = "5.0-SNAPSHOT";
        }
        return version;
    }

    @Override public String getDHFVersion() {

        return this.DHFVersion;
    }

    private Map<String, String> getCustomTokens() {
        AppConfig appConfig = getAppConfig();

        if (appConfig == null) {
            appConfig = new DefaultAppConfigFactory().newAppConfig();
        }

        return getCustomTokens(appConfig, appConfig.getCustomTokens());
    }

    private Map<String, String> getCustomTokens(AppConfig appConfig, Map<String, String> customTokens) {
        customTokens.put("%%mlHost%%", appConfig == null ? environment.getProperty("mlHost") : appConfig.getHost());
        customTokens.put("%%mlStagingAppserverName%%", stagingHttpName == null ? environment.getProperty("mlStagingAppserverName") : stagingHttpName);
        customTokens.put("\"%%mlStagingPort%%\"", stagingPort == null ? environment.getProperty("mlStagingPort") : stagingPort.toString());
        customTokens.put("%%mlStagingDbName%%", stagingDbName == null ? environment.getProperty("mlStagingDbName") : stagingDbName);
        customTokens.put("%%mlStagingForestsPerHost%%", stagingForestsPerHost == null ? environment.getProperty("mlStagingForestsPerHost") : stagingForestsPerHost.toString());
        customTokens.put("%%mlStagingAuth%%", stagingAuthMethod == null ? environment.getProperty("mlStagingAuth") : stagingAuthMethod);

        customTokens.put("%%mlFinalAppserverName%%", finalHttpName == null ? environment.getProperty("mlFinalAppserverName") : finalHttpName);
        customTokens.put("\"%%mlFinalPort%%\"", finalPort == null ? environment.getProperty("mlFinalPort") : finalPort.toString());
        customTokens.put("%%mlFinalDbName%%", finalDbName == null ? environment.getProperty("mlFinalDbName") : finalDbName);
        customTokens.put("%%mlFinalForestsPerHost%%", finalForestsPerHost == null ? environment.getProperty("mlFinalForestsPerHost") : finalForestsPerHost.toString());
        customTokens.put("%%mlFinalAuth%%", finalAuthMethod == null ? environment.getProperty("mlFinalAuth") : finalAuthMethod);


        customTokens.put("%%mlJobAppserverName%%", jobHttpName == null ? environment.getProperty("mlJobAppserverName") : jobHttpName);
        customTokens.put("\"%%mlJobPort%%\"", jobPort == null ? environment.getProperty("mlJobPort") : jobPort.toString());
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

        customTokens.put("%%mlHubUserRole%%", hubRoleName == null ? environment.getProperty("mlHubUserRole") : hubRoleName);
        customTokens.put("%%mlHubUserName%%", hubUserName == null ? environment.getProperty("mlHubUserName") : hubUserName);

        customTokens.put("%%mlHubAdminRole%%", hubAdminRoleName == null ? environment.getProperty("mlHubAdminRole") : hubAdminRoleName);
        customTokens.put("%%mlHubAdminUserName%%", hubAdminUserName == null ? environment.getProperty("mlHubAdminUserName") : hubAdminUserName);

        // random password for hub user
        RandomStringGenerator randomStringGenerator = new RandomStringGenerator.Builder().withinRange(33, 126).filteredBy((CharacterPredicate) codePoint -> (codePoint != 92 && codePoint != 34)).build();
        customTokens.put("%%mlHubUserPassword%%", randomStringGenerator.generate(20));
        // and another random password for hub Admin User
        customTokens.put("%%mlHubAdminUserPassword%%", randomStringGenerator.generate(20));

        customTokens.put("%%mlCustomForestPath%%", customForestPath == null ? environment.getProperty("mlCustomForestPath") : customForestPath);

        //version of DHF the user INTENDS to use
        customTokens.put("%%mlDHFVersion%%", getJarVersion());

        // in a load-from-properties situation we don't want a random string...
        if (projectProperties.containsKey("mlHubUserPassword")) {
            customTokens.put("%%mlHubUserPassword%%", projectProperties.getProperty("mlHubUserPassword"));
        }
        if (projectProperties.containsKey("mlHubAdminUserPassword")) {
            customTokens.put("%%mlHubAdminUserPassword%%", projectProperties.getProperty("mlHubAdminUserPassword"));
        }
        /* can't iterate through env properties, so rely on custom tokens itself?
        if (environment != null) {
            Enumeration keyEnum = environment.propertyNames();
            while (keyEnum.hasMoreElements()) {
                String key = (String) keyEnum.nextElement();
                if (key.matches("^ml[A-Z].+") && !customTokens.containsKey(key)) {
                    customTokens.put("%%" + key + "%%", (String) environmentProperties.get(key));
                }
            }
        }
        */

        return customTokens;
    }

    /**
     * Makes DHF-specific updates to the AppConfig, after it's been constructed by ml-gradle.
     *
     * @param config
     */
    private void updateAppConfig(AppConfig config) {
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

        config.setSchemasPath(getUserSchemasDir().toString());

        Map<String, String> customTokens = getCustomTokens(config, config.getCustomTokens());

        String version = getJarVersion();
        customTokens.put("%%mlHubVersion%%", version);

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
     * @param config
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
     * @param config
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
            return objmapper.writerWithDefaultPrettyPrinter().writeValueAsString(this);
        }
        catch(Exception e)
        {
            throw new DataHubConfigurationException("Your datahub configuration could not serialize");

        }

    }

    @JsonIgnore
    public void refreshProject() {
        refreshProject(null, true);
    }

    @JsonIgnore
    public void refreshProject(Properties properties, boolean loadGradleProperties) {
        loadConfigurationFromProperties(properties, loadGradleProperties);

        flowManager.setupClient();
        dataHub.wireClient();
        versions.setupClient();
        jobMonitor.setupClient();
    }

    /**
     * It is not expected that a client would use this, as it would be partially re-inventing what the Gradle
     * properties plugin does. But it is being preserved for backwards compatibility in case any clients prior to
     * 4.1 were using HubConfigBuilder.withPropertiesFromEnvironment.
     *
     * @param environment
     * @return
     */
    @JsonIgnore
    public HubConfig withPropertiesFromEnvironment(String environment) {
        this.envString = environment;
        hubProject.setUserModulesDeployTimestampFile(envString + "-" + USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES);
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
            throw new DataHubProjectException("No properties file found in project " + hubProject.getProjectDirString());
        }
    }

    public String getStagingSchemasDbName() {
        return this.stagingSchemasDbName;
    }

    // Only used by QS for login
    public void resetAppConfigs() {
        appConfig = null;
        adminConfig = null;
        adminManager = null;
        manageConfig = null;
        manageClient = null;
    }

}
