/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.helper.LoggingObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

/**
 * A class for passing around the Data Hub's Configuration
 */
public class HubConfig extends LoggingObject {

    public static final String OLD_HUB_CONFIG_DIR = "marklogic-config";
    public static final String HUB_CONFIG_DIR = "hub-internal-config";
    public static final String USER_CONFIG_DIR = "user-config";

    public static final String DEFAULT_HOST = "localhost";

    public static final String DEFAULT_STAGING_NAME = "data-hub-STAGING";
    public static final String DEFAULT_FINAL_NAME = "data-hub-FINAL";
    public static final String DEFAULT_TRACE_NAME = "data-hub-TRACING";
    public static final String DEFAULT_JOB_NAME = "data-hub-JOBS";
    public static final String DEFAULT_MODULES_DB_NAME = "data-hub-MODULES";
    public static final String DEFAULT_TRIGGERS_DB_NAME = "data-hub-TRIGGERS";
    public static final String DEFAULT_SCHEMAS_DB_NAME = "data-hub-SCHEMAS";

    public static final String DEFAULT_HUB_USER_ROLE = "data-hub-user";
    public static final String DEFAULT_HUB_USER_NAME = "data-hub-user";

    public static final Integer DEFAULT_STAGING_PORT = 8010;
    public static final Integer DEFAULT_FINAL_PORT = 8011;
    public static final Integer DEFAULT_TRACE_PORT = 8012;
    public static final Integer DEFAULT_JOB_PORT = 8013;

    public static final String DEFAULT_APP_NAME = "data-hub";
    public static final String DEFAULT_PROJECT_DIR = ".";

    public static final String DEFAULT_AUTH_METHOD = "digest";

    public static final Integer DEFAULT_FORESTS_PER_HOST = 4;

    private static final String GRADLE_PROPERTIES_FILENAME = "gradle.properties";

    public String name = DEFAULT_APP_NAME;

    public String username;
    @JsonIgnore
    public String password;

    public String adminUsername;
    @JsonIgnore
    public String adminPassword;

    public String host = DEFAULT_HOST;

    public String stagingDbName = DEFAULT_STAGING_NAME;
    public String stagingHttpName = DEFAULT_STAGING_NAME;
    public Integer stagingForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    public Integer stagingPort = DEFAULT_STAGING_PORT;
    public String stagingAuthMethod = DEFAULT_AUTH_METHOD;

    public String finalDbName = DEFAULT_FINAL_NAME;
    public String finalHttpName = DEFAULT_FINAL_NAME;
    public Integer finalForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    public Integer finalPort = DEFAULT_FINAL_PORT;
    public String finalAuthMethod = DEFAULT_AUTH_METHOD;

    public String traceDbName = DEFAULT_TRACE_NAME;
    public String traceHttpName = DEFAULT_TRACE_NAME;
    public Integer traceForestsPerHost = 1;
    public Integer tracePort = DEFAULT_TRACE_PORT;
    public String traceAuthMethod = DEFAULT_AUTH_METHOD;

    public String jobDbName = DEFAULT_JOB_NAME;
    public String jobHttpName = DEFAULT_JOB_NAME;
    public Integer jobForestsPerHost = 1;
    public Integer jobPort = DEFAULT_JOB_PORT;
    public String jobAuthMethod = DEFAULT_AUTH_METHOD;

    public String modulesDbName = DEFAULT_MODULES_DB_NAME;
    public String triggersDbName = DEFAULT_TRIGGERS_DB_NAME;
    public String schemasDbName = DEFAULT_SCHEMAS_DB_NAME;

    public String hubUserName = DEFAULT_HUB_USER_NAME;
    public String hubUserPassword = DEFAULT_HUB_USER_NAME;
    public String hubUserRole = DEFAULT_HUB_USER_ROLE;

    public String projectDir;

    public HubConfig() {
        this(DEFAULT_PROJECT_DIR);
    }

    public HubConfig(String projectDir) {
        this.projectDir = projectDir;
    }

    /**
     * Creates a hub config from a Project dir and environment.
     * @param projectDir - the project directory
     * @param environment - the environment to use
     * @return a new HubConfig
     */
    public static HubConfig hubFromEnvironment(String projectDir, String environment) {
        HubConfig config = new HubConfig(projectDir);
        Properties environmentProperties = config.getProperties(environment);
        config.loadConfigurationFromProperties(environmentProperties);
        return config;
    }

    private Properties getProperties(String environment) {
        Properties environmentProperties = new Properties();

        loadConfigurationFromFile(environmentProperties, GRADLE_PROPERTIES_FILENAME);
        String envPropertiesFile = "gradle-" + environment + ".properties";
        loadConfigurationFromFile(environmentProperties, envPropertiesFile);

        return environmentProperties;
    }

    public void loadConfigurationFromProperties(Properties environmentProperties) {
        name = getEnvPropString(environmentProperties,"mlAppName", name);
        host = getEnvPropString(environmentProperties, "mlHost", host);
        stagingDbName = getEnvPropString(environmentProperties, "mlStagingDbName", stagingDbName);
        stagingHttpName = getEnvPropString(environmentProperties, "mlStagingAppserverName", stagingHttpName);
        stagingForestsPerHost = getEnvPropInteger(environmentProperties, "mlStagingForestsPerHost", stagingForestsPerHost);
        stagingPort = getEnvPropInteger(environmentProperties, "mlStagingPort", stagingPort);
        stagingAuthMethod = getEnvPropString(environmentProperties, "mlStagingAuth", stagingAuthMethod);
        finalDbName = getEnvPropString(environmentProperties, "mlFinalDbName", finalDbName);
        finalHttpName = getEnvPropString(environmentProperties, "mlFinalAppserverName", finalHttpName);
        finalForestsPerHost = getEnvPropInteger(environmentProperties, "mlFinalForestsPerHost", finalForestsPerHost);
        finalPort = getEnvPropInteger(environmentProperties, "mlFinalPort", finalPort);
        finalAuthMethod = getEnvPropString(environmentProperties, "mlFinalAuth", finalAuthMethod);
        traceDbName = getEnvPropString(environmentProperties, "mlTraceDbName", traceDbName);
        traceHttpName = getEnvPropString(environmentProperties, "mlTraceAppserverName", traceHttpName);
        traceForestsPerHost = getEnvPropInteger(environmentProperties, "mlTraceForestsPerHost", traceForestsPerHost);
        tracePort = getEnvPropInteger(environmentProperties, "mlTracePort", tracePort);
        traceAuthMethod = getEnvPropString(environmentProperties, "mlTraceAuth", traceAuthMethod);
        jobDbName = getEnvPropString(environmentProperties, "mlJobDbName", jobDbName);
        jobHttpName = getEnvPropString(environmentProperties, "mlJobAppserverName", jobHttpName);
        jobForestsPerHost = getEnvPropInteger(environmentProperties, "mlJobForestsPerHost", jobForestsPerHost);
        jobPort = getEnvPropInteger(environmentProperties, "mlJobPort", jobPort);
        jobAuthMethod = getEnvPropString(environmentProperties, "mlJobAuth", jobAuthMethod);
        modulesDbName = getEnvPropString(environmentProperties, "mlModulesDbName", modulesDbName);
        triggersDbName = getEnvPropString(environmentProperties, "mlTriggersDbName", triggersDbName);
        schemasDbName = getEnvPropString(environmentProperties, "mlSchemasDbName", schemasDbName);
        adminUsername = getEnvPropString(environmentProperties, "mlAdminUsername", adminUsername);
        adminPassword = getEnvPropString(environmentProperties, "mlAdminPassword", adminPassword);

        username = getEnvPropString(environmentProperties, "mlManageUsername", username);
        username = getEnvPropString(environmentProperties, "mlUsername", username);
        if (username == null) {
            username = adminUsername;
        }

        password = getEnvPropString(environmentProperties, "mlManagePassword", password);
        password = getEnvPropString(environmentProperties, "mlPassword", password);
        if (password == null) {
            password = adminPassword;
        }

        projectDir = getEnvPropString(environmentProperties, "hubProjectDir", projectDir);

        logger.info("Hub Project Dir: " + projectDir);
    }

    /**
     * Creates a new DatabaseClient for accessing the Staging database
     * @return - a DatabaseClient
     */
    public DatabaseClient newStagingClient() {
        return DatabaseClientFactory.newClient(
            host,
            stagingPort,
            username,
            password,
            DatabaseClientFactory.Authentication.valueOf(stagingAuthMethod.toUpperCase()));
    }

    /**
     * Creates a new DatabaseClient for accessing the Final database
     * @return - a DatabaseClient
     */
    public DatabaseClient newFinalClient() {
        return DatabaseClientFactory.newClient(
            host,
            finalPort,
            username,
            password,
            DatabaseClientFactory.Authentication.valueOf(finalAuthMethod.toUpperCase()));
    }

    /**
     * Creates a new DatabaseClient for accessing the Job database
     * @return - a DatabaseClient
     */
    public DatabaseClient newJobDbClient() {
        return DatabaseClientFactory.newClient(
            host,
            jobPort,
            username,
            password,
            DatabaseClientFactory.Authentication.valueOf(jobAuthMethod.toUpperCase()));
    }

    /**
     * Creates a new DatabaseClient for accessing the Trace database
     * @return - a DatabaseClient
     */
    public DatabaseClient newTraceDbClient() {
        return DatabaseClientFactory.newClient(
            host,
            tracePort,
            username,
            password,
            DatabaseClientFactory.Authentication.valueOf(stagingAuthMethod.toUpperCase()));
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

    private void loadConfigurationFromFile(Properties configProperties, String fileName) {
        InputStream is;
        try {
            File file = new File(this.projectDir, fileName);
            if(file.exists()) {
                is = new FileInputStream( file );
                configProperties.load( is );
                is.close();
            }
        }
        catch ( Exception e ) {
            e.printStackTrace();
        }
    }

    public Path getHubConfigDir() {
        return Paths.get(this.projectDir, HUB_CONFIG_DIR);
    }

    public Path getHubDatabaseDir() {
        return Paths.get(this.projectDir, HUB_CONFIG_DIR, "databases");
    }

    public Path getHubServersDir() {
        return Paths.get(this.projectDir, HUB_CONFIG_DIR, "servers");
    }

    public Path getHubSecurityDir() {
        return Paths.get(this.projectDir, HUB_CONFIG_DIR, "security");
    }

    public Path getUserConfigDir() {
        return Paths.get(this.projectDir, USER_CONFIG_DIR);
    }

    public Path getUserDatabaseDir() {
        return Paths.get(this.projectDir, USER_CONFIG_DIR, "databases");
    }

    public Path getUserServersDir() {
        return Paths.get(this.projectDir, USER_CONFIG_DIR, "servers");
    }

}
