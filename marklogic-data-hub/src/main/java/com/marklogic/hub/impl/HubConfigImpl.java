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
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.mgmt.DefaultManageConfigFactory;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.admin.DefaultAdminConfigFactory;
import org.apache.commons.text.CharacterPredicate;
import org.apache.commons.text.RandomStringGenerator;
import org.omg.CORBA.Object;
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
public class HubConfigImpl extends AbstractHubConfig implements HubConfig
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

    private ManageConfig manageConfig;
    private ManageClient manageClient;
    private AdminConfig adminConfig;
    private AdminManager adminManager;

    // By default, DHF uses gradle-local.properties for your local environment.
    private String envString = "local";

    public HubConfigImpl() {
        projectProperties = new Properties();
    }

    public HubConfigImpl(Environment environment) {
        this();
        this.environment = environment;
    }

    public void createProject(String projectDirString) {
        hubProject.createProject(projectDirString);
    }

    @Override
    public String getProjectDir() {
        return hubProject.getProjectDirString();
    }

    @Override
    public void setProjectDir(String projectDir) {
        createProject(projectDir);
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

        if (dataHubAdminRoleName == null) {
            dataHubAdminRoleName = getEnvPropString(projectProperties, "mlDataHubAdminRole", environment.getProperty("mlDataHubAdminRole"));
        }
        else {
            projectProperties.setProperty("mlDataHubAdminRole", dataHubAdminRoleName);
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
    public Path getStepsDirByType(StepDefinition.StepDefinitionType type) {
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
    public Path getFlowsDir() {
        return hubProject.getFlowsDir();
    }

    @Override
    public Path getStepDefinitionsDir() {
        return hubProject.getStepDefinitionsDir();
    }

    @JsonIgnore
    @Override
    public Path getUserServersDir() {
        return hubProject.getUserServersDir();
    }

    @Override
    public void setAppConfig(AppConfig config) {
        setAppConfig(config, false);
    }

    @Override
    public void setAppConfig(AppConfig config, boolean skipUpdate) {
        this.appConfig = config;
        if (!skipUpdate) {
            updateAppConfig(this.appConfig);
        }
    }

    protected void updateAppConfig(AppConfig config) {
        super.updateAppConfig(config);

        if (envString != null) {
            String defaultPath = config.getModuleTimestampsPath();
            int index = defaultPath.lastIndexOf("/") + 1;
            config.setModuleTimestampsPath(defaultPath.substring(0, index) + envString + "-" + defaultPath.substring(index));
        }

        modifyCustomTokensMap(config);

        this.appConfig = config;
    }

    private Map<String, String> getCustomTokens() {
        AppConfig appConfig = getAppConfig();
        if (appConfig == null) {
            appConfig = new DefaultAppConfigFactory().newAppConfig();
        }
        modifyCustomTokensMap(appConfig);
        return appConfig.getCustomTokens();
    }

    protected void modifyCustomTokensMap(AppConfig appConfig) {
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

        customTokens.put("%%mlDataHubAdminRole%%", dataHubAdminRoleName == null ? environment.getProperty("mlDataHubAdminRole") : dataHubAdminRoleName);

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
     * @param environment a string name for environment
     * @return a hubconfig object
     */
    @JsonIgnore
    public HubConfig withPropertiesFromEnvironment(String environment) {
        this.envString = environment;
        hubProject.setUserModulesDeployTimestampFile(envString + "-" + USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES);
        return this;
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

        dataHubAdminRoleName = null;
        customForestPath = null;
        modulePermissions = null;
        entityModelPermissions = null;
        jobPermissions = null;
        hubLogLevel = null;
        loadBalancerHost = null;
        isHostLoadBalancer = null;
    }

}
