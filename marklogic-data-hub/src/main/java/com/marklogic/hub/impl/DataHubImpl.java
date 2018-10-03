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
package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.CommandMapBuilder;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.appdeployer.command.forests.DeployCustomForestsCommand;
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.appdeployer.command.security.*;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.admin.ResourceExtensionsManager;
import com.marklogic.client.admin.ServerConfigurationManager;
import com.marklogic.client.admin.TransformExtensionsManager;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.QueryOptionsListHandle;
import com.marklogic.hub.*;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.*;
import com.marklogic.hub.util.Versions;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;
import com.marklogic.rest.util.ResourcesFragment;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.conn.HttpHostConnectException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.io.File;
import java.io.IOException;
import java.net.ConnectException;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

public class DataHubImpl implements DataHub {

    private ManageClient _manageClient;
    private DatabaseManager _databaseManager;
    private ServerManager _serverManager;
    private HubConfigImpl hubConfig;

    private AdminManager _adminManager;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
	private String finalFile = "final-database.json";
	private String stagingFile = "staging-database.json";
	private String jobsFile = "job-database.json";

    public DataHubImpl(HubConfig hubConfig) {
        if (hubConfig == null) {
            throw new DataHubConfigurationException("HubConfig must not be null when creating a data hub");
        }
        this.hubConfig = ((HubConfigImpl) hubConfig);
    }

    private ManageClient getManageClient() {
        if (this._manageClient == null) {
            this._manageClient = this.hubConfig.getManageClient();
        }
        return this._manageClient;
    }

    @Override
    public void clearDatabase(String database) {
        DatabaseManager mgr = new DatabaseManager(this.getManageClient());
        mgr.clearDatabase(database);
    }

    private AdminManager getAdminManager() {
        if (this._adminManager == null) {
            this._adminManager = this.hubConfig.getAdminManager();
        }
        return this._adminManager;
    }

    void setAdminManager(AdminManager manager) {
        this._adminManager = manager;
    }

    private DatabaseManager getDatabaseManager() {
        if (this._databaseManager == null) {
            this._databaseManager = new DatabaseManager(getManageClient());
        }
        return this._databaseManager;
    }

    private ServerManager getServerManager() {
        if (this._serverManager == null) {
            this._serverManager = new ServerManager(getManageClient());
        }
        return this._serverManager;
    }

    public void setServerManager(ServerManager manager) {
        this._serverManager = manager;
    }

    @Override
    public InstallInfo isInstalled() {

        InstallInfo installInfo = InstallInfo.create();

        if (hubConfig.getIsProvisionedEnvironment()){
            return assumedProvisionedInstallInfo(installInfo);
        }
        else {
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
                versionString = new Versions(hubConfig).getMarkLogicVersion();
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

    public List<Command> getStagingCommandList() {
        Map<String, List<Command>> commandMap = getStagingCommands();
        List<Command> commands = new ArrayList<>();
        for (String name : commandMap.keySet()) {
            commands.addAll(commandMap.get(name));
        }
        return commands;
    }

    public List<Command> getFinalCommandList() {
        Map<String, List<Command>> commandMap = getFinalCommands();
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
    public HashMap runPreInstallCheck() {
        return runPreInstallCheck(null);
    }

    @Override
    public HashMap<String, Boolean> runPreInstallCheck(Versions versions) {


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
        jobPortInUse = ports.contains(hubConfig.getPort(DatabaseKind.JOB)) && serverName != null && !serverName.equals(hubConfig.getHttpName(DatabaseKind.JOB));
        if (jobPortInUse) {
            jobPortInUseBy = serverName;
        }


        if (versions == null) {
            versions = new Versions(hubConfig);
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

        return response;
    }

    /*
     * just installs the hub modules, for more granular management of upgrade
     */
    private void hubInstallModules() {
        AppConfig stagingConfig = hubConfig.getStagingAppConfig();
        CommandContext stagingContext = new CommandContext(stagingConfig, null, null);
        new LoadHubModulesCommand(hubConfig).execute(stagingContext);
    }

    /*
     * just installs the user modules, for more granular management of upgrade
     */
    private void loadUserModules() {
        AppConfig stagingConfig = hubConfig.getStagingAppConfig();
        CommandContext stagingContext = new CommandContext(stagingConfig, null, null);
        new LoadUserStagingModulesCommand(hubConfig).execute(stagingContext);
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
        initProject();

        logger.warn("Installing the Data Hub into MarkLogic");

        // in AWS setting this fails...
        // for now putting in try/catch
        try {
            AppConfig roleConfig = hubConfig.getStagingAppConfig();
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

        AppConfig finalConfig = hubConfig.getFinalAppConfig();
        HubAppDeployer finalDeployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener, hubConfig.newStagingClient());
        finalDeployer.setFinalCommandsList(getFinalCommandList());

        AppConfig stagingConfig = hubConfig.getStagingAppConfig();
        finalDeployer.setStagingCommandsList(getStagingCommandList());

        finalDeployer.deployAll(finalConfig, stagingConfig);
    }

    @Override
    public void installFinal(HubDeployStatusListener listener) {

        logger.warn("Installing the Data Hub into MarkLogic");
        AppConfig finalConfig = hubConfig.getFinalAppConfig();
        HubAppDeployer finalDeployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener, hubConfig.newFinalClient());
        finalDeployer.setCommands(getFinalCommandList());
        finalDeployer.deploy(finalConfig);
    }

    @Override
    public void installStaging(HubDeployStatusListener listener) {
        // i know it's weird that the final client installs staging, but it's needed
        AppConfig stagingConfig = hubConfig.getStagingAppConfig();
        HubAppDeployer stagingDeployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener, hubConfig.newFinalClient());
        stagingDeployer.setCommands(getStagingCommandList());
        stagingDeployer.deploy(stagingConfig);
    }

    @Override
    public void updateIndexes() {
    	HubAppDeployer deployer = new HubAppDeployer(getManageClient(), getAdminManager(), null, hubConfig.newStagingClient());
    	
    	AppConfig finalConfig = hubConfig.getFinalAppConfig();
        List<Command> finalDBCommand = new ArrayList<>();
        finalDBCommand.add(new DeployHubDatabaseCommand(hubConfig, finalFile));
        deployer.setFinalCommandsList(finalDBCommand);
        
        AppConfig stagingConfig = hubConfig.getStagingAppConfig();
        List<Command> stagingDBCommand = new ArrayList<>();
        stagingDBCommand.add(new DeployHubDatabaseCommand(hubConfig, stagingFile));
        stagingDBCommand.add(new DeployHubDatabaseCommand(hubConfig, jobsFile));
        deployer.setStagingCommandsList(stagingDBCommand);

        deployer.deployAll(finalConfig, stagingConfig);
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

        AppConfig finalConfig = hubConfig.getFinalAppConfig();
        HubAppDeployer finalDeployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener, hubConfig.newStagingClient());
        finalDeployer.setFinalCommandsList(getFinalCommandList());

        AppConfig stagingConfig = hubConfig.getStagingAppConfig();
        finalDeployer.setStagingCommandsList(getStagingCommandList());

        finalDeployer.undeployAll(finalConfig, stagingConfig);

        AppConfig roleConfig = hubConfig.getStagingAppConfig();
        SimpleAppDeployer roleDeployer = new SimpleAppDeployer(getManageClient(), getAdminManager());
        roleDeployer.setCommands(getSecurityCommandList());
        roleDeployer.undeploy(roleConfig);
    }

    @Override
    public void uninstallStaging(HubDeployStatusListener listener) {

        AppConfig config = hubConfig.getStagingAppConfig();
        HubAppDeployer stagingDeployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener, hubConfig.newStagingClient());
        stagingDeployer.setCommands(getStagingCommandList());
        stagingDeployer.undeploy(config);
    }

    @Override
    public void uninstallFinal(HubDeployStatusListener listener) {

        AppConfig finalAppConfig = hubConfig.getFinalAppConfig();
        HubAppDeployer finalDeployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener, hubConfig.newFinalClient());
        finalDeployer.setCommands(getFinalCommandList());
        finalDeployer.undeploy(finalAppConfig);
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


    private Map<String, List<Command>> getStagingCommands() {
        Map<String, List<Command>> commandMap = new CommandMapBuilder().buildCommandMap();

        List<Command> dbCommands = new ArrayList<>();
        dbCommands.add(new DeployHubDatabasesCommand(hubConfig));
        dbCommands.add(new DeployHubStagingTriggersDatabaseCommand(hubConfig));
        dbCommands.add(new DeployHubStagingSchemasDatabaseCommand(hubConfig));
        commandMap.put("mlDatabaseCommands", dbCommands);

        commandMap.remove("mlSecurityCommands");

        // staging deploys amps.
        List<Command> securityCommand = new ArrayList<>();
        securityCommand.add(new DeployHubAmpsCommand(hubConfig));
        commandMap.put("mlSecurityCommand", securityCommand);

        // don't deploy rest api servers
        commandMap.remove("mlRestApiCommands");

        List<Command> serverCommands = new ArrayList<>();
        serverCommands.add(new DeployHubServersCommand(hubConfig));
        DeployOtherServersCommand otherServersCommand = new DeployOtherServersCommand();
        otherServersCommand.setFilenamesToIgnore("staging-server.json", "final-server.json", "job-server.json", "trace-server.json");
        serverCommands.add(otherServersCommand);
        commandMap.put("mlServerCommands", serverCommands);

        List<Command> moduleCommands = new ArrayList<>();
        moduleCommands.add(new LoadHubModulesCommand(hubConfig));
        moduleCommands.add(new LoadUserStagingModulesCommand(hubConfig));
        commandMap.put("mlModuleCommands", moduleCommands);

        List<Command> forestCommands = commandMap.get("mlForestCommands");
        DeployCustomForestsCommand deployCustomForestsCommand = (DeployCustomForestsCommand) forestCommands.get(0);
        deployCustomForestsCommand.setCustomForestsPath(hubConfig.getCustomForestPath());

        return commandMap;
    }

    private Map<String, List<Command>> getFinalCommands() {
        Map<String, List<Command>> commandMap = new CommandMapBuilder().buildCommandMap();

        // final bootstraps users and roles for the hub
        List<Command> securityCommands = commandMap.get("mlSecurityCommands");
        securityCommands.set(0, new DeployUserRolesCommand(hubConfig));
        securityCommands.set(1, new DeployUserUsersCommand(hubConfig));

        commandMap.put("mlSecurityCommands", securityCommands);

        List<Command> dbCommands = new ArrayList<>();
        dbCommands.add(new DeployHubOtherDatabasesCommand(hubConfig));
        dbCommands.add(new DeployHubFinalTriggersDatabaseCommand(hubConfig));
        dbCommands.add(new DeployHubFinalSchemasDatabaseCommand(hubConfig));
        commandMap.put("mlDatabaseCommands", dbCommands);

        // don't deploy rest api servers
        commandMap.remove("mlRestApiCommands");

        List<Command> serverCommands = new ArrayList<>();
        serverCommands.add(new DeployUserServersCommand(hubConfig));
        DeployOtherServersCommand otherServersCommand = new DeployOtherServersCommand();
        otherServersCommand.setFilenamesToIgnore("staging-server.json", "final-server.json", "job-server.json", "trace-server.json");
        serverCommands.add(otherServersCommand);
        commandMap.put("mlServerCommands", serverCommands);

        // this is the vanilla load-modules command from ml-gradle, to be included in this
        // command list for install
        List<Command> moduleCommands = new ArrayList<>();
        moduleCommands.add(new LoadModulesCommand());
        commandMap.put("mlModuleCommands", moduleCommands);

        List<Command> forestCommands = commandMap.get("mlForestCommands");
        DeployCustomForestsCommand deployCustomForestsCommand = (DeployCustomForestsCommand) forestCommands.get(0);
        deployCustomForestsCommand.setCustomForestsPath(hubConfig.getCustomForestPath());

        return commandMap;
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
        String currentVersion = new Versions(hubConfig).getHubVersion();
        int compare = Versions.compare(currentVersion, MIN_UPGRADE_VERSION);
        if (compare == -1) {
            throw new CantUpgradeException(currentVersion, MIN_UPGRADE_VERSION);
        }

        boolean result = false;
        boolean alreadyInitialized = hubConfig.getHubProject().isInitialized();
        File buildGradle = Paths.get(hubConfig.getProjectDir(), "build.gradle").toFile();

        // update the hub-internal-config files
        hubConfig.initHubProject();
        try {
            if (alreadyInitialized) {
                // replace the hub version in build.gradle
                String text = FileUtils.readFileToString(buildGradle);
                String version = hubConfig.getJarVersion();
                text = Pattern.compile("^(\\s*)id\\s+['\"]com.marklogic.ml-data-hub['\"]\\s+version.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1id 'com.marklogic.ml-data-hub' version '" + version + "'");
                text = Pattern.compile("^(\\s*)compile.+marklogic-data-hub.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1compile 'com.marklogic:marklogic-data-hub:" + version + "'");
                FileUtils.writeStringToFile(buildGradle, text);

                hubConfig.getHubSecurityDir().resolve("roles").resolve("data-hub-user.json").toFile().delete();
            }

            //now let's try to upgrade the directory structure
            hubConfig.getHubProject().upgradeProject();

            // update legacy flows to include main.(sjs|xqy)
            List<String> flows = FlowManager.create(hubConfig).updateLegacyFlows(currentVersion);
            if (updatedFlows != null) {
                updatedFlows.addAll(flows);
            }

            if (isHubInstalled) {
                // install hub modules into MarkLogic
                runInDatabase("cts:uris(\"\", (), cts:and-not-query(cts:collection-query(\"hub-core-module\"), cts:document-query((\"/com.marklogic.hub/config.sjs\", \"/com.marklogic.hub/config.xqy\")))) ! xdmp:document-delete(.)", hubConfig.getDbName(DatabaseKind.MODULES));

                // should be install user modules and hub modules, not install
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
}
