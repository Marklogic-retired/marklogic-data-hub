package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.*;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import com.marklogic.hub.impl.Versions;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.resource.security.ProtectedPathManager;
import com.marklogic.mgmt.util.SimplePropertySource;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.regex.Pattern;

/**
 * Abstract base class for all Data Hub tests. Intended to provide a set of reusable methods for all tests.
 */
public abstract class AbstractHubTest extends AbstractHubClientTest {

    /**
     * Use this when you need access to stuff that's not in HubClient. Typically, that means you need a HubProject or
     * you're using a DH core class that depends on HubConfig.
     *
     * @return
     */
    protected abstract HubConfigImpl getHubConfig();

    protected abstract File getTestProjectDirectory();

    protected void resetHubProject() {
        XMLUnit.setIgnoreWhitespace(true);

        deleteTestProjectDirectory();
        resetDatabases();
        logger.info("Initializing test project in directory: " + getTestProjectDirectory());
        initializeTestProjectDirectory();
    }

    /**
     * Extracted so that HC can override it, since it does not have a HubProject associated with its HubConfig.
     */
    protected void initializeTestProjectDirectory() {
        getHubConfig().initHubProject();
    }

    protected void deleteTestProjectDirectory() {
        File projectDir = getTestProjectDirectory();
        if (projectDir != null && projectDir.exists()) {
            try {
                FileUtils.deleteDirectory(projectDir);
            } catch (Exception ex) {
                logger.warn("Unable to delete the project directory: " + ex.getMessage());
            }
        }
    }

    protected void resetDatabases() {
        super.resetDatabases();

        try {
            clearDatabase(getHubConfig().newStagingClient(getHubConfig().getDbName(DatabaseKind.STAGING_SCHEMAS)));
        } catch (Exception ex) {
            logger.warn("Unable to clear staging schemas database, but will continue: " + ex.getMessage());
        }
        try {
            clearDatabase(getHubConfig().newStagingClient(getHubConfig().getDbName(DatabaseKind.FINAL_SCHEMAS)));
        } catch (Exception ex) {
            logger.warn("Unable to clear final schemas database, but will continue: " + ex.getMessage());
        }
    }

    /**
     * Convenience method for updating the username/password on all configuration objects in HubConfig - specifically,
     * the ones in manageConfig, adminConfig, and the restAdmin* and appServices* ones in appConfig.
     *
     * @param mlUsername
     * @param mlPassword
     */
    protected void applyMlUsernameAndMlPassword(String mlUsername, String mlPassword) {
        Properties props = new Properties();
        props.setProperty("mlUsername", mlUsername);
        props.setProperty("mlPassword", mlPassword);

        // Need to include this so that when running tests in parallel, this doesn't default back to localhost
        props.setProperty("mlHost", getHubConfig().getHost());

        getHubConfig().applyProperties(new SimplePropertySource(props));
    }

    /**
     * Load the files associated with the entity reference model.
     */
    protected ReferenceModelProject installReferenceModelProject() {
        installProjectInFolder("entity-reference-model");
        return new ReferenceModelProject(getHubClient());
    }

    /**
     * Sometimes your test only needs the entity models in the reference project, in which case you should use this
     * method as it's quite a bit faster than installing the entire project.
     *
     * @return
     */
    protected ReferenceModelProject installOnlyReferenceModelEntities() {
        return installOnlyReferenceModelEntities(false);
    }

    protected ReferenceModelProject installOnlyReferenceModelEntities(boolean loadQueryOptions) {
        long start = System.currentTimeMillis();
        HubProject hubProject = getHubConfig().getHubProject();
        try {
            File testProjectDir = new ClassPathResource("entity-reference-model").getFile();
            File entitiesDir = new File(testProjectDir, "entities");
            if (entitiesDir.exists()) {
                FileUtils.copyDirectory(entitiesDir, hubProject.getHubEntitiesDir().toFile());
            }
            installUserModulesAndArtifacts(getHubConfig(), false, loadQueryOptions);
            logger.info("Installed only reference model entities, time: " + (System.currentTimeMillis() - start));
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
        return new ReferenceModelProject(getHubClient());
    }

    /**
     * Load the files associated with the entity reference model with an option to load query options.
     */
    protected ReferenceModelProject installReferenceModelProject(boolean loadQueryOptions) {
        installProjectInFolder("entity-reference-model", loadQueryOptions);
        return new ReferenceModelProject(getHubClient());
    }

    /**
     * Installs a project for a particular test but will not load query options.
     *
     * @param folderInClasspath
     */
    protected void installProjectInFolder(String folderInClasspath) {
        installProjectInFolder(folderInClasspath, false);
    }

    /**
     * Intended to make it easy to specify a set of project files to load for a particular test. You likely will want to
     * call "resetProject" before calling this.
     *
     * @param folderInClasspath
     * @param loadQueryOptions
     */
    protected void installProjectInFolder(String folderInClasspath, boolean loadQueryOptions) {
        long start = System.currentTimeMillis();
        boolean loadModules = false;
        HubProject hubProject = getHubConfig().getHubProject();
        try {
            File testProjectDir = new ClassPathResource(folderInClasspath).getFile();

            File dataDir = new File(testProjectDir, "data");
            if (dataDir.exists()) {
                FileUtils.copyDirectory(dataDir, new File(hubProject.getProjectDir().toFile(), "data"));
            }

            File entitiesDir = new File(testProjectDir, "entities");
            if (entitiesDir.exists()) {
                FileUtils.copyDirectory(entitiesDir, hubProject.getHubEntitiesDir().toFile());
            }

            File flowsDir = new File(testProjectDir, "flows");
            if (flowsDir.exists()) {
                FileUtils.copyDirectory(flowsDir, hubProject.getFlowsDir().toFile());
            }

            File inputDir = new File(testProjectDir, "input");
            if (inputDir.exists()) {
                FileUtils.copyDirectory(inputDir, new File(hubProject.getProjectDir().toFile(), "input"));
            }

            File mappingsDir = new File(testProjectDir, "mappings");
            if (mappingsDir.exists()) {
                FileUtils.copyDirectory(mappingsDir, hubProject.getHubMappingsDir().toFile());
            }

            File matchingDir = new File(testProjectDir, "matching");
            if (matchingDir.exists()) {
                FileUtils.copyDirectory(matchingDir, new File(hubProject.getProjectDir().toFile(), "matching"));
            }

            File stepDefinitionsDir = new File(testProjectDir, "step-definitions");
            if (stepDefinitionsDir.exists()) {
                FileUtils.copyDirectory(stepDefinitionsDir, hubProject.getStepDefinitionsDir().toFile());
            }

            File stepsDir = new File(testProjectDir, "steps");
            if (stepsDir.exists()) {
                FileUtils.copyDirectory(stepsDir, hubProject.getStepsPath().toFile());
            }

            File modulesDir = new File(testProjectDir, "modules");
            if (modulesDir.exists()) {
                FileUtils.copyDirectory(modulesDir, hubProject.getModulesDir().toFile());
                loadModules = true;
            }

            File configDir = new File(testProjectDir, "ml-config");
            if (configDir.exists()) {
                FileUtils.copyDirectory(configDir, hubProject.getUserConfigDir().toFile());
            }
        } catch (IOException e) {
            throw new RuntimeException("Unable to load project files: " + e.getMessage(), e);
        }

        if (loadModules || loadQueryOptions) {
            installUserModulesAndArtifacts(getHubConfig(), true, loadQueryOptions);
        } else {
            installUserArtifacts();
        }

        logger.info("Installed project from folder in classpath: " + folderInClasspath + "; time: " +
            (System.currentTimeMillis() - start));
    }

    /**
     * Installs user modules and artifacts without loading query options.
     *
     * @param hubConfig
     * @param forceLoad
     */
    protected void installUserModulesAndArtifacts(HubConfig hubConfig, boolean forceLoad) {
        installUserModulesAndArtifacts(hubConfig, forceLoad, false);
    }

    protected void installUserModulesAndArtifacts(HubConfig hubConfig, boolean forceLoad, boolean loadQueryOptions) {
        logger.debug("Installing user modules into MarkLogic");
        resolveAppConfigDirectories(hubConfig);
        List<Command> commands = new ArrayList<>();

        LoadUserModulesCommand loadUserModulesCommand = new LoadUserModulesCommand(hubConfig);
        loadUserModulesCommand.setForceLoad(forceLoad);
        loadUserModulesCommand.setLoadQueryOptions(loadQueryOptions);
        commands.add(loadUserModulesCommand);

        SimpleAppDeployer deployer = new SimpleAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());
        commands.clear();

        // Generate function metadata must occur after loading modules
        // and before loading mapping artifacts
        try {
            new GenerateFunctionMetadataCommand(hubConfig).generateFunctionMetadata();
        } catch (Exception ex) {
            logger.warn("Unable to generate function metadata. Catching this by default, as at least one test " +
                "- GetPrimaryEntityTypesTest - is failing in Jenkins because it cannot generate metadata for a module " +
                "for unknown reasons (the test passes locally). That test does not depend on metadata. If your test " +
                "does depend on knowing that metadata generation failed, consider overriding this to allow for the " +
                "exception to propagate; cause: " + ex.getMessage(), ex);
        }

        LoadUserArtifactsCommand loadUserArtifactsCommand = new LoadUserArtifactsCommand(hubConfig);
        loadUserArtifactsCommand.setForceLoad(forceLoad);
        commands.add(loadUserArtifactsCommand);

        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());

        // Wait for post-commit triggers to finish
        waitForTasksToFinish();

    }

    private void resolveAppConfigDirectories(HubConfig hubConfig) {
        String baseDirStr = hubConfig.getProjectDir();
        AppConfig appConfig = hubConfig.getAppConfig();
        List<ConfigDir> configDirs = appConfig.getConfigDirs();
        for (ConfigDir configDir : configDirs) {
            String configPath = configDir.getBaseDir().getPath();
            if (!configPath.contains(baseDirStr)) {
                configDir.setBaseDir(Paths.get(baseDirStr, configPath).toFile());
            }
        }
        List<String> modulePaths = appConfig.getModulePaths();
        for (String modulePath : modulePaths) {
            if (!modulePath.contains(baseDirStr)) {
                modulePaths.set(modulePaths.indexOf(modulePath), Paths.get(baseDirStr, modulePath).toString());
            }
        }
    }

    protected void installUserArtifacts() {
        LoadUserArtifactsCommand command = new LoadUserArtifactsCommand(getHubConfig());
        command.setForceLoad(true);
        new SimpleAppDeployer(getHubConfig().getManageClient(), getHubConfig().getAdminManager(), command)
            .deploy(getHubConfig().getAppConfig());
        // Wait for post-commit triggers to finish
        waitForTasksToFinish();
    }

    protected boolean isVersionCompatibleWith520Roles() {
        return new Versions(getHubClient()).getMarkLogicVersion().isVersionCompatibleWith520Roles();
    }

    /**
     * This is public and static so that it can also be invoked by RunMarkLogicUnitTestsTest. Apparently, some of these
     * database changes go away as a result of some test that runs in our test suite before RMLUTT. So RMLUTT has to
     * run this again to ensure that the indexes it depends on are present. Sigh.
     *
     * @param hubConfig
     */
    public static void applyDatabasePropertiesForTests(HubConfig hubConfig) {
        try {
            // First need to clear out existing indexes; otherwise, the Manage API will throw an error if we try to
            // update path expressions and end up removing one that an existing index depends on - even though that
            // index is being removed at the same time
            Database finalDb = new Database(new API(hubConfig.getManageClient()), hubConfig.getDbName(DatabaseKind.FINAL));
            finalDb.setRangePathIndex(new ArrayList<>());
            finalDb.setRangeElementIndex(new ArrayList<>());
            finalDb.save();

            File testFile = new ClassPathResource("test-config/databases/final-database.json").getFile();
            String payload = new String(FileCopyUtils.copyToByteArray(testFile));
            new DatabaseManager(hubConfig.getManageClient()).save(payload);

            Database stagingDb = new Database(new API(hubConfig.getManageClient()), hubConfig.getDbName(DatabaseKind.STAGING));
            stagingDb.setRangePathIndex(new ArrayList<>());
            stagingDb.setRangeElementIndex(new ArrayList<>());
            stagingDb.save();

            // Gotta rerun this command since the test file has path range indexes in it
            DeployDatabaseFieldCommand command = new DeployDatabaseFieldCommand();
            command.setResourceFilenamesIncludePattern(Pattern.compile("(staging|final)-database.xml"));
            command.execute(new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), null));
        } catch (IOException ioe) {
            throw new RuntimeException("Unable to deploy test indexes; cause: " + ioe.getMessage(), ioe);
        }
    }

    protected CommandContext newCommandContext() {
        return newCommandContext(getHubConfig());
    }

    protected CommandContext newCommandContext(HubConfig hubConfig) {
        return new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), hubConfig.getAdminManager());
    }

    /**
     * This should be run after any test that deploys protected paths based on entity models, so that those do not
     * impact other tests. It's quick enough that we may want to run it on AfterEach for every test (as if there are no
     * protected paths, it's very quick).
     */
    protected void deleteProtectedPaths() {
        runAsAdmin();
        ProtectedPathManager mgr = new ProtectedPathManager(getHubConfig().getManageClient());
        mgr.getAsXml().getListItemIdRefs().forEach(id -> {
            mgr.deleteAtPath("/manage/v2/protected-paths/" + id + "?force=true");
        });
    }

    /**
     * Convenience method for running a flow so you don't have to remember to call awaitCompletion.
     *
     * @param flowInputs
     * @return
     */
    protected RunFlowResponse runFlow(FlowInputs flowInputs) {
        makeInputFilePathsAbsoluteInFlow(flowInputs.getFlowName());
        FlowRunnerImpl flowRunner = new FlowRunnerImpl(getHubClient());
        RunFlowResponse response = flowRunner.runFlow(flowInputs);
        flowRunner.awaitCompletion();
        return response;
    }

    protected void waitForReindex(HubClient hubClient, String database){
        String query = "(\n" +
            "  for $forest-id in xdmp:database-forests(xdmp:database('" + database + "'))\n" +
            "  return xdmp:forest-status($forest-id)//*:reindexing\n" +
            ") = fn:true()";
        boolean currentStatus;
        int attempts = 125;
        boolean previousStatus = false;
        do{
            sleep(200L);
            currentStatus = Boolean.parseBoolean(hubClient.getStagingClient().newServerEval().xquery(query).evalAs(String.class));
            if(currentStatus){
                logger.info("Reindexing staging database");
            }
            if(!currentStatus && previousStatus){
                logger.info("Finished reindexing staging database");
                return;
            }
            else{
                previousStatus = currentStatus;
            }
            attempts--;
        }
        while(attempts > 0);
        if(currentStatus){
            logger.warn("Reindexing is taking more than 25 seconds");
        }
    }

    protected HubProjectImpl getHubProject() {
        return (HubProjectImpl) getHubConfig().getHubProject();
    }

    /**
     * This is needed for running flows without a HubProject because if the paths are relative (which they are by
     * default), then a HubProject is needed to resolve them into absolute paths.
     */
    protected void makeInputFilePathsAbsoluteInFlow(String flowName) {
        final String flowFilename = flowName + ".flow.json";
        try {
            Path projectDir = getHubProject().getProjectDir();
            final File flowFile = projectDir.resolve("flows").resolve(flowFilename).toFile();
            JsonNode flow = objectMapper.readTree(flowFile);
            makeInputFilePathsAbsoluteForFlow(flow, projectDir.toFile().getAbsolutePath());
            objectMapper.writeValue(flowFile, flow);

            // Have to run as a developer in order to update the flow document
            runAsDataHubDeveloper();
            JSONDocumentManager mgr = getHubClient().getStagingClient().newJSONDocumentManager();
            final String uri = "/flows/" + flowFilename;
            if (mgr.exists(uri) != null) {
                DocumentMetadataHandle metadata = mgr.readMetadata("/flows/" + flowFilename, new DocumentMetadataHandle());
                mgr.write("/flows/" + flowFilename, metadata, new JacksonHandle(flow));
            }
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    protected void makeInputFilePathsAbsoluteForFlow(JsonNode flow, String projectDir) {
        JsonNode steps = flow.get("steps");
        steps.fieldNames().forEachRemaining(name -> {
            JsonNode step = steps.get(name);
            if (step.has("fileLocations")) {
                ObjectNode fileLocations = (ObjectNode) step.get("fileLocations");
                makeInputFilePathsAbsolute(fileLocations, projectDir);
            }
        });
    }

    protected void makeInputFilePathsAbsolute(ObjectNode fileLocations, String projectDir) {
        if (fileLocations.has("inputFilePath")) {
            String currentPath = fileLocations.get("inputFilePath").asText();
            if (!Paths.get(currentPath).isAbsolute()) {
                fileLocations.put("inputFilePath", projectDir + "/" + currentPath);
            }
        }
    }
    protected int getDocumentCount(DatabaseClient client) {
        String query = "cts.estimate(cts.trueQuery())";
        return Integer.parseInt(client.newServerEval().javascript(query).evalAs(String.class));
    }
}
