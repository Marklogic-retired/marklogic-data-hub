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

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandMapBuilder;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.appdeployer.command.forests.DeployCustomForestsCommand;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.hub.*;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.CantUpgradeException;
import com.marklogic.hub.error.InvalidDBOperationError;
import com.marklogic.hub.error.ServerValidationException;
import com.marklogic.hub.util.Versions;
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
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import java.io.File;
import java.io.IOException;
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

    public DataHubImpl(HubConfig hubConfig) {
        this.hubConfig = ((HubConfigImpl)hubConfig);
    }

    private ManageClient getManageClient() {
        if (this._manageClient == null) {
            this._manageClient = this.hubConfig.getManageClient();
        }
        return this._manageClient;
    }

    @Override public void clearDatabase(String database){
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
    public void setServerManager(ServerManager manager) { this._serverManager = manager; }

    @Override public InstallInfo isInstalled() {

        InstallInfo installInfo = InstallInfo.create();

        ResourcesFragment srf = getServerManager().getAsXml();
        installInfo.setAppServerExistent(DatabaseKind.STAGING, srf.resourceExists(hubConfig.getHttpName(DatabaseKind.STAGING)));
        installInfo.setAppServerExistent(DatabaseKind.FINAL, srf.resourceExists(hubConfig.getHttpName(DatabaseKind.FINAL)));
        installInfo.setAppServerExistent(DatabaseKind.TRACE, srf.resourceExists(hubConfig.getHttpName(DatabaseKind.TRACE)));
        installInfo.setAppServerExistent(DatabaseKind.JOB, srf.resourceExists(hubConfig.getHttpName(DatabaseKind.JOB)));

        ResourcesFragment drf = getDatabaseManager().getAsXml();
        installInfo.setDbExistent(DatabaseKind.STAGING, drf.resourceExists(hubConfig.getDbName(DatabaseKind.STAGING)));
        installInfo.setDbExistent(DatabaseKind.FINAL, drf.resourceExists(hubConfig.getDbName(DatabaseKind.FINAL)));
        installInfo.setDbExistent(DatabaseKind.TRACE, drf.resourceExists(hubConfig.getDbName(DatabaseKind.TRACE)));
        installInfo.setDbExistent(DatabaseKind.JOB, drf.resourceExists(hubConfig.getDbName(DatabaseKind.JOB)));

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

        if (installInfo.isDbExistent(DatabaseKind.TRACE)) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.getDbName(DatabaseKind.TRACE));
            installInfo.setForestsExistent(DatabaseKind.TRACE, (f.getElements("//m:forest").size() > 0));
        }

        if (installInfo.isDbExistent(DatabaseKind.JOB)) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.getDbName(DatabaseKind.JOB));
            installInfo.setForestsExistent(DatabaseKind.JOB, (f.getElements("//m:forest").size() > 0));
        }

        logger.info(installInfo.toString());

        return installInfo;
    }

    @Override public boolean isServerVersionValid(String versionString) {
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
                if (!isNightly && ver < 9011) {
                    return false;
                }
            }
            if (isNightly) {
                String dateString = versionString.replaceAll("[^-]+-(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3");
                Date minDate = new GregorianCalendar(2017, 6, 1).getTime();
                Date date = new SimpleDateFormat("y-M-d").parse(dateString);
                if (date.before(minDate)) {
                    return false;
                }
            }

        }
        catch(Exception e) {
            throw new ServerValidationException(e.toString());
        }
        return true;
    }

    @Override public void initProject() {
        logger.info("Initializing the Hub Project");
        hubConfig.initHubProject();
    }


    @Override public void clearUserModules() {
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DataHub.class.getClassLoader());
        try {
            ArrayList<String> options = new ArrayList<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/options/*.xml")) {
                options.add(r.getFilename().replace(".xml", ""));
            }
            for (Resource r : resolver.getResources("classpath*:/ml-modules-traces/options/*.xml")) {
                options.add(r.getFilename().replace(".xml", ""));
            }
            for (Resource r : resolver.getResources("classpath*:/ml-modules-jobs/options/*.xml")) {
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
            runInDatabase(query, hubConfig.getDbName(DatabaseKind.MODULES));
        }
        catch(FailedRequestException e) {
            logger.error("Failed to clear user modules");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<Command> getCommandList() {
        Map<String, List<Command>> commandMap = getCommands();
        List<Command> commands = new ArrayList<>();
        for (String name : commandMap.keySet()) {
            commands.addAll(commandMap.get(name));
        }
        return commands;
    }

    @Override public HashMap runPreInstallCheck() {
       return runPreInstallCheck(null);
    }

    @Override public HashMap runPreInstallCheck(Versions versions) {

        Map<Integer, String> portsInUse = getServerPortsInUse();
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

        serverName = portsInUse.get(hubConfig.getPort(DatabaseKind.TRACE));
        tracePortInUse = ports.contains(hubConfig.getPort(DatabaseKind.TRACE)) && serverName != null && !serverName.equals(hubConfig.getHttpName(DatabaseKind.TRACE));
        if (tracePortInUse) {
            tracePortInUseBy = serverName;
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
        response.put("tracePortInUse", tracePortInUse);
        response.put("tracePortInUseBy", tracePortInUseBy);
        response.put("safeToInstall", isSafeToInstall());

        return response;
    }

    /**
     * Installs the data hub configuration and server-side config files into MarkLogic
     */
    @Override public void install() {
        install(null);
    }

    /**
     * Installs the data hub configuration and server-side config files into MarkLogic
     * @param listener - the callback method to receive status updates
     */
    @Override public void install(HubDeployStatusListener listener) {
        initProject();

        logger.info("Installing the Data Hub into MarkLogic");

        AppConfig config = hubConfig.getAppConfig();
        HubAppDeployer deployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener);
        deployer.setCommands(getCommandList());
        deployer.deploy(config);
    }

    @Override public void updateIndexes() {
        AppConfig config = hubConfig.getAppConfig();
        HubAppDeployer deployer = new HubAppDeployer(getManageClient(), getAdminManager(), null);
        List<Command> commands = new ArrayList<>();
        commands.add(new DeployHubDatabasesCommand(hubConfig));
        deployer.setCommands(commands);
        deployer.deploy(config);
    }

    /**
     * Uninstalls the data hub configuration and server-side config files from MarkLogic
     */
    @Override public void uninstall() {
        uninstall(null);
    }

    /**
     * Uninstalls the data hub configuration and server-side config files from MarkLogic
     * @param listener - the callback method to receive status updates
     */
    @Override public void uninstall(HubDeployStatusListener listener) {
        logger.debug("Uninstalling the Data Hub from MarkLogic");

        AppConfig config = hubConfig.getAppConfig();
        HubAppDeployer deployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener);
        deployer.setCommands(getCommandList());
        deployer.undeploy(config);
    }

    private void runInDatabase(String query, String databaseName) {
        ServerEvaluationCall eval = hubConfig.newStagingClient().newServerEval();
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

    private Map<String, List<Command>> getCommands() {
        Map<String, List<Command>> commandMap = new CommandMapBuilder().buildCommandMap();

        List<Command> securityCommands = commandMap.get("mlSecurityCommands");
        securityCommands.set(0, new DeployHubRolesCommand(hubConfig));
        securityCommands.set(1, new DeployHubUsersCommand(hubConfig));

        List<Command> dbCommands = new ArrayList<>();
        dbCommands.add(new DeployHubDatabasesCommand(hubConfig));
        dbCommands.add(new DeployHubOtherDatabasesCommand(hubConfig));
        dbCommands.add(new DeployHubTriggersDatabaseCommand(hubConfig));
        dbCommands.add(new DeployHubSchemasDatabaseCommand(hubConfig));
        commandMap.put("mlDatabaseCommands", dbCommands);

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
        moduleCommands.add(new LoadUserModulesCommand(hubConfig));
        commandMap.put("mlModuleCommands", moduleCommands);

        List<Command> mimetypeCommands = commandMap.get("mlMimetypeCommands");
        mimetypeCommands.add(0, new DeployHubMimetypesCommand(hubConfig));

        List<Command> forestCommands = commandMap.get("mlForestCommands");
        DeployCustomForestsCommand deployCustomForestsCommand = (DeployCustomForestsCommand)forestCommands.get(0);
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


    // Here is the former PreCheckInstall class stuff
    // We should probably move this into a sub class OR its own class and interface, and create a super at the
    // datahub level
    private boolean stagingPortInUse;
    private String stagingPortInUseBy;
    private boolean finalPortInUse;
    private String finalPortInUseBy;
    private boolean jobPortInUse;
    private String jobPortInUseBy;
    private boolean tracePortInUse;
    private String tracePortInUseBy;
    private boolean serverVersionOk;
    private String serverVersion;

    @Override public boolean isSafeToInstall() {
        return !(isPortInUse(DatabaseKind.FINAL) ||
            isPortInUse(DatabaseKind.STAGING) ||
            isPortInUse(DatabaseKind.JOB) ||
            isPortInUse(DatabaseKind.TRACE)) && isServerVersionOk();
    }

    @Override public boolean isPortInUse(DatabaseKind kind){
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
            case TRACE:
                inUse = tracePortInUse;
                break;
            default:
                throw new InvalidDBOperationError(kind, "check for port use");
        }
        return inUse;
    }

    @Override public void setPortInUseBy(DatabaseKind kind, String usedBy){
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
            case TRACE:
                tracePortInUseBy = usedBy;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set if port in use");
        }
    }

   @Override public String getPortInUseBy(DatabaseKind kind){
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
            case TRACE:
                inUseBy = tracePortInUseBy;
                break;
            default:
                throw new InvalidDBOperationError(kind, "check if port is in use");
        }
        return inUseBy;
    }

    @Override public boolean isServerVersionOk() {
        return serverVersionOk;
    }

    @Override public void setServerVersionOk(boolean serverVersionOk) {
        this.serverVersionOk = serverVersionOk;
    }

    @Override public String getServerVersion() {
        return serverVersion;
    }

    @Override public void setServerVersion(String serverVersion) {
        this.serverVersion = serverVersion;
    }

    //DataHubUpgrader stuff
    public static String MIN_UPGRADE_VERSION = "1.1.3";

    @Override public boolean upgradeHub() throws CantUpgradeException {
        return upgradeHub(null);
    }

    @Override public boolean upgradeHub(List<String> updatedFlows) throws CantUpgradeException {
        boolean isHubInstalled = this.isInstalled().isInstalled();

        String currentVersion = new Versions(hubConfig).getHubVersion();
        int compare = Versions.compare(currentVersion, MIN_UPGRADE_VERSION);
        if (compare == -1) {
            throw new CantUpgradeException(currentVersion, MIN_UPGRADE_VERSION);
        }

        boolean result = false;
        boolean alreadyInitialized = hubConfig.getHubProject().isInitialized();
        File buildGradle = Paths.get(hubConfig.getProjectDir(), "build.gradle").toFile();
        try {
            // update the hub-internal-config files
            hubConfig.initHubProject();

            if (alreadyInitialized) {
                // replace the hub version in build.gradle
                String text = FileUtils.readFileToString(buildGradle);
                String version = hubConfig.getJarVersion();
                text = Pattern.compile("^(\\s*)id\\s+['\"]com.marklogic.ml-data-hub['\"]\\s+version.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1id 'com.marklogic.ml-data-hub' version '" + version + "'");
                text = Pattern.compile("^(\\s*)compile.+marklogic-data-hub.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1compile 'com.marklogic:marklogic-data-hub:" + version + "'");
                FileUtils.writeStringToFile(buildGradle, text);

                hubConfig.getHubSecurityDir().resolve("roles").resolve("data-hub-user.json").toFile().delete();
            }

            // update legacy flows to include main.(sjs|xqy)
            List<String> flows = FlowManager.create(hubConfig).updateLegacyFlows(currentVersion);
            if (updatedFlows != null) {
                updatedFlows.addAll(flows);
            }

            if (isHubInstalled) {
                // install hub modules into MarkLogic
                this.install();
            }

            result = true;
        }
        catch(IOException e) {
            e.printStackTrace();
        }
        return result;
    }
}
