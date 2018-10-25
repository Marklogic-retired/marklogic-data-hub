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
import com.marklogic.mgmt.DefaultManageConfigFactory;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.admin.DefaultAdminConfigFactory;
import org.apache.commons.io.IOUtils;
import org.apache.commons.text.CharacterPredicate;
import org.apache.commons.text.RandomStringGenerator;
import org.apache.http.conn.ssl.X509HostnameVerifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.security.cert.X509Certificate;
import java.util.*;

@JsonAutoDetect(
    fieldVisibility = JsonAutoDetect.Visibility.PROTECTED_AND_PUBLIC,
    getterVisibility = JsonAutoDetect.Visibility.ANY,
    setterVisibility = JsonAutoDetect.Visibility.ANY)
@Component
@PropertySource({"classpath:dhf-defaults.properties"})
// TODO change to DHS defaults
public class HubConfigImpl implements HubConfig
{
    @Autowired
    private HubProject hubProject;

    @Autowired
    private Environment environment;

    // a set of properties to use for legacy token replacement.
    Properties projectProperties = null;

    // TODO fix this. hooks into every singleton for refresh :(
    @Autowired FlowManagerImpl flowManager;
    @Autowired DataHubImpl dataHub;
    @Autowired Versions versions;
    @Autowired ScaffoldingImpl scaffolding;

    @Value("${mlHost}")
    protected String host;

    @Value("${mlStagingDbName}")
    protected String stagingDbName;
    @Value("${mlStagingAppserverName}")
    protected String stagingHttpName;
    @Value("${mlStagingForestsPerHost}")
    protected Integer stagingForestsPerHost;
    @Value("${mlStagingPort}")
    protected Integer stagingPort;
    @Value("${mlStagingAuth}")
    protected String stagingAuthMethod;
    @Value("${mlStagingScheme}")
    private String stagingScheme;
    @Value("${mlStagingSimpleSsl}")
    private boolean stagingSimpleSsl;


    private SSLContext stagingSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier;
    private String stagingCertFile;
    private String stagingCertPassword;
    private String stagingExternalName;
    private X509TrustManager stagingTrustManager;

    @Value("${mlFinalDbName}")
    protected String finalDbName;
    @Value("${mlFinalAppserverName}")
    protected String finalHttpName;
    @Value("${mlFinalForestsPerHost}")
    protected Integer finalForestsPerHost;
    @Value("${mlFinalPort}")
    protected Integer finalPort;
    @Value("${mlFinalAuth}")
    protected String finalAuthMethod;
    @Value("${mlFinalScheme}")
    private String finalScheme;
    @Value("${mlFinalSimpleSsl}")
    private boolean finalSimpleSsl;
    private SSLContext finalSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier;
    private String finalCertFile;
    private String finalCertPassword;
    private String finalExternalName;
    private X509TrustManager finalTrustManager;

    @Value("${mlJobDbName}")
    protected String jobDbName;
    @Value("${mlJobAppserverName}")
    protected String jobHttpName;
    @Value("${mlJobForestsPerHost}")
    protected Integer jobForestsPerHost;
    @Value("${mlJobPort}")
    protected Integer jobPort;
    @Value("${mlJobAuth}")
    protected String jobAuthMethod;
    @Value("${mlJobScheme}")
    private String jobScheme;
    @Value("${mlJobSimpleSsl}")
    private boolean jobSimpleSsl;
    private SSLContext jobSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier;
    private String jobCertFile;
    private String jobCertPassword;
    private String jobExternalName;
    private X509TrustManager jobTrustManager;

    @Value("${mlModulesDbName}")
    protected String modulesDbName;
    @Value("${mlModulesForestsPerHost}")
    protected Integer modulesForestsPerHost = 1;

    @Value("${mlStagingTriggersDbName}")
    protected String stagingTriggersDbName;
    @Value("${mlStagingTriggersForestsPerHost}")
    protected Integer stagingTriggersForestsPerHost;
    @Value("${mlFinalTriggersDbName}")
    protected String finalTriggersDbName;
    @Value("${mlFinalTriggersForestsPerHost}")
    protected Integer finalTriggersForestsPerHost;

    @Value("${mlStagingSchemasDbName}")
    protected String stagingSchemasDbName;
    @Value("${mlStagingSchemasForestsPerHost}")
    protected Integer stagingSchemasForestsPerHost;
    @Value("${mlFinalSchemasDbName}")
    protected String finalSchemasDbName;
    @Value("${mlFinalSchemasForestsPerHost}")
    protected Integer finalSchemasForestsPerHost;

    @Value("${mlHubUserRole}")
    private String hubRoleName;
    @Value("${mlHubUserName}")
    private String hubUserName;
    @Value("${mlHubAdminRole}")
    private String hubAdminRoleName;
    @Value("${mlHubAdminUserName}")
    private String hubAdminUserName;

    //we assume DHF 2.x unless otherwise told, our earliest 'from' version
    private String DHFVersion = "2.0.0";

    // these hold runtime credentials for flows.
    private String mlUsername = null;
    private String mlPassword = null;

    private String loadBalancerHost;

    @Value("${mlIsHostLoadBalancer}")
    private Boolean isHostLoadBalancer;

    @Value("${mlIsProvisionedEnvironment}")
    private Boolean isProvisionedEnvironment;

    @Value("${mlCustomForestPath}")
    protected String customForestPath;
    @Value("${mlModulePermissions}")
    protected String modulePermissions;

    private ManageConfig manageConfig;
    private ManageClient manageClient;
    private AdminConfig adminConfig;
    private AdminManager adminManager;

    private AppConfig stagingAppConfig;
    private AppConfig finalAppConfig;

    private static final Logger logger = LoggerFactory.getLogger(HubConfigImpl.class);

    private ObjectMapper objmapper;

    public HubConfigImpl() {
        objmapper = new ObjectMapper();
        projectProperties = new Properties();
    }


    public String getHost() { return stagingAppConfig.getHost(); }

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


    @PostConstruct
    /* this method takes care of setting app config and other non-injected dependencies */
    public void initializeApplicationConfigurations() {
        hydrateAppConfigs(environment);
        hydrateConfigs();
    }

    public void hydrateConfigs() {
        if (stagingSimpleSsl) {
            stagingSslContext = SimpleX509TrustManager.newSSLContext();
            stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            stagingTrustManager = new SimpleX509TrustManager();
        }
        if (finalSimpleSsl) {
            finalSslContext = SimpleX509TrustManager.newSSLContext();
            finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            finalTrustManager = new SimpleX509TrustManager();
        }
        if (jobSimpleSsl) {
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


    public void loadConfigurationFromProperties() {
        projectProperties = new Properties();
        InputStream inputStream = null;
        try {
            inputStream = new FileSystemResource(hubProject.getProjectDir().resolve("gradle.properties").toFile()).getInputStream();
            projectProperties.load(inputStream);
            inputStream.close();
        } catch (IOException e) {
            throw new DataHubProjectException("No properties file found in project " + hubProject.getProjectDirString());
        } finally {
        }

        host = getEnvPropString(projectProperties, "mlHost", host);
        stagingDbName = getEnvPropString(projectProperties, "mlStagingDbName", stagingDbName);
        stagingHttpName = getEnvPropString(projectProperties, "mlStagingAppserverName", stagingHttpName);
        stagingForestsPerHost = getEnvPropInteger(projectProperties, "mlStagingForestsPerHost", stagingForestsPerHost);
        stagingPort = getEnvPropInteger(projectProperties, "mlStagingPort", stagingPort);
        stagingAuthMethod = getEnvPropString(projectProperties, "mlStagingAuth", stagingAuthMethod);
        stagingScheme = getEnvPropString(projectProperties, "mlStagingScheme", stagingScheme);
        stagingSimpleSsl = getEnvPropBoolean(projectProperties, "mlStagingSimpleSsl", false);
        stagingCertFile = getEnvPropString(projectProperties, "mlStagingCertFile", stagingCertFile);
        stagingCertPassword = getEnvPropString(projectProperties, "mlStagingCertPassword", stagingCertPassword);
        stagingExternalName = getEnvPropString(projectProperties, "mlStagingExternalName", stagingExternalName);


        finalDbName = getEnvPropString(projectProperties, "mlFinalDbName", finalDbName);
        finalHttpName = getEnvPropString(projectProperties, "mlFinalAppserverName", finalHttpName);
        finalForestsPerHost = getEnvPropInteger(projectProperties, "mlFinalForestsPerHost", finalForestsPerHost);
        finalPort = getEnvPropInteger(projectProperties, "mlFinalPort", finalPort);
        finalAuthMethod = getEnvPropString(projectProperties, "mlFinalAuth", finalAuthMethod);
        finalScheme = getEnvPropString(projectProperties, "mlFinalScheme", finalScheme);
        finalCertFile = getEnvPropString(projectProperties, "mlfinalCertFile", finalCertFile);
        finalCertPassword = getEnvPropString(projectProperties, "mlfinalCertPassword", finalCertPassword);
        finalExternalName = getEnvPropString(projectProperties, "mlfinalExternalName", finalExternalName);


        jobDbName = getEnvPropString(projectProperties, "mlJobDbName", jobDbName);
        jobHttpName = getEnvPropString(projectProperties, "mlJobAppserverName", jobHttpName);
        jobForestsPerHost = getEnvPropInteger(projectProperties, "mlJobForestsPerHost", jobForestsPerHost);
        jobPort = getEnvPropInteger(projectProperties, "mlJobPort", jobPort);
        jobAuthMethod = getEnvPropString(projectProperties, "mlJobAuth", jobAuthMethod);
        jobScheme = getEnvPropString(projectProperties, "mlJobScheme", jobScheme);
        jobSimpleSsl = getEnvPropBoolean(projectProperties, "mlJobSimpleSsl", false);
        jobCertFile = getEnvPropString(projectProperties, "mlJobCertFile", jobCertFile);
        jobCertPassword = getEnvPropString(projectProperties, "mlJobCertPassword", jobCertPassword);
        jobExternalName = getEnvPropString(projectProperties, "mlJobExternalName", jobExternalName);

        customForestPath = getEnvPropString(projectProperties, "mlCustomForestPath", customForestPath);

        modulesDbName = getEnvPropString(projectProperties, "mlModulesDbName", modulesDbName);
        modulesForestsPerHost = getEnvPropInteger(projectProperties, "mlModulesForestsPerHost", modulesForestsPerHost);
        modulePermissions = getEnvPropString(projectProperties, "mlModulePermissions", modulePermissions);

        stagingTriggersDbName = getEnvPropString(projectProperties, "mlStagingTriggersDbName", stagingTriggersDbName);
        stagingTriggersForestsPerHost = getEnvPropInteger(projectProperties, "mlStagingTriggersForestsPerHost", stagingTriggersForestsPerHost);

        finalTriggersDbName = getEnvPropString(projectProperties, "mlFinalTriggersDbName", finalTriggersDbName);
        finalTriggersForestsPerHost = getEnvPropInteger(projectProperties, "mlFinalTriggersForestsPerHost", finalTriggersForestsPerHost);

        stagingSchemasDbName = getEnvPropString(projectProperties, "mlStagingSchemasDbName", stagingSchemasDbName);
        stagingSchemasForestsPerHost = getEnvPropInteger(projectProperties, "mlStagingSchemasForestsPerHost", stagingSchemasForestsPerHost);

        finalSchemasDbName = getEnvPropString(projectProperties, "mlFinalSchemasDbName", finalSchemasDbName);
        finalSchemasForestsPerHost = getEnvPropInteger(projectProperties, "mlFinalSchemasForestsPerHost", finalSchemasForestsPerHost);

        hubRoleName = getEnvPropString(projectProperties, "mlHubUserRole", hubRoleName);
        hubUserName = getEnvPropString(projectProperties, "mlHubUserName", hubUserName);

        DHFVersion = getEnvPropString(projectProperties, "mlDHFVersion", DHFVersion);

        // this is a runtime username/password for running flows
        // could be factored away with FlowRunner
        mlUsername = getEnvPropString(projectProperties, "mlUsername", mlUsername);
        mlPassword = getEnvPropString(projectProperties, "mlPassword", mlPassword);

        loadBalancerHost = getEnvPropString(projectProperties, "mlLoadBalancerHosts", null);
        isHostLoadBalancer = getEnvPropBoolean(projectProperties, "mlIsHostLoadBalancer", false);

        isProvisionedEnvironment = getEnvPropBoolean(projectProperties, "mlIsProvisionedEnvironment", false);

        hydrateAppConfigs(projectProperties);
        hydrateConfigs();
        logger.info("Hub Project: " + hubProject);
    }

    private void hydrateAppConfigs(Properties properties) {
        com.marklogic.mgmt.util.PropertySource propertySource = new com.marklogic.mgmt.util.PropertySource() {
            @Override
            public String getProperty(String name) {
                return properties.getProperty(name);
            }
        };
        hydrateAppConfigs(propertySource);
    }
    private void hydrateAppConfigs(Environment environment) {
        com.marklogic.mgmt.util.PropertySource propertySource = new com.marklogic.mgmt.util.PropertySource() {
            @Override
            public String getProperty(String name) {
                return environment.getProperty(name);
            }
        };
        hydrateAppConfigs(propertySource);
    }
    private void hydrateAppConfigs(com.marklogic.mgmt.util.PropertySource propertySource) {

        setStagingAppConfig(new DefaultAppConfigFactory(propertySource).newAppConfig());
        getStagingAppConfig().setSortOtherDatabaseByDependencies(false);

        setFinalAppConfig(new DefaultAppConfigFactory(propertySource).newAppConfig());
        getFinalAppConfig().setSortOtherDatabaseByDependencies(false);

        setAdminConfig(new DefaultAdminConfigFactory(propertySource).newAdminConfig());
        setAdminManager(new AdminManager(getAdminConfig()));

        ManageConfig manageConfig = new DefaultManageConfigFactory(propertySource).newManageConfig();
        manageConfig.setHostnameVerifier(new X509HostnameVerifier() {
            @Override
            public void verify(String s, SSLSocket sslSocket) {
            }

            @Override
            public void verify(String s, X509Certificate x509Certificate) {
            }

            @Override
            public void verify(String s, String[] strings, String[] strings1) {
            }

            @Override
            public boolean verify(String s, SSLSession sslSession) {
                return true;
            }
        });
        setManageConfig(manageConfig);
        setManageClient(new ManageClient(getManageConfig()));
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
        return getStagingAppConfig().newAppServicesDatabaseClient(stagingDbName);
    }

    @Override
    public DatabaseClient newStagingClient() {
        return newStagingClient(stagingDbName);
    }

    private DatabaseClient newStagingClient(String dbName) {
        if (isHostLoadBalancer) {
            return newStagingDbClientForLoadBalancerHost(dbName);
        }
        else {
            AppConfig appConfig = getStagingAppConfig();
            DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), stagingPort, getMlUsername(), getMlPassword());
            config.setDatabase(dbName);
            config.setSecurityContextType(SecurityContextType.valueOf(stagingAuthMethod.toUpperCase()));
            config.setSslHostnameVerifier(stagingSslHostnameVerifier);
            config.setSslContext(stagingSslContext);
            config.setCertFile(stagingCertFile);
            config.setCertPassword(stagingCertPassword);
            config.setExternalName(stagingExternalName);
            config.setTrustManager(stagingTrustManager);
            return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
        }
    }

    @Override
    // this method uses STAGING appserver but FINAL database.
    // it's only use is for reverse flows, which need to use staging modules.
    public DatabaseClient newReverseFlowClient() {
        if (isHostLoadBalancer) {
            return newStagingDbClientForLoadBalancerHost(finalDbName);
        } else {
            return newStagingClient(finalDbName);
        }
    }

    public DatabaseClient newStagingDbClientForLoadBalancerHost(String database){
        return getDatabaseClientForLoadBalancerHost(stagingAuthMethod, stagingTrustManager, stagingSslHostnameVerifier, stagingCertFile, stagingCertPassword, stagingSslContext, stagingExternalName, stagingPort, database);

    }

    private DatabaseClient newJobDbClientForLoadBalancerHost(){
        return getDatabaseClientForLoadBalancerHost(jobAuthMethod, jobTrustManager, jobSslHostnameVerifier, jobCertFile, jobCertPassword, jobSslContext, jobExternalName, jobPort, jobDbName);

    }

    private DatabaseClient getDatabaseClientForLoadBalancerHost(String stagingAuthMethod, X509TrustManager stagingTrustManager, DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier, String stagingCertFile, String stagingCertPassword, SSLContext stagingSslContext, String stagingExternalName, Integer stagingPort, String stagingDbName)
    {
        AppConfig appConfig = getStagingAppConfig();

        DatabaseClientFactory.SecurityContext securityContext;

        SecurityContextType securityContextType = SecurityContextType.valueOf(stagingAuthMethod.toUpperCase());

        if (SecurityContextType.BASIC.equals(securityContextType)) {
            securityContext = new DatabaseClientFactory.BasicAuthContext(getMlUsername(), getMlPassword());
        } else if (SecurityContextType.CERTIFICATE.equals(securityContextType)) {
            X509TrustManager trustManager = stagingTrustManager;
            DatabaseClientFactory.SSLHostnameVerifier verifier = stagingSslHostnameVerifier;

            String certFile = stagingCertFile;
            if (certFile != null) {
                try {
                    if (stagingCertPassword != null) {
                        securityContext = new DatabaseClientFactory.CertificateAuthContext(certFile, stagingCertPassword, trustManager);
                    }
                    else {
                        securityContext = new DatabaseClientFactory.CertificateAuthContext(certFile, trustManager);
                    }
                } catch (Exception ex) {
                    throw new RuntimeException("Unable to build CertificateAuthContext: " + ex.getMessage(), ex);
                }
            }
            else if (verifier != null) {
                securityContext = new DatabaseClientFactory.CertificateAuthContext(stagingSslContext, verifier, trustManager);
            }
            else {
                securityContext = new DatabaseClientFactory.CertificateAuthContext(stagingSslContext, trustManager);

            }
        } else if (SecurityContextType.DIGEST.equals(securityContextType)) {
            securityContext = new DatabaseClientFactory.DigestAuthContext(getMlUsername(), getMlPassword());
        } else if (SecurityContextType.KERBEROS.equals(securityContextType)) {
            securityContext = new DatabaseClientFactory.KerberosAuthContext(stagingExternalName);
        } else if (SecurityContextType.NONE.equals(securityContextType)) {
            securityContext = null;
        }
        else {
            throw new IllegalArgumentException("Unsupported SecurityContextType: " + securityContextType);
        }

        if (securityContext != null) {
            SSLContext sslContext = stagingSslContext;
            DatabaseClientFactory.SSLHostnameVerifier verifier = stagingSslHostnameVerifier;
            if (sslContext != null) {
                securityContext = securityContext.withSSLContext(sslContext, stagingTrustManager);
            }
            if (verifier != null) {
                securityContext = securityContext.withSSLHostnameVerifier(verifier);
            }
        }

        String host = appConfig.getHost();
        int port = stagingPort;
        String database = stagingDbName;

        if (securityContext == null) {
            if (database == null) {
                return DatabaseClientFactory.newClient(host, port, null, DatabaseClient.ConnectionType.GATEWAY);
            }
            return DatabaseClientFactory.newClient(host, port, database, null, DatabaseClient.ConnectionType.GATEWAY);
        }
        if (database == null) {
            return DatabaseClientFactory.newClient(host, port, securityContext, DatabaseClient.ConnectionType.GATEWAY);
        }
        return DatabaseClientFactory.newClient(host, port, database, securityContext, DatabaseClient.ConnectionType.GATEWAY);
    }

    @Override
    public DatabaseClient newFinalClient() {
        AppConfig appConfig = getFinalAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), finalPort, getMlUsername(), getMlPassword());
        config.setDatabase(finalDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(finalSslHostnameVerifier);
        config.setSslContext(finalSslContext);
        config.setCertFile(finalCertFile);
        config.setCertPassword(finalCertPassword);
        config.setExternalName(finalExternalName);
        config.setTrustManager(finalTrustManager);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    public DatabaseClient newJobDbClient() {
        if (isHostLoadBalancer){
            return newJobDbClientForLoadBalancerHost();
        }
        else {
            AppConfig appConfig = getStagingAppConfig();
            DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), jobPort, mlUsername, mlPassword);
            config.setDatabase(jobDbName);
            config.setSecurityContextType(SecurityContextType.valueOf(jobAuthMethod.toUpperCase()));
            config.setSslHostnameVerifier(jobSslHostnameVerifier);
            config.setSslContext(jobSslContext);
            config.setCertFile(jobCertFile);
            config.setCertPassword(jobCertPassword);
            config.setExternalName(jobExternalName);
            config.setTrustManager(jobTrustManager);
            return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
        }
    }

    public DatabaseClient newTraceDbClient() {
        return newJobDbClient();
    }

    public DatabaseClient newModulesDbClient() {
        AppConfig appConfig = getStagingAppConfig();
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
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    @JsonIgnore
    @Override public Path getModulesDir() {
        return hubProject.getModulesDir();
    }

    @JsonIgnore
    @Override public Path getHubPluginsDir() {
        return hubProject.getHubPluginsDir();
    }

    @JsonIgnore
    @Override public Path getHubEntitiesDir() { return hubProject.getHubEntitiesDir(); }

    @JsonIgnore
    @Override public Path getHubMappingsDir() { return hubProject.getHubMappingsDir(); }

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

    @JsonIgnore
    @Override public Path getUserServersDir() {
        return hubProject.getUserServersDir();
    }

    @JsonIgnore
    @Override public AppConfig getStagingAppConfig() {
        return stagingAppConfig;
    }


    @Override public void setStagingAppConfig(AppConfig config) {
        setStagingAppConfig(config, false);
    }

    @Override public void setStagingAppConfig(AppConfig config, boolean skipUpdate) {
        this.stagingAppConfig = config;
        if (!skipUpdate) {
            updateStagingAppConfig(this.stagingAppConfig);
        }
    }

    @JsonIgnore
    @Override public AppConfig getFinalAppConfig() {
        return finalAppConfig;
    }


    @Override public void setFinalAppConfig(AppConfig config) {
        setFinalAppConfig(config, false);
    }

    @Override public void setFinalAppConfig(AppConfig config, boolean skipUpdate) {
        this.finalAppConfig = config;
        if (!skipUpdate) {
            updateFinalAppConfig(this.finalAppConfig);
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
            version = "4.0.1";
        }
        return version;
    }

    @Override public String getDHFVersion() {

        return this.DHFVersion;
    }


    private Map<String, String> getCustomTokens() {
        AppConfig appConfig = getStagingAppConfig();
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

        customTokens.put("%%mlStagingTriggersDbName%%", stagingTriggersDbName);
        customTokens.put("%%mlStagingTriggersForestsPerHost%%", stagingTriggersForestsPerHost.toString());

        customTokens.put("%%mlFinalTriggersDbName%%", finalTriggersDbName);
        customTokens.put("%%mlFinalTriggersForestsPerHost%%", finalTriggersForestsPerHost.toString());

        customTokens.put("%%mlStagingSchemasDbName%%", stagingSchemasDbName);
        customTokens.put("%%mlStagingSchemasForestsPerHost%%", stagingSchemasForestsPerHost.toString());

        customTokens.put("%%mlFinalSchemasDbName%%", finalSchemasDbName);
        customTokens.put("%%mlFinalSchemasForestsPerHost%%", finalSchemasForestsPerHost.toString());

        customTokens.put("%%mlHubUserRole%%", hubRoleName);
        customTokens.put("%%mlHubUserName%%", hubUserName);

        customTokens.put("%%mlHubAdminRole%%", hubAdminRoleName);
        customTokens.put("%%mlHubAdminUserName%%", hubAdminUserName);

        // random password for hub user
        RandomStringGenerator randomStringGenerator = new RandomStringGenerator.Builder().withinRange(33, 126).filteredBy((CharacterPredicate) codePoint -> (codePoint != 92 && codePoint != 34)).build();
        customTokens.put("%%mlHubUserPassword%%", randomStringGenerator.generate(20));
        // and another random password for hub Admin User
        customTokens.put("%%mlHubAdminUserPassword%%", randomStringGenerator.generate(20));

        customTokens.put("%%mlCustomForestPath%%", customForestPath);

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

    private void updateStagingAppConfig(AppConfig config) {
        config.setRestPort(stagingPort);

        config.setTriggersDatabaseName(stagingTriggersDbName);
        config.setSchemasDatabaseName(stagingSchemasDbName);
        config.setModulesDatabaseName(modulesDbName);

        config.setReplaceTokensInModules(true);
        config.setUseRoxyTokenPrefix(false);
        config.setModulePermissions(modulePermissions);

        HashMap<String, Integer> forestCounts = new HashMap<>();
        forestCounts.put(stagingDbName, stagingForestsPerHost);
        forestCounts.put(jobDbName, jobForestsPerHost);
        forestCounts.put(modulesDbName, modulesForestsPerHost);
        forestCounts.put(stagingTriggersDbName, stagingTriggersForestsPerHost);
        forestCounts.put(stagingSchemasDbName, stagingSchemasForestsPerHost);
        config.setForestCounts(forestCounts);

        ConfigDir configDir = new ConfigDir(getHubConfigDir().toFile());
        config.setConfigDir(configDir);
        config.setSchemasPath(getHubConfigDir().resolve("schemas").toString());

        Map<String, String> customTokens = getCustomTokens(config, config.getCustomTokens());
        if (projectProperties != null) {
            Enumeration keyEnum = projectProperties.propertyNames();
            while (keyEnum.hasMoreElements()) {
                String key = (String) keyEnum.nextElement();
                if (key.matches("^ml[A-Z].+") && !customTokens.containsKey(key)) {
                    customTokens.put("%%" + key + "%%", (String) projectProperties.get(key));
                }
            }
        }


        String version = getJarVersion();
        customTokens.put("%%mlHubVersion%%", version);

        stagingAppConfig = config;
    }

    private void updateFinalAppConfig(AppConfig config) {
        config.setRestPort(finalPort);

        config.setTriggersDatabaseName(finalTriggersDbName);
        config.setSchemasDatabaseName(finalSchemasDbName);
        config.setModulesDatabaseName(modulesDbName);

        config.setReplaceTokensInModules(true);
        config.setUseRoxyTokenPrefix(false);
        config.setModulePermissions(modulePermissions);

        HashMap<String, Integer> forestCounts = new HashMap<>();
        forestCounts.put(finalDbName, finalForestsPerHost);
        forestCounts.put(modulesDbName, modulesForestsPerHost);
        forestCounts.put(finalTriggersDbName, finalTriggersForestsPerHost);
        forestCounts.put(finalSchemasDbName, finalSchemasForestsPerHost);
        config.setForestCounts(forestCounts);

        ConfigDir configDir = new ConfigDir(getUserConfigDir().toFile());
        config.setConfigDir(configDir);
        config.setSchemasPath(getUserSchemasDir().toString());
        List<String> modulesPathList = new ArrayList<>();
        modulesPathList.add(getModulesDir().normalize().toAbsolutePath().toString());
        config.setModulePaths(modulesPathList);

        Map<String, String> customTokens = getCustomTokens(config, config.getCustomTokens());

        // spring has custom tokens handling FIXME
        /*  use an itertion over custom tokens rather than properties?
        Enumeration keyEnum = environmentProperties.propertyNames();
            while (keyEnum.hasMoreElements()) {
                String key = (String) keyEnum.nextElement();
                if (key.matches("^ml[A-Z].+") && !customTokens.containsKey(key)) {
                    customTokens.put("%%" + key + "%%", (String) environmentProperties.get(key));
                }
            }
        }
        */


        String version = getJarVersion();
        customTokens.put("%%mlHubVersion%%", version);

        finalAppConfig = config;
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

    @Override
    @JsonIgnore
    public void refreshProject() {
        loadConfigurationFromProperties();

        flowManager.setupClient();
        dataHub.wireClient();
        versions.setupClient();

    }

    public String toString() {
        return getInfo();
    }
}
