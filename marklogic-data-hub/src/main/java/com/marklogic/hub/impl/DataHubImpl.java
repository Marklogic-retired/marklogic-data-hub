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
package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.CommandMapBuilder;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.appdeployer.command.appservers.UpdateRestApiServersCommand;
import com.marklogic.appdeployer.command.databases.DeployContentDatabasesCommand;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.databases.DeploySchemasDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployTriggersDatabaseCommand;
import com.marklogic.appdeployer.command.forests.DeployCustomForestsCommand;
import com.marklogic.appdeployer.command.modules.DeleteTestModulesCommand;
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.appdeployer.command.security.*;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.admin.ResourceExtensionsManager;
import com.marklogic.client.admin.ServerConfigurationManager;
import com.marklogic.client.admin.TransformExtensionsManager;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.QueryOptionsListHandle;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.InstallInfo;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.deploy.util.CMASettings;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.*;
import com.marklogic.hub.legacy.impl.LegacyFlowManagerImpl;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;
import com.marklogic.rest.util.ResourcesFragment;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

@Component
public class DataHubImpl implements DataHub {

    private ManageClient _manageClient;
    private DatabaseManager _databaseManager;
    private ServerManager _serverManager;

    @Autowired
    private HubConfigImpl hubConfig;

    @Autowired
    private HubProject project;

    @Autowired
    private LoadHubModulesCommand loadHubModulesCommand;

    @Autowired
    private LoadUserModulesCommand loadUserModulesCommand;

    @Autowired
    private LoadUserArtifactsCommand loadUserArtifactsCommand;
    
    @Autowired
    private Versions versions;
    
    @Autowired
    private LegacyFlowManagerImpl flowManager;

    private AdminManager _adminManager;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @PostConstruct
    public void wireClient() {
        this._manageClient = hubConfig.getManageClient();
        this._adminManager = hubConfig.getAdminManager();
        this._databaseManager = new DatabaseManager(_manageClient);
        this._serverManager = new ServerManager(_manageClient);
    }

    @Override
    public void clearDatabase(String database) {
        DatabaseManager mgr = new DatabaseManager(_manageClient);
        mgr.clearDatabase(database);
    }

    private AdminManager getAdminManager() {
        return this._adminManager;
    }

    void setAdminManager(AdminManager manager) {
        this._adminManager = manager;
    }

    private ManageClient getManageClient() {
        return _manageClient;
    }

    private DatabaseManager getDatabaseManager() {
        return this._databaseManager;
    }

    private ServerManager getServerManager() {
        return this._serverManager;
    }

    public void setServerManager(ServerManager manager) {
        this._serverManager = manager;
    }

    @Override
    public InstallInfo isInstalled() {

        InstallInfo installInfo = InstallInfo.create();

        if (hubConfig.getIsProvisionedEnvironment()) {
            return assumedProvisionedInstallInfo(installInfo);
        } else {
            ResourcesFragment srf = null;
            try {
                srf = getServerManager().getAsXml();
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                    throw new DataHubSecurityNotInstalledException();
                }
            }

            installInfo.setAppServerExistent(DatabaseKind.STAGING, srf.resourceExists(hubConfig.getHttpName(DatabaseKind.STAGING)));
            installInfo.setAppServerExistent(DatabaseKind.FINAL, srf.resourceExists(hubConfig.getHttpName(DatabaseKind.FINAL)));
            installInfo.setAppServerExistent(DatabaseKind.JOB, srf.resourceExists(hubConfig.getHttpName(DatabaseKind.JOB)));

            ResourcesFragment drf = getDatabaseManager().getAsXml();
            installInfo.setDbExistent(DatabaseKind.STAGING, drf.resourceExists(hubConfig.getDbName(DatabaseKind.STAGING)));
            installInfo.setDbExistent(DatabaseKind.FINAL, drf.resourceExists(hubConfig.getDbName(DatabaseKind.FINAL)));
            installInfo.setDbExistent(DatabaseKind.JOB, drf.resourceExists(hubConfig.getDbName(DatabaseKind.JOB)));

            installInfo.setDbExistent(DatabaseKind.MODULES, drf.resourceExists(hubConfig.getDbName(DatabaseKind.MODULES)));
            installInfo.setDbExistent(DatabaseKind.STAGING_SCHEMAS, drf.resourceExists(hubConfig.getDbName(DatabaseKind.STAGING_SCHEMAS)));
            installInfo.setDbExistent(DatabaseKind.STAGING_TRIGGERS, drf.resourceExists(hubConfig.getDbName(DatabaseKind.STAGING_TRIGGERS)));

            if (installInfo.isDbExistent(DatabaseKind.STAGING)) {
                Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.getDbName(DatabaseKind.STAGING));
                installInfo.setTripleIndexOn(DatabaseKind.STAGING, Boolean.parseBoolean(f.getElementValue("//m:triple-index")));
                installInfo.setCollectionLexiconOn(DatabaseKind.STAGING, Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon")));
                installInfo.setForestsExistent(DatabaseKind.STAGING, (f.getElements("//m:forest").size() > 0));
            }

            if (installInfo.isDbExistent(DatabaseKind.FINAL)) {
                Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.getDbName(DatabaseKind.FINAL));
                installInfo.setTripleIndexOn(DatabaseKind.FINAL, Boolean.parseBoolean(f.getElementValue("//m:triple-index")));
                installInfo.setCollectionLexiconOn(DatabaseKind.FINAL, Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon")));
                installInfo.setForestsExistent(DatabaseKind.FINAL, (f.getElements("//m:forest").size() > 0));
            }

            if (installInfo.isDbExistent(DatabaseKind.JOB)) {
                Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.getDbName(DatabaseKind.JOB));
                installInfo.setForestsExistent(DatabaseKind.JOB, (f.getElements("//m:forest").size() > 0));
            }

            logger.info(installInfo.toString());

            return installInfo;
        }
    }

    // this InstallInfo is used as a dummy to return DHS provisioned information
    private InstallInfo assumedProvisionedInstallInfo(InstallInfo installInfo) {
        installInfo.setAppServerExistent(DatabaseKind.STAGING, true);
        installInfo.setAppServerExistent(DatabaseKind.FINAL, true);
        installInfo.setAppServerExistent(DatabaseKind.JOB, true);

        installInfo.setDbExistent(DatabaseKind.STAGING, true);
        installInfo.setDbExistent(DatabaseKind.FINAL, true);
        installInfo.setDbExistent(DatabaseKind.JOB, true);

        installInfo.setDbExistent(DatabaseKind.MODULES, true);
        installInfo.setDbExistent(DatabaseKind.STAGING_SCHEMAS, true);
        installInfo.setDbExistent(DatabaseKind.STAGING_TRIGGERS, true);

        installInfo.setTripleIndexOn(DatabaseKind.STAGING, true);
        installInfo.setCollectionLexiconOn(DatabaseKind.STAGING, true);
        installInfo.setForestsExistent(DatabaseKind.STAGING, true);

        installInfo.setTripleIndexOn(DatabaseKind.FINAL, true);
        installInfo.setCollectionLexiconOn(DatabaseKind.FINAL, true);
        installInfo.setForestsExistent(DatabaseKind.FINAL, true);

        installInfo.setForestsExistent(DatabaseKind.JOB, true);

        return installInfo;

    }

    @Override
    public boolean isServerVersionValid(String versionString) {
        try {
            if (versionString == null) {
                versionString = versions.getMarkLogicVersion();
            }
            int major = Integer.parseInt(versionString.replaceAll("([^.]+)\\..*", "$1"));
            if (major < 9) {
                return false;
            }
            boolean isNightly = versionString.matches("[^-]+-(\\d{4})(\\d{2})(\\d{2})");
            if (major == 9) {
                String alteredString = versionString.replaceAll("[^\\d]+", "");
                if (alteredString.length() < 4) {
                    alteredString = StringUtils.rightPad(alteredString, 4, "0");
                }
                int ver = Integer.parseInt(alteredString.substring(0, 4));
                if (!isNightly && ver < 9050) {
                    return false;
                }
            }
            if (isNightly) {
                String dateString = versionString.replaceAll("[^-]+-(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3");
                Date minDate = new GregorianCalendar(2018, 4, 5).getTime();
                Date date = new SimpleDateFormat("y-M-d").parse(dateString);
                if (date.before(minDate)) {
                    return false;
                }
            }

        } catch (Exception e) {
            throw new ServerValidationException(e.toString());
        }
        return true;
    }

    @Override
    public void initProject() {
        logger.info("Initializing the Hub Project");
        hubConfig.initHubProject();
    }


    @Override
    public void clearUserModules() {
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DataHub.class.getClassLoader());
        try {
            HashSet<String> options = new HashSet<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/options/*.xml")) {
                options.add(r.getFilename().replace(".xml", ""));
            }
            for (Resource r : resolver.getResources("classpath*:/ml-modules-final/options/*.xml")) {
                options.add(r.getFilename().replace(".xml", ""));
            }
            for (Resource r : resolver.getResources("classpath*:/ml-modules-traces/options/*.xml")) {
                options.add(r.getFilename().replace(".xml", ""));
            }
            for (Resource r : resolver.getResources("classpath*:/ml-modules-jobs/options/*.xml")) {
                options.add(r.getFilename().replace(".xml", ""));
            }

            HashSet<String> services = new HashSet<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/services/*.xqy")) {
                services.add(r.getFilename().replaceAll("\\.(xqy|sjs)", ""));
            }

            HashSet<String> transforms = new HashSet<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/transforms/*")) {
                transforms.add(r.getFilename().replaceAll("\\.(xqy|sjs)", ""));
            }

            ServerConfigurationManager configMgr = hubConfig.newStagingClient().newServerConfigManager();
            QueryOptionsManager stagingOptionsManager = configMgr.newQueryOptionsManager();

            // remove options using mgr.
            QueryOptionsListHandle handle = stagingOptionsManager.optionsList(new QueryOptionsListHandle());
            Map<String, String> optionsMap = handle.getValuesMap();
            optionsMap.keySet().forEach(
                optionsName -> {
                    if (!options.contains(optionsName)) {
                        stagingOptionsManager.deleteOptions(optionsName);
                    }
                }
            );

            ServerConfigurationManager finalConfigMgr = hubConfig.newFinalClient().newServerConfigManager();
            QueryOptionsManager finalOptionsManager = finalConfigMgr.newQueryOptionsManager();

            // remove options using mgr.
            QueryOptionsListHandle finalHandle = finalOptionsManager.optionsList(new QueryOptionsListHandle());
            Map<String, String> finalOptionsMap = finalHandle.getValuesMap();
            finalOptionsMap.keySet().forEach(
                optionsName -> {
                    if (!options.contains(optionsName)) {
                        finalOptionsManager.deleteOptions(optionsName);
                    }
                }
            );

            // remove transforms using amped channel
            TransformExtensionsManager transformExtensionsManager = configMgr.newTransformExtensionsManager();
            JsonNode transformsList = transformExtensionsManager.listTransforms(new JacksonHandle()).get();
            transformsList.findValuesAsText("name").forEach(
                x -> {
                    if (!transforms.contains(x)) {
                        transformExtensionsManager.deleteTransform(x);
                    }
                }
            );

            // remove resource extensions using amped channel
            ResourceExtensionsManager resourceExtensionsManager = configMgr.newResourceExtensionsManager();
            JsonNode resourceExtensions = resourceExtensionsManager.listServices(new JacksonHandle()).get();
            resourceExtensions.findValuesAsText("name").forEach(
                x -> {
                    if (!services.contains(x)) {
                        resourceExtensionsManager.deleteServices(x);
                    }
                }
            );

            String query =
                "cts:uris((),(),cts:not-query(cts:collection-query('hub-core-module')))[\n" +
                    "  fn:not(\n" +
                    "    fn:matches(., \"^.+options/(" + String.join("|", options) + ").xml$\") or\n" +
                    "    fn:matches(., \"/marklogic.rest.resource/(" + String.join("|", services) + ")/assets/(metadata\\.xml|resource\\.(xqy|sjs))\") or\n" +
                    "    fn:matches(., \"/marklogic.rest.transform/(" + String.join("|", transforms) + ")/assets/(metadata\\.xml|transform\\.(xqy|sjs))\")\n" +
                    "  )\n" +
                    "] ! xdmp:document-delete(.)\n";
            runInDatabase(query, hubConfig.getDbName(DatabaseKind.MODULES));
        } catch (FailedRequestException e) {
            logger.error("Failed to clear user modules");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<Command> buildListOfCommands() {
        Map<String, List<Command>> commandMap = buildCommandMap();
        List<Command> commands = new ArrayList<>();
        for (String name : commandMap.keySet()) {
            commands.addAll(commandMap.get(name));
        }
        return commands;
    }

    public List<Command> getSecurityCommandList() {
        Map<String, List<Command>> commandMap = getSecurityCommands();
        List<Command> commands = new ArrayList<>();
        for (String name : commandMap.keySet()) {
            commands.addAll(commandMap.get(name));
        }
        return commands;
    }


    @Override
    public HashMap<String, Boolean> runPreInstallCheck() {


        Map<Integer, String> portsInUse = null;

        try {
            portsInUse = getServerPortsInUse();
        } catch (HttpClientErrorException e) {
            logger.warn("Used non-existing user to verify data hub.  Usually this means a fresh system, ready to install.");
            HashMap response = new HashMap();
            response.put("serverVersion", serverVersion);
            // no server means give it a shot.
            response.put("serverVersionOk", true);
            response.put("stagingPortInUse", stagingPortInUse);
            response.put("stagingPortInUseBy", stagingPortInUseBy);
            response.put("finalPortInUse", finalPortInUse);
            response.put("finalPortInUseBy", finalPortInUseBy);
            response.put("jobPortInUse", jobPortInUse);
            response.put("jobPortInUseBy", jobPortInUseBy);
            response.put("safeToInstall", true);
            return response;
        }

        Set<Integer> ports = portsInUse.keySet();
        String serverName = portsInUse.get(hubConfig.getPort(DatabaseKind.STAGING));
        stagingPortInUse = ports.contains(hubConfig.getPort(DatabaseKind.STAGING)) && serverName != null && !serverName.equals(hubConfig.getHttpName(DatabaseKind.STAGING));
        if (stagingPortInUse) {
            stagingPortInUseBy = serverName;
        }

        serverName = portsInUse.get(hubConfig.getPort(DatabaseKind.FINAL));
        finalPortInUse = ports.contains(hubConfig.getPort(DatabaseKind.FINAL)) && serverName != null && !serverName.equals(hubConfig.getHttpName(DatabaseKind.FINAL));
        if (finalPortInUse) {
            finalPortInUseBy = serverName;
        }

        serverName = portsInUse.get(hubConfig.getPort(DatabaseKind.JOB));
        jobPortInUse = ports.contains(hubConfig.getPort(DatabaseKind.JOB)) && serverName != null && !serverName.equalsIgnoreCase(hubConfig.getHttpName(DatabaseKind.JOB));
        if (jobPortInUse) {
            jobPortInUseBy = serverName;
        }


        serverVersion = versions.getMarkLogicVersion();
        serverVersionOk = isServerVersionValid(serverVersion);
        HashMap response = new HashMap();
        response.put("serverVersion", serverVersion);
        response.put("serverVersionOk", serverVersionOk);
        response.put("stagingPortInUse", stagingPortInUse);
        response.put("stagingPortInUseBy", stagingPortInUseBy);
        response.put("finalPortInUse", finalPortInUse);
        response.put("finalPortInUseBy", finalPortInUseBy);
        response.put("jobPortInUse", jobPortInUse);
        response.put("jobPortInUseBy", jobPortInUseBy);
        response.put("safeToInstall", isSafeToInstall());
        if ((boolean) response.get("safeToInstall")) {
            response.put("dhfVersion", versions.getHubVersion());
        }
        return response;
    }

    /*
     * just installs the hub modules, for more granular management of upgrade
     */
    private void hubInstallModules() {
        loadHubModulesCommand.execute(new CommandContext(hubConfig.getAppConfig(), null, null));
    }

    /*
     * just installs the user modules, for more granular management of upgrade
     */
    private void loadUserModules() {
        loadUserModulesCommand.execute(new CommandContext(hubConfig.getAppConfig(), null, null));
    }

    /**
     * Installs the data hub configuration and server-side config files into MarkLogic
     */
    @Override
    public void install() {
        install(null);
    }

    /**
     * Installs the data hub configuration and server-side config files into MarkLogic
     *
     * @param listener - the callback method to receive status updates
     */
    @Override
    public void install(HubDeployStatusListener listener) {
        if (!hubConfig.getHubProject().isInitialized()) {
            initProject();
        }

        logger.warn("Installing the Data Hub into MarkLogic");

        // in AWS setting this fails...
        // for now putting in try/catch
        try {
            AppConfig roleConfig = hubConfig.getAppConfig();
            SimpleAppDeployer roleDeployer = new SimpleAppDeployer(getManageClient(), getAdminManager());
            roleDeployer.setCommands(getSecurityCommandList());
            roleDeployer.deploy(roleConfig);
        } catch (HttpServerErrorException e) {
            if (e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) {
                logger.warn("No manage client for security installs.  Assuming DHS provisioning already threre");
            } else {
                throw new DataHubConfigurationException(e);
            }
        }
        AppConfig appConfig = hubConfig.getAppConfig();
        CMASettings.getInstance().setCmaSettings(appConfig);

        HubAppDeployer finalDeployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener, hubConfig.newStagingClient());
        finalDeployer.setCommands(buildListOfCommands());
        finalDeployer.deploy(appConfig);
    }

    /**
     * Note that this differs from how "mlUpdateIndexes" works in ml-gradle. This is not stripping out any "non-index"
     * properties from each payload - it's just updating every database.
     *
     * This does however disable forest creation which speeds up the process so that the only calls made are to
     * update the databases.
     */
    @Override
    public void updateIndexes() {
        SimpleAppDeployer deployer = new SimpleAppDeployer(getManageClient(), getAdminManager());
        deployer.setCommands(buildCommandMap().get("mlDatabaseCommands"));

        AppConfig appConfig = hubConfig.getAppConfig();
        final boolean originalCreateForests = appConfig.isCreateForests();
        final Pattern originalIncludePattern = appConfig.getResourceFilenamesIncludePattern();
        try {
            appConfig.setCreateForests(false);
            if (hubConfig.getIsProvisionedEnvironment()) {
                appConfig.setResourceFilenamesIncludePattern(buildPatternForDatabasesToUpdateIndexesFor());
            }
            deployer.deploy(hubConfig.getAppConfig());
        } finally {
            appConfig.setCreateForests(originalCreateForests);
            appConfig.setResourceFilenamesIncludePattern(originalIncludePattern);
        }
    }

    /**
     * In a provisioned environment, only the databases defined by this pattern can be updated.
     *
     * @return
     */
    protected Pattern buildPatternForDatabasesToUpdateIndexesFor() {
        return Pattern.compile("(staging|final|job)-database.json");
    }

    /**
     * Uninstalls the data hub configuration and server-side config files from MarkLogic
     */
    @Override
    public void uninstall() {
        uninstall(null);
    }

    /**
     * Uninstalls the data hub configuration and server-side config files from MarkLogic
     *
     * @param listener - the callback method to receive status updates
     */
    @Override
    public void uninstall(HubDeployStatusListener listener) {
        logger.warn("Uninstalling the Data Hub and Final Databases/Servers from MarkLogic");
        List<Command> commandMap = buildListOfCommands();

        // Removing this command as databases are deleted by other DatabaseCommands
        commandMap.removeIf(command -> command instanceof DeployDatabaseFieldCommand);

        AppConfig appConfig = hubConfig.getAppConfig();
        CMASettings.getInstance().setCmaSettings(appConfig);

        HubAppDeployer finalDeployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener, hubConfig.newStagingClient());
        finalDeployer.setCommands(commandMap);
        finalDeployer.undeploy(appConfig);
    }

    private void runInDatabase(String query, String databaseName) {
        ServerEvaluationCall eval = hubConfig.newModulesDbClient().newServerEval();
        String xqy =
            "xdmp:invoke-function(function() {" +
                query +
                "}," +
                "<options xmlns=\"xdmp:eval\">" +
                "  <database>{xdmp:database(\"" + databaseName + "\")}</database>" +
                "  <transaction-mode>update-auto-commit</transaction-mode>" +
                "</options>)";
        eval.xquery(xqy).eval();
    }

    public Map<String, List<Command>> buildCommandMap() {
        Map<String, List<Command>> commandMap = new CommandMapBuilder().buildCommandMap();

        updateDatabaseCommandList(commandMap);

        addDatabaseFieldCommand(commandMap);

        updateServerCommandList(commandMap);

        updateModuleCommandList(commandMap);

        // DHF has no use case for the "deploy REST API server" commands provided by ml-gradle
        commandMap.remove("mlRestApiCommands");

        // DHF has a custom property named "mlCustomForestPath" that has to be set on this command.
        List<Command> forestCommands = commandMap.get("mlForestCommands");
        DeployCustomForestsCommand deployCustomForestsCommand = (DeployCustomForestsCommand) forestCommands.get(0);
        deployCustomForestsCommand.setCustomForestsPath(hubConfig.getCustomForestPath());

        return commandMap;
    }

    /**
     * DHF doesn't need the default commands for deploying a specific content/triggers/schemas database. It does want to
     * preserve any other commands, with the one addition being that it needs to modify DeployOtherDatabaseCommand so
     * that a custom DeployDatabaseCommand implementation is used.
     *
     * @param commandMap
     */
    private void updateDatabaseCommandList(Map<String, List<Command>> commandMap) {
        List<Command> dbCommands = new ArrayList<>();
        for (Command c : commandMap.get("mlDatabaseCommands")) {
            if (!(c instanceof DeployContentDatabasesCommand || c instanceof DeployTriggersDatabaseCommand || c instanceof DeploySchemasDatabaseCommand)) {
                dbCommands.add(c);
                if (c instanceof DeployOtherDatabasesCommand) {
                    ((DeployOtherDatabasesCommand)c).setDeployDatabaseCommandFactory(new HubDeployDatabaseCommandFactory(hubConfig));
                }
            }
        }
        commandMap.put("mlDatabaseCommands", dbCommands);
    }

    /*
        Adding a custom command to deploy database field using an XML payload because of
        a bug in the RMA for JSON payload which fails to set the field type as "metadata".
     */
    private void addDatabaseFieldCommand(Map<String, List<Command>> commandMap) {
        List<Command> databaseFieldList = new ArrayList<>();
        databaseFieldList.add(new DeployDatabaseFieldCommand());
        commandMap.put("mlDatabaseField", databaseFieldList);
    }

    private void updateServerCommandList(Map<String, List<Command>> commandMap) {
        final String key = "mlServerCommands";
        List<Command> newCommands = new ArrayList<>();
        for (Command c : commandMap.get(key)) {
            /**
             * DHF doesn't need the "Update REST API" command that ml-gradle includes because DHF isn't using ml-gradle's support
             * for a default REST API server.
             */
            if (c instanceof UpdateRestApiServersCommand) {
                continue;
            }
            /**
             * Replace ml-gradle's DeployOtherServersCommand with a subclass that has DHF-specific functionality
             */
            if (c instanceof DeployOtherServersCommand) {
                newCommands.add(new DeployHubOtherServersCommand());
            }
            else {
                newCommands.add(c);
            }
        }
        commandMap.put(key, newCommands);
    }

    /**
     * This affects what mlLoadModules does. We want it to load all modules, including hub modules. This supports a
     * scenario where a user may clear her modules database; mlLoadModules should then load everything in.
     *
     * @param commandsMap
     */
    private void updateModuleCommandList(Map<String, List<Command>> commandsMap) {
        List<Command> commands = new ArrayList();
        commands.add(loadHubModulesCommand);
        commands.add(loadUserModulesCommand);
        commands.add(loadUserArtifactsCommand);

        for (Command c : commandsMap.get("mlModuleCommands")) {
            if (c instanceof LoadModulesCommand) {
                // Don't want this, since our custom command above extends LoadModulesCommand
                continue;
            }
            if (c instanceof DeleteTestModulesCommand) {
                // Make sure this runs after our custom command for loading modules
                ((DeleteTestModulesCommand) c).setExecuteSortOrder(loadUserModulesCommand.getExecuteSortOrder() + 1);
            }
            commands.add(c);
        }

        commandsMap.put("mlModuleCommands", commands);
    }

    private Map<Integer, String> getServerPortsInUse() {
        Map<Integer, String> portsInUse = new HashMap<>();
        ResourcesFragment srf = getServerManager().getAsXml();
        srf.getListItemNameRefs().forEach(s -> {
            Fragment fragment = getServerManager().getPropertiesAsXml(s);
            int port = Integer.parseInt(fragment.getElementValue("//m:port"));
            portsInUse.put(port, s);
        });
        return portsInUse;
    }

    private Map<String, List<Command>> getSecurityCommands() {
        Map<String, List<Command>> commandMap = new HashMap<>();
        List<Command> securityCommands = new ArrayList<Command>();
        securityCommands.add(new DeployRolesCommand());
        securityCommands.add(new DeployUsersCommand());
        securityCommands.add(new DeployCertificateTemplatesCommand());
        securityCommands.add(new DeployCertificateAuthoritiesCommand());
        securityCommands.add(new InsertCertificateHostsTemplateCommand());
        securityCommands.add(new DeployExternalSecurityCommand());
        securityCommands.add(new DeployPrivilegesCommand());
        securityCommands.add(new DeployProtectedCollectionsCommand());
        securityCommands.add(new DeployProtectedPathsCommand());
        securityCommands.add(new DeployQueryRolesetsCommand());
        commandMap.put("mlSecurityCommands", securityCommands);
        return commandMap;
    }


    // Here is the former PreCheckInstall class stuff
    // We should probably move this into a sub class OR its own class and interface, and create a super at the
    // datahub level
    private boolean stagingPortInUse;
    private String stagingPortInUseBy;
    private boolean finalPortInUse;
    private String finalPortInUseBy;
    private boolean jobPortInUse;
    private String jobPortInUseBy;
    private boolean serverVersionOk;
    private String serverVersion;

    @Override
    public boolean isSafeToInstall() {
        return !(isPortInUse(DatabaseKind.FINAL) ||
            isPortInUse(DatabaseKind.STAGING) ||
            isPortInUse(DatabaseKind.JOB)) && isServerVersionOk();
    }

    @Override
    public boolean isPortInUse(DatabaseKind kind) {
        boolean inUse;
        switch (kind) {
            case STAGING:
                inUse = stagingPortInUse;
                break;
            case FINAL:
                inUse = finalPortInUse;
                break;
            case JOB:
                inUse = jobPortInUse;
                break;
            default:
                throw new InvalidDBOperationError(kind, "check for port use");
        }
        return inUse;
    }

    @Override
    public void setPortInUseBy(DatabaseKind kind, String usedBy) {
        switch (kind) {
            case STAGING:
                stagingPortInUseBy = usedBy;
                break;
            case FINAL:
                finalPortInUseBy = usedBy;
                break;
            case JOB:
                jobPortInUseBy = usedBy;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set if port in use");
        }
    }

    @Override
    public String getPortInUseBy(DatabaseKind kind) {
        String inUseBy;
        switch (kind) {
            case STAGING:
                inUseBy = stagingPortInUseBy;
                break;
            case FINAL:
                inUseBy = finalPortInUseBy;
                break;
            case JOB:
                inUseBy = jobPortInUseBy;
                break;
            default:
                throw new InvalidDBOperationError(kind, "check if port is in use");
        }
        return inUseBy;
    }

    @Override
    public boolean isServerVersionOk() {
        return serverVersionOk;
    }

    @Override
    public void setServerVersionOk(boolean serverVersionOk) {
        this.serverVersionOk = serverVersionOk;
    }

    @Override
    public String getServerVersion() {
        return serverVersion;
    }

    @Override
    public void setServerVersion(String serverVersion) {
        this.serverVersion = serverVersion;
    }

    //DataHubUpgrader stuff
    public static String MIN_UPGRADE_VERSION = "2.0.0";

    @Override
    public boolean upgradeHub() throws CantUpgradeException {
        return upgradeHub(null);
    }

    @Override
    public boolean upgradeHub(List<String> updatedFlows) throws CantUpgradeException {
        boolean isHubInstalled = this.isInstalled().isInstalled();
        String currentVersion = versions.getHubVersion();

        int compare = Versions.compare(currentVersion, MIN_UPGRADE_VERSION);
        if (compare == -1) {
            throw new CantUpgradeException(currentVersion, MIN_UPGRADE_VERSION);
        }
        boolean result = false;
        boolean alreadyInitialized = project.isInitialized();
        String gradleVersion = versions.getDHFVersion();
        try {
            /*Ideally this should move to HubProject.upgradeProject() method
             * But since it requires 'hubConfig' and 'versions', for now 
             * leaving it here 
             */
            if(alreadyInitialized) {
                // The version provided in "mlDHFVersion" property in gradle.properties.

                File buildGradle = Paths.get(project.getProjectDirString(), "build.gradle").toFile();
                
                // Back up the hub-internal-config and user-config directories in versions > 4.0
                FileUtils.copyDirectory(project.getHubConfigDir().toFile(), project.getProjectDir().resolve(HubProject.HUB_CONFIG_DIR+"-"+gradleVersion).toFile());
                FileUtils.copyDirectory(project.getUserConfigDir().toFile(), project.getProjectDir().resolve(HubProject.USER_CONFIG_DIR+"-"+gradleVersion).toFile());
                  
                // Gradle plugin uses a logging framework that is different from java api. Hence writing it to stdout as it is done in gradle plugin. 
                System.out.println("The "+ gradleVersion + " "+ HubProject.HUB_CONFIG_DIR +" is now moved to "+ HubProject.HUB_CONFIG_DIR+"-"+gradleVersion);
                System.out.println("The "+ gradleVersion + " "+ HubProject.USER_CONFIG_DIR +" is now moved to "+ HubProject.USER_CONFIG_DIR+"-"+gradleVersion);
                System.out.println("Please copy the custom database, server configuration files from " + HubProject.HUB_CONFIG_DIR+"-"+gradleVersion
                        + " and "+ HubProject.USER_CONFIG_DIR+"-"+gradleVersion + " to their respective locations in  "+HubProject.HUB_CONFIG_DIR +" and "
                        + HubProject.USER_CONFIG_DIR);
                // replace the hub version in build.gradle
                String text = FileUtils.readFileToString(buildGradle);
                String version = hubConfig.getJarVersion();
                text = Pattern.compile("^(\\s*)id\\s+['\"]com.marklogic.ml-data-hub['\"]\\s+version.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1id 'com.marklogic.ml-data-hub' version '" + version + "'");
                text = Pattern.compile("^(\\s*)compile.+marklogic-data-hub.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1compile 'com.marklogic:marklogic-data-hub:" + version + "'");
                FileUtils.writeStringToFile(buildGradle, text);
                hubConfig.getHubSecurityDir().resolve("roles").resolve("data-hub-user.json").toFile().delete();
            }
            
            hubConfig.initHubProject();

            /*  DHFPROD- 1694
                Copy contents from hub-internal-config-version/schemas to ml-config/databases/<staging_schemas_db_name>/schemas
                This has to be done in DataHubImpl as we require HubConfigImpl for getting the staging schemas db name
             */
            if(alreadyInitialized) {
                Path sourceSchemasDir = project.getProjectDir().resolve(HubProject.HUB_CONFIG_DIR + "-" + gradleVersion).resolve("schemas");
                Path destSchemasDir = project.getUserDatabaseDir().resolve(hubConfig.getStagingSchemasDbName()).resolve("schemas");
                if (sourceSchemasDir.toFile().exists()) {
                    Files.walk(Paths.get(sourceSchemasDir.toUri()))
                        .filter(f -> !Files.isDirectory(f))
                        .forEach(f -> {
                            try {
                                FileUtils.copyInputStreamToFile(Files.newInputStream(f), destSchemasDir.resolve(sourceSchemasDir.relativize(f)).toFile());
                            } catch (IOException e) {
                                logger.error("Unable to copy file " + f.getFileName());
                                throw new RuntimeException(e);
                            }
                        });

                }
            }
            
            //now let's try to upgrade the directory structure
            hubConfig.getHubProject().upgradeProject();
            List<String> flows = flowManager.updateLegacyFlows(currentVersion);
            if (updatedFlows != null) {
                updatedFlows.addAll(flows);
            }
            if (isHubInstalled) {
                runInDatabase("cts:uris(\"\", (), cts:and-not-query(cts:collection-query(\"hub-core-module\"), cts:document-query((\"/com.marklogic.hub/config.sjs\", \"/com.marklogic.hub/config.xqy\")))) ! xdmp:document-delete(.)", hubConfig.getDbName(DatabaseKind.MODULES));
                this.hubInstallModules();
                this.loadUserModules();
            }

            //if none of this has thrown an exception, we're clear and can set the result to true
            result = true;
        } catch (IOException e) {
            e.printStackTrace();
        }

        return result;
    }

    // only used in test
    public void setHubConfig(HubConfigImpl hubConfig) {
        this.hubConfig = hubConfig;
    }

    // only used in test
    public void setVersions(Versions versions) {
        this.versions = versions;
    }
}
