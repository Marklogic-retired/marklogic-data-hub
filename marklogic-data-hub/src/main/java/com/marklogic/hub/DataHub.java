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
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.appdeployer.command.security.DeployUsersCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.ServerValidationException;
import com.marklogic.hub.util.JsonXor;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.appservers.ServerManager;
import com.marklogic.mgmt.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;
import com.marklogic.rest.util.ResourcesFragment;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.client.ResourceAccessException;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

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
     * @throws ServerValidationException if the server is not compatible
     */
    public void validateServer() throws ServerValidationException {
        try {
            String versionString = getAdminManager().getServerVersion();
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

    public void initProject() {
        logger.info("Initializing the Hub Project");

        HubProject hp = new HubProject(hubConfig);
        hp.init();
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
        return ev.validate();
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

    public boolean updateHubFromPre110() {
        boolean result = false;
        File buildGradle = Paths.get(this.hubConfig.projectDir, "build.gradle").toFile();
        try {
            // step 1: update build.gradle
            String text = new String(FileCopyUtils.copyToByteArray(buildGradle));
            String version = hubConfig.getJarVersion();
            text = Pattern.compile("^(\\s*)id\\s+['\"]com.marklogic.ml-data-hub['\"]\\s+version.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1id 'com.marklogic.ml-data-hub' version '" + version + "'");
            text = Pattern.compile("^(\\s*)compile.+marklogic-data-hub.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1compile 'com.marklogic:marklogic-data-hub:" + version + "'");
            FileUtils.writeStringToFile(buildGradle, text);

            // step 2: create the internal-hub-config dir and the gradle files
            HubProject hp = new HubProject(hubConfig);
            hp.init();

            // step 3: rename marklogic-config to user-config (if marklogic-config exists)
            File markLogicConfig = Paths.get(this.hubConfig.projectDir, HubConfig.OLD_HUB_CONFIG_DIR).toFile();
            Path userConfigDir = this.hubConfig.getUserConfigDir();
            if (markLogicConfig.exists() && markLogicConfig.isDirectory()) {
                FileUtils.forceDelete(userConfigDir.toFile());
                FileUtils.moveDirectory(markLogicConfig, userConfigDir.toFile());

                // fix unquoted ports in old configs
                Files.walkFileTree(this.hubConfig.getUserServersDir(), new SimpleFileVisitor<Path>() {
                        @Override
                        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                            if (file.getFileName().toString().endsWith(".json")) {
                                String fileContents = FileUtils.readFileToString(file.toFile());
                                for (String findMe : new String[]{"%%mlStagingPort%%", "%%mlFinalPort%%", "%%mlTracePort%%", "%%mlJobPort%%"}) {
                                    fileContents = Pattern.compile("(\"port\"\\s*:\\s*)" + findMe).matcher(fileContents).replaceAll("$1\"" + findMe + "\"");
                                }
                                FileUtils.writeStringToFile(file.toFile(), fileContents);
                            }
                            return FileVisitResult.CONTINUE;
                        }
                });

                // step 3.5: tease out user's config file changes
                Files.walkFileTree(userConfigDir, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                        if (file.getFileName().toString().endsWith(".json")) {
                            File hubFile = new File(file.toString().replace(HubConfig.USER_CONFIG_DIR, HubConfig.HUB_CONFIG_DIR));
                            if (hubFile.exists()) {
                                JsonNode xored = JsonXor.xor(hubFile, file.toFile());
                                if (xored.size() > 0) {
                                    ObjectMapper objectMapper = new ObjectMapper();
                                    objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), xored);
                                }
                                else {
                                    FileUtils.forceDelete(file.toFile());
                                }
                            }
                        }
                        return FileVisitResult.CONTINUE;
                    }

                });

            }

            // step 4: install hub modules into MarkLogic
            install();

            result = true;
        }
        catch(IOException e) {
            e.printStackTrace();
        }
        return result;
    }

    public boolean updateHubFrom110() {
        boolean result = false;
        File buildGradle = Paths.get(this.hubConfig.projectDir, "build.gradle").toFile();
        try {
            // step 1: update the hub-internal-config files
            HubProject hp = new HubProject(hubConfig);
            hp.init();

            // step 2: replace the hub version in build.gradle
            String text = new String(FileCopyUtils.copyToByteArray(buildGradle));
            String version = hubConfig.getJarVersion();
            text = Pattern.compile("^(\\s*)id\\s+['\"]com.marklogic.ml-data-hub['\"]\\s+version.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1id 'com.marklogic.ml-data-hub' version '" + version + "'");
            text = Pattern.compile("^(\\s*)compile.+marklogic-data-hub.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1compile 'com.marklogic:marklogic-data-hub:" + version + "'");
            FileUtils.writeStringToFile(buildGradle, text);

            // step 3: install hub modules into MarkLogic
            install();

            result = true;
        }
        catch(IOException e) {
            e.printStackTrace();
        }
        return result;
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
        return "1.0.0";
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

        JsonNode validate() {
            ServiceResultIterator resultItr = this.getServices().get(new RequestParameters());
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
