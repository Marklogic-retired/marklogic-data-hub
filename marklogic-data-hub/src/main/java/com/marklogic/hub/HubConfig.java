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
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.DefaultAppConfigFactory;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;
import com.marklogic.mgmt.DefaultManageConfigFactory;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.admin.DefaultAdminConfigFactory;
import com.marklogic.mgmt.util.SimplePropertySource;
import org.apache.commons.text.CharacterPredicate;
import org.apache.commons.text.RandomStringGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.SSLContext;
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

    public static final String HUB_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES = "hub-modules-deploy-timestamps.properties";
    public static final String USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES = "user-modules-deploy-timestamps.properties";
    public static final String USER_CONTENT_DEPLOY_TIMESTAMPS_PROPERTIES = "user-content-deploy-timestamps.properties";

    public static final String HUB_CONFIG_DIR = "hub-internal-config";
    public static final String USER_CONFIG_DIR = "user-config";
    public static final String ENTITY_CONFIG_DIR = "entity-config";
    public static final String STAGING_ENTITY_SEARCH_OPTIONS_FILE = "staging-entity-options.xml";
    public static final String FINAL_ENTITY_SEARCH_OPTIONS_FILE = "final-entity-options.xml";

    public static final String DEFAULT_STAGING_NAME = "data-hub-STAGING";
    public static final String DEFAULT_FINAL_NAME = "data-hub-FINAL";
    public static final String DEFAULT_TRACE_NAME = "data-hub-TRACING";
    public static final String DEFAULT_JOB_NAME = "data-hub-JOBS";
    public static final String DEFAULT_MODULES_DB_NAME = "data-hub-MODULES";
    public static final String DEFAULT_TRIGGERS_DB_NAME = "data-hub-TRIGGERS";
    public static final String DEFAULT_SCHEMAS_DB_NAME = "data-hub-SCHEMAS";

    public static final String DEFAULT_ROLE_NAME = "data-hub-role";
    public static final String DEFAULT_USER_NAME = "data-hub-user";

    public static final Integer DEFAULT_STAGING_PORT = 8010;
    public static final Integer DEFAULT_FINAL_PORT = 8011;
    public static final Integer DEFAULT_TRACE_PORT = 8012;
    public static final Integer DEFAULT_JOB_PORT = 8013;

    public static final String DEFAULT_AUTH_METHOD = "digest";

    public static final Integer DEFAULT_FORESTS_PER_HOST = 4;

    public static final String DEFAULT_CUSTOM_FOREST_PATH = "forests";

    private static final String GRADLE_PROPERTIES_FILENAME = "gradle.properties";

    public String stagingDbName = DEFAULT_STAGING_NAME;
    public String stagingHttpName = DEFAULT_STAGING_NAME;
    public Integer stagingForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    public Integer stagingPort = DEFAULT_STAGING_PORT;
    public String stagingAuthMethod = DEFAULT_AUTH_METHOD;
    private SSLContext stagingSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier;
    private String stagingCertFile;
    private String stagingCertPassword;
    private String stagingExternalName;

    public String finalDbName = DEFAULT_FINAL_NAME;
    public String finalHttpName = DEFAULT_FINAL_NAME;
    public Integer finalForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    public Integer finalPort = DEFAULT_FINAL_PORT;
    public String finalAuthMethod = DEFAULT_AUTH_METHOD;
    private SSLContext finalSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier;
    private String finalCertFile;
    private String finalCertPassword;
    private String finalExternalName;

    public String traceDbName = DEFAULT_TRACE_NAME;
    public String traceHttpName = DEFAULT_TRACE_NAME;
    public Integer traceForestsPerHost = 1;
    public Integer tracePort = DEFAULT_TRACE_PORT;
    public String traceAuthMethod = DEFAULT_AUTH_METHOD;
    private SSLContext traceSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier traceSslHostnameVerifier;
    private String traceCertFile;
    private String traceCertPassword;
    private String traceExternalName;

    public String jobDbName = DEFAULT_JOB_NAME;
    public String jobHttpName = DEFAULT_JOB_NAME;
    public Integer jobForestsPerHost = 1;
    public Integer jobPort = DEFAULT_JOB_PORT;
    public String jobAuthMethod = DEFAULT_AUTH_METHOD;
    private SSLContext jobSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier;
    private String jobCertFile;
    private String jobCertPassword;
    private String jobExternalName;

    public String modulesDbName = DEFAULT_MODULES_DB_NAME;
    public Integer modulesForestsPerHost = 1;

    public String triggersDbName = DEFAULT_TRIGGERS_DB_NAME;
    public Integer triggersForestsPerHost = 1;

    public String schemasDbName = DEFAULT_SCHEMAS_DB_NAME;
    public Integer schemasForestsPerHost = 1;

    public String hubRoleName = DEFAULT_ROLE_NAME;
    public String hubUserName = DEFAULT_USER_NAME;

    public String customForestPath = DEFAULT_CUSTOM_FOREST_PATH;

    public String modulePermissions = "rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute";

    private String projectDir;

    private Properties environmentProperties;

    private String environment;

    private HubProject hubProject;

    private DefaultManageConfigFactory manageConfigFactory;
    private DefaultAdminConfigFactory adminConfigFactory;
    private AppConfig appConfig;

    private Properties propertyOverrides;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public HubConfig() {
        setProjectDir(".");
    }

    private HubConfig(String projectDir) {
        setProjectDir(new File(projectDir).getAbsolutePath());
    }

    public String getProjectDir() {
        return this.projectDir;
    }

    public void setProjectDir(String projectDir) {
        this.projectDir = projectDir;
        this.hubProject = new HubProject(projectDir);
    }

    /**
     * Creates a hub config from a Project dir and environment.
     * @param projectDir - the project directory
     * @param environment - the environment to use
     * @return a new HubConfig
     */
    public static HubConfig hubFromEnvironment(String projectDir, String environment) {
        HubConfig config = new HubConfig(projectDir);
        config.environment = environment;
        config.loadConfigurationFromProperties(config.getProperties(environment));
        return config;
    }

    public static HubConfig hubFromEnvironmentWithOverrides(String projectDir, String environment, Properties properties) {
        HubConfig config = new HubConfig(projectDir);
        config.environment = environment;
        config.propertyOverrides = properties;
        config.loadConfigurationFromProperties(config.getProperties(environment));
        return config;
    }

    /**
     * Creates a hub config from a Project dir and Properties file
     * @param projectDir - the project directory
     * @param properties - the properties file
     * @return a new HubConfig
     */
    public static HubConfig hubFromProperties(String projectDir, Properties properties) {
        HubConfig config = new HubConfig(projectDir);
        config.loadConfigurationFromProperties(properties);
        return config;
    }

    private Properties getProperties(String environment) {
        Properties environmentProperties = new Properties();

        loadConfigurationFromFile(environmentProperties, GRADLE_PROPERTIES_FILENAME);
        if (environment != null) {
            String envPropertiesFile = "gradle-" + environment + ".properties";
            loadConfigurationFromFile(environmentProperties, envPropertiesFile);
        }

        if (propertyOverrides != null) {
            propertyOverrides.forEach((o, o2) -> {
                environmentProperties.put(o, o2);
            });
        }

        return environmentProperties;
    }

    @JsonIgnore
    public HubProject getHubProject() {
        return this.hubProject;
    }

    public void initHubProject() {
        this.hubProject.init(getCustomTokens());
    }

    public String getHubModulesDeployTimestampFile() {
        return Paths.get(projectDir, ".tmp", HUB_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toString();
    }

    public String getUserModulesDeployTimestampFile() {
        return Paths.get(projectDir, ".tmp", USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toString();
    }

    public File getUserContentDeployTimestampFile() {
        return Paths.get(projectDir, ".tmp", USER_CONTENT_DEPLOY_TIMESTAMPS_PROPERTIES).toFile();
    }

    private void loadConfigurationFromProperties(Properties environmentProperties) {
        this.environmentProperties = environmentProperties;

        if (this.environmentProperties != null) {
            SimplePropertySource propertySource = new SimplePropertySource(this.environmentProperties);
            manageConfigFactory = new DefaultManageConfigFactory(propertySource);
            adminConfigFactory = new DefaultAdminConfigFactory(propertySource);

            stagingDbName = getEnvPropString(environmentProperties, "mlStagingDbName", stagingDbName);
            stagingHttpName = getEnvPropString(environmentProperties, "mlStagingAppserverName", stagingHttpName);
            stagingForestsPerHost = getEnvPropInteger(environmentProperties, "mlStagingForestsPerHost", stagingForestsPerHost);
            stagingPort = getEnvPropInteger(environmentProperties, "mlStagingPort", stagingPort);
            stagingAuthMethod = getEnvPropString(environmentProperties, "mlStagingAuth", stagingAuthMethod);
            if (getEnvPropBoolean(environmentProperties, "mlStagingSimpleSsl", false)) {
                stagingSslContext = SimpleX509TrustManager.newSSLContext();
                stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            }
            stagingCertFile = getEnvPropString(environmentProperties, "mlStagingCertFile", stagingCertFile);
            stagingCertPassword = getEnvPropString(environmentProperties, "mlStagingCertPassword", stagingCertPassword);
            stagingExternalName = getEnvPropString(environmentProperties, "mlStagingExternalName", stagingExternalName);


            finalDbName = getEnvPropString(environmentProperties, "mlFinalDbName", finalDbName);
            finalHttpName = getEnvPropString(environmentProperties, "mlFinalAppserverName", finalHttpName);
            finalForestsPerHost = getEnvPropInteger(environmentProperties, "mlFinalForestsPerHost", finalForestsPerHost);
            finalPort = getEnvPropInteger(environmentProperties, "mlFinalPort", finalPort);
            finalAuthMethod = getEnvPropString(environmentProperties, "mlFinalAuth", finalAuthMethod);
            if (getEnvPropBoolean(environmentProperties, "mlFinalSimpleSsl", false)) {
                finalSslContext = SimpleX509TrustManager.newSSLContext();
                finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            }
            finalCertFile = getEnvPropString(environmentProperties, "mlFinalCertFile", finalCertFile);
            finalCertPassword = getEnvPropString(environmentProperties, "mlFinalCertPassword", finalCertPassword);
            finalExternalName = getEnvPropString(environmentProperties, "mlFinalExternalName", finalExternalName);

            traceDbName = getEnvPropString(environmentProperties, "mlTraceDbName", traceDbName);
            traceHttpName = getEnvPropString(environmentProperties, "mlTraceAppserverName", traceHttpName);
            traceForestsPerHost = getEnvPropInteger(environmentProperties, "mlTraceForestsPerHost", traceForestsPerHost);
            tracePort = getEnvPropInteger(environmentProperties, "mlTracePort", tracePort);
            traceAuthMethod = getEnvPropString(environmentProperties, "mlTraceAuth", traceAuthMethod);
            if (getEnvPropBoolean(environmentProperties, "mlTraceSimpleSsl", false)) {
                traceSslContext = SimpleX509TrustManager.newSSLContext();
                traceSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            }
            traceCertFile = getEnvPropString(environmentProperties, "mlTraceCertFile", traceCertFile);
            traceCertPassword = getEnvPropString(environmentProperties, "mlTraceCertPassword", traceCertPassword);
            traceExternalName = getEnvPropString(environmentProperties, "mlTraceExternalName", traceExternalName);


            jobDbName = getEnvPropString(environmentProperties, "mlJobDbName", jobDbName);
            jobHttpName = getEnvPropString(environmentProperties, "mlJobAppserverName", jobHttpName);
            jobForestsPerHost = getEnvPropInteger(environmentProperties, "mlJobForestsPerHost", jobForestsPerHost);
            jobPort = getEnvPropInteger(environmentProperties, "mlJobPort", jobPort);
            jobAuthMethod = getEnvPropString(environmentProperties, "mlJobAuth", jobAuthMethod);
            if (getEnvPropBoolean(environmentProperties, "mlJobSimpleSsl", false)) {
                jobSslContext = SimpleX509TrustManager.newSSLContext();
                jobSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            }
            jobCertFile = getEnvPropString(environmentProperties, "mlJobCertFile", jobCertFile);
            jobCertPassword = getEnvPropString(environmentProperties, "mlJobCertPassword", jobCertPassword);
            jobExternalName = getEnvPropString(environmentProperties, "mlJobExternalName", jobExternalName);

            customForestPath = getEnvPropString(environmentProperties, "mlCustomForestPath", customForestPath);

            modulesDbName = getEnvPropString(environmentProperties, "mlModulesDbName", modulesDbName);
            modulesForestsPerHost = getEnvPropInteger(environmentProperties, "mlModulesForestsPerHost", modulesForestsPerHost);
            modulePermissions = getEnvPropString(environmentProperties, "mlModulePermissions", modulePermissions);

            triggersDbName = getEnvPropString(environmentProperties, "mlTriggersDbName", triggersDbName);
            triggersForestsPerHost = getEnvPropInteger(environmentProperties, "mlTriggersForestsPerHost", triggersForestsPerHost);

            schemasDbName = getEnvPropString(environmentProperties, "mlSchemasDbName", schemasDbName);
            schemasForestsPerHost = getEnvPropInteger(environmentProperties, "mlSchemasForestsPerHost", schemasForestsPerHost);

            hubRoleName = getEnvPropString(environmentProperties, "mlHubUserRole", hubRoleName);
            hubUserName = getEnvPropString(environmentProperties, "mlHubUserName", hubUserName);

            projectDir = getEnvPropString(environmentProperties, "hubProjectDir", projectDir);

            logger.info("Hub Project Dir: " + projectDir);
        }
        else {
            logger.error("Missing environmentProperties");
        }
    }

    public ManageClient newManageClient() {
        return new ManageClient(manageConfigFactory.newManageConfig());
    }

    public AdminManager newAdminManager() {
        return new AdminManager(adminConfigFactory.newAdminConfig());
    }

    public DatabaseClient newAppServicesClient() {
        return getAppConfig().newAppServicesDatabaseClient(null);
    }

    /**
     * Creates a new DatabaseClient for accessing the Staging database
     * @return - a DatabaseClient
     */
    public DatabaseClient newStagingClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), stagingPort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(stagingDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(stagingAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(stagingSslHostnameVerifier);
        config.setSslContext(stagingSslContext);
        config.setCertFile(stagingCertFile);
        config.setCertPassword(stagingCertPassword);
        config.setExternalName(stagingExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    /**
     * Creates a new DatabaseClient for accessing the Final database
     * @return - a DatabaseClient
     */
    public DatabaseClient newFinalClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), finalPort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(finalDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(finalSslHostnameVerifier);
        config.setSslContext(finalSslContext);
        config.setCertFile(finalCertFile);
        config.setCertPassword(finalCertPassword);
        config.setExternalName(finalExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    /**
     * Creates a new DatabaseClient for accessing the Job database
     * @return - a DatabaseClient
     */
    public DatabaseClient newJobDbClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), jobPort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(jobDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(jobAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(jobSslHostnameVerifier);
        config.setSslContext(jobSslContext);
        config.setCertFile(jobCertFile);
        config.setCertPassword(jobCertPassword);
        config.setExternalName(jobExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    /**
     * Creates a new DatabaseClient for accessing the Trace database
     * @return - a DatabaseClient
     */
    public DatabaseClient newTraceDbClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), tracePort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(traceDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(traceAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(traceSslHostnameVerifier);
        config.setSslContext(traceSslContext);
        config.setCertFile(traceCertFile);
        config.setCertPassword(traceCertPassword);
        config.setExternalName(traceExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    /**
     * Creates a new DatabaseClient for accessing the Hub Modules database
     * @return - a DatabaseClient
     */
    public DatabaseClient newModulesDbClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), stagingPort, appConfig.getRestAdminUsername(), appConfig.getRestAdminPassword());
        config.setDatabase(appConfig.getModulesDatabaseName());
        config.setSecurityContextType(SecurityContextType.valueOf(stagingAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(stagingSslHostnameVerifier);
        config.setSslContext(stagingSslContext);
        config.setCertFile(stagingCertFile);
        config.setCertPassword(stagingCertPassword);
        config.setExternalName(stagingExternalName);
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    public Path getHubPluginsDir() {
        return hubProject.getHubPluginsDir();
    }

    public Path getHubEntitiesDir() { return hubProject.getHubEntitiesDir(); }

    public Path getHubConfigDir() {
        return hubProject.getHubConfigDir();
    }

    public Path getHubDatabaseDir() {
        return hubProject.getHubDatabaseDir();
    }

    public Path getHubServersDir() {
        return hubProject.getHubServersDir();
    }

    public Path getHubSecurityDir() {
        return hubProject.getHubSecurityDir();
    }

    public Path getUserSecurityDir() {
        return hubProject.getUserSecurityDir();
    }

    public Path getUserConfigDir() {
        return hubProject.getUserConfigDir();
    }

    public Path getUserDatabaseDir() {
        return hubProject.getUserDatabaseDir();
    }

    public Path getEntityDatabaseDir() {
        return hubProject.getEntityDatabaseDir();
    }

    public Path getUserServersDir() {
        return hubProject.getUserServersDir();
    }

    public Path getHubMimetypesDir() {
        return hubProject.getHubMimetypesDir();
    }

    @JsonIgnore
    public AppConfig getAppConfig() {
        if (appConfig == null) {
            Properties properties = getProperties(this.environment);
            appConfig = new DefaultAppConfigFactory(new SimplePropertySource(properties)).newAppConfig();
            updateAppConfig(appConfig);
        }
        return appConfig;
    }

    private Map<String, String> getCustomTokens() {
        AppConfig appConfig = getAppConfig();
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

        customTokens.put("%%mlTraceAppserverName%%", traceHttpName);
        customTokens.put("\"%%mlTracePort%%\"", tracePort.toString());
        customTokens.put("%%mlTraceDbName%%", traceDbName);
        customTokens.put("%%mlTraceForestsPerHost%%", traceForestsPerHost.toString());
        customTokens.put("%%mlTraceAuth%%", traceAuthMethod);

        customTokens.put("%%mlJobAppserverName%%", jobHttpName);
        customTokens.put("\"%%mlJobPort%%\"", jobPort.toString());
        customTokens.put("%%mlJobDbName%%", jobDbName);
        customTokens.put("%%mlJobForestsPerHost%%", jobForestsPerHost.toString());
        customTokens.put("%%mlJobAuth%%", jobAuthMethod);

        customTokens.put("%%mlModulesDbName%%", modulesDbName);
        customTokens.put("%%mlModulesForestsPerHost%%", modulesForestsPerHost.toString());

        customTokens.put("%%mlTriggersDbName%%", triggersDbName);
        customTokens.put("%%mlTriggersForestsPerHost%%", triggersForestsPerHost.toString());

        customTokens.put("%%mlSchemasDbName%%", schemasDbName);
        customTokens.put("%%mlSchemasForestsPerHost%%", schemasForestsPerHost.toString());

        customTokens.put("%%mlHubUserRole%%", hubRoleName);
        customTokens.put("%%mlHubUserName%%", hubUserName);

        // random password for hub user
        RandomStringGenerator randomStringGenerator = new RandomStringGenerator.Builder().withinRange(33, 126).filteredBy((CharacterPredicate) codePoint -> (codePoint != 92 && codePoint != 34)).build();
        customTokens.put("%%mlHubUserPassword%%", randomStringGenerator.generate(20));

        customTokens.put("%%mlCustomForestPath%%", customForestPath);

        if (environmentProperties != null) {
            Enumeration keyEnum = environmentProperties.propertyNames();
            while (keyEnum.hasMoreElements()) {
                String key = (String) keyEnum.nextElement();
                if (key.matches("^ml[A-Z].+") && !customTokens.containsKey(key)) {
                    customTokens.put("%%" + key + "%%", (String) environmentProperties.get(key));
                }
            }
        }

        return customTokens;
    }

    public void setAppConfig(AppConfig config) {
        this.appConfig = config;
        updateAppConfig(this.appConfig);
    }

    public String getJarVersion() throws IOException {
        Properties properties = new Properties();
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("version.properties");
        properties.load(inputStream);
        String version = (String)properties.get("version");

        // this lets debug builds work from an IDE
        if (version.equals("${project.version}")) {
            version = "0.1.2";
        }
        return version;
    }

    private void updateAppConfig(AppConfig config) {
        config.setRestPort(stagingPort);
        config.setModulesDatabaseName(modulesDbName);

        config.setTriggersDatabaseName(triggersDbName);
        config.setSchemasDatabaseName(schemasDbName);
        config.setModulesDatabaseName(modulesDbName);

        config.setReplaceTokensInModules(true);
        config.setUseRoxyTokenPrefix(false);
        config.setModulePermissions(modulePermissions);

        HashMap<String, Integer> forestCounts = new HashMap<>();
        forestCounts.put(stagingDbName, stagingForestsPerHost);
        forestCounts.put(finalDbName, finalForestsPerHost);
        forestCounts.put(traceDbName, traceForestsPerHost);
        forestCounts.put(jobDbName, jobForestsPerHost);
        forestCounts.put(modulesDbName, modulesForestsPerHost);
        forestCounts.put(triggersDbName, triggersForestsPerHost);
        forestCounts.put(schemasDbName, schemasForestsPerHost);
        config.setForestCounts(forestCounts);

        ConfigDir configDir = new ConfigDir(getUserConfigDir().toFile());
        config.setConfigDir(configDir);

        config.setSchemasPath(getUserConfigDir().resolve("schemas").toString());

        Map<String, String> customTokens = getCustomTokens(config, config.getCustomTokens());

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

        appConfig = config;
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

    private boolean getEnvPropBoolean(Properties environmentProperties, String key, boolean fallback) {
        String value = environmentProperties.getProperty(key);
        boolean res;
        if (value != null) {
            res = Boolean.parseBoolean(value);
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
}
