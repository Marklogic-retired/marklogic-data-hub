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

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.alert.DeployAlertActionsCommand;
import com.marklogic.appdeployer.command.alert.DeployAlertConfigsCommand;
import com.marklogic.appdeployer.command.alert.DeployAlertRulesCommand;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.appdeployer.command.cpf.DeployCpfConfigsCommand;
import com.marklogic.appdeployer.command.cpf.DeployDomainsCommand;
import com.marklogic.appdeployer.command.cpf.DeployPipelinesCommand;
import com.marklogic.appdeployer.command.databases.DeploySchemasDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployTriggersDatabaseCommand;
import com.marklogic.appdeployer.command.flexrep.DeployConfigsCommand;
import com.marklogic.appdeployer.command.flexrep.DeployFlexrepCommand;
import com.marklogic.appdeployer.command.flexrep.DeployTargetsCommand;
import com.marklogic.appdeployer.command.forests.ConfigureForestReplicasCommand;
import com.marklogic.appdeployer.command.groups.DeployGroupsCommand;
import com.marklogic.appdeployer.command.mimetypes.DeployMimetypesCommand;
import com.marklogic.appdeployer.command.schemas.LoadSchemasCommand;
import com.marklogic.appdeployer.command.security.*;
import com.marklogic.appdeployer.command.tasks.DeployScheduledTasksCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.appdeployer.command.viewschemas.DeployViewSchemasCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.DeployHubDatabasesCommand;
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.ServerValidationException;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.appservers.ServerManager;
import com.marklogic.mgmt.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;
import com.marklogic.rest.util.ResourcesFragment;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.web.client.ResourceAccessException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.*;

public class DataHub extends LoggingObject {

    private ManageConfig config;
    private ManageClient client;
    private DatabaseManager databaseManager;
    private ServerManager serverManager;
    private HubConfig hubConfig;

    private AdminManager adminManager;

    public DataHub(HubConfig hubConfig) {
        init(hubConfig);
    }

    private void init(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        if (hubConfig.username != null && hubConfig.password != null) {
            config = new ManageConfig(hubConfig.host, 8002, hubConfig.username, hubConfig.password);
            client = new ManageClient(config);
            databaseManager = new DatabaseManager(client);
            serverManager = new ServerManager(client);

            AdminConfig adminConfig = new AdminConfig();
            adminConfig.setHost(hubConfig.host);
            adminConfig.setUsername(hubConfig.adminUsername);
            adminConfig.setPassword(hubConfig.adminPassword);
            adminManager = new AdminManager(adminConfig);
        }
        else {
            logger.info("Missing username and/or password.");
        }
    }

    void setAdminManager(AdminManager manager) {
        this.adminManager = manager;
    }

    /**
     * Determines if the data hub is installed in MarkLogic
     * @return true if installed, false otherwise
     */
    public InstallInfo isInstalled() {

        InstallInfo installInfo = new InstallInfo();

        ResourcesFragment srf = serverManager.getAsXml();
        installInfo.stagingAppServerExists = srf.resourceExists(hubConfig.stagingHttpName);
        installInfo.finalAppServerExists = srf.resourceExists(hubConfig.finalHttpName);
        installInfo.traceAppServerExists = srf.resourceExists(hubConfig.traceHttpName);
        installInfo.jobAppServerExists = srf.resourceExists(hubConfig.jobHttpName);

        ResourcesFragment drf = databaseManager.getAsXml();
        installInfo.stagingDbExists = drf.resourceExists(hubConfig.stagingDbName);
        installInfo.finalDbExists = drf.resourceExists(hubConfig.finalDbName);
        installInfo.traceDbExists = drf.resourceExists(hubConfig.traceDbName);
        installInfo.jobDbExists = drf.resourceExists(hubConfig.jobDbName);

        if (installInfo.stagingDbExists) {
            Fragment f = databaseManager.getPropertiesAsXml(hubConfig.stagingDbName);
            installInfo.stagingTripleIndexOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            installInfo.stagingCollectionLexiconOn = Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            installInfo.stagingForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        if (installInfo.finalDbExists) {
            Fragment f = databaseManager.getPropertiesAsXml(hubConfig.finalDbName);
            installInfo.finalTripleIndexOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            installInfo.finalCollectionLexiconOn = Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            installInfo.finalForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        if (installInfo.traceDbExists) {
            Fragment f = databaseManager.getPropertiesAsXml(hubConfig.traceDbName);
            installInfo.traceForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        if (installInfo.jobDbExists) {
            Fragment f = databaseManager.getPropertiesAsXml(hubConfig.jobDbName);
            installInfo.jobForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        logger.info(installInfo.toString());

        return installInfo;
    }

    /**
     * Validates the MarkLogic server to ensure compatibility with the hub
     * @throws ServerValidationException if the server is not compatible
     */
    public void validateServer() throws ServerValidationException {
        try {
            String versionString = adminManager.getServerVersion();
            String alteredString = versionString.replaceAll("[^\\d]+", "");
            if (alteredString.length() < 3) {
                alteredString += "0";
            }
            int major = Integer.parseInt(alteredString.substring(0, 1));
            int ver = Integer.parseInt(alteredString.substring(0, 3));
            boolean isNightly = versionString.matches("[^-]+-\\d{8}");
            if (major < 8 || (!isNightly && ver < 804)) {
                throw new ServerValidationException("Invalid MarkLogic Server Version: " + versionString);
            }

        }
        catch(ResourceAccessException e) {
            throw new ServerValidationException(e.toString());
        }
    }

    private AppConfig getAppConfig() {
        AppConfig config = new AppConfig();
        updateAppConfig(config);
        return config;
    }

    /**
     * Updates the given AppConfig with values from this DataHub
     * @param config - the AppConfig instance to update
     */
    public void updateAppConfig(AppConfig config) {
        config.setHost(hubConfig.host);
        config.setRestPort(hubConfig.stagingPort);
        config.setName(hubConfig.name);
        config.setRestAdminUsername(hubConfig.username);
        config.setRestAdminPassword(hubConfig.password);
        config.setModulesDatabaseName(hubConfig.modulesDbName);

        config.setTriggersDatabaseName(hubConfig.triggersDbName);
        config.setSchemasDatabaseName(hubConfig.schemasDbName);
        config.setModulesDatabaseName(hubConfig.modulesDbName);

        config.setReplaceTokensInModules(true);
        config.setUseRoxyTokenPrefix(false);

        HashMap<String, Integer> forestCounts = new HashMap<String, Integer>();
        forestCounts.put(hubConfig.stagingDbName, hubConfig.stagingForestsPerHost);
        forestCounts.put(hubConfig.finalDbName, hubConfig.finalForestsPerHost);
        forestCounts.put(hubConfig.traceDbName, hubConfig.traceForestsPerHost);
        forestCounts.put(hubConfig.modulesDbName, 1);
        config.setForestCounts(forestCounts);

        ConfigDir configDir = new ConfigDir(Paths.get(hubConfig.projectDir, "marklogic-config").toFile());
        config.setConfigDir(configDir);

        Map<String, String> customTokens = config.getCustomTokens();

        customTokens.put("%%mlStagingAppserverName%%", hubConfig.stagingHttpName);
        customTokens.put("%%mlStagingPort%%", hubConfig.stagingPort.toString());
        customTokens.put("%%mlStagingDbName%%", hubConfig.stagingDbName);
        customTokens.put("%%mlStagingForestsPerHost%%", hubConfig.stagingForestsPerHost.toString());

        customTokens.put("%%mlFinalAppserverName%%", hubConfig.finalHttpName);
        customTokens.put("%%mlFinalPort%%", hubConfig.finalPort.toString());
        customTokens.put("%%mlFinalDbName%%", hubConfig.finalDbName);
        customTokens.put("%%mlFinalForestsPerHost%%", hubConfig.finalForestsPerHost.toString());

        customTokens.put("%%mlTraceAppserverName%%", hubConfig.traceHttpName);
        customTokens.put("%%mlTracePort%%", hubConfig.tracePort.toString());
        customTokens.put("%%mlTraceDbName%%", hubConfig.traceDbName);
        customTokens.put("%%mlTraceForestsPerHost%%", hubConfig.traceForestsPerHost.toString());

        customTokens.put("%%mlJobAppserverName%%", hubConfig.jobHttpName);
        customTokens.put("%%mlJobPort%%", hubConfig.jobPort.toString());
        customTokens.put("%%mlJobDbName%%", hubConfig.jobDbName);
        customTokens.put("%%mlJobForestsPerHost%%", hubConfig.jobForestsPerHost.toString());

        customTokens.put("%%mlModulesDbName%%", hubConfig.modulesDbName);
        customTokens.put("%%mlTriggersDbName%%", hubConfig.triggersDbName);
        customTokens.put("%%mlSchemasDbName%%", hubConfig.schemasDbName);

        customTokens.put("%%mlHubUserName%%", hubConfig.hubUserName);
        customTokens.put("%%mlHubUserPassword%%", hubConfig.hubUserPassword);
        customTokens.put("%%mlHubUserRole%%", hubConfig.hubUserRole);

        try {
            String version = getJarVersion();
            customTokens.put("%%mlHubVersion%%", version);
        }
        catch(IOException e) {
            e.printStackTrace();
        }
    }

    String getJarVersion() throws IOException {
        Properties properties = new Properties();
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("version.properties");
        properties.load(inputStream);
        String version = (String)properties.get("version");
        return version;
    }

    public void initProject() {
        logger.info("Initializing the Hub Project");

        HubProject hp = new HubProject(hubConfig);
        hp.init();
    }

    private DatabaseClient getDatabaseClient(int port) {
        AppConfig config = new AppConfig();
        config.setHost(hubConfig.host);
        config.setName(hubConfig.name);
        config.setRestAdminUsername(hubConfig.username);
        config.setRestAdminPassword(hubConfig.password);
        return DatabaseClientFactory.newClient(hubConfig.host, port, hubConfig.username, hubConfig.password,
                config.getRestAuthentication(), config.getRestSslContext(), config.getRestSslHostnameVerifier());
    }

    /**
     * Installs User Provided modules into the Data Hub
     */
    public void installUserModules() {
        installUserModules(false);
    }

    /**
     * Removes user's modules from the modules db
     */
    public void clearUserModules() {
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DataHub.class.getClassLoader());
        try {
            ArrayList<String> options = new ArrayList<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/options/*.xml")) {
                options.add(r.getFilename().replace(".xml", ""));
            }

            ArrayList<String> services = new ArrayList<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/services/*.xqy")) {
                services.add(r.getFilename().replaceAll("\\.(xqy|sjs)", ""));
            }


            ArrayList<String> transforms = new ArrayList<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/transforms/*")) {
                transforms.add(r.getFilename().replaceAll("\\.(xqy|sjs)", ""));
            }

            String query =
                "cts:uris((),(),cts:not-query(cts:collection-query('hub-core-module')))[\n" +
                    "  fn:not(\n" +
                    "    fn:matches(., \"^.+options/(" + String.join("|", options) + ").xml$\") or\n" +
                    "    fn:matches(., \"/marklogic.rest.resource/(" + String.join("|", services) + ")/assets/(metadata\\.xml|resource\\.(xqy|sjs))\") or\n" +
                    "    fn:matches(., \"/marklogic.rest.transform/(" + String.join("|", transforms) + ")/assets/(metadata\\.xml|transform\\.(xqy|sjs))\")\n" +
                    "  )\n" +
                    "] ! xdmp:document-delete(.)\n";
            runInDatabase(query, hubConfig.modulesDbName);
        }
        catch(FailedRequestException e) {
            logger.error("Failed to clear user modules");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Clears out the content in the given database
     * @param database - the database name to clear
     */
    public void clearContent(String database) {
        databaseManager.clearDatabase(database);
    }

    private EvalResultIterator runInDatabase(String query, String databaseName) {
        ServerEvaluationCall eval = getDatabaseClient(hubConfig.stagingPort).newServerEval();
        String xqy =
            "xdmp:invoke-function(function() {" +
                query +
                "}," +
                "<options xmlns=\"xdmp:eval\">" +
                "  <database>{xdmp:database(\"" + databaseName + "\")}</database>" +
                "  <transaction-mode>update-auto-commit</transaction-mode>" +
                "</options>)";
        return eval.xquery(xqy).eval();
    }

    public void installUserModules(boolean force) {
        logger.debug("Installing user modules into MarkLogic");

        List<Command> commands = new ArrayList<>();
        LoadUserModulesCommand lumc = new LoadUserModulesCommand(hubConfig);
        lumc.setForceLoad(force);
        commands.add(lumc);


        AppConfig config = getAppConfig();
        SimpleAppDeployer deployer = new SimpleAppDeployer(client, adminManager);
        deployer.setCommands(commands);
        deployer.deploy(config);
    }

    public JsonNode validateUserModules() {
        logger.debug("validating user modules");

        DatabaseClient client = getDatabaseClient(hubConfig.stagingPort);
        EntitiesValidator ev = new EntitiesValidator(client);
        JsonNode jsonNode = ev.validate();

        return jsonNode;
    }

    private List<Command> getCommands(AppConfig config) {
        List<Command> commands = new ArrayList<>();

        // Security
        List<Command> securityCommands = new ArrayList<>();
        securityCommands.add(new DeployRolesCommand());
        securityCommands.add(new DeployUsersCommand());
        securityCommands.add(new DeployAmpsCommand());
        securityCommands.add(new DeployCertificateTemplatesCommand());
        securityCommands.add(new DeployCertificateAuthoritiesCommand());
        securityCommands.add(new DeployExternalSecurityCommand());
        securityCommands.add(new DeployPrivilegesCommand());
        securityCommands.add(new DeployProtectedCollectionsCommand());
        commands.addAll(securityCommands);

        // Databases
        List<Command> dbCommands = new ArrayList<>();
        dbCommands.add(new DeployHubDatabasesCommand());
        dbCommands.add(new DeployTriggersDatabaseCommand());
        dbCommands.add(new DeploySchemasDatabaseCommand());
        commands.addAll(dbCommands);

        // Schemas
        LoadSchemasCommand lsc = new LoadSchemasCommand();
        commands.add(lsc);

        // App servers
        commands.add(new DeployOtherServersCommand());

        // Modules
        commands.add(new LoadHubModulesCommand(hubConfig));

        // Alerting
        List<Command> alertCommands = new ArrayList<>();
        alertCommands.add(new DeployAlertConfigsCommand());
        alertCommands.add(new DeployAlertActionsCommand());
        alertCommands.add(new DeployAlertRulesCommand());
        commands.addAll(alertCommands);

        // CPF
        List<Command> cpfCommands = new ArrayList<>();
        cpfCommands.add(new DeployCpfConfigsCommand());
        cpfCommands.add(new DeployDomainsCommand());
        cpfCommands.add(new DeployPipelinesCommand());
        commands.addAll(cpfCommands);

        // Flexrep
        List<Command> flexrepCommands = new ArrayList<>();
        flexrepCommands.add(new DeployConfigsCommand());
        flexrepCommands.add(new DeployTargetsCommand());
        flexrepCommands.add(new DeployFlexrepCommand());
        commands.addAll(flexrepCommands);

        // Groups
        List<Command> groupCommands = new ArrayList<>();
        groupCommands.add(new DeployGroupsCommand());
        commands.addAll(groupCommands);

        List<Command> mimetypeCommands = new ArrayList<>();
        mimetypeCommands.add(new DeployMimetypesCommand());
        commands.addAll(mimetypeCommands);

        // Forest replicas
        List<Command> replicaCommands = new ArrayList<>();
        replicaCommands.add(new ConfigureForestReplicasCommand());
        commands.addAll(replicaCommands);

        // Tasks
        List<Command> taskCommands = new ArrayList<>();
        taskCommands.add(new DeployScheduledTasksCommand());
        commands.addAll(taskCommands);

        // Triggers
        List<Command> triggerCommands = new ArrayList<>();
        triggerCommands.add(new DeployTriggersCommand());
        commands.addAll(triggerCommands);

        // SQL Views
        List<Command> viewCommands = new ArrayList<>();
        DeployViewSchemasCommand deployViewSchemasCommand = new DeployViewSchemasCommand();
        deployViewSchemasCommand.setDatabaseIdOrName(hubConfig.finalDbName);
        viewCommands.add(deployViewSchemasCommand);
        commands.addAll(viewCommands);

        return commands;
    }

    /**
     * Installs the data hub configuration and server-side modules into MarkLogic
     */
    public void install() {
        install(null);
    }

    /**
     * Installs the data hub configuration and server-side modules into MarkLogic
     * @param listener - the callback method to receive status updates
     */
    public void install(HubDeployStatusListener listener) {
        initProject();

        logger.info("Installing the Data Hub into MarkLogic");

        AppConfig config = getAppConfig();
        HubAppDeployer deployer = new HubAppDeployer(client, adminManager, listener);
        deployer.setCommands(getCommands(config));
        deployer.deploy(config);
    }

    /**
     * Uninstalls the data hub configuration and server-side modules from MarkLogic
     */
    public void uninstall() {
        uninstall(null);
    }

    /**
     * Uninstalls the data hub configuration and server-side modules from MarkLogic
     * @param listener - the callback method to receive status updates
     */
    public void uninstall(HubDeployStatusListener listener) {
        logger.debug("Uninstalling the Data Hub from MarkLogic");

        AppConfig config = getAppConfig();
        HubAppDeployer deployer = new HubAppDeployer(client, adminManager, listener);
        deployer.setCommands(getCommands(config));
        deployer.undeploy(config);
    }

    /**
     * Gets the hub version for the installed server side modules
     * @return - the version of the installed modules
     */
    public String getHubVersion() {
        try {
            DatabaseClient client = getDatabaseClient(hubConfig.stagingPort);
            HubVersion hv = new HubVersion(client);
            return hv.getVersion();
        }
        catch(Exception e) {}
        return "1.0.0";
    }

    class EntitiesValidator extends ResourceManager {
        private static final String NAME = "validate";

        public EntitiesValidator(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        public JsonNode validate() {
            RequestParameters params = new RequestParameters();
            ServiceResultIterator resultItr = this.getServices().get(params);
            if (resultItr == null || ! resultItr.hasNext()) {
                return null;
            }
            ServiceResult res = resultItr.next();
            JacksonHandle handle = new JacksonHandle();
            return res.getContent(handle).get();
        }
    }

    class HubVersion extends ResourceManager {
        private static final String NAME = "hubversion";

        public HubVersion(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        public String getVersion() {
            RequestParameters params = new RequestParameters();
            ServiceResultIterator resultItr = this.getServices().get(params);
            if (resultItr == null || ! resultItr.hasNext()) {
                return null;
            }
            ServiceResult res = resultItr.next();
            StringHandle handle = new StringHandle();
            return res.getContent(handle).get();
        }
    }
}
