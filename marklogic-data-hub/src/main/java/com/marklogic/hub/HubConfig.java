/*
 * Copyright (c) 2021 MarkLogic Corporation
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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;

import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;

public interface HubConfig {

    String DEFAULT_STAGING_NAME = "data-hub-STAGING";
    String DEFAULT_FINAL_NAME = "data-hub-FINAL";
    String DEFAULT_JOB_NAME = "data-hub-JOBS";
    String DEFAULT_MODULES_DB_NAME = "data-hub-MODULES";
    String DEFAULT_STAGING_TRIGGERS_DB_NAME = "data-hub-staging-TRIGGERS";
    String DEFAULT_FINAL_TRIGGERS_DB_NAME = "data-hub-final-TRIGGERS";
    String DEFAULT_STAGING_SCHEMAS_DB_NAME = "data-hub-staging-SCHEMAS";
    String DEFAULT_FINAL_SCHEMAS_DB_NAME = "data-hub-final-SCHEMAS";

    String PII_QUERY_ROLESET_FILE = "pii-reader.json";
    String PII_PROTECTED_PATHS_FILE = "pii-protected-paths.json";

    /**
     *
     * @return a HubClient instance based on the configuration of this HubConfig. Ideally, DH clients should construct
     * a HubConfig based on configuration properties and then call this method to obtain a HubClient. A HubClient should
     * then be used for all DH operations where possible. HubConfig is still needed by a number of DH classes, but in
     * general, prefer HubClient over HubConfig.
     */
    HubClient newHubClient();

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
     * Returns the HubProject associated with the HubConfig
     * @return current hubProject associated with the HubConfig
     */
    HubProject getHubProject();

    /**
     * Initializes the hub project on disk. As of 5.4, this requires access to all the project properties, as those
     * properties affect how the project is initialized. This doesn't really seem to make sense though, because the
     * primary way of specifying properties is by reading in a properties file from the project.
     */
    void initHubProject();

    /**
     * Creates a new DatabaseClient for accessing the Job database
     * @return - a DatabaseClient
     */
    DatabaseClient newJobDbClient();

    /**
     * Creates a new DatabaseClient for accessing the Hub Modules database
     * @return - a DatabaseClient
     */
    DatabaseClient newModulesDbClient();

    /**
     * Returns the current AppConfig object attached to the HubConfig
     * @return Returns current AppConfig object set for HubConfig
     */
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

    HubConfig withPropertiesFromEnvironment(String environment);
}
