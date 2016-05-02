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

import java.io.File;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.client.ResourceAccessException;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.modules.AllButAssetsModulesFinder;
import com.marklogic.appdeployer.command.modules.AssetModulesFinder;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.modulesloader.impl.XccAssetLoader;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.commands.DeployHubDatabaseCommand;
import com.marklogic.hub.commands.DeployModulesDatabaseCommand;
import com.marklogic.hub.commands.DeployRestApiCommand;
import com.marklogic.hub.commands.LoadModulesCommand;
import com.marklogic.hub.commands.UpdateRestApiServersCommand;
import com.marklogic.hub.commands.DeployHubDatabaseCommand.DBType;
import com.marklogic.hub.util.HubFileFilter;
import com.marklogic.hub.util.HubModulesLoader;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.appservers.ServerManager;
import com.marklogic.mgmt.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;
import com.marklogic.rest.util.ResourcesFragment;

public class DataHub {

    static final private Logger LOGGER = LoggerFactory.getLogger(DataHub.class);

    private ManageConfig config;
    private ManageClient client;

    private File assetInstallTimeFile = new File("./assetInstallTime.properties");
    private HubConfig hubConfig;

    public DataHub(HubConfig hubConfig) {
        init(hubConfig);
    }

    public DataHub(String host, String username, String password) {
        hubConfig = new HubConfig();
        hubConfig.host = host;
        hubConfig.adminUsername = username;
        hubConfig.adminPassword = password;
        init(hubConfig);
    }

    private void init(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        config = new ManageConfig(hubConfig.host, 8002, hubConfig.adminUsername, hubConfig.adminPassword);
        client = new ManageClient(config);
    }

    public void setAssetInstallTimeFile(File assetInstallTimeFile) {
        this.assetInstallTimeFile = assetInstallTimeFile;
    }

    /**
     * Determines if the data hub is installed in MarkLogic
     * @return true if installed, false otherwise
     */
    public boolean isInstalled() {
        ServerManager sm = new ServerManager(client);
        DatabaseManager dm = new DatabaseManager(client);

        ResourcesFragment srf = sm.getAsXml();
        boolean stagingAppServerExists = srf.resourceExists(hubConfig.stagingHttpName);
        boolean finalAppServerExists = srf.resourceExists(hubConfig.finalHttpName);
        boolean tracingAppServerExists = srf.resourceExists(hubConfig.tracingHttpName);
        boolean appserversOk = (stagingAppServerExists && finalAppServerExists && tracingAppServerExists);

        ResourcesFragment drf = dm.getAsXml();
        boolean stagingDbExists = drf.resourceExists(hubConfig.stagingDbName);
        boolean finalDbExists = drf.resourceExists(hubConfig.finalDbName);
        boolean tracingDbExists = drf.resourceExists(hubConfig.stagingDbName);

        boolean stagingForestsExist = false;
        boolean finalForestsExist = false;
        boolean tracingForestsExist = false;

        boolean stagingIndexesOn = false;
        boolean finalIndexesOn = false;
        boolean tracingIndexesOn = false;

        if (stagingDbExists) {
            Fragment f = dm.getPropertiesAsXml(hubConfig.stagingDbName);
            stagingIndexesOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            stagingIndexesOn = stagingIndexesOn && Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            stagingForestsExist = (f.getElements("//m:forest").size() == hubConfig.stagingForestsPerHost);
        }

        if (finalDbExists) {
            Fragment f = dm.getPropertiesAsXml(hubConfig.finalDbName);
            finalIndexesOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            finalIndexesOn = finalIndexesOn && Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            finalForestsExist = (f.getElements("//m:forest").size() == hubConfig.finalForestsPerHost);
        }

        if (tracingDbExists) {
            tracingIndexesOn = true;
            Fragment f = dm.getPropertiesAsXml(hubConfig.tracingDbName);
            tracingForestsExist = (f.getElements("//m:forest").size() == hubConfig.tracingForestsPerHost);
        }

        boolean dbsOk = (stagingDbExists && stagingIndexesOn &&
                finalDbExists && finalIndexesOn &&
                tracingDbExists && tracingIndexesOn);
        boolean forestsOk = (stagingForestsExist && finalForestsExist && tracingForestsExist);

        return (appserversOk && dbsOk && forestsOk);
    }

    /**
     * Validates the MarkLogic server to ensure compatibility with the hub
     * @throws ServerValidationException if the server is not compatible
     */
    public void validateServer() throws ServerValidationException {
        try {
            AdminManager am = getAdminManager();
            String versionString = am.getServerVersion();
            int major = Integer.parseInt(versionString.substring(0, 1));
            int minor = Integer.parseInt(versionString.substring(2, 3) + versionString.substring(4, 5));
            if (major < 8 || minor < 4) {
                throw new ServerValidationException("Invalid MarkLogic Server Version: " + versionString);
            }
        }
        catch(ResourceAccessException e) {
            throw new ServerValidationException(e.toString());
        }
    }

    private AppConfig getAppConfig() throws IOException {
        AppConfig config = new AppConfig();
        config.setHost(hubConfig.host);
        config.setRestPort(hubConfig.stagingPort);
        config.setName(hubConfig.name);
        config.setRestAdminUsername(hubConfig.adminUsername);
        config.setRestAdminPassword(hubConfig.adminPassword);
        config.setModulesDatabaseName(hubConfig.modulesDbName);

        List<String> paths = new ArrayList<String>();
        paths.add(new ClassPathResource("ml-modules").getPath());

        String configPath = new ClassPathResource("ml-config").getPath();
        config.setConfigDir(new ConfigDir(new File(configPath)));
        config.setModulePaths(paths);

        Map<String, String> customTokens = config.getCustomTokens();
        customTokens.put("%%STAGING_DATABASE%%", hubConfig.stagingDbName);
        customTokens.put("%%FINAL_DATABASE%%", hubConfig.finalDbName);
        customTokens.put("%%TRACING_DATABASE%%", hubConfig.tracingDbName);
        customTokens.put("%%MODULES_DATABASE%%", hubConfig.modulesDbName);

        return config;
    }

    /**
     * Installs the data hub configuration and server-side modules into MarkLogic
     * @throws IOException
     */
    public void install() throws IOException {
        long startTime = System.nanoTime();
        LOGGER.debug("Installing the Data Hub into MarkLogic");

        // clean up any lingering cache for deployed modules
        PropertiesModuleManager moduleManager = new PropertiesModuleManager(this.assetInstallTimeFile);
        moduleManager.deletePropertiesFile();

        AppConfig config = getAppConfig();
        SimpleAppDeployer deployer = new SimpleAppDeployer(client, getAdminManager());
        deployer.setCommands(getCommands(config));

        deployer.deploy(config);
        long endTime = System.nanoTime();
        long duration = (endTime - startTime);
        LOGGER.info("Install took: " + (duration / 1000000000) + " seconds");
    }

    private DatabaseClient getDatabaseClient(int port) {
        AppConfig config = new AppConfig();
        config.setHost(hubConfig.host);
        config.setName(hubConfig.name);
        config.setRestAdminUsername(hubConfig.adminUsername);
        config.setRestAdminPassword(hubConfig.adminPassword);
        DatabaseClient client = DatabaseClientFactory.newClient(hubConfig.host, port, hubConfig.adminUsername, hubConfig.adminPassword,
                config.getRestAuthentication(), config.getRestSslContext(), config.getRestSslHostnameVerifier());
        return client;
    }

    /**
     * Installs User Provided modules into the Data Hub
     *
     * @param pathToUserModules
     *            - the absolute path to the user's modules folder
     * @return the canonical/absolute path of files that was loaded, together
     *         with its install time
     * @throws IOException
     */
    public Set<File> installUserModules(String pathToUserModules) throws IOException {
        LOGGER.debug("Installing user modules into MarkLogic");

        AppConfig config = getAppConfig();

        DatabaseClient stagingClient = getDatabaseClient(hubConfig.stagingPort);
        DatabaseClient finalClient = getDatabaseClient(hubConfig.finalPort);


        Set<File> loadedFiles = new HashSet<File>();

        XccAssetLoader assetLoader = config.newXccAssetLoader();
        assetLoader.setFileFilter(new HubFileFilter());

        PropertiesModuleManager moduleManager = new PropertiesModuleManager(this.assetInstallTimeFile);
        HubModulesLoader hubModulesLoader = new HubModulesLoader(assetLoader, moduleManager);
        File baseDir = Paths.get(pathToUserModules).normalize().toAbsolutePath().toFile();
        loadedFiles.addAll(hubModulesLoader.loadModules(baseDir, new AssetModulesFinder(), stagingClient));
        Path startPath = Paths.get(pathToUserModules, "entities");

        Files.walkFileTree(startPath, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
                throws IOException
            {
                boolean isRest = dir.endsWith("REST");

                String dirStr = dir.toString();
                boolean isInputDir = dirStr.matches(".*[/\\\\]input[/\\\\].*");
                boolean isHarmonizeDir = dirStr.matches(".*[/\\\\]harmonize[/\\\\].*");
                if (isRest) {
                    if (isInputDir) {
                        loadedFiles.addAll(hubModulesLoader.loadModules(dir.normalize().toAbsolutePath().toFile(), new AllButAssetsModulesFinder(), stagingClient));
                    }
                    else if (isHarmonizeDir) {
                        loadedFiles.addAll(hubModulesLoader.loadModules(dir.normalize().toAbsolutePath().toFile(), new AllButAssetsModulesFinder(), finalClient));
                    }
                    return FileVisitResult.SKIP_SUBTREE;
                }
                else {
                    return FileVisitResult.CONTINUE;
                }
            }
        });
        return loadedFiles;
    }

    public JsonNode validateUserModules() {
        LOGGER.debug("validating user modules");
        DatabaseClient client = getDatabaseClient(hubConfig.stagingPort);
        EntitiesValidator ev = new EntitiesValidator(client);
        return ev.validate();
    }

    private List<Command> getCommands(AppConfig config) {
        List<Command> commands = new ArrayList<Command>();

        // Databases
        List<Command> dbCommands = new ArrayList<Command>();
        DeployHubDatabaseCommand staging = new DeployHubDatabaseCommand(hubConfig.stagingDbName);
        staging.setForestsPerHost(hubConfig.stagingForestsPerHost);
        staging.setDbType(DBType.STAGING);
        dbCommands.add(staging);

        DeployHubDatabaseCommand finalDb = new DeployHubDatabaseCommand(hubConfig.finalDbName);
        finalDb.setForestsPerHost(hubConfig.finalForestsPerHost);
        finalDb.setDbType(DBType.FINAL);
        dbCommands.add(finalDb);

        DeployHubDatabaseCommand tracingDb = new DeployHubDatabaseCommand(hubConfig.tracingDbName);
        tracingDb.setForestsPerHost(hubConfig.tracingForestsPerHost);
        tracingDb.setDbType(DBType.TRACING);
        dbCommands.add(tracingDb);

        dbCommands.add(new DeployModulesDatabaseCommand(hubConfig.modulesDbName));
        commands.addAll(dbCommands);

        // App Servers
        commands.add(new DeployRestApiCommand(hubConfig.stagingHttpName, hubConfig.stagingPort, hubConfig.stagingDbName, hubConfig.stagingForestsPerHost));
        commands.add(new DeployRestApiCommand(hubConfig.finalHttpName, hubConfig.finalPort, hubConfig.finalDbName, hubConfig.finalForestsPerHost));
        commands.add(new DeployRestApiCommand(hubConfig.tracingHttpName, hubConfig.tracePort, hubConfig.tracingDbName, hubConfig.tracingForestsPerHost));

        commands.add(new UpdateRestApiServersCommand(hubConfig.stagingHttpName));
        commands.add(new UpdateRestApiServersCommand(hubConfig.finalHttpName));
        commands.add(new UpdateRestApiServersCommand(hubConfig.tracingHttpName));

        // Modules
        commands.add(new LoadModulesCommand());

        return commands;
    }

    private AdminManager getAdminManager() {
        AdminConfig adminConfig = new AdminConfig();
        adminConfig.setHost(hubConfig.host);
        adminConfig.setUsername(hubConfig.adminUsername);
        adminConfig.setPassword(hubConfig.adminPassword);
        AdminManager manager = new AdminManager(adminConfig);
        return manager;
    }

    /**
     * Uninstalls the data hub configuration and server-side modules from MarkLogic
     * @throws IOException
     */
    public void uninstall() throws IOException {
        long startTime = System.nanoTime();
        LOGGER.debug("Uninstalling the Data Hub from MarkLogic");
        AppConfig config = getAppConfig();
        AdminManager adminManager = getAdminManager();
        SimpleAppDeployer deployer = new SimpleAppDeployer(client, adminManager);
        deployer.setCommands(getCommands(config));
        deployer.undeploy(config);

        // clean up any lingering cache for deployed modules
        PropertiesModuleManager moduleManager = new PropertiesModuleManager(this.assetInstallTimeFile);
        moduleManager.deletePropertiesFile();
        long endTime = System.nanoTime();
        long duration = (endTime - startTime);
        LOGGER.info("Uninstall took: " + (duration / 1000000000) + " seconds");
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
}
