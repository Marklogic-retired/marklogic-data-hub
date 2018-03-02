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

    String getHost();

    static HubConfig create(String projectDir) {
        return new HubConfigImpl(projectDir);
    }
    String getDbName(DatabaseKind kind);

    void setDbName(DatabaseKind kind, String dbName);

    String getHttpName(DatabaseKind kind);

    void setHttpName(DatabaseKind kind, String httpName);

    Integer getForestsPerHost(DatabaseKind kind);

    void setForestsPerHost(DatabaseKind kind, Integer forestsPerHost);

    Integer getPort(DatabaseKind kind);

    void setPort(DatabaseKind kind, Integer port);

    void setStagingSslContext(SSLContext stagingSslContext);

    void setStagingSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier);

    void setFinalSslContext(SSLContext finalSslContext);

    void setFinalSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier);

    // roles and users
    String getHubRoleName();
    void setHubRoleName(String hubRoleName);

    String getHubUserName();
    void setHubUserName(String hubUserName);

    String[] getLoadBalancerHosts();

    String getCustomForestPath();

    String getModulePermissions();

    String getProjectDir();
    void setProjectDir(String projectDir);

    HubProject getHubProject();

    void initHubProject();

    String getHubModulesDeployTimestampFile();


    String getUserModulesDeployTimestampFile();

    DatabaseClient newAppServicesClient();

    /**
     * Creates a new DatabaseClient for accessing the Staging database
     * @return - a DatabaseClient
     */
     DatabaseClient newStagingClient();

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

    Path getHubPluginsDir();
    Path getHubEntitiesDir();

    Path getHubConfigDir();
    Path getHubDatabaseDir();
    Path getHubServersDir();
    Path getHubSecurityDir();

    Path getUserSecurityDir();

    Path getUserConfigDir();

    Path getUserDatabaseDir();

    Path getEntityDatabaseDir();

    Path getUserServersDir();

    Path getHubMimetypesDir();

    AppConfig getAppConfig();

    void setAppConfig(AppConfig config);

    void setAppConfig(AppConfig config, boolean skipUpdate);

    String getJarVersion() throws IOException;
}
