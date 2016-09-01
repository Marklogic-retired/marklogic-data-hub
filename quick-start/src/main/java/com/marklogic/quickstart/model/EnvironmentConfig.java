package com.marklogic.quickstart.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

@Component
@Scope(proxyMode=ScopedProxyMode.TARGET_CLASS, value="session")
public class EnvironmentConfig {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(EnvironmentConfig.class);
    private static final String GRADLE_PROPERTIES_FILENAME = "gradle.properties";

    private String projectDir;
    private String environment;

    private boolean installed = false;
    private boolean isInitialized = false;

    private HubConfig mlSettings;


    private DataHub dataHub;

    private Properties environmentProperties = new Properties();

    public boolean isInstalled() {
        return installed;
    }

    public void setInstalled(boolean installed) {
        this.installed = installed;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getProjectDir() {
        return projectDir;
    }

    public void setProjectDir(String projectDir) {
        this.projectDir = projectDir;
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    public void setInitialized(boolean initialized) {
        isInitialized = initialized;
    }

    public HubConfig getMlSettings() {
        return mlSettings;
    }

    public void setMlSettings(HubConfig mlSettings) {
        this.mlSettings = mlSettings;
    }

    public void init(String projectDir, String environment) {
        init(projectDir, environment, null);
    }

    public void init(String projectDir, String environment, LoginInfo loginInfo) {
        this.projectDir = projectDir;
        this.environment = environment;

        mlSettings = HubConfig.hubFromEnvironment(this.projectDir, environment);
        if (loginInfo != null) {
            mlSettings.username = loginInfo.username;
            mlSettings.password = loginInfo.password;
        }

        dataHub = new DataHub(mlSettings);
        installed = dataHub.isInstalled();
        isInitialized = true;
    }

    @JsonIgnore
    public DatabaseClient getStagingClient() {
        Authentication authMethod = Authentication
                .valueOf(mlSettings.authMethod.toUpperCase());

        DatabaseClient client = DatabaseClientFactory.newClient(
                mlSettings.host,
                mlSettings.stagingPort,
                mlSettings.username,
                mlSettings.password, authMethod);
        return client;
    }

    @JsonIgnore
    public DatabaseClient getFinalClient() {
        Authentication authMethod = Authentication
                .valueOf(mlSettings.authMethod.toUpperCase());

        DatabaseClient client = DatabaseClientFactory.newClient(
                mlSettings.host,
                mlSettings.finalPort,
                mlSettings.username,
                mlSettings.password, authMethod);
        return client;
    }

    @JsonIgnore
    public DatabaseClient getTraceClient() {
        Authentication authMethod = Authentication
            .valueOf(mlSettings.authMethod.toUpperCase());

        DatabaseClient client = DatabaseClientFactory.newClient(
            mlSettings.host,
            mlSettings.tracePort,
            mlSettings.username,
            mlSettings.password, authMethod);
        return client;
    }

    @JsonIgnore
    public DatabaseClient getJobClient() {
        Authentication authMethod = Authentication
            .valueOf(mlSettings.authMethod.toUpperCase());

        DatabaseClient client = DatabaseClientFactory.newClient(
            mlSettings.host,
            mlSettings.jobPort,
            mlSettings.username,
            mlSettings.password, authMethod);
        return client;
    }

    public String toJson() throws JsonProcessingException {
        ObjectMapper om = new ObjectMapper();
        return om.writeValueAsString(this);
    }
}
