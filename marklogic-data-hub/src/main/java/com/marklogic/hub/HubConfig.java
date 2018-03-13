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
package com.marklogic.hub;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.hub.impl.HubConfigImpl;

import javax.net.ssl.SSLContext;
import java.io.IOException;
import java.nio.file.Path;

/**
 * A class for passing around the Data Hub's Configuration
 */
public interface HubConfig {

    String HUB_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES = "hub-modules-deploy-timestamps.properties";
    String USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES = "user-modules-deploy-timestamps.properties";
    String USER_CONTENT_DEPLOY_TIMESTAMPS_PROPERTIES = "user-content-deploy-timestamps.properties";

    String HUB_CONFIG_DIR = "hub-internal-config";
    String USER_CONFIG_DIR = "user-config";
    String ENTITY_CONFIG_DIR = "entity-config";
    String STAGING_ENTITY_QUERY_OPTIONS_FILE = "staging-entity-options.xml";
    String FINAL_ENTITY_QUERY_OPTIONS_FILE = "final-entity-options.xml";

    String DEFAULT_STAGING_NAME = "data-hub-STAGING";
    String DEFAULT_FINAL_NAME = "data-hub-FINAL";
    String DEFAULT_TRACE_NAME = "data-hub-TRACING";
    String DEFAULT_JOB_NAME = "data-hub-JOBS";
    String DEFAULT_MODULES_DB_NAME = "data-hub-MODULES";
    String DEFAULT_TRIGGERS_DB_NAME = "data-hub-TRIGGERS";
    String DEFAULT_SCHEMAS_DB_NAME = "data-hub-SCHEMAS";

    String DEFAULT_ROLE_NAME = "data-hub-role";
    String DEFAULT_USER_NAME = "data-hub-user";

    Integer DEFAULT_STAGING_PORT = 8010;
    Integer DEFAULT_FINAL_PORT = 8011;
    Integer DEFAULT_TRACE_PORT = 8012;
    Integer DEFAULT_JOB_PORT = 8013;

    String DEFAULT_AUTH_METHOD = "digest";

    String DEFAULT_SCHEME = "http";

    Integer DEFAULT_FORESTS_PER_HOST = 4;

    String DEFAULT_CUSTOM_FOREST_PATH = "forests";

    /**
     * Gets the hostname of the AppConfig
     * @return name of host
     */
    String getHost();

    /**
     * Creates and returns a hubconfig object for a project directory
     * @param projectDir - string path to the project directory
     * @return HubConfig based in the project directory
     */
    static HubConfig create(String projectDir) {
        return new HubConfigImpl(projectDir);
    }

    /**
     * Returns the database name for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The name of the database
     */
    String getDbName(DatabaseKind kind);

    /**
     * Sets the database name for the databaseKind on the hubconfig
     * @param kind- DatabaseKind enum, eg: STAGING or JOB
     * @param dbName The name desired for the database
     */
    void setDbName(DatabaseKind kind, String dbName);

    /**
     * Returns the appserver name for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The name of the App server
     */
    String getHttpName(DatabaseKind kind);

    /**
     * Sets the appserver name for the databaseKind on the hubconfig
     * @param kind- DatabaseKind enum, eg: STAGING or JOB
     * @param httpName The name to set for the appserver
     */
    void setHttpName(DatabaseKind kind, String httpName);

    /**
     * Returns the number of forests per host for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The number of forests per host for this database
     */
    Integer getForestsPerHost(DatabaseKind kind);

    /**
     * Sets the number of forests per host for the databaseKind on the hubconfig
     * @param kind- DatabaseKind enum, eg: STAGING or JOB
     * @param forestsPerHost The number of forests per host
     */
    void setForestsPerHost(DatabaseKind kind, Integer forestsPerHost);

    /**
     * Returns the port number for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The port set for the appserver connected to the database
     */
    Integer getPort(DatabaseKind kind);

    /**
     * Sets the port number for the databaseKind on the hubconfig
     * @param kind- DatabaseKind enum, eg: STAGING or JOB
     * @param port The port number for the database appserver
     */
    void setPort(DatabaseKind kind, Integer port);

    /**
     * Returns the SSL Context for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The SSLContext set for the database connection
     */
    SSLContext getSslContext(DatabaseKind kind);

    void setSslContext(DatabaseKind kind, SSLContext sslContext);

    void setSslHostnameVerifier(DatabaseKind kind, DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier);

    DatabaseClientFactory.SSLHostnameVerifier getSslHostnameVerifier(DatabaseKind kind);

    String getAuthMethod(DatabaseKind kind);

    void setAuthMethod(DatabaseKind kind, String authMethod);

    String getScheme(DatabaseKind kind);

    void setScheme(DatabaseKind kind, String scheme);

    boolean getSimpleSsl(DatabaseKind kind);

    void setSimpleSsl(DatabaseKind kind, Boolean simpleSsl);

    String getCertFile(DatabaseKind kind);

    void setCertFile(DatabaseKind kind, String certFile);

    String getCertPassword(DatabaseKind kind);

    void setCertPass(DatabaseKind kind, String certPassword);

    String getExternalName(DatabaseKind kind);

    void setExternalName(DatabaseKind kind, String externalName);

    // roles and users

    /**
     * Get the roleName the hub uses
     * @return the name of the role the DHF uses
     */
    String getHubRoleName();

    /**
     * Set the role name that the hub uses
     * @param hubRoleName the name to use
     */
    void setHubRoleName(String hubRoleName);

    /**
     * Get the current marklogic user name the hub uses
     * @return the username
     */
    String getHubUserName();

    /**
     * Sets the username for the hub to use in MarkLogic
     * @param hubUserName - username to use
     */
    void setHubUserName(String hubUserName);

    /**
     * Gets a string array of hosts
     * @return String array of hosts
     */
    String[] getLoadBalancerHosts();

    /**
     * Returns the path for the custom forests definition
     * @return path where the custom forests are as string
     */
    String getCustomForestPath();

    /**
     * Gets the permissions used to execute a module in string form
     * @return a string reprsenting the marklogic permissions for a module
     */
    String getModulePermissions();

    /**
     * Obtains the project directory as a string
     * @return project directory
     */
    String getProjectDir();

    /**
     *
     * @param projectDir
     */
    void setProjectDir(String projectDir);

    /**
     * Returns the HubProject associated with the HubConfig
     * @return current hubProject associated with the HubConfig
     */
    HubProject getHubProject();

    /**
     * Initializes the hub project on disk
     */
    void initHubProject();

    /**
     * Returns the last deployed timestamp file for the hub config and modules
     * @return string of what's located in the timestamp file
     */
    String getHubModulesDeployTimestampFile();

    /**
     * Returns the last deployed timestamp file for the user modules
     * @return string of what's located in the timestamp file
     */
    String getUserModulesDeployTimestampFile();

    /**
     * Creates a new DatabaseClient for accessing the AppServices app
     * @return - a DatabaseClient
     */
    DatabaseClient newAppServicesClient();

    /**
     * Creates a new DatabaseClient for accessing the Staging database
     * @return - a DatabaseClient
     */
     DatabaseClient newStagingClient();

    /**
     * Creates a new DatabaseClient for accessing the Staging database
     * @param databaseName - the name of the database for the staging Client to use
     * @return- a DatabaseClient
     */
     DatabaseClient newStagingClient(String databaseName);

    /**
     * Creates a new DatabaseClient for accessing the Final database
     * @return - a DatabaseClient
     */
    DatabaseClient newFinalClient();

    /**
     * Creates a new DatabaseClient for accessing the Job database
     * @return - a DatabaseClient
     */
    DatabaseClient newJobDbClient();

    /**
     * Creates a new DatabaseClient for accessing the Trace database
     * @return - a DatabaseClient
     */
    DatabaseClient newTraceDbClient();

    /**
     * Creates a new DatabaseClient for accessing the Hub Modules database
     * @return - a DatabaseClient
     */
    DatabaseClient newModulesDbClient();

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    Path getHubPluginsDir();

    /**
     * Gets the path for the hub plugins directory
     * @return the path for the hub plugins directory
     */
    Path getHubEntitiesDir();

    /**
     * Gets the path for the hub's entities directory
     * @return the path for the hub's entities directory
     */
    Path getHubConfigDir();

    /**
     * Gets the path for the hub's config directory
     * @return the path for the hub's config directory
     */
    Path getHubDatabaseDir();

    /**
     * Gets the path for the hub's database directory
     * @return the path for the hub's database directory
     */
    Path getHubServersDir();

    /**
     * Gets the path for the hub servers directory
     * @return the path for the hub servers database directory
     */
    Path getHubSecurityDir();

    /**
     * Gets the path for the hub security directory
     * @return the path for the hub security directory
     */
    Path getHubMimetypesDir();

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    Path getUserConfigDir();

    /**
     * Gets the path for the user config directory
     * @return the path for the user config directory
     */
    Path getUserSecurityDir();

    /**
     * Gets the path for the user security directory
     * @return the path for the user security directory
     */
    Path getUserDatabaseDir();

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    Path getUserServersDir();

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    Path getEntityDatabaseDir();

    /**
     * Returns the current appconfig object attached to the HubConfig
     * @return Returns current AppConfig object set for HubConfig
     */
    AppConfig getAppConfig();

    /**
     * Sets the App Config for the current HubConfig
     * @param config AppConfig to associate with the HubConfig
     */
    void setAppConfig(AppConfig config);

    /**
     * Sets the App Config for the current HubConfig, with skipUpdate option
     * @param config - AppConfig to associate with the HubConfig
     * @param skipUpdate false to force update of AppConfig, true to skip it
     */
    void setAppConfig(AppConfig config, boolean skipUpdate);

    /**
     * Gets the current version of the DHF Jar
     * @return Version of DHF Jar file as string
     * @throws IOException if current jar can't be found
     */
    String getJarVersion() throws IOException;
}
