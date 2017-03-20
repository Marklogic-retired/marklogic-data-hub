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

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.helper.DatabaseClientConfig;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * A class for passing around the Data Hub's Configuration
 */
public class HubConfig {

    public static final String OLD_HUB_CONFIG_DIR = "marklogic-config";
    public static final String HUB_CONFIG_DIR = "hub-internal-config";
    public static final String USER_CONFIG_DIR = "user-config";
    public static final String SEARCH_OPTIONS_FILE = "all-search-options.xml";

    public static final String DEFAULT_HOST = "localhost";

    public static final String DEFAULT_STAGING_NAME = "data-hub-STAGING";
    public static final String DEFAULT_FINAL_NAME = "data-hub-FINAL";
    public static final String DEFAULT_TRACE_NAME = "data-hub-TRACING";
    public static final String DEFAULT_JOB_NAME = "data-hub-JOBS";
    public static final String DEFAULT_MODULES_DB_NAME = "data-hub-MODULES";
    public static final String DEFAULT_TRIGGERS_DB_NAME = "data-hub-TRIGGERS";
    public static final String DEFAULT_SCHEMAS_DB_NAME = "data-hub-SCHEMAS";

    public static final Integer DEFAULT_STAGING_PORT = 8010;
    public static final Integer DEFAULT_FINAL_PORT = 8011;
    public static final Integer DEFAULT_TRACE_PORT = 8012;
    public static final Integer DEFAULT_JOB_PORT = 8013;

    public static final String DEFAULT_PROJECT_DIR = ".";

    public static final String DEFAULT_AUTH_METHOD = "digest";

    public static final Integer DEFAULT_FORESTS_PER_HOST = 4;

    private static final String GRADLE_PROPERTIES_FILENAME = "gradle.properties";

    private String username;
    private String password;

    private String adminUsername;
    private String adminPassword;

    private String manageUsername;
    private String managePassword;

    private String restAdminUsername;
    private String restAdminPassword;

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

    public String projectDir;

    private Properties environmentProperties;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

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
        config.loadConfigurationFromProperties(config.getProperties(environment));
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
        this.environmentProperties = environmentProperties;

        if (this.environmentProperties != null) {
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

            manageUsername = getEnvPropString(environmentProperties, "mlManageUsername", manageUsername);
            managePassword = getEnvPropString(environmentProperties, "mlManagePassword", managePassword);

            restAdminUsername = getEnvPropString(environmentProperties, "mlRestAdminUsername", restAdminUsername);
            restAdminPassword = getEnvPropString(environmentProperties, "mlRestAdminPassword", restAdminPassword);

            username = getEnvPropString(environmentProperties, "mlUsername", username);
            password = getEnvPropString(environmentProperties, "mlPassword", password);

            projectDir = getEnvPropString(environmentProperties, "hubProjectDir", projectDir);

            logger.info("Hub Project Dir: " + projectDir);
        }
        else {
            logger.error("Missing environmentProperties");
        }
    }

    public ManageClient newManageClient() {
        ManageConfig config = new ManageConfig(host, 8002, username, password);
        return new ManageClient(config);
    }

    public AdminManager newAdminManager() {
        AdminConfig adminConfig = new AdminConfig();
        adminConfig.setHost(host);
        adminConfig.setUsername(getAdminUsername());
        adminConfig.setPassword(getAdminPassword());
        return new AdminManager(adminConfig);
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

    public DatabaseClientConfig getStagingDbClientConfig() {
        DatabaseClientConfig config = new DatabaseClientConfig(
            host,
            stagingPort,
            username,
            password
        );

        config.setDatabase(stagingDbName);
        config.setAuthentication(DatabaseClientFactory.Authentication.valueOfUncased(stagingAuthMethod.toLowerCase()));

        return config;
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

    public DatabaseClientConfig getJobDbClientConfig() {
        DatabaseClientConfig config = new DatabaseClientConfig(
            host,
            jobPort,
            username,
            password
        );

        config.setDatabase(jobDbName);
        config.setAuthentication(DatabaseClientFactory.Authentication.valueOfUncased(jobAuthMethod.toLowerCase()));

        return config;
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

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUsername() {
        if (this.username == null) {
            logger.error("MISSING PROPERTY mlUsername");
        }

        return this.username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPassword() {
        if (this.password == null) {
            logger.error("MISSING PROPERTY mlPassword");
        }
        return this.password;
    }

    private String getAdminUsername() {
        String username = null;
        if (this.adminUsername != null) {
            username = this.adminUsername;
        }
        else if (this.username != null) {
            username = this.username;
        }
        else {
            logger.error("MISSING PROPERTY mlAdminUsername or mlUsername");
        }

        return username;
    }

    private String getAdminPassword() {
        String password = null;
        if (this.adminPassword != null) {
            password = this.adminPassword;
        }
        else if (this.password != null) {
            password = this.password;
        }
        else {
            logger.error("MISSING PROPERTY mlAdminPassword or mlPassword");
        }

        return password;
    }

    private String getRestAdminUsername() {
        String username = null;
        if (this.restAdminUsername != null) {
            username = this.restAdminUsername;
        }
        else if (this.username != null) {
            username = this.username;
        }
        else {
            logger.error("MISSING PROPERTY mlRestAdminUsername or mlUsername");
        }

        return username;
    }

    private String getRestAdminPassword() {
        String password = null;
        if (this.restAdminPassword != null) {
            password = this.restAdminPassword;
        }
        else if (this.password != null) {
            password = this.password;
        }
        else {
            logger.error("MISSING PROPERTY mlRestAdminPassword or mlPassword");
        }

        return password;
    }

    private String getManageUsername() {
        String username = null;
        if (this.manageUsername != null) {
            username = this.manageUsername;
        }
        else if (this.username != null) {
            username = this.username;
        }
        else {
            logger.error("MISSING PROPERTY mlManageUsername or mlUsername");
        }

        return username;
    }

    private String getManagePassword() {
        String password = null;
        if (this.managePassword != null) {
            password = this.managePassword;
        }
        else if (this.password != null) {
            password = this.password;
        }
        else {
            logger.error("MISSING PROPERTY mlManagePassword or mlPassword");
        }

        return password;
    }

    public AppConfig getAppConfig() {
        AppConfig config = new AppConfig();

        updateAppConfig(config);
        return config;
    }

    public void updateAppConfig(AppConfig config) {
        config.setHost(host);
        config.setRestPort(stagingPort);
        config.setRestAdminUsername(getRestAdminUsername());
        config.setRestAdminPassword(getRestAdminPassword());
        config.setModulesDatabaseName(modulesDbName);

        config.setTriggersDatabaseName(triggersDbName);
        config.setSchemasDatabaseName(schemasDbName);
        config.setModulesDatabaseName(modulesDbName);

        config.setReplaceTokensInModules(true);
        config.setUseRoxyTokenPrefix(false);

        HashMap<String, Integer> forestCounts = new HashMap<>();
        forestCounts.put(stagingDbName, stagingForestsPerHost);
        forestCounts.put(finalDbName, finalForestsPerHost);
        forestCounts.put(traceDbName, traceForestsPerHost);
        forestCounts.put(modulesDbName, 1);
        config.setForestCounts(forestCounts);

        ConfigDir configDir = new ConfigDir(getUserConfigDir().toFile());
        config.setConfigDir(configDir);

        Map<String, String> customTokens = config.getCustomTokens();

        customTokens.put("%%mlStagingAppserverName%%", stagingHttpName);
        customTokens.put("\"%%mlStagingPort%%\"", stagingPort.toString());
        customTokens.put("%%mlStagingDbName%%", stagingDbName);
        customTokens.put("%%mlStagingForestsPerHost%%", stagingForestsPerHost.toString());

        customTokens.put("%%mlFinalAppserverName%%", finalHttpName);
        customTokens.put("\"%%mlFinalPort%%\"", finalPort.toString());
        customTokens.put("%%mlFinalDbName%%", finalDbName);
        customTokens.put("%%mlFinalForestsPerHost%%", finalForestsPerHost.toString());

        customTokens.put("%%mlTraceAppserverName%%", traceHttpName);
        customTokens.put("\"%%mlTracePort%%\"", tracePort.toString());
        customTokens.put("%%mlTraceDbName%%", traceDbName);
        customTokens.put("%%mlTraceForestsPerHost%%", traceForestsPerHost.toString());

        customTokens.put("%%mlJobAppserverName%%", jobHttpName);
        customTokens.put("\"%%mlJobPort%%\"", jobPort.toString());
        customTokens.put("%%mlJobDbName%%", jobDbName);
        customTokens.put("%%mlJobForestsPerHost%%", jobForestsPerHost.toString());

        customTokens.put("%%mlModulesDbName%%", modulesDbName);
        customTokens.put("%%mlTriggersDbName%%", triggersDbName);
        customTokens.put("%%mlSchemasDbName%%", schemasDbName);

        if (environmentProperties != null) {
            Enumeration keyEnum = environmentProperties.propertyNames();
            while (keyEnum.hasMoreElements()) {
                String key = (String) keyEnum.nextElement();
                if (key.matches("^ml[A-Z].+") && !customTokens.containsKey(key)) {
                    customTokens.put("%%" + key + "%%", (String) environmentProperties.get(key));
                }
            }
        }


        try {
            String version = getJarVersion();
            customTokens.put("%%mlHubVersion%%", version);
        }
        catch(IOException e) {
            e.printStackTrace();
        }
    }

    public String getJarVersion() throws IOException {
        Properties properties = new Properties();
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("version.properties");
        properties.load(inputStream);
        return (String)properties.get("version");
    }


    public String toString() {

        StringBuilder sb = new StringBuilder();
        sb.append("Data Hub Config:\n")
            .append("\n")
            .append("username: " + getUsername() + "\n")
            .append("password: " + getPassword() + "\n")
            .append("\n")
            .append("manageUsername: " + getManageUsername() + "\n")
            .append("managePassword: " + getManagePassword() + "\n")
            .append("\n")
            .append("restAdminUsername: " + getRestAdminUsername() + "\n")
            .append("restAdminPassword: " + getRestAdminPassword() + "\n")
            .append("\n")
            .append("adminUsername: " + getAdminUsername() + "\n")
            .append("adminPassword: " + getAdminPassword() + "\n")
            .append("\n")
            .append("host: " + host + "\n")
            .append("\n")
            .append("stagingDbName: " + stagingDbName + "\n")
            .append("stagingHttpName: " + stagingHttpName + "\n")
            .append("stagingForestsPerHost: " + stagingForestsPerHost + "\n")
            .append("stagingPort: " + stagingPort + "\n")
            .append("stagingAuthMethod: " + stagingAuthMethod + "\n")
            .append("\n")
            .append("finalDbName: " + finalDbName + "\n")
            .append("finalHttpName: " + finalHttpName + "\n")
            .append("finalForestsPerHost: " + finalForestsPerHost + "\n")
            .append("finalPort: " + finalPort + "\n")
            .append("finalAuthMethod: " + finalAuthMethod + "\n")
            .append("\n")
            .append("traceDbName: " + traceDbName + "\n")
            .append("traceHttpName: " + traceHttpName + "\n")
            .append("traceForestsPerHost: " + traceForestsPerHost + "\n")
            .append("tracePort: " + tracePort + "\n")
            .append("traceAuthMethod: " + traceAuthMethod + "\n")
            .append("\n")
            .append("jobDbName: " + jobDbName + "\n")
            .append("jobHttpName: " + jobHttpName + "\n")
            .append("jobForestsPerHost: " + jobForestsPerHost + "\n")
            .append("jobPort: " + jobPort + "\n")
            .append("jobAuthMethod: " + jobAuthMethod + "\n")
            .append("\n")
            .append("modulesDbName: " + modulesDbName + "\n")
            .append("triggersDbName: " + triggersDbName + "\n")
            .append("schemasDbName: " + schemasDbName + "\n")
            .append("\n")
            .append("projectDir: " + projectDir + "\n")
            .append("\n");
        return sb.toString();
    }

}
