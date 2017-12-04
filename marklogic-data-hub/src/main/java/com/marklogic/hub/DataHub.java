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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandMapBuilder;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.appdeployer.command.forests.DeployCustomForestsCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.ServerValidationException;
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
        init(hubConfig);
    }

    private void init(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    private ManageClient getManageClient() {
        if (this._manageClient == null) {
            this._manageClient = hubConfig.newManageClient();
        }
        return this._manageClient;
    }

    private AdminManager getAdminManager() {
        if (this._adminManager == null) {
            this._adminManager = hubConfig.newAdminManager();
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
    void setServerManager(ServerManager manager) { this._serverManager = manager; }
    /**
     * Determines if the data hub is installed in MarkLogic
     * @return true if installed, false otherwise
     */
    public InstallInfo isInstalled() {

        InstallInfo installInfo = new InstallInfo();

        ResourcesFragment srf = getServerManager().getAsXml();
        installInfo.stagingAppServerExists = srf.resourceExists(hubConfig.stagingHttpName);
        installInfo.finalAppServerExists = srf.resourceExists(hubConfig.finalHttpName);
        installInfo.traceAppServerExists = srf.resourceExists(hubConfig.traceHttpName);
        installInfo.jobAppServerExists = srf.resourceExists(hubConfig.jobHttpName);

        ResourcesFragment drf = getDatabaseManager().getAsXml();
        installInfo.stagingDbExists = drf.resourceExists(hubConfig.stagingDbName);
        installInfo.finalDbExists = drf.resourceExists(hubConfig.finalDbName);
        installInfo.traceDbExists = drf.resourceExists(hubConfig.traceDbName);
        installInfo.jobDbExists = drf.resourceExists(hubConfig.jobDbName);

        if (installInfo.stagingDbExists) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.stagingDbName);
            installInfo.stagingTripleIndexOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            installInfo.stagingCollectionLexiconOn = Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            installInfo.stagingForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        if (installInfo.finalDbExists) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.finalDbName);
            installInfo.finalTripleIndexOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            installInfo.finalCollectionLexiconOn = Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            installInfo.finalForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        if (installInfo.traceDbExists) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.traceDbName);
            installInfo.traceForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        if (installInfo.jobDbExists) {
            Fragment f = getDatabaseManager().getPropertiesAsXml(hubConfig.jobDbName);
            installInfo.jobForestsExist = (f.getElements("//m:forest").size() > 0);
        }

        logger.info(installInfo.toString());

        return installInfo;
    }

    /**
     * Validates the MarkLogic server to ensure compatibility with the hub
     * @return true if valid, false otherwise
     * @throws ServerValidationException if the server is not compatible
     */
    public boolean isServerVersionValid() {
        return isServerVersionValid(null);
    }

    public boolean isServerVersionValid(String versionString) {
        try {
            if (versionString == null) {
                versionString = getMarkLogicVersion();
            }
            int major = Integer.parseInt(versionString.replaceAll("([^.]+)\\..*", "$1"));
            if (major < 8) {
                return false;
            }
            boolean isNightly = versionString.matches("[^-]+-(\\d{4})(\\d{2})(\\d{2})");
            if (major == 8) {
                String alteredString = versionString.replaceAll("[^\\d]+", "");
                if (alteredString.length() < 4) {
                    alteredString = StringUtils.rightPad(alteredString, 4, "0");
                }
                int ver = Integer.parseInt(alteredString.substring(0, 4));
                if (!isNightly && ver < 8070) {
                    return false;
                }
            }
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

    public void initProject() {
        logger.info("Initializing the Hub Project");
        hubConfig.initHubProject();
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
        getDatabaseManager().clearDatabase(database);
    }

    private EvalResultIterator runInDatabase(String query, String databaseName) {
        ServerEvaluationCall eval = hubConfig.newStagingClient().newServerEval();
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
        LoadUserModulesCommand loadUserModulesCommand = new LoadUserModulesCommand(hubConfig);
        loadUserModulesCommand.setForceLoad(force);
        commands.add(loadUserModulesCommand);

        runCommands(commands);
    }

    /**
     * Install the Data Hub Framework's internal modules into MarkLogic
     */
    public void installHubModules() {
        logger.debug("Installing Data Hub Framework modules into MarkLogic");

        List<Command> commands = new ArrayList<>();
        commands.add(new LoadHubModulesCommand(hubConfig));

        runCommands(commands);
    }

    private void runCommands(List<Command> commands) {
        SimpleAppDeployer deployer = new SimpleAppDeployer(getManageClient(), getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());
    }

    public JsonNode validateUserModules() {
        logger.debug("validating user modules");

        EntitiesValidator ev = new EntitiesValidator(hubConfig.newStagingClient());
        return ev.validateAll();
    }

    public JsonNode validateUserModule(String entity, String flow, String plugin, String type, String content) {
        logger.debug("validating user module");

        EntitiesValidator ev = new EntitiesValidator(hubConfig.newStagingClient());
        return ev.validate(entity, flow, plugin, type, content);
    }

    public List<Command> getCommandList() {
        Map<String, List<Command>> commandMap = getCommands();
        List<Command> commands = new ArrayList<>();
        for (String name : commandMap.keySet()) {
            commands.addAll(commandMap.get(name));
        }
        return commands;
    }
    public Map<String, List<Command>> getCommands() {
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
        deployCustomForestsCommand.setCustomForestsPath(hubConfig.customForestPath);

        return commandMap;
    }

    public Map<Integer, String> getServerPortsInUse() {
        Map<Integer, String> portsInUse = new HashMap<>();
        ResourcesFragment srf = getServerManager().getAsXml();
        srf.getListItemNameRefs().forEach(s -> {
            Fragment fragment = getServerManager().getPropertiesAsXml(s);
            int port = Integer.parseInt(fragment.getElementValue("//m:port"));
            portsInUse.put(port, s);
        });
        return portsInUse;
    }

    public PreInstallCheck runPreInstallCheck() {
        PreInstallCheck check = new PreInstallCheck();

        Map<Integer, String> portsInUse = getServerPortsInUse();
        Set<Integer> ports = portsInUse.keySet();

        String serverName = portsInUse.get(hubConfig.stagingPort);
        check.stagingPortInUse = ports.contains(hubConfig.stagingPort) && serverName != null && !serverName.equals(hubConfig.stagingHttpName);
        if (check.stagingPortInUse) {
            check.stagingPortInUseBy = serverName;
        }

        serverName = portsInUse.get(hubConfig.finalPort);
        check.finalPortInUse = ports.contains(hubConfig.finalPort) && serverName != null && !serverName.equals(hubConfig.finalHttpName);
        if (check.finalPortInUse) {
            check.finalPortInUseBy = serverName;
        }

        serverName = portsInUse.get(hubConfig.jobPort);
        check.jobPortInUse = ports.contains(hubConfig.jobPort) && serverName != null && !serverName.equals(hubConfig.jobHttpName);
        if (check.jobPortInUse) {
            check.jobPortInUseBy = serverName;
        }

        serverName = portsInUse.get(hubConfig.tracePort);
        check.tracePortInUse = ports.contains(hubConfig.tracePort) && serverName != null && !serverName.equals(hubConfig.traceHttpName);
        if (check.tracePortInUse) {
            check.tracePortInUseBy = serverName;
        }

        check.serverVersion = getMarkLogicVersion();
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

    /**
     * Gets the hub version for the installed server side modules
     * @return - the version of the installed modules
     */
    public String getHubVersion() {
        try {
            HubVersion hv = new HubVersion(hubConfig.newStagingClient());
            return hv.getVersion();
        }
        catch(Exception e) {}
        return "2.0.0"; // don't change this value
    }

    public String getMarkLogicVersion() {
        // do it this way to avoid needing an admin user
        // vs getAdminManager().getServerVersion() which needs admin :(
        ServerEvaluationCall eval = hubConfig.newAppServicesClient().newServerEval();
        String xqy = "xdmp:version()";
        EvalResultIterator result = eval.xquery(xqy).eval();
        if (result.hasNext()) {
            return result.next().getString();
        }
        else {
            throw new RuntimeException("Couldn't determine MarkLogic Version");
        }
    }

    public static int versionCompare(String v1, String v2) {
        if(v1 == null || v2 == null) {
            return 1;
        }
        String[] v1Parts = v1.split("\\.");
        String[] v2Parts = v2.split("\\.");
        int length = Math.max(v1Parts.length, v2Parts.length);
        for(int i = 0; i < length; i++) {
            int v1Part = i < v1Parts.length ? Integer.parseInt(v1Parts[i]) : 0;
            int v2Part = i < v2Parts.length ? Integer.parseInt(v2Parts[i]) : 0;

            if(v1Part < v2Part) {
                return -1;
            }

            if(v1Part > v2Part) {
                return 1;
            }
        }
        return 0;
    }

    class EntitiesValidator extends ResourceManager {
        private static final String NAME = "validate";

        EntitiesValidator(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        JsonNode validateAll() {
            ServiceResultIterator resultItr = this.getServices().get(new RequestParameters());
            if (resultItr == null || ! resultItr.hasNext()) {
                return null;
            }
            ServiceResult res = resultItr.next();
            return res.getContent(new JacksonHandle()).get();
        }

        JsonNode validate(String entity, String flow, String plugin, String type, String content) {
            RequestParameters params = new RequestParameters();
            params.add("entity", entity);
            params.add("flow", flow);
            params.add("plugin", plugin);
            params.add("type", type);
            StringHandle handle = new StringHandle(content);
            handle.setFormat(Format.TEXT);
            ServiceResultIterator resultItr = this.getServices().post(params, handle );
            if (resultItr == null || ! resultItr.hasNext()) {
                return null;
            }
            ServiceResult res = resultItr.next();
            return res.getContent(new JacksonHandle()).get();
        }
    }

    class HubVersion extends ResourceManager {
        private static final String NAME = "hubversion";

        HubVersion(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        String getVersion() {
            ServiceResultIterator resultItr = this.getServices().get(new RequestParameters());
            if (resultItr == null || ! resultItr.hasNext()) {
                return null;
            }
            ServiceResult res = resultItr.next();
            return res.getContent(new StringHandle()).get();
        }
    }
}
