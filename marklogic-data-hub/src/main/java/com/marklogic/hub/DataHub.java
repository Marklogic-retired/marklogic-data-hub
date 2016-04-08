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
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.client.ResourceAccessException;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.databases.DeploySchemasDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployTriggersDatabaseCommand;
import com.marklogic.appdeployer.command.modules.AllButAssetsModulesFinder;
import com.marklogic.appdeployer.command.modules.AssetModulesFinder;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.appdeployer.command.security.DeployUsersCommand;
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
import com.marklogic.hub.util.HubFileFilter;
import com.marklogic.hub.util.HubModulesLoader;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.appservers.ServerManager;
import com.marklogic.mgmt.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;

public class DataHub {

    static final private Logger LOGGER = LoggerFactory.getLogger(DataHub.class);
    static final public String STAGING_NAME = "data-hub-STAGING";
    static final public String FINAL_NAME = "data-hub-FINAL";
    static final public String TRACING_NAME = "data-hub-TRACING";
    static final public String MODULES_DB_NAME = "data-hub-modules";
    private ManageConfig config;
    private ManageClient client;
    public static String HUB_NAME = "data-hub";
    public static int FORESTS_PER_HOST = 4;
    private String host;
    private int stagingRestPort;
    private int finalRestPort;
    private int tracingRestPort;
    private String username;
    private String password;

    private File assetInstallTimeFile = new File("./assetInstallTime.properties");

    private final static int DEFAULT_STAGING_REST_PORT = 8010;
    private final static int DEFAULT_FINAL_REST_PORT = 8011;
    private final static int DEFAULT_TRACING_REST_PORT = 8012;

    public DataHub(HubConfig config) {
        this(config.getHost(), config.getStagingPort(), config.getFinalPort(), config.getTracePort(), config.getAdminUsername(), config.getAdminPassword());
    }

    public DataHub(String host, String username, String password) {
        this(host, DEFAULT_STAGING_REST_PORT, DEFAULT_FINAL_REST_PORT, DEFAULT_TRACING_REST_PORT, username, password);
    }

    public DataHub(String host, int stagingRestPort, int finalRestPort, int tracingRestPort, String username, String password) {
        config = new ManageConfig(host, 8002, username, password);
        client = new ManageClient(config);
        this.host = host;
        this.stagingRestPort = stagingRestPort;
        this.finalRestPort = finalRestPort;
        this.tracingRestPort = tracingRestPort;
        this.username = username;
        this.password = password;
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
        boolean stagingAppServerExists = sm.exists(STAGING_NAME);
        boolean finalAppServerExists = sm.exists(FINAL_NAME);
        boolean appserversOk = (stagingAppServerExists && finalAppServerExists);

        boolean stagingDbExists = dm.exists(STAGING_NAME);
        boolean finalDbExists = dm.exists(FINAL_NAME);

        boolean stagingForestsExist = false;
        boolean finalForestsExist = false;

        boolean stagingIndexesOn = false;
        boolean finalIndexesOn = false;

        if (stagingDbExists) {
            Fragment f = dm.getPropertiesAsXml(STAGING_NAME);
            stagingIndexesOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            stagingIndexesOn = stagingIndexesOn && Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            stagingForestsExist = (dm.getForestIds(STAGING_NAME).size() == FORESTS_PER_HOST);
        }

        if (finalDbExists) {
            Fragment f = dm.getPropertiesAsXml(FINAL_NAME);
            finalIndexesOn = Boolean.parseBoolean(f.getElementValue("//m:triple-index"));
            finalIndexesOn = finalIndexesOn && Boolean.parseBoolean(f.getElementValue("//m:collection-lexicon"));
            finalForestsExist = (dm.getForestIds(FINAL_NAME).size() == FORESTS_PER_HOST);
        }
        boolean dbsOk = (stagingDbExists && stagingIndexesOn &&
                finalDbExists && finalIndexesOn);
        boolean forestsOk = (stagingForestsExist && finalForestsExist);

        return (appserversOk && dbsOk && forestsOk);
    }

    /**
     * Validates the MarkLogic server to ensure compatibility with the hub
     * @throws ServerValidationException if the server is not compatible
     */
    public void validateServer() throws ServerValidationException {
        try {
            AdminConfig adminConfig = new AdminConfig();
            adminConfig.setHost(host);
            adminConfig.setUsername(username);
            adminConfig.setPassword(password);
            AdminManager am = new AdminManager(adminConfig);
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
        config.setHost(host);
        config.setRestPort(stagingRestPort);
        config.setName(HUB_NAME);
        config.setRestAdminUsername(username);
        config.setRestAdminPassword(password);
        List<String> paths = new ArrayList<String>();
        paths.add(new ClassPathResource("ml-modules").getPath());
        String configPath = new ClassPathResource("ml-config").getPath();
        config.setConfigDir(new ConfigDir(new File(configPath)));
        config.setModulePaths(paths);
        return config;
    }

    /**
     * Installs the data hub configuration and server-side modules into MarkLogic
     * @throws IOException
     */
    public void install() throws IOException {
        // clean up any lingering cache for deployed modules
        PropertiesModuleManager moduleManager = new PropertiesModuleManager(this.assetInstallTimeFile);
        moduleManager.deletePropertiesFile();

        AdminManager manager = new AdminManager();
        AppConfig config = getAppConfig();
        SimpleAppDeployer deployer = new SimpleAppDeployer(client, manager);
        deployer.setCommands(getCommands(config));
        deployer.deploy(config);
    }

    private DatabaseClient getDatabaseClient(int port) {
        AppConfig config = new AppConfig();
        config.setHost(host);
        config.setName(HUB_NAME);
        config.setRestAdminUsername(username);
        config.setRestAdminPassword(password);
        DatabaseClient client = DatabaseClientFactory.newClient(host, port, username, password,
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
        AppConfig config = new AppConfig();
        config.setHost(host);
        config.setRestPort(finalRestPort);
        config.setName(HUB_NAME);
        config.setRestAdminUsername(username);
        config.setRestAdminPassword(password);

        DatabaseClient stagingClient = getDatabaseClient(stagingRestPort);
        DatabaseClient finalClient = getDatabaseClient(finalRestPort);


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
                boolean isConformanceDir = dirStr.matches(".*[/\\\\]conformance[/\\\\].*");
                if (isRest) {
                    if (isInputDir) {
                        loadedFiles.addAll(hubModulesLoader.loadModules(dir.normalize().toAbsolutePath().toFile(), new AllButAssetsModulesFinder(), stagingClient));
                    }
                    else if (isConformanceDir) {
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
        DatabaseClient client = getDatabaseClient(stagingRestPort);
        EntitiesValidator ev = new EntitiesValidator(client);
        return ev.validate();
    }

    private List<Command> getCommands(AppConfig config) {
        List<Command> commands = new ArrayList<Command>();

        // Security
        List<Command> securityCommands = new ArrayList<Command>();
        securityCommands.add(new DeployRolesCommand());
        securityCommands.add(new DeployUsersCommand());
        commands.addAll(securityCommands);

        // Databases
        List<Command> dbCommands = new ArrayList<Command>();
        DeployHubDatabaseCommand staging = new DeployHubDatabaseCommand(STAGING_NAME);
        staging.setForestsPerHost(FORESTS_PER_HOST);
        dbCommands.add(staging);

        DeployHubDatabaseCommand finalDb = new DeployHubDatabaseCommand(FINAL_NAME);
        finalDb.setForestsPerHost(FORESTS_PER_HOST);
        dbCommands.add(finalDb);

        DeployHubDatabaseCommand tracingDb = new DeployHubDatabaseCommand(TRACING_NAME);
        dbCommands.add(tracingDb);

        dbCommands.add(new DeployModulesDatabaseCommand(MODULES_DB_NAME));
        dbCommands.add(new DeployTriggersDatabaseCommand());
        dbCommands.add(new DeploySchemasDatabaseCommand());
        commands.addAll(dbCommands);

        // App Servers
        commands.add(new DeployRestApiCommand(STAGING_NAME, stagingRestPort));
        commands.add(new DeployRestApiCommand(FINAL_NAME, finalRestPort));
        commands.add(new DeployRestApiCommand(TRACING_NAME, tracingRestPort));

        // Modules
        commands.add(new LoadModulesCommand());

        return commands;
    }



    /**
     * Uninstalls the data hub configuration and server-side modules from MarkLogic
     * @throws IOException
     */
    public void uninstall() throws IOException {
        AdminManager manager = new AdminManager();
        AppConfig config = getAppConfig();
        SimpleAppDeployer deployer = new SimpleAppDeployer(client, manager);
        deployer.setCommands(getCommands(config));
        deployer.undeploy(config);

        // clean up any lingering cache for deployed modules
        PropertiesModuleManager moduleManager = new PropertiesModuleManager(this.assetInstallTimeFile);
        moduleManager.deletePropertiesFile();
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
