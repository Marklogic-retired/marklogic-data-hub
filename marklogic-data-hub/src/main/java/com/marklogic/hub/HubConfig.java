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
package com.marklogic.hub;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;

import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;
import java.nio.file.Path;

/**
 * An interface to set, manage and recall the Data Hub's Configuration.
 * HubConfig has a singleton scope so set everything you want at the start of the application and
 * and then call {@link #refreshProject()} to wire up all clients and load the properties from gradle.properties
 * (optionally overridden with gradle-{env}.properties).
 */
@JsonDeserialize(as = HubConfigImpl.class)
@JsonSerialize(as = HubConfigImpl.class)
public interface HubConfig {

    String HUB_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES = "hub-modules-deploy-timestamps.properties";
    String USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES = "user-modules-deploy-timestamps.properties";
    String USER_CONTENT_DEPLOY_TIMESTAMPS_PROPERTIES = "user-content-deploy-timestamps.properties";

    String PATH_PREFIX = "src/main/";
    String HUB_CONFIG_DIR = PATH_PREFIX + "hub-internal-config";
    String USER_CONFIG_DIR = PATH_PREFIX + "ml-config";
    String ENTITY_CONFIG_DIR = PATH_PREFIX + "entity-config";
    String STAGING_ENTITY_QUERY_OPTIONS_FILE = "staging-entity-options.xml";
    String FINAL_ENTITY_QUERY_OPTIONS_FILE = "final-entity-options.xml";
    String EXP_STAGING_ENTITY_QUERY_OPTIONS_FILE = "exp-staging-entity-options.xml";
    String EXP_FINAL_ENTITY_QUERY_OPTIONS_FILE = "exp-final-entity-options.xml";
    String STAGING_ENTITY_DATABASE_FILE = "staging-database.json";
    String FINAL_ENTITY_DATABASE_FILE = "final-database.json";


    String DEFAULT_STAGING_NAME = "data-hub-STAGING";
    String DEFAULT_FINAL_NAME = "data-hub-FINAL";
    String DEFAULT_JOB_NAME = "data-hub-JOBS";
    String DEFAULT_MODULES_DB_NAME = "data-hub-MODULES";
    String DEFAULT_STAGING_TRIGGERS_DB_NAME = "data-hub-staging-TRIGGERS";
    String DEFAULT_FINAL_TRIGGERS_DB_NAME = "data-hub-final-TRIGGERS";
    String DEFAULT_STAGING_SCHEMAS_DB_NAME = "data-hub-staging-SCHEMAS";
    String DEFAULT_FINAL_SCHEMAS_DB_NAME = "data-hub-final-SCHEMAS";

    String DEFAULT_ROLE_NAME = "flow-operator-role";
    String DEFAULT_USER_NAME = "flow-operator";
    String DEFAULT_DEVELOPER_ROLE_NAME = "flow-developer-role";
    String DEFAULT_DEVELOPER_USER_NAME = "flow-developer";

    Integer DEFAULT_STAGING_PORT = 8010;
    Integer DEFAULT_FINAL_PORT = 8011;
    Integer DEFAULT_JOB_PORT = 8013;

    String DEFAULT_AUTH_METHOD = "digest";
    String DEFAULT_HUB_LOG_LEVEL = "default";

    String DEFAULT_SCHEME = "http";

    Integer DEFAULT_FORESTS_PER_HOST = 4;

    String DEFAULT_CUSTOM_FOREST_PATH = "forests";
    String PII_QUERY_ROLESET_FILE = "pii-reader.json";
    String PII_PROTECTED_PATHS_FILE = "pii-protected-paths.json";

    /**
     * Gets the hostname of the AppConfig
     * @return name of host
     */
    String getHost();

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

    /**
     * Sets the SSL Context for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param sslContext - The SSLContext set for the database connection
     */
    void setSslContext(DatabaseKind kind, SSLContext sslContext);

    /**
     * Sets the SSL Hostname Verifier object for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param stagingSslHostnameVerifier - The SSL Hostname Verifier object for the database connection
     */
    void setSslHostnameVerifier(DatabaseKind kind, DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier);

    /**
     * Returns the SSL hostname verifier object for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The SSL Hostname Verifier for the DatabaseKind in hubconfig
     */
    DatabaseClientFactory.SSLHostnameVerifier getSslHostnameVerifier(DatabaseKind kind);

    /**
     * Returns the AuthMethod object for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The Auth Method for the DatabaseKind in hubconfig
     */
    String getAuthMethod(DatabaseKind kind);

    /**
     * Sets the SSL Auth Method for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param authMethod - The SSL Auth Method for the database connection
     */
    void setAuthMethod(DatabaseKind kind, String authMethod);

    /**
     * Returns the TrustManager object for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The TrustManager for the DatabaseKind in hubconfig
     */
    X509TrustManager getTrustManager(DatabaseKind kind);

    /**
     * Sets the Trust Manager for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param trustManager - The Trust Manager for the database connection
     */
    void setTrustManager(DatabaseKind kind, X509TrustManager trustManager);

    /**
     * Deprecated, as scheme was never usable when constructing a DatabaseClient.
     */
    @Deprecated
    String getScheme(DatabaseKind kind);

    /**
     * Deprecated, as scheme was never usable when constructing a DatabaseClient.
     */
    @Deprecated
    void setScheme(DatabaseKind kind, String scheme);

    /**
     * Returns if Simple SSL is set for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return true if Simple SSL is set for the DatabaseKind in hubconfig
     */
    boolean getSimpleSsl(DatabaseKind kind);

    /**
     * Sets if Simple SSL is to be used for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param simpleSsl- true if you want to use Simple SSL, false if you don't
     */
    void setSimpleSsl(DatabaseKind kind, Boolean simpleSsl);

    /**
     * Returns the SSL Cert file as a string for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The SSL Cert File as a string for the DatabaseKind in hubconfig
     */
    String getCertFile(DatabaseKind kind);

    /**
     * Sets the SSL Certfile to use for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param certFile - The SSL Cert File as a string to be used for the database connection
     */
    void setCertFile(DatabaseKind kind, String certFile);

    /**
     * Returns the SSL Cert Password as a string for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The SSL Cert Password for the DatabaseKind in hubconfig
     */
    String getCertPassword(DatabaseKind kind);

    /**
     * Sets the SSL Cert password for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param certPassword - The SSL certificate password for the database connection
     */
    void setCertPass(DatabaseKind kind, String certPassword);

    /**
     * Returns the external name for the host for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The external name of the host for the DatabaseKind in hubconfig
     */
    String getExternalName(DatabaseKind kind);

    /**
     * Sets the external hostname for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param externalName- The external host name for the database connection
     */
    void setExternalName(DatabaseKind kind, String externalName);

    // roles and users

    /**
     * Get the roleName the hub uses
     * @return the name of the role the DHF uses
     */
    String getFlowOperatorRoleName();

    /**
     * Set the role name that the hub uses
     * @param flowOperatorRoleName the name to use
     */
    void setFlowOperatorRoleName(String flowOperatorRoleName);

    /**
     * Get the current marklogic user name the hub uses
     * @return the username
     */
    String getFlowOperatorUserName();

    /**
     * Sets the username for the hub to use in MarkLogic
     * @param flowOperatorUserName - username to use
     */
    void setFlowOperatorUserName(String flowOperatorUserName);

    /**
     * Get the roleName the hub uses for developing flows
     * @return the name of the role the DHF uses for developing flows
     */
    String getFlowDeveloperRoleName();

    /**
     * Set the role name that the hub uses for developing flows
     * @param flowDeveloperRoleName the name to use for developing flows
     */
    void setFlowDeveloperRoleName(String flowDeveloperRoleName);

    /**
     * Get the current marklogic user name the hub uses to develop flows
     * @return the username
     */
    String getFlowDeveloperUserName();

    /**
     * Sets the username for the hub to use in MarkLogic for developing flows
     * @param flowDeveloperUserName - username to use
     */
    void setFlowDeveloperUserName(String flowDeveloperUserName);

    /**
     * Gets a string of load balancer host
     * @return String of load balancer host
     */
    String getLoadBalancerHost();

    /**
     * Signifies if the host is a load balancer host.
     * @return a Boolean.
     */
    Boolean getIsHostLoadBalancer();

    /**
     * Signifies if we are dealing with a provisioned environment.
     * @return a Boolean.
     */
    Boolean getIsProvisionedEnvironment();

    void setIsProvisionedEnvironment(boolean isProvisionedEnvironment);

    /**
     * Returns the path for the custom forests definition
     * @return path where the custom forests are as string
     */
    String getCustomForestPath();

    /**
     * Gets the permissions used to execute a module in string form
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each module
     */
    String getModulePermissions();

    /**
     * Prior to 5.1.0, entities were assigned permissions returned by getModulePermissions. For 5.1.0 and later, this
     * method should be used to know which permissions to assign to entity models.
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each entity model
     */
    String getEntityModelPermissions();

    /**
     * Prior to 5.2.0, entities were assigned permissions returned by getModulePermissions. For 5.2.0 and later, this
     * method should be used to know which permissions to assign to flow document.
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each flow document
     */
    String getFlowPermissions();

    /**
     * Prior to 5.2.0, entities were assigned permissions returned by getModulePermissions. For 5.2.0 and later, this
     * method should be used to know which permissions to assign to mapping document.
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each mapping document
     */
    String getMappingPermissions();

    /**
     * Prior to 5.2.0, entities were assigned permissions returned by getModulePermissions. For 5.2.0 and later, this
     * method should be used to know which permissions to assign to step definition document.
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each step definition document
     */
    String getStepDefinitionPermissions();

    /**
     * Obtains the project directory as a string
     * @return project directory
     */
    String getProjectDir();

    /**
     * Sets the directory for the current project
     * @param projectDir - a string that represents the path to the project directory
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
     * Creates a new DatabaseClient for accessing the Job database
     * @return - a DatabaseClient
     */
    DatabaseClient newJobDbClient();

    /**
     * Use newJobDbClient instead.  This function returns a client to
     * the JOBS database.
     * @return - a DatabaseClient
     */
    @Deprecated
    DatabaseClient newTraceDbClient();

    /**
     * Creates a new DatabaseClient for accessing the Hub Modules database
     * @return - a DatabaseClient
     */
    DatabaseClient newModulesDbClient();

    /**
     * Gets the path for the modules directory
     * @return the path for the modules directory
     */
    Path getModulesDir();

    /**
     * Gets the path for the hub plugins directory
     * @return the path for the hub plugins directory
     */
    Path getHubPluginsDir();

    /**
     * Gets the path for the hub entities directory
     * @return the path for the hub entities directory
     */
    Path getHubEntitiesDir();

    /**
     * Gets the path for the hub mappings directory
     * @return the path for the hub mappings directory
     */
    Path getHubMappingsDir();

    Path getStepsDirByType(StepDefinition.StepDefinitionType type);

    /**
     * Gets the path for the hub's config directory
     * @return the path for the hub's config directory
     */
    Path getHubConfigDir();

    /**
     * Gets the path for the hub's database directory
     * @return the path for the hub's database directory
     */
    Path getHubDatabaseDir();

    /**
     * Gets the path for the hub servers directory
     * @return the path for the hub servers database directory
     */
    Path getHubServersDir();

    /**
     * Gets the path for the hub's security directory
     * @return the path for the hub's security directory
     */
    Path getHubSecurityDir();

    /**
     * Gets the path for the user config directory
     * @return the path for the user config directory
     */
    Path getUserConfigDir();

    /**
     * Gets the path for the user security directory
     * @return the path for the user security directory
     */
    Path getUserSecurityDir();

    /**
     * Gets the path for the user database directory
     * @return the path for the user database directory
     */
    Path getUserDatabaseDir();

    /**
     * Gets the path for the user schemas directory
     * @return the path for the user schemas directory
     */
    Path getUserSchemasDir();

    /**
     * Gets the path for the user servers directory
     * @return the path for the user servers database directory
     */
    Path getUserServersDir();

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    Path getEntityDatabaseDir();

    /**
     * Gets the path for the flows directory
     *
     * @return the path for the flows directory
     */
    Path getFlowsDir();

    /**
     * Gets the path for the step definitions directory
     *
     * @return the path for the step definitions directory
     */
    Path getStepDefinitionsDir();

    /**
     * Returns the current AppConfig object attached to the HubConfig
     * @return Returns current AppConfig object set for HubConfig
     */
    @JsonIgnore
    AppConfig getAppConfig();

    /**
     * Sets the AppConfig for the current HubConfig
     * @param config AppConfig to associate with the HubConfig
     */
    void setAppConfig(AppConfig config);

    /**
     * Sets the AppConfig for the current HubConfig, with skipUpdate option
     * @param config - AppConfig to associate with the HubConfig
     * @param skipUpdate false to force update of AppConfig, true to skip it
     */
    void setAppConfig(AppConfig config, boolean skipUpdate);

    /**
     * Gets the current version of the DHF Jar
     * @return Version of DHF Jar file as string
     */
    String getJarVersion();

    /**
     * Gets the current version of the project properties file is targeting
     * @return Version of DHF that the project properties file is targeting
     */
    String getDHFVersion();

    /**
     * Gets the current level of logging set for the data hub
     * @return Log level of the data hub config
     */
    String getHubLogLevel();

    /**
     * Gets a new DatabaseClient that queries the staging database and appserver
     * @return A client that accesses the hub's staging appserver and staging database.
     */
    DatabaseClient newStagingClient();

    /**
     * Gets a new DatabaseClient that queries the staging database and appserver
     * @param dbName the name of the database
     * @return A client that accesses the hub's staging appserver and the database passed as param.
     */
    DatabaseClient newStagingClient(String dbName);

    String getStagingTriggersDbName();

    AdminManager getAdminManager();
    ManageClient getManageClient();
    /**
     * Gets a new DatabaseClient that queries the Final database using the staging appserver.
     * @return A database client configured for fetching from final database, but using DHF's staging modules.
     */
    DatabaseClient newReverseFlowClient();

    /**
     * Gets a new DatabaseClient that queries the Final database and appserver
     * @return A client that accesses the hub's Final appserver and staging database.
     */
    DatabaseClient newFinalClient();

    /**
     * Gets a new DatabaseClient that queries the Final database using the final appserver.
     * and final modules database.  (Future, will be same behavior as newReverseFlowClient when modules databases are merged.)
     * @return A DatabaseClient
     */
    DatabaseClient newFinalClient(String dbName);

    /**
     * Gets information on a datahub configuration
     * @return information on the datahub configuration as a string
     */
    String getInfo();


    /**
     * Initializes the java application state to a specific location.  A properties file
     * is expected to be found in this directory.
     * @param projectDirString The directory in which to find properties for a project.
     */
    void createProject(String projectDirString);

    /**
     * In a non-Gradle environment, a client can use this to load properties from a "gradle-(environment).properties"
     * file, similar to how the Gradle properties plugin would process such a file in a Gradle context.
     *
     * @param environment - The name of the environment to use (local,dev,qa,prod,...)
     * @return A HubConfig
     */
    HubConfig withPropertiesFromEnvironment(String environment);

    /**
     * Loads HubConfig object with values from gradle.properties (optionally overridden with
     * gradle-(environment).properties). Once Spring creates HubConfig object and the project is initialized with
     * {@link #createProject(String)} you can use setter methods to change HubConfig properties
     * and then call this method.
     */
    void refreshProject();
}
