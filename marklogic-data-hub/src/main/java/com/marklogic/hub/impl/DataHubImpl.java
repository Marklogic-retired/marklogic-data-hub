/*
 * Copyright (c) 2020 MarkLogic Corporation
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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandMapBuilder;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.appdeployer.command.appservers.UpdateRestApiServersCommand;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.forests.DeployCustomForestsCommand;
import com.marklogic.appdeployer.command.modules.DeleteTestModulesCommand;
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.appdeployer.command.security.*;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.admin.ResourceExtensionsManager;
import com.marklogic.client.admin.ServerConfigurationManager;
import com.marklogic.client.admin.TransformExtensionsManager;
import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.impl.DocumentWriteOperationImpl;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.QueryOptionsListHandle;
import com.marklogic.hub.*;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.*;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;
import com.marklogic.rest.util.ResourcesFragment;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Component
public class DataHubImpl implements DataHub, InitializingBean {

    @Autowired
    private HubConfig hubConfig;

    private HubClient hubClient;

    private LoadHubModulesCommand loadHubModulesCommand;

    private LoadUserModulesCommand loadUserModulesCommand;

    private LoadUserArtifactsCommand loadUserArtifactsCommand;

    private LoadHubArtifactsCommand loadHubArtifactsCommand;

    private GenerateFunctionMetadataCommand generateFunctionMetadataCommand;

    private Versions versions;

    @Autowired
    private FlowRunner flowRunner;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public DataHubImpl() {
        super();
    }

    public DataHubImpl(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
        afterPropertiesSet();
    }

    /**
     * Only use this constructor for the clearUserData operation, which does not depend on a HubConfig.
     *
     * @param hubClient
     */
    public DataHubImpl(HubClient hubClient) {
        this();
        this.hubClient = hubClient;
    }

    public void afterPropertiesSet() {
        this.versions = new Versions(hubConfig);
        this.generateFunctionMetadataCommand = new GenerateFunctionMetadataCommand(hubConfig);
        this.loadHubModulesCommand = new LoadHubModulesCommand(hubConfig);
        this.loadUserModulesCommand = new LoadUserModulesCommand(hubConfig);
        this.loadUserArtifactsCommand = new LoadUserArtifactsCommand(hubConfig);
        this.loadHubArtifactsCommand = new LoadHubArtifactsCommand(hubConfig);
    }

    /**
     * Need to account for the group name in case the user has overridden the name of the "Default" group.
     *
     * @param hubConfig hubConfig object
     * @return constructed ServerManager object
     */
    protected ServerManager constructServerManager(HubConfig hubConfig) {
        AppConfig appConfig = hubConfig.getAppConfig();
        return appConfig != null ?
            new ServerManager(hubConfig.getManageClient(), appConfig.getGroupName()) :
            new ServerManager(hubConfig.getManageClient());
    }

    @Override
    public void clearDatabase(String database) {
        getDatabaseManager().clearDatabase(database);
    }

    private AdminManager getAdminManager() {
        return hubConfig.getAdminManager();
    }

    private ManageClient getManageClient() {
        return hubConfig.getManageClient();
    }

    private DatabaseManager getDatabaseManager() {
        return new DatabaseManager(getManageClient());
    }

    @Override
    public FlowRunner getFlowRunner() {
        return  this.flowRunner;
    }

    @Override
    public InstallInfo isInstalled() throws ResourceAccessException {

        InstallInfo installInfo = InstallInfo.create();

        if (hubConfig.getIsProvisionedEnvironment()) {
            return assumedProvisionedInstallInfo(installInfo);
        } else {
            ResourcesFragment srf = null;
            try {
                srf = constructServerManager(hubConfig).getAsXml();
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
        try{
            Versions.MarkLogicVersion serverVersion = versions.getMLVersion(versionString);
            if (!(serverVersion.getMajor() == 9 || serverVersion.getMajor() == 10)) {
                return false;
            }
            if(serverVersion.isNightly()){
                //The dates are the nightly servers on the day the least supported server versions (9.0-11, 10.0-2) were released
                if(serverVersion.getMajor() == 9) {
                    Date minDate = new GregorianCalendar(2019, Calendar.NOVEMBER, 12).getTime();
                    Date date = new SimpleDateFormat("y-M-d").parse(serverVersion.getDateString());
                    if (date.before(minDate)) {
                        return false;
                    }
                }
                if(serverVersion.getMajor() == 10) {
                    Date minDate = new GregorianCalendar(2019, Calendar.SEPTEMBER, 12).getTime();
                    Date date = new SimpleDateFormat("y-M-d").parse(serverVersion.getDateString());
                    if (date.before(minDate)) {
                        return false;
                    }
                }
            }
            /*  Using 9.0-11 ensures mapping step always executes "entity-services-mapping" step definition. 9.0-11  server
                included a bunch of entity services related bugfixes 52810, 53034, 52735, 52772, 52905, 53199 ,53409
             */
            else {
                if(serverVersion.getMajor() == 9){
                    if(serverVersion.getMinor() < 1100) {
                        return false;
                    }
                }
                if(serverVersion.getMajor() == 10){
                    if(serverVersion.getMinor() < 200) {
                        return false;
                    }
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
        clearUserModules(null);
    }

    /**
     *
     * @param resourceNamesToNotDelete optional list of names of resources that should not be deleted; can be null;
     *                                 introduced for the sake of DHF tests so that marklogic-unit-test will not be deleted
     */
    public void clearUserModules(List<String> resourceNamesToNotDelete) {
        logger.info("Clearing user modules");
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DataHub.class.getClassLoader());
        try {
            HashSet<String> dataHubOptions = new HashSet<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/options/*.xml")) {
                dataHubOptions.add(r.getFilename().replace(".xml", ""));
            }
            for (Resource r : resolver.getResources("classpath*:/ml-modules-final/options/*.xml")) {
                dataHubOptions.add(r.getFilename().replace(".xml", ""));
            }
            for (Resource r : resolver.getResources("classpath*:/ml-modules-traces/options/*.xml")) {
                dataHubOptions.add(r.getFilename().replace(".xml", ""));
            }
            for (Resource r : resolver.getResources("classpath*:/ml-modules-jobs/options/*.xml")) {
                dataHubOptions.add(r.getFilename().replace(".xml", ""));
            }

            HashSet<String> dataHubServices = new HashSet<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/services/*")) {
                dataHubServices.add(r.getFilename().replaceAll("\\.(sjs|xqy)$",""));
            }

            HashSet<String> dataHubTransforms = new HashSet<>();
            for (Resource r : resolver.getResources("classpath*:/ml-modules/transforms/*")) {
                dataHubTransforms.add(r.getFilename().replaceAll("\\.(sjs|xqy)$",""));
            }

            ServerConfigurationManager configMgr = hubConfig.newStagingClient().newServerConfigManager();
            QueryOptionsManager stagingOptionsManager = configMgr.newQueryOptionsManager();

            // remove options using mgr.
            QueryOptionsListHandle handle = stagingOptionsManager.optionsList(new QueryOptionsListHandle());
            Map<String, String> optionsMap = handle.getValuesMap();
            optionsMap.keySet().forEach(
                optionsName -> {
                    if (!dataHubOptions.contains(optionsName)) {
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
                    if (!dataHubOptions.contains(optionsName)) {
                        finalOptionsManager.deleteOptions(optionsName);
                    }
                }
            );

            // remove transforms using amped channel
            TransformExtensionsManager transformExtensionsManager = configMgr.newTransformExtensionsManager();
            JsonNode transformsList = transformExtensionsManager.listTransforms(new JacksonHandle()).get();
            transformsList.findValuesAsText("name").forEach(
                x -> {
                    if (!(dataHubTransforms.contains(x) || x.startsWith("ml"))) {
                        transformExtensionsManager.deleteTransform(x);
                    }
                }
            );

            // remove resource extensions
            ResourceExtensionsManager resourceExtensionsManager = configMgr.newResourceExtensionsManager();
            JsonNode resourceExtensions = resourceExtensionsManager.listServices(new JacksonHandle()).get();
            if (resourceNamesToNotDelete == null) {
                resourceNamesToNotDelete = new ArrayList<>(); // makes the boolean logic below simpler
            }
            for (String resourceName : resourceExtensions.findValuesAsText("name")) {
                if (!dataHubServices.contains(resourceName) && !resourceName.startsWith("ml") && !resourceNamesToNotDelete.contains(resourceName)) {
                    resourceExtensionsManager.deleteServices(resourceName);
                }
            }

            String query =
                "cts:uris((),(),cts:not-query(cts:collection-query('hub-core-module')))[\n" +
                    "  fn:not(\n" +
                    "    fn:matches(., \"^.+options/(" + String.join("|", dataHubOptions) + ").xml$\") or\n" +
                    "    fn:starts-with(., '/marklogic.rest.') or\n" +
                    // Retain compiled mappings for OOTB mapping functions
                    "    fn:starts-with(., '/data-hub/5/mapping-functions/')\n" +
                    "  )\n" +
                    "] ! xdmp:document-delete(.)\n";
            runInDatabase(query, hubConfig.getDbName(DatabaseKind.MODULES));
        } catch (Exception e) {
            logger.error("Failed to clear user modules, cause: " + e.getMessage(), e);
        }
        logger.info("Finished clearing user modules");
    }

    public void deleteDocument(String uri, DatabaseKind databaseKind) {
        String query = "xdmp:document-delete(\"" + uri + "\")";
        logger.info("Deleting URI " + uri + " from " + databaseKind + " database.");
        runInDatabase(query, hubConfig.getDbName(databaseKind));
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
    public Map<String, Object> runPreInstallCheck() {
        return runPreInstallCheck(constructServerManager(hubConfig));
    }

    /**
     * This overloaded version was added to facilitate mock testing - i.e. to be able to mock which ports are available.
     *
     * @param serverManager
     * @return
     */
    protected Map<String, Object> runPreInstallCheck(ServerManager serverManager) {
        Map<Integer, String> portsInUse;

        try {
            portsInUse = getServerPortsInUse(serverManager);
        } catch (HttpClientErrorException e) {
            logger.warn("Used non-existing user to verify data hub.  Usually this means a fresh system, ready to install.");
            Map<String, Object> response = new HashMap<>();
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
        Map<String, Object> response = new HashMap<>();
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

        AppConfig appConfig = hubConfig.getAppConfig();
        disableSomeCmaUsage(appConfig);

        // When setting up the test application, there's a chance of having duplicate modules due to modules existing in
        // multiple places on the classpath. For the purpose of loading DH modules, this can be avoided by setting the
        // batch size for loading modules to 1.
        appConfig.setModulesLoaderBatchSize(1);

        // in AWS setting this fails...
        // for now putting in try/catch
        try {
            SimpleAppDeployer roleDeployer = new SimpleAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager());
            roleDeployer.setCommands(getSecurityCommandList());
            roleDeployer.deploy(appConfig);
        } catch (HttpServerErrorException e) {
            if (e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) {
                logger.warn("No manage client for security installs.  Assuming DHS provisioning already there");
            } else {
                throw new DataHubConfigurationException(e);
            }
        }

        HubAppDeployer finalDeployer = new HubAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager(), listener, hubConfig.newStagingClient());
        finalDeployer.setCommands(buildListOfCommands());
        finalDeployer.deploy(appConfig);
    }

    /**
     * Turns off CMA for some resources that have bbugs in ML 9.0-7/8.
     *
     * @param appConfig
     */
    protected void disableSomeCmaUsage(AppConfig appConfig) {
        appConfig.getCmaConfig().setCombineRequests(false);
        appConfig.getCmaConfig().setDeployDatabases(false);
        appConfig.getCmaConfig().setDeployRoles(false);
        appConfig.getCmaConfig().setDeployUsers(false);
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
        // First deploy protected paths (can add more resources here in the future)
        AppConfig appConfig = hubConfig.getAppConfig();
        new SimpleAppDeployer(getManageClient(), getAdminManager(), new DeployProtectedPathsCommand()).deploy(appConfig);

        // Then deploy databases, utilizing a pattern for filenames when in a provisioned environment
        SimpleAppDeployer deployer = new SimpleAppDeployer(getManageClient(), getAdminManager());
        Map<String, List<Command>> commandMap = buildCommandMap();
        List<Command> indexRelatedCommands = new ArrayList<>();
        indexRelatedCommands.addAll(commandMap.get("mlDatabaseCommands"));
        deployer.setCommands(indexRelatedCommands);
        final boolean originalCreateForests = appConfig.isCreateForests();
        final Pattern originalIncludePattern = appConfig.getResourceFilenamesIncludePattern();
        try {
            appConfig.setCreateForests(false);
            if (hubConfig.getIsProvisionedEnvironment()) {
                appConfig.setResourceFilenamesIncludePattern(buildPatternForDatabasesToUpdateIndexesFor());
            }
            deployer.deploy(appConfig);
        } finally {
            appConfig.setCreateForests(originalCreateForests);
            appConfig.setResourceFilenamesIncludePattern(originalIncludePattern);
        }
    }

    /**
     * In a provisioned environment, only the databases defined by this pattern can be updated.
     *
     * @return database name pattern
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

        HubAppDeployer finalDeployer = new HubAppDeployer(getManageClient(), getAdminManager(), listener, hubConfig.newStagingClient());
        finalDeployer.setCommands(commandMap);
        finalDeployer.undeploy(hubConfig.getAppConfig());
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
        eval.xquery(xqy).eval().close();
    }

    public Map<String, List<Command>> buildCommandMap() {
        Map<String, List<Command>> commandMap = new CommandMapBuilder().buildCommandMap();

        updateDatabaseCommandList(commandMap);

        updateServerCommandList(commandMap);

        updateTriggersCommandList(commandMap);

        updateModuleCommandList(commandMap);

        // DHF has no use case for the "deploy REST API server" commands provided by ml-gradle
        commandMap.remove("mlRestApiCommands");

        // DHF has a custom property named "mlCustomForestPath" that has to be set on this command.
        List<Command> forestCommands = commandMap.get("mlForestCommands");
        DeployCustomForestsCommand deployCustomForestsCommand = (DeployCustomForestsCommand) forestCommands.get(0);
        deployCustomForestsCommand.setCustomForestsPath(hubConfig.getCustomForestPath());

        List<Command> granularPrivilegeCommands = new ArrayList<>();
        granularPrivilegeCommands.add(new CreateGranularPrivilegesCommand(hubConfig));
        commandMap.put("hubGranularPrivilegeCommands", granularPrivilegeCommands);

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
            dbCommands.add(c);
            if (c instanceof DeployOtherDatabasesCommand) {
                ((DeployOtherDatabasesCommand)c).setDeployDatabaseCommandFactory(new HubDeployDatabaseCommandFactory(hubConfig));
            }
        }
        // This ensures that this command is run when mlDeployDatabases is run
        dbCommands.add(new DeployDatabaseFieldCommand());
        commandMap.put("mlDatabaseCommands", dbCommands);
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
     * The existing "DeployTriggersCommand" is based on the ml-config path and the AppConfig object should set the default
     * triggers database name to that of the final triggers database. Thus, we just need to add a hub-specific command for
     * loading staging triggers into the staging triggers database.
     *
     */
    private void updateTriggersCommandList(Map<String, List<Command>> commandMap) {
        List<Command> commands = commandMap.get("mlTriggerCommands");
        commands.add(new DeployHubTriggersCommand(hubConfig.getStagingTriggersDbName()));
    }

    /**
     * This affects what mlLoadModules does. We want it to load all modules, including hub modules. This supports a
     * scenario where a user may clear her modules database; mlLoadModules should then load everything in.
     *
     * @param commandsMap
     */
    private void updateModuleCommandList(Map<String, List<Command>> commandsMap) {
        List<Command> commands = new ArrayList<>();
        commands.add(loadHubModulesCommand);
        commands.add(loadUserModulesCommand);
        commands.add(loadUserArtifactsCommand);
        commands.add(loadHubArtifactsCommand);
        commands.add(generateFunctionMetadataCommand);

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

    private Map<Integer, String> getServerPortsInUse(ServerManager serverManager) {
        Map<Integer, String> portsInUse = new HashMap<>();
        ResourcesFragment srf = serverManager.getAsXml();
        srf.getListItemNameRefs().forEach(s -> {
            Fragment fragment = serverManager.getPropertiesAsXml(s);
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
        if(serverVersion == null) {
            serverVersion = versions.getMarkLogicVersion();
        }
        return serverVersion;
    }

    @Override
    public void setServerVersion(String serverVersion) {
        this.serverVersion = serverVersion;
    }

    @Override
    public boolean upgradeHub() {
        boolean isHubInstalled;
        try {
            isHubInstalled = this.isInstalled().isInstalled();
        } catch (ResourceAccessException e) {
            isHubInstalled = false;
        }

        if (isHubInstalled) {
            final String minUpgradeVersion = "4.3.0";
            final String installedVersion = versions.getInstalledVersion();
            // Warn is used so this appears when using Gradle without "-i"
            logger.warn("Currently installed DHF version: " + installedVersion);
            if (Versions.compare(installedVersion, minUpgradeVersion) == -1) {
                throw new RuntimeException("Cannot upgrade installed Data Hub; its version is " + installedVersion + ", and must be at least version " + minUpgradeVersion + " or higher");
            }
        }

        verifyLocalProjectIs430OrGreater();

        boolean result = false;

        try {
            if (hubConfig.getHubProject().isInitialized()) {
                prepareProjectBeforeUpgrading(hubConfig.getHubProject(), hubConfig.getJarVersion());
                hubConfig.getHubSecurityDir().resolve("roles").resolve("flow-operator.json").toFile().delete();
            }

            hubConfig.initHubProject();
            hubConfig.getHubProject().upgradeProject();
            System.out.println("Starting in version 5.2.0, the default value of mlModulePermissions has been changed to \"data-hub-module-reader,read,data-hub-module-reader,execute,data-hub-module-writer,update,rest-extension-user,execute\". " +
                "It is recommended to remove this property from gradle.properties unless you must customize the value." );

            result = true;
        } catch (IOException e) {
            logger.error("Unable to upgrade project, cause: " + e.getMessage(), e);
        }

        return result;
    }

    /**
     * Per DHFPROD-4912, instead of depending on mlDHFVersion, this logic takes advantage of the fact that the
     * hub-internal-config triggers - including ml-dh-entity-create.json - had their permissions modified in the 4.3.0
     * release.
     */
    protected void verifyLocalProjectIs430OrGreater() {
        File triggersDir = hubConfig.getHubProject().getHubTriggersDir().toFile();
        if (!triggersDir.exists()) {
            // If the internal triggers dir doesn't exist, then the project hasn't been initialized yet. That means
            // we aren't trying to upgrade a pre-4.3.0 project, so the "upgrade" is safe to proceed.
            return;
        }

        File triggerFile = new File(triggersDir, "ml-dh-entity-create.json");
        boolean canBeUpgraded = true;
        try {
            JsonNode trigger = new ObjectMapper().readTree(triggerFile);
            final String roleName = trigger.get("permission").get(0).get("role-name").asText();
            if ("%%mlHubAdminRole%%".equals(roleName) || "%%mlHubUserRole%%".equals(roleName)) {
                canBeUpgraded = false;
            }
        } catch (Exception ex) {
            throw new RuntimeException("Unable to upgrade project; while trying to verify that the local project is of " +
                "version 4.3.0 or greater, was unable to read JSON from ml-dh-entity-create.json file; cause: " + ex.getMessage(), ex);
        }

        if (!canBeUpgraded) {
            throw new RuntimeException("Unable to upgrade current project, as its version is less than 4.3.0. Please " +
                "first upgrade this project to 4.3.0. Consult the Data Hub documentation on performing this upgrade.");
        }
    }

    /**
     * The expectation is that a user has upgraded build.gradle to use a newer version of DHF but has not yet updated
     * mlDHFVersion in gradle.properties. Thus, the value of mlDHFVersion is expected to be passed in here so that the
     * backup path of hub-internal-config has the current version of DHF in its name.
     *
     * @param hubProject
     * @param newDataHubVersion
     * @throws IOException
     */
    protected void prepareProjectBeforeUpgrading(HubProject hubProject, String newDataHubVersion) throws IOException {
        final String backupPath = HubProject.HUB_CONFIG_DIR + "-pre-" + newDataHubVersion;
        FileUtils.copyDirectory(hubProject.getHubConfigDir().toFile(), hubProject.getProjectDir().resolve(backupPath).toFile());
        logger.warn("The " + HubProject.HUB_CONFIG_DIR + " directory has been moved to " + backupPath + " so that it can be re-initialized using the new version of Data Hub");
    }

    // only used in test
    public void setHubConfig(HubConfigImpl hubConfig) {
        this.hubConfig = hubConfig;
        if (this.loadUserModulesCommand != null) {
            this.loadUserModulesCommand.setHubConfig(hubConfig);
        }
        if (this.loadHubModulesCommand != null) {
            this.loadHubModulesCommand.setHubConfig(hubConfig);
        }
        if (this.loadHubArtifactsCommand != null) {
            this.loadHubArtifactsCommand.setHubConfig(hubConfig);
        }
        if (this.loadUserArtifactsCommand != null) {
            this.loadUserArtifactsCommand.setHubConfig(hubConfig);
        }
        if (this.generateFunctionMetadataCommand != null) {
            this.generateFunctionMetadataCommand.setHubConfig(hubConfig);
        }
    }

    // only used in test
    public HubConfig getHubConfig() {
        return this.hubConfig;
    }

    // only used in test
    public void setVersions(Versions versions) {
        this.versions = versions;
    }

    /**
     * Clear "user data", which is anything that's not a user or hub artifact. Depends on the ability to clear the
     * staging, final, and job databases. An error will be thrown if a user doesn't have the privilege to perform any
     * of those operations.
     *
     * This is intentionally not exposed in the DataHub interface, as there's no use case yet for a client of this
     * library to perform this operation. It can instead be accessed via Hub Central and Gradle.
     */
    public void clearUserData() {
        final HubClient hubClientToUse = hubClient != null ? hubClient : hubConfig.newHubClient();

        long start = System.currentTimeMillis();
        logger.info("Clearing user data as user: " + hubClientToUse.getUsername());

        final List<DocumentWriteOperation> userAndHubArtifacts = readUserAndHubArtifacts(hubClientToUse);
        logger.info("Count of user and hub artifacts read into memory: " + userAndHubArtifacts.size());

        final DatabaseManager databaseManager = new DatabaseManager(hubClientToUse.getManageClient());
        Stream.of(hubClientToUse.getDbName(DatabaseKind.STAGING), hubClientToUse.getDbName(DatabaseKind.FINAL), hubClientToUse.getDbName(DatabaseKind.JOB)).forEach(db -> {
            logger.info("Clearing database: " + db);
            final boolean catchException = false;
            databaseManager.clearDatabase(db, catchException);
        });

        writeUserAndHubArtifacts(hubClientToUse, userAndHubArtifacts);
        logger.info("Finished clearing user data; time elapsed: " + (System.currentTimeMillis() - start));
    }

    /**
     * Uses the REST API to determine the URIs of the artifacts that need to be read into memory, as the REST API will
     * also be used to actually read the documents and their metadata into memory.
     *
     * @param hubClientToUse
     * @return
     */
    private List<DocumentWriteOperation> readUserAndHubArtifacts(HubClient hubClientToUse) {
        List<DocumentWriteOperation> docs = new ArrayList<>();
        JSONDocumentManager mgr = hubClientToUse.getStagingClient().newJSONDocumentManager();
        final String script = "const consts = require('/data-hub/5/impl/consts.sjs');\n" +
            "cts.uris(null, null, " +
            "   cts.collectionQuery(consts.USER_ARTIFACT_COLLECTIONS.concat(consts.HUB_ARTIFACT_COLLECTION).concat('http://marklogic.com/data-hub/mappings'))" +
            ")";
        EvalResultIterator resultIterator = hubClientToUse.getStagingClient().newServerEval().javascript(script).eval();
        resultIterator.iterator().forEachRemaining(item -> {
            final String uri = item.getString();
            DocumentMetadataHandle metadata = new DocumentMetadataHandle();
            JacksonHandle content = new JacksonHandle();
            mgr.read(uri, metadata, content);
            docs.add(new DocumentWriteOperationImpl(DocumentWriteOperation.OperationType.DOCUMENT_WRITE, uri, metadata, content));
        });
        resultIterator.close();
        return docs;
    }

    /**
     * After clearing the databases of user data, write the user and hub artifacts back to staging and final.
     *
     * @param hubClientToUse
     * @param userAndHubArtifacts
     */
    private void writeUserAndHubArtifacts(HubClient hubClientToUse, List<DocumentWriteOperation> userAndHubArtifacts) {
        JSONDocumentManager stagingManager = hubClientToUse.getStagingClient().newJSONDocumentManager();
        JSONDocumentManager finalManager = hubClientToUse.getFinalClient().newJSONDocumentManager();
        DocumentWriteSet stagingSet = stagingManager.newWriteSet();
        DocumentWriteSet finalSet = finalManager.newWriteSet();
        userAndHubArtifacts.forEach(doc -> {
            stagingSet.add(doc);
            finalSet.add(doc);
        });
        logger.info("Writing user and hub artifacts to staging; count: " + stagingSet.size());
        stagingManager.write(stagingSet);
        logger.info("Writing user and hub artifacts to final; count: " + stagingSet.size());
        finalManager.write(finalSet);
        logger.info("Finished writing user and hub artifacts to staging and final");
    }
}
