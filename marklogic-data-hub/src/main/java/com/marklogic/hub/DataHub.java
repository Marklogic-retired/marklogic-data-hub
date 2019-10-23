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
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandMapBuilder;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.appdeployer.command.forests.DeployCustomForestsCommand;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.ServerValidationException;
import com.marklogic.hub.util.Versions;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;
import com.marklogic.rest.util.ResourcesFragment;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

public class DataHub {

    private ManageClient _manageClient;
    private DatabaseManager _databaseManager;
    private ServerManager _serverManager;
    private HubConfig hubConfig;

    private AdminManager _adminManager;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());


    public DataHub(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    public ManageClient getManageClient() {
        if (this._manageClient == null) {
            this._manageClient = hubConfig.getManageClient();
        }
        return this._manageClient;
    }

    public AdminManager getAdminManager() {
        if (this._adminManager == null) {
            this._adminManager = hubConfig.getAdminManager();
        }
        return this._adminManager;
    }
    void setAdminManager(AdminManager manager) {
        this._adminManager = manager;
    }

    public DatabaseManager getDatabaseManager() {
        if (this._databaseManager == null) {
            this._databaseManager = new DatabaseManager(getManageClient());
        }
        return this._databaseManager;
    }

    public ServerManager getServerManager() {
        if (this._serverManager == null) {
            this._serverManager = new ServerManager(getManageClient());
        }
        return this._serverManager;
    }
    void setServerManager(ServerManager manager) { this._serverManager = manager; }
    /**
     * Determines if the data hub is installed in MarkLogic
     * @return true if installed, false otherwise
     */
    public InstallInfo isInstalled() {

        InstallInfo installInfo = new InstallInfo();

        ResourcesFragment srf = getServerManager().getAsXml();
        installInfo.stagingAppServerExists = srf.resourceExists(hubConfig.getStagingHttpName());
        installInfo.finalAppServerExists = srf.resourceExists(hubConfig.getFinalHttpName());
        installInfo.traceAppServerExists = srf.resourceExists(hubConfig.getTraceHttpName());
        installInfo.jobAppServerExists = srf.resourceExists(hubConfig.getJobHttpName());

        ResourcesFragment drf = getDatabaseManager().getAsXml();
        installInfo.stagingDbExists = drf.resourceExists(hubConfig.getStagingDbName());
        installInfo.finalDbExists = drf.resourceExists(hubConfig.getFinalDbName());
        installInfo.traceDbExists = drf.resourceExists(hubConfig.getTraceDbName());
        installInfo.jobDbExists = drf.resourceExists(hubConfig.getJobDbName());

        if (installInfo.stagingDbExists) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.getStagingDbName());
            installInfo.stagingTripleIndexOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            installInfo.stagingCollectionLexiconOn = Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            installInfo.stagingForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        if (installInfo.finalDbExists) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.getFinalDbName());
            installInfo.finalTripleIndexOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            installInfo.finalCollectionLexiconOn = Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            installInfo.finalForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        if (installInfo.traceDbExists) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.getTraceDbName());
            installInfo.traceForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        if (installInfo.jobDbExists) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.getJobDbName());
            installInfo.jobForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        logger.info(installInfo.toString());

        return installInfo;
    }

    /**
     * Validates the MarkLogic server to ensure compatibility with the hub
     * @param versionString - the version of the server to validate
     * @return true if valid, false otherwise
     * @throws ServerValidationException if the server is not compatible
     */
    public boolean isServerVersionValid(String versionString) {
        try {
            if (versionString == null) {
                versionString = new Versions(hubConfig).getMarkLogicVersion();
            }
            int major = Integer.parseInt(versionString.replaceAll("([^.]+)\\..*", "$1"));
            if (major != 9) {
                return false;
            }
            boolean isNightly = versionString.matches("[^-]+-(\\d{4})(\\d{2})(\\d{2})");

            //Support any 9.0 version >= 9.1-1.
            int minor = 0;
            int hotFixNum = 0;

            //Extract minor version in cases where versions is of type 9.0-6.2 or 9.0-6
            if(versionString.matches("^.*-(.+)\\.(.*)")) {
                minor = Integer.parseInt(versionString.replaceAll("^.*-(.+)\\..*", "$1"));
                hotFixNum = Integer.parseInt(versionString.replaceAll("^.*-(.+)\\.(.*)", "$2"));
            }
            else if(versionString.matches("^.*-(.+)$")){
                minor = Integer.parseInt(versionString.replaceAll("^.*-(.+)$", "$1"));
            }
            //left pad minor version with 0 if it is < 10
            String modifiedMinor = minor < 10 ? StringUtils.leftPad(String.valueOf(minor), 2, "0"):String.valueOf(minor) ;

            //left pad hotFixNum  with 0 if it is < 10
            String modifiedHotFixNum = hotFixNum < 10 ? StringUtils.leftPad(String.valueOf(hotFixNum), 2, "0"):String.valueOf(hotFixNum) ;
            String alteredString = StringUtils.join(modifiedMinor, modifiedHotFixNum);
            int ver = Integer.parseInt(alteredString);

            //ver >= 500 => 9.1-1 and above is supported
            if (!isNightly && ver < 100) {
                return false;
            }
            if (isNightly) {
                String dateString = versionString.replaceAll("[^-]+-(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3");
                //Support all 9.0-nightly on or after 5/5/2018
                Date minDate = new GregorianCalendar(2018, Calendar.MAY, 5).getTime();
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

    public void initProject() {
        logger.info("Initializing the Hub Project");
        hubConfig.initHubProject();
    }

    /**
     * Removes user's modules from the modules db
     * TODO: this becomes much simpler when we move code into the server dir
     */
    public void clearUserModules() {
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
            runInDatabase(query, hubConfig.getModulesDbName());
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

    public PreInstallCheck runPreInstallCheck() {
        return runPreInstallCheck(null);
    }

    public PreInstallCheck runPreInstallCheck(Versions versions) {
        PreInstallCheck check = new PreInstallCheck();

        Map<Integer, String> portsInUse = getServerPortsInUse();
        Set<Integer> ports = portsInUse.keySet();

        String serverName = portsInUse.get(hubConfig.getStagingPort());
        check.stagingPortInUse = ports.contains(hubConfig.getStagingPort()) && serverName != null && !serverName.equals(hubConfig.getStagingHttpName());
        if (check.stagingPortInUse) {
            check.stagingPortInUseBy = serverName;
        }

        serverName = portsInUse.get(hubConfig.getFinalPort());
        check.finalPortInUse = ports.contains(hubConfig.getFinalPort()) && serverName != null && !serverName.equals(hubConfig.getFinalHttpName());
        if (check.finalPortInUse) {
            check.finalPortInUseBy = serverName;
        }

        serverName = portsInUse.get(hubConfig.getJobPort());
        check.jobPortInUse = ports.contains(hubConfig.getJobPort()) && serverName != null && !serverName.equals(hubConfig.getJobHttpName());
        if (check.jobPortInUse) {
            check.jobPortInUseBy = serverName;
        }

        serverName = portsInUse.get(hubConfig.getTracePort());
        check.tracePortInUse = ports.contains(hubConfig.getTracePort()) && serverName != null && !serverName.equals(hubConfig.getTraceHttpName());
        if (check.tracePortInUse) {
            check.tracePortInUseBy = serverName;
        }

        if (versions == null) {
            versions = new Versions(hubConfig);
        }
        check.serverVersion = versions.getMarkLogicVersion();
        check.serverVersionOk = isServerVersionValid(check.serverVersion);
        return check;
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

        AppConfig config = hubConfig.getAppConfig();
        HubAppDeployer deployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener);
        deployer.setCommands(getCommandList());
        deployer.deploy(config);
    }

    public void updateIndexes() {
        AppConfig config = hubConfig.getAppConfig();
        HubAppDeployer deployer = new HubAppDeployer(getManageClient(), getAdminManager(), null);
        List<Command> commands = new ArrayList<>();
        commands.add(new DeployHubDatabasesCommand(hubConfig));
        deployer.setCommands(commands);
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
}
