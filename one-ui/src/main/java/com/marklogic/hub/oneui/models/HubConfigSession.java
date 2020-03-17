package com.marklogic.hub.oneui.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import com.marklogic.hub.oneui.services.EnvironmentService;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.SessionScope;

import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
@Primary
@SessionScope
public class HubConfigSession implements HubConfig, InitializingBean, DisposableBean {
    private static final Logger logger = LoggerFactory.getLogger(HubConfigSession.class);

    private HubConfigImpl hubConfigImpl;

    @Autowired
    private Environment environment;

    @Autowired
    private EnvironmentService environmentService;

    private Map<DatabaseKind, Map<String, DatabaseClient>> clientsByKindAndDatabaseName  = new HashMap<>();

    private DataHub dataHub;

    public void setCredentials(EnvironmentInfo environmentInfo, String username, String password) {
        // customize hubConfig
        hubConfigImpl.setAuthMethod(DatabaseKind.STAGING, environmentInfo.dhStagingAuthMethod.toLowerCase());
        hubConfigImpl.setAuthMethod(DatabaseKind.FINAL, environmentInfo.dhFinalAuthMethod.toLowerCase());
        hubConfigImpl.setHost(environmentInfo.mlHost);
        hubConfigImpl.setPort(DatabaseKind.STAGING, environmentInfo.dhStagingPort);
        hubConfigImpl.setPort(DatabaseKind.FINAL, environmentInfo.dhFinalPort);
        hubConfigImpl.setMlUsername(username);
        hubConfigImpl.setMlPassword(password);
        // Setup app config
        AppConfig appConfig = hubConfigImpl.getAppConfig();
        appConfig.setAppServicesUsername(username);
        appConfig.setAppServicesPassword(password);
        appConfig.setRestAdminUsername(username);
        appConfig.setRestAdminPassword(password);
        appConfig.setHost(environmentInfo.mlHost);
        appConfig.setRestPort(environmentInfo.dhStagingPort);
        appConfig.setAppServicesSecurityContextType(SecurityContextType.valueOf(environmentInfo.mlAuthMethod));
        appConfig.setRestSecurityContextType(SecurityContextType.valueOf(environmentInfo.mlAuthMethod));

        // Setup admin manager/config
        AdminConfig adminConfig = hubConfigImpl.getAdminConfig();
        adminConfig.setHost(environmentInfo.mlHost);
        adminConfig.setUsername(username);
        adminConfig.setPassword(password);
        hubConfigImpl.getAdminManager().setAdminConfig(adminConfig);

        // setup manageConfig
        ManageConfig manageConfig = hubConfigImpl.getManageConfig();
        manageConfig.setHost(environmentInfo.mlHost);
        if (environmentInfo.mlManagePort != 0) {
            manageConfig.setPort(environmentInfo.mlManagePort);
        }
        manageConfig.setSecurityUsername(username);
        manageConfig.setSecurityPassword(password);
        manageConfig.setUsername(username);
        manageConfig.setPassword(password);
        hubConfigImpl.getManageClient().setManageConfig(manageConfig);

        hubConfigImpl.createProject(environmentService.getProjectDirectory());
        hubConfigImpl.refreshProject();
        // construct clients now, so we can clear our password fields
        eagerlyConstructClients();

        // TODO figure out a way to clear out passwords after client construction and support install
/*
        hubConfigImpl.setMlPassword(null);
        appConfig.setAppServicesPassword(null);
        appConfig.setRestAdminPassword(null);
        adminConfig.setPassword(null);
        manageConfig.setSecurityPassword(null);
        manageConfig.setPassword(null);
*/
    }
    /**
     * Gets the hostname of the AppConfig
     * @return name of host
     */
    @Override
    public String getHost() {
        return hubConfigImpl.getHost();
    }

    /**
     * Returns the database name for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The name of the database
     */
    @Override
    public String getDbName(DatabaseKind kind) {
        return hubConfigImpl.getDbName(kind);
    }

    /**
     * Sets the database name for the databaseKind on the hubconfig
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param dbName The name desired for the database
     */
    @Override
    public void setDbName(DatabaseKind kind, String dbName) {
        hubConfigImpl.setDbName(kind, dbName);
    }

    /**
     * Returns the appserver name for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The name of the App server
     */
    @Override
    public String getHttpName(DatabaseKind kind) {
        return hubConfigImpl.getHttpName(kind);
    }

    /**
     * Sets the appserver name for the databaseKind on the hubconfig
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param httpName The name to set for the appserver
     */
    @Override
    public void setHttpName(DatabaseKind kind, String httpName) {
        hubConfigImpl.setHttpName(kind, httpName);
    }

    /**
     * Returns the number of forests per host for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The number of forests per host for this database
     */
    @Override
    public Integer getForestsPerHost(DatabaseKind kind) {
        return hubConfigImpl.getForestsPerHost(kind);
    }

    /**
     * Sets the number of forests per host for the databaseKind on the hubconfig
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param forestsPerHost The number of forests per host
     */
    @Override
    public void setForestsPerHost(DatabaseKind kind, Integer forestsPerHost) {
        hubConfigImpl.setForestsPerHost(kind, forestsPerHost);
    }

    /**
     * Returns the port number for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The port set for the appserver connected to the database
     */
    @Override
    public Integer getPort(DatabaseKind kind) {
        return hubConfigImpl.getPort(kind);
    }

    /**
     * Sets the port number for the databaseKind on the hubconfig
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param port The port number for the database appserver
     */
    @Override
    public void setPort(DatabaseKind kind, Integer port) {
        hubConfigImpl.setPort(kind, port);
    }

    /**
     * Returns the SSL Context for the DatabaseKind set in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The SSLContext set for the database connection
     */
    @Override
    public SSLContext getSslContext(DatabaseKind kind) {
        return hubConfigImpl.getSslContext(kind);
    }

    /**
     * Sets the SSL Context for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param sslContext - The SSLContext set for the database connection
     */
    @Override
    public void setSslContext(DatabaseKind kind, SSLContext sslContext) {
        hubConfigImpl.setSslContext(kind, sslContext);
    }

    /**
     * Sets the SSL Hostname Verifier object for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param stagingSslHostnameVerifier - The SSL Hostname Verifier object for the database connection
     */
    @Override
    public void setSslHostnameVerifier(DatabaseKind kind, DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier) {
        hubConfigImpl.setSslHostnameVerifier(kind, stagingSslHostnameVerifier);
    }

    /**
     * Returns the SSL hostname verifier object for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The SSL Hostname Verifier for the DatabaseKind in hubconfig
     */
    @Override
    public DatabaseClientFactory.SSLHostnameVerifier getSslHostnameVerifier(DatabaseKind kind) {
        return hubConfigImpl.getSslHostnameVerifier(kind);
    }

    /**
     * Returns the AuthMethod object for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The Auth Method for the DatabaseKind in hubconfig
     */
    @Override
    public String getAuthMethod(DatabaseKind kind) {
        return hubConfigImpl.getAuthMethod(kind);
    }

    /**
     * Sets the SSL Auth Method for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param authMethod - The SSL Auth Method for the database connection
     */
    @Override
    public void setAuthMethod(DatabaseKind kind, String authMethod) {
        hubConfigImpl.setAuthMethod(kind, authMethod);
    }

    /**
     * Returns the TrustManager object for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The TrustManager for the DatabaseKind in hubconfig
     */
    @Override
    public X509TrustManager getTrustManager(DatabaseKind kind) {
        return hubConfigImpl.getTrustManager(kind);
    }

    /**
     * Sets the Trust Manager for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param trustManager - The Trust Manager for the database connection
     */
    @Override
    public void setTrustManager(DatabaseKind kind, X509TrustManager trustManager) {
        hubConfigImpl.setTrustManager(kind, trustManager);
    }

    /**
     * Deprecated, as scheme was never usable when constructing a DatabaseClient.
     * @param kind
     */
    @Override
    @Deprecated
    public String getScheme(DatabaseKind kind) {
        return hubConfigImpl.getScheme(kind);
    }

    /**
     * Deprecated, as scheme was never usable when constructing a DatabaseClient.
     * @param kind
     * @param scheme
     */
    @Override
    @Deprecated
    public void setScheme(DatabaseKind kind, String scheme) {
        hubConfigImpl.setScheme(kind, scheme);
    }

    /**
     * Returns if Simple SSL is set for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return true if Simple SSL is set for the DatabaseKind in hubconfig
     */
    @Override
    public boolean getSimpleSsl(DatabaseKind kind) {
        return hubConfigImpl.getSimpleSsl(kind);
    }

    /**
     * Sets if Simple SSL is to be used for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param simpleSsl - true if you want to use Simple SSL, false if you don't
     */
    @Override
    public void setSimpleSsl(DatabaseKind kind, Boolean simpleSsl) {
        hubConfigImpl.setSimpleSsl(kind, simpleSsl);
    }

    /**
     * Returns the SSL Cert file as a string for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The SSL Cert File as a string for the DatabaseKind in hubconfig
     */
    @Override
    public String getCertFile(DatabaseKind kind) {
        return hubConfigImpl.getCertFile(kind);
    }

    /**
     * Sets the SSL Certfile to use for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param certFile - The SSL Cert File as a string to be used for the database connection
     */
    @Override
    public void setCertFile(DatabaseKind kind, String certFile) {
        hubConfigImpl.setCertFile(kind, certFile);
    }

    /**
     * Returns the SSL Cert Password as a string for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The SSL Cert Password for the DatabaseKind in hubconfig
     */
    @Override
    public String getCertPassword(DatabaseKind kind) {
        return hubConfigImpl.getCertPassword(kind);
    }

    /**
     * Sets the SSL Cert password for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param certPassword - The SSL certificate password for the database connection
     */
    @Override
    public void setCertPass(DatabaseKind kind, String certPassword) {
        hubConfigImpl.setCertPass(kind, certPassword);
    }

    /**
     * Returns the external name for the host for the DatabaseKind in the hub config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return The external name of the host for the DatabaseKind in hubconfig
     */
    @Override
    public String getExternalName(DatabaseKind kind) {
        return hubConfigImpl.getExternalName(kind);
    }

    /**
     * Sets the external hostname for the DatabaseKind in the config
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param externalName - The external host name for the database connection
     */
    @Override
    public void setExternalName(DatabaseKind kind, String externalName) {
        hubConfigImpl.setExternalName(kind, externalName);
    }

    /**
     * Get the roleName the hub uses
     * @return the name of the role the DHF uses
     */
    @Override
    public String getFlowOperatorRoleName() {
        return hubConfigImpl.getFlowOperatorRoleName();
    }

    /**
     * Set the role name that the hub uses
     * @param flowOperatorRoleName the name to use
     */
    @Override
    public void setFlowOperatorRoleName(String flowOperatorRoleName) {
        hubConfigImpl.setFlowOperatorRoleName(flowOperatorRoleName);
    }

    /**
     * Get the current marklogic user name the hub uses
     * @return the username
     */
    @Override
    public String getFlowOperatorUserName() {
        return hubConfigImpl.getFlowOperatorUserName();
    }

    /**
     * Sets the username for the hub to use in MarkLogic
     * @param flowOperatorUserName - username to use
     */
    @Override
    public void setFlowOperatorUserName(String flowOperatorUserName) {
        hubConfigImpl.setFlowOperatorUserName(flowOperatorUserName);
    }

    /**
     * Get the roleName the hub uses for developing flows
     * @return the name of the role the DHF uses for developing flows
     */
    @Override
    public String getFlowDeveloperRoleName() {
        return hubConfigImpl.getFlowDeveloperRoleName();
    }

    /**
     * Set the role name that the hub uses for developing flows
     * @param flowDeveloperRoleName the name to use for developing flows
     */
    @Override
    public void setFlowDeveloperRoleName(String flowDeveloperRoleName) {
        hubConfigImpl.setFlowDeveloperRoleName(flowDeveloperRoleName);
    }

    /**
     * Get the current marklogic user name the hub uses to develop flows
     * @return the username
     */
    @Override
    public String getFlowDeveloperUserName() {
        return hubConfigImpl.getFlowDeveloperUserName();
    }

    /**
     * Sets the username for the hub to use in MarkLogic for developing flows
     * @param flowDeveloperUserName - username to use
     */
    @Override
    public void setFlowDeveloperUserName(String flowDeveloperUserName) {
        hubConfigImpl.setFlowDeveloperUserName(flowDeveloperUserName);
    }

    /**
     * Gets a string of load balancer host
     * @return String of load balancer host
     */
    @Override
    public String getLoadBalancerHost() {
        return hubConfigImpl.getLoadBalancerHost();
    }

    /**
     * Signifies if the host is a load balancer host.
     * @return a Boolean.
     */
    @Override
    public Boolean getIsHostLoadBalancer() {
        return hubConfigImpl.getIsHostLoadBalancer();
    }

    /**
     * Signifies if we are dealing with a provisioned environment.
     * @return a Boolean.
     */
    @Override
    public Boolean getIsProvisionedEnvironment() {
        return hubConfigImpl.getIsProvisionedEnvironment();
    }

    @Override
    public void setIsProvisionedEnvironment(boolean isProvisionedEnvironment) { hubConfigImpl.setIsProvisionedEnvironment(isProvisionedEnvironment);  }

    /**
     * Returns the path for the custom forests definition
     * @return path where the custom forests are as string
     */
    @Override
    public String getCustomForestPath() {
        return hubConfigImpl.getCustomForestPath();
    }

    /**
     * Gets the permissions used to execute a module in string form
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each module
     */
    @Override
    public String getModulePermissions() {
        return hubConfigImpl.getModulePermissions();
    }

    /**
     * Prior to 5.1.0, entities were assigned permissions returned by getModulePermissions. For 5.1.0 and later, this
     * method should be used to know which permissions to assign to entity models.
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each entity model
     */
    @Override
    public String getEntityModelPermissions() {
        return hubConfigImpl.getEntityModelPermissions();
    }

    /**
     * Prior to 5.2.0, entities were assigned permissions returned by getModulePermissions. For 5.2.0 and later, this
     * method should be used to know which permissions to assign to flow document.
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each flow document
     */
    @Override
    public String getFlowPermissions() {
        return hubConfigImpl.getFlowPermissions();
    }

    /**
     * Prior to 5.2.0, entities were assigned permissions returned by getModulePermissions. For 5.2.0 and later, this
     * method should be used to know which permissions to assign to mapping document.
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each mapping document
     */
    @Override
    public String getMappingPermissions() {
        return hubConfigImpl.getMappingPermissions();
    }

    /**
     * Prior to 5.2.0, entities were assigned permissions returned by getModulePermissions. For 5.2.0 and later, this
     * method should be used to know which permissions to assign to step definition document.
     *
     * @return a comma-delimited string of role1,capability1,role2,capability2 that defines the permissions to add to
     * each step definition document
     */
    @Override
    public String getStepDefinitionPermissions() {
        return hubConfigImpl.getStepDefinitionPermissions();
    }

    /**
     * Obtains the project directory as a string
     * @return project directory
     */
    @Override
    public String getProjectDir() {
        return hubConfigImpl.getProjectDir();
    }

    /**
     * Sets the directory for the current project
     * @param projectDir - a string that represents the path to the project directory
     */
    @Override
    public void setProjectDir(String projectDir) {
        hubConfigImpl.setProjectDir(projectDir);
    }

    /**
     * Returns the HubProject associated with the HubConfig
     * @return current hubProject associated with the HubConfig
     */
    @Override
    public HubProject getHubProject() {
        return hubConfigImpl.getHubProject();
    }

    /**
     * Initializes the hub project on disk
     */
    @Override
    public void initHubProject() {
        hubConfigImpl.initHubProject();
    }

    /**
     * Returns the last deployed timestamp file for the hub config and modules
     * @return string of what's located in the timestamp file
     */
    @Override
    public String getHubModulesDeployTimestampFile() {
        return hubConfigImpl.getHubModulesDeployTimestampFile();
    }

    /**
     * Returns the last deployed timestamp file for the user modules
     * @return string of what's located in the timestamp file
     */
    @Override
    public String getUserModulesDeployTimestampFile() {
        return hubConfigImpl.getUserModulesDeployTimestampFile();
    }

    /**
     * Creates a new DatabaseClient for accessing the AppServices app
     * @return - a DatabaseClient
     */
    @Override
    public DatabaseClient newAppServicesClient() {
        return hubConfigImpl.newAppServicesClient();
    }

    /**
     * Creates a new DatabaseClient for accessing the Job database
     * @return - a DatabaseClient
     */
    @Override
    public DatabaseClient newJobDbClient() {
        return hubConfigImpl.newJobDbClient();
    }

    /**
     * Use newJobDbClient instead.  This function returns a client to
     * the JOBS database.
     * @return - a DatabaseClient
     */
    @Override
    @Deprecated
    public DatabaseClient newTraceDbClient() {
        return hubConfigImpl.newTraceDbClient();
    }

    /**
     * Creates a new DatabaseClient for accessing the Hub Modules database
     * @return - a DatabaseClient
     */
    @Override
    public DatabaseClient newModulesDbClient() {
        return hubConfigImpl.newModulesDbClient();
    }

    /**
     * Gets the path for the modules directory
     * @return the path for the modules directory
     */
    @Override
    public Path getModulesDir() {
        return hubConfigImpl.getModulesDir();
    }

    /**
     * Gets the path for the hub plugins directory
     * @return the path for the hub plugins directory
     */
    @Override
    public Path getHubPluginsDir() {
        return hubConfigImpl.getHubPluginsDir();
    }

    /**
     * Gets the path for the hub entities directory
     * @return the path for the hub entities directory
     */
    @Override
    public Path getHubEntitiesDir() {
        return hubConfigImpl.getHubEntitiesDir();
    }

    /**
     * Gets the path for the hub mappings directory
     * @return the path for the hub mappings directory
     */
    @Override
    public Path getHubMappingsDir() {
        return hubConfigImpl.getHubMappingsDir();
    }

    @Override
    public Path getStepsDirByType(StepDefinition.StepDefinitionType type) {
        return hubConfigImpl.getStepsDirByType(type);
    }

    /**
     * Gets the path for the hub's config directory
     * @return the path for the hub's config directory
     */
    @Override
    public Path getHubConfigDir() {
        return hubConfigImpl.getHubConfigDir();
    }

    /**
     * Gets the path for the hub's database directory
     * @return the path for the hub's database directory
     */
    @Override
    public Path getHubDatabaseDir() {
        return hubConfigImpl.getHubDatabaseDir();
    }

    /**
     * Gets the path for the hub servers directory
     * @return the path for the hub servers database directory
     */
    @Override
    public Path getHubServersDir() {
        return hubConfigImpl.getHubServersDir();
    }

    /**
     * Gets the path for the hub's security directory
     * @return the path for the hub's security directory
     */
    @Override
    public Path getHubSecurityDir() {
        return hubConfigImpl.getHubSecurityDir();
    }

    /**
     * Gets the path for the user config directory
     * @return the path for the user config directory
     */
    @Override
    public Path getUserConfigDir() {
        return hubConfigImpl.getUserConfigDir();
    }

    /**
     * Gets the path for the user security directory
     * @return the path for the user security directory
     */
    @Override
    public Path getUserSecurityDir() {
        return hubConfigImpl.getUserSecurityDir();
    }

    /**
     * Gets the path for the user database directory
     * @return the path for the user database directory
     */
    @Override
    public Path getUserDatabaseDir() {
        return hubConfigImpl.getUserDatabaseDir();
    }

    /**
     * Gets the path for the user schemas directory
     * @return the path for the user schemas directory
     */
    @Override
    public Path getUserSchemasDir() {
        return hubConfigImpl.getUserSchemasDir();
    }

    /**
     * Gets the path for the user servers directory
     * @return the path for the user servers database directory
     */
    @Override
    public Path getUserServersDir() {
        return hubConfigImpl.getUserServersDir();
    }

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    @Override
    public Path getEntityDatabaseDir() {
        return hubConfigImpl.getEntityDatabaseDir();
    }

    /**
     * Gets the path for the flows directory
     *
     * @return the path for the flows directory
     */
    @Override
    public Path getFlowsDir() {
        return hubConfigImpl.getFlowsDir();
    }

    /**
     * Gets the path for the step definitions directory
     *
     * @return the path for the step definitions directory
     */
    @Override
    public Path getStepDefinitionsDir() {
        return hubConfigImpl.getStepDefinitionsDir();
    }

    /**
     * Returns the current AppConfig object attached to the HubConfig
     * @return Returns current AppConfig object set for HubConfig
     */
    @Override
    @JsonIgnore
    public AppConfig getAppConfig() {
        return hubConfigImpl.getAppConfig();
    }

    /**
     * Sets the AppConfig for the current HubConfig
     * @param config AppConfig to associate with the HubConfig
     */
    @Override
    public void setAppConfig(AppConfig config) {
        hubConfigImpl.setAppConfig(config);
    }

    /**
     * Sets the AppConfig for the current HubConfig, with skipUpdate option
     * @param config - AppConfig to associate with the HubConfig
     * @param skipUpdate false to force update of AppConfig, true to skip it
     */
    @Override
    public void setAppConfig(AppConfig config, boolean skipUpdate) {
        hubConfigImpl.setAppConfig(config, skipUpdate);
    }

    /**
     * Gets the current version of the DHF Jar
     * @return Version of DHF Jar file as string
     */
    @Override
    public String getJarVersion() {
        return hubConfigImpl.getJarVersion();
    }

    /**
     * Gets the current version of the project properties file is targeting
     * @return Version of DHF that the project properties file is targeting
     */
    @Override
    public String getDHFVersion() {
        return hubConfigImpl.getDHFVersion();
    }

    /**
     * Gets the current level of logging set for the data hub
     * @return Log level of the data hub config
     */
    @Override
    public String getHubLogLevel() {
        return hubConfigImpl.getHubLogLevel();
    }

    /**
     * Gets a new DatabaseClient that queries the staging database and appserver
     * @return A client that accesses the hub's staging appserver and staging database.
     */
    @Override
    public DatabaseClient newStagingClient() {
        return getClientByDatabaseKindAndName(DatabaseKind.STAGING, null);
    }

    /**
     * Gets a new DatabaseClient that queries the staging database and appserver
     * @param dbName the name of the database
     * @return A client that accesses the hub's staging appserver and the database passed as param.
     */
    @Override
    public DatabaseClient newStagingClient(String dbName) {
        return getClientByDatabaseKindAndName(DatabaseKind.STAGING, dbName);
    }

    @Override
    public String getStagingTriggersDbName() {
        return hubConfigImpl.getStagingTriggersDbName();
    }

    @Override
    public AdminManager getAdminManager() {
        return hubConfigImpl.getAdminManager();
    }

    /**
     * Gets a new DatabaseClient that queries the Final database using the staging appserver.
     * @return A database client configured for fetching from final database, but using DHF's staging modules.
     */
    @Override
    public DatabaseClient newReverseFlowClient() {
        return getClientByDatabaseKindAndName(DatabaseKind.FINAL, hubConfigImpl.getDbName(DatabaseKind.STAGING));
    }

    /**
     * Gets a new DatabaseClient that queries the Final database using the final appserver.
     * and final modules database.  (Future, will be same behavior as newReverseFlowClient when modules databases are merged.)
     * @return A DatabaseClient
     */
    @Override
    public DatabaseClient newFinalClient() {
        return getClientByDatabaseKindAndName(DatabaseKind.FINAL, null);
    }

    /**
     * Gets a new DatabaseClient that queries the Final database and appserver
     * @param dbName the name of the database
     * @return A client that accesses the hub's Final appserver and the database passed as param.
     */
    @Override
    public DatabaseClient newFinalClient(String dbName) {
        return getClientByDatabaseKindAndName(DatabaseKind.FINAL, dbName);
    }

    /**
     * Gets information on a datahub configuration
     * @return information on the datahub configuration as a string
     */
    @Override
    public String getInfo() {
        return hubConfigImpl.getInfo();
    }

    /**
     * Initializes the java application state to a specific location.  A properties file
     * is expected to be found in this directory.
     * @param projectDirString The directory in which to find properties for a project.
     */
    @Override
    public void createProject(String projectDirString) {
        hubConfigImpl.createProject(projectDirString);
    }

    /**
     * In a non-Gradle environment, a client can use this to load properties from a "gradle-(environment).properties"
     * file, similar to how the Gradle properties plugin would process such a file in a Gradle context.
     *
     * @param environment - The name of the environment to use (local,dev,qa,prod,...)
     * @return A HubConfig
     */
    @Override
    public HubConfig withPropertiesFromEnvironment(String environment) {
        return hubConfigImpl.withPropertiesFromEnvironment(environment);
    }

    /**
     * Loads HubConfig object with values from gradle.properties (optionally overridden with
     * gradle-(environment).properties). Once Spring creates HubConfig object and the project is initialized with
     * {@link #createProject(String)} you can use setter methods to change HubConfig properties
     * and then call this method.
     */
    @Override
    public void refreshProject() {
        hubConfigImpl.refreshProject();
    }

    public ManageClient getManageClient() {
        return hubConfigImpl.getManageClient();
    }

    public ManageConfig getManageConfig() {
        return hubConfigImpl.getManageConfig();
    }

    // Eagerly constructs clients with credentials to avoid storing password in our Java Objects
    private void eagerlyConstructClients() {
        // Only constructing what we need, as we discover we need it.
        // Staging clients
        Map<String, DatabaseClient> stagingClients = new HashMap<>();
        // create client for data services (no database name)
        stagingClients.put(null, hubConfigImpl.newStagingClient(null));
        String modulesDbName = hubConfigImpl.getDbName(DatabaseKind.MODULES);
        stagingClients.put(modulesDbName, hubConfigImpl.newStagingClient(modulesDbName));
        clientsByKindAndDatabaseName.put(DatabaseKind.STAGING, stagingClients);
        Map<String, DatabaseClient> finalClients = new HashMap<>();
        // create client for data services (no database name)
        finalClients.put(null, hubConfigImpl.newFinalClient(null));
        finalClients.put(hubConfigImpl.getDbName(DatabaseKind.FINAL), hubConfigImpl.newFinalClient());
        finalClients.put(hubConfigImpl.getDbName(DatabaseKind.STAGING), hubConfigImpl.newReverseFlowClient());
        clientsByKindAndDatabaseName.put(DatabaseKind.FINAL, finalClients);
    }

    private DatabaseClient getClientByDatabaseKindAndName(DatabaseKind kind, String name) {
        DatabaseClient client = null;
        Map<String, DatabaseClient> clientsOfKind = clientsByKindAndDatabaseName.get(kind);
        if (clientsOfKind != null) {
            client = clientsOfKind.get(name);
        }
        if (client == null) {
            throw new DataHubConfigurationException("Tried to obtain unsupported database client");
        }
        return client;
    }

    public DataHub getDataHub() {
        return this.dataHub;
    }

    /**
     * Invoked by the containing {@code BeanFactory} after it has set all bean properties
     * and satisfied {@link BeanFactoryAware}, {@code ApplicationContextAware} etc.
     * <p>This method allows the bean instance to perform validation of its overall
     * configuration and final initialization when all bean properties have been set.
     *
     * @throws Exception in the event of misconfiguration (such as failure to set an
     *                   essential property) or if initialization fails for any other reason
     */
    @Override
    public void afterPropertiesSet() throws Exception {
        hubConfigImpl = new HubConfigImpl(new HubProjectImpl(), environment);
        if (hubConfigImpl.getManageConfig() == null) {
            hubConfigImpl.setManageConfig(new ManageConfig());
        }
        if (hubConfigImpl.getManageClient() == null) {
            hubConfigImpl.setManageClient(new ManageClient());
        }
        if (hubConfigImpl.getAdminConfig() == null) {
            hubConfigImpl.setAdminConfig(new AdminConfig());
        }
        if (hubConfigImpl.getAdminManager() == null) {
            hubConfigImpl.setAdminManager(new AdminManager());
        }
        setProjectDirectory(environmentService.getProjectDirectory());
        this.dataHub = new DataHubImpl(this);
    }

    @Override
    public void destroy() {
        if (!clientsByKindAndDatabaseName.isEmpty()) {
            clientsByKindAndDatabaseName.values().stream()
                .flatMap(s -> s.values().stream().filter(Objects::nonNull))
                .forEach(
                    e -> {
                        logger.debug(String.format("release %s (%s)", e.getDatabase(), e.toString()));
                        e.release();
                        e = null;
                    });
            clientsByKindAndDatabaseName.clear();
        }
    }

    public void setProjectDirectory(String projectDirectory) {
        hubConfigImpl.setAppConfig(null, true);
        hubConfigImpl.createProject(projectDirectory);
        hubConfigImpl.refreshProject();
    }

    //only for test purpose
    protected Map<DatabaseKind, Map<String, DatabaseClient>> getAllDatabaseClients() {
        return clientsByKindAndDatabaseName;
    }

    // this is used for flow runner, so we have a HubConfig that isn't session scoped
    public HubConfigImpl getHubConfigImpl() {
        return hubConfigImpl;
    }
}
