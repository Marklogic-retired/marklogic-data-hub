package com.marklogic.quickstart.model;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;

@Component
@Scope("session")
public class EnvironmentConfig {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(EnvironmentConfig.class);
    private static final String GRADLE_PROPERTIES_FILENAME = "gradle.properties";

    public String projectDir;
    public String environment;
    public boolean installed = false;
    public boolean isInitialized = false;

    public HubConfig mlSettings;

    private Properties environmentProperties = new Properties();

    public void init(String projectDir, String environment) {
        init(projectDir, environment, null);
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    public void init(String projectDir, String environment, LoginInfo loginInfo) {
        this.projectDir = projectDir;
        this.environment = environment;
        mlSettings = new HubConfig(this.projectDir);
        mlSettings.adminUsername = loginInfo.username;
        mlSettings.adminPassword = loginInfo.password;
        loadConfigurationFromFiles();

        DataHub dh = new DataHub(mlSettings);
        installed = dh.isInstalled();
        isInitialized = true;
    }

    public void loadConfigurationFromFiles() {
        loadConfigurationFromFile(environmentProperties, GRADLE_PROPERTIES_FILENAME);
        String envPropertiesFile = "gradle-" + environment + ".properties";
        LOGGER.info("envPropertiesFile = " + envPropertiesFile);
        loadConfigurationFromFile(environmentProperties, envPropertiesFile);
        LOGGER.info(environmentProperties.toString());

        setEnvPropString("mlAppName", mlSettings.name);

        setEnvPropString("mlHost", mlSettings.host);

        setEnvPropString("mlStagingDbName", mlSettings.stagingDbName);
        setEnvPropString("mlStagingAppserverName", mlSettings.stagingHttpName);
        setEnvPropInteger("mlStagingForestsPerHost", mlSettings.stagingForestsPerHost);
        setEnvPropInteger("mlStagingPort", mlSettings.stagingPort);

        setEnvPropString("mlFinalDbName", mlSettings.finalDbName);
        setEnvPropString("mlFinalAppserverName", mlSettings.finalHttpName);
        setEnvPropInteger("mlFinalForestsPerHost", mlSettings.finalForestsPerHost);
        setEnvPropInteger("mlFinalPort", mlSettings.finalPort);

        setEnvPropString("mlTraceDbName", mlSettings.traceDbName);
        setEnvPropString("mlTraceAppserverName", mlSettings.traceHttpName);
        setEnvPropInteger("mlTraceForestsPerHost", mlSettings.traceForestsPerHost);
        setEnvPropInteger("mlTracePort", mlSettings.tracePort);

        setEnvPropString("mlModulesDbName", mlSettings.modulesDbName);
        setEnvPropString("mlTriggersDbName", mlSettings.triggersDbName);
        setEnvPropString("mlSchemasDbName", mlSettings.schemasDbName);

        setEnvPropString("mlAuth", mlSettings.authMethod);
    }

    private void setEnvPropString(String key, String target) {
        String value = this.environmentProperties.getProperty(key);
        if (value != null) {
            target = value;
        }
    }

    private void setEnvPropInteger(String key, Integer target) {
        String value = this.environmentProperties.getProperty(key);
        if (value != null) {
            target = Integer.parseInt(value);
        }
    }

    public void loadConfigurationFromFile(Properties configProperties, String fileName) {
        InputStream is = null;
        try {
            File file = new File(this.projectDir, fileName);
            if(file.exists()) {
                is = new FileInputStream( file );
                configProperties.load( is );
                is.close();
            }
        } catch ( Exception e ) {
            is = null;
        }
    }

    @JsonIgnore
    public DatabaseClient getStagingClient() {
        Authentication authMethod = Authentication
                .valueOf(mlSettings.authMethod.toUpperCase());

        DatabaseClient client = DatabaseClientFactory.newClient(
                mlSettings.host,
                mlSettings.stagingPort,
                mlSettings.adminUsername,
                mlSettings.adminPassword, authMethod);
        return client;
    }

    @JsonIgnore
    public DatabaseClient getFinalClient() {
        Authentication authMethod = Authentication
                .valueOf(mlSettings.authMethod.toUpperCase());

        DatabaseClient client = DatabaseClientFactory.newClient(
                mlSettings.host,
                mlSettings.finalPort,
                mlSettings.adminUsername,
                mlSettings.adminPassword, authMethod);
        return client;
    }
}
