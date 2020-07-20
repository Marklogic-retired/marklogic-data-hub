package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand;
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.Versions;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.User;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.util.SimplePropertySource;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.regex.Pattern;

/**
 * Abstract base class for all Data Hub tests. Intended to provide a set of reusable methods for all tests.
 */
public abstract class AbstractHubTest extends TestObject {

    /**
     * Tests should prefer this over getHubConfig, but of course use getHubConfig if HubClient doesn't provide something
     * that you need.
     *
     * @return
     */
    protected abstract HubClient getHubClient();

    /**
     * Use this when you need access to stuff that's not in HubClient. Typically, that means you need a HubProject or
     * you're using a DH core class that depends on HubConfig.
     *
     * @return
     */
    protected abstract HubConfigImpl getHubConfig();

    protected abstract File getTestProjectDirectory();

    protected abstract HubConfigImpl runAsUser(String username, String password);

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
            } catch (IOException ex) {
                logger.warn("Unable to delete the project directory", ex);
            }
        }
    }

    protected void resetDatabases() {
        // Admin is needed to clear out provenance data
        runAsAdmin();
        String xquery = "cts:uris((), (), cts:not-query(cts:collection-query('hub-core-artifact'))) ! xdmp:document-delete(.)";
        HubClient hubClient = getHubClient();
        hubClient.getStagingClient().newServerEval().xquery(xquery).evalAs(String.class);
        hubClient.getFinalClient().newServerEval().xquery(xquery).evalAs(String.class);
        hubClient.getJobsClient().newServerEval().xquery(xquery).evalAs(String.class);
    }

    protected HubConfigImpl runAsDataHubDeveloper() {
        return runAsUser("test-data-hub-developer", "password");
    }

    protected HubConfigImpl runAsDataHubOperator() {
        return runAsUser("test-data-hub-operator", "password");
    }

    protected HubConfigImpl runAsAdmin() {
        return runAsUser("test-admin-for-data-hub-tests", "password");
    }

    protected HubConfigImpl runAsTestUserWithRoles(String... roles) {
        setTestUserRoles(roles);
        return runAsTestUser();
    }

    protected HubConfigImpl runAsTestUser() {
        return runAsUser("test-data-hub-user", "password");
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
        getHubConfig().applyProperties(new SimplePropertySource(props));
    }

    /**
     * Each test is free to modify the roles on this user so it can be used for any purpose. Such tests should not
     * make any assumptions about what roles this user does have entering into the test.
     *
     * @param roles
     */
    protected void setTestUserRoles(String... roles) {
        runAsAdmin();

        User user = new User(new API(getHubConfig().getManageClient()), "test-data-hub-user");
        user.setRole(Arrays.asList(roles));
        user.setPassword("password");
        user.save();
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
        for (ConfigDir configDir:configDirs) {
            String configPath = configDir.getBaseDir().getPath();
            if (!configPath.contains(baseDirStr)) {
                configDir.setBaseDir(Paths.get(baseDirStr, configPath).toFile());
            }
        }
        List<String> modulePaths = appConfig.getModulePaths();
        for (String modulePath: modulePaths) {
            if (!modulePath.contains(baseDirStr)) {
                modulePaths.set(modulePaths.indexOf(modulePath),Paths.get(baseDirStr,modulePath).toString());
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

    /**
     * Use this anytime a test needs to wait for things that run on the ML task server - generally, post-commit triggers
     * - to finish, without resorting to arbitrary Thread.sleep calls that don't always work and often require more
     * waiting than necessary.
     */
    protected void waitForTasksToFinish() {
        String query = "xquery version '1.0-ml';" +
            "\n declare namespace ss = 'http://marklogic.com/xdmp/status/server';" +
            "\n declare namespace hs = 'http://marklogic.com/xdmp/status/host';" +
            "\n let $task-server-id as xs:unsignedLong := xdmp:host-status(xdmp:host())//hs:task-server-id" +
            "\n return fn:count(xdmp:server-status(xdmp:host(), $task-server-id)/ss:request-statuses/*)";

        final int maxTries = 100;
        final long sleepPeriod = 200;

        DatabaseClient stagingClient = getHubClient().getStagingClient();

        int taskCount = Integer.parseInt(stagingClient.newServerEval().xquery(query).evalAs(String.class));
        int tries = 0;
        logger.debug("Waiting for task server tasks to finish, count: " + taskCount);
        while (taskCount > 0 && tries < maxTries) {
            tries++;
            try {
                Thread.sleep(sleepPeriod);
            } catch (Exception ex) {
                // ignore
            }
            taskCount = Integer.parseInt(stagingClient.newServerEval().xquery(query).evalAs(String.class));
            logger.debug("Waiting for task server tasks to finish, count: " + taskCount);
        }

        // Hack for cluster tests - if there's more than one host, wait a couple more seconds. Sigh.
        String secondHost = stagingClient.newServerEval().xquery("xdmp:hosts()[2]").evalAs(String.class);
        if (StringUtils.hasText(secondHost)) {
            sleep(2000);
        }
    }

    protected boolean isVersionCompatibleWith520Roles() {
        Versions.MarkLogicVersion serverVersion = new Versions(getHubClient()).getMLVersion();
        if (serverVersion.isNightly()) {
            return (serverVersion.getMajor() == 10);
        }
        return (serverVersion.getMajor() == 10 && serverVersion.getMinor() >= 300);
    }

    protected JsonNode getStagingDoc(String uri) {
        return getHubClient().getStagingClient().newJSONDocumentManager().read(uri, new JacksonHandle()).get();
    }

    protected JsonNode getFinalDoc(String uri) {
        return getHubClient().getFinalClient().newJSONDocumentManager().read(uri, new JacksonHandle()).get();
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
            File testFile = new ClassPathResource("test-config/databases/final-database.json").getFile();
            String payload = new String(FileCopyUtils.copyToByteArray(testFile));
            new DatabaseManager(hubConfig.getManageClient()).save(payload);
            // Gotta rerun this command since the test file has path range indexes in it
            DeployDatabaseFieldCommand command = new DeployDatabaseFieldCommand();
            command.setResourceFilenamesIncludePattern(Pattern.compile("final-database.xml"));
            command.execute(new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), null));
        } catch (IOException ioe) {
            throw new RuntimeException("Unable to deploy test indexes", ioe);
        }
    }

    protected CommandContext newCommandContext() {
        return newCommandContext(getHubConfig());
    }

    protected CommandContext newCommandContext(HubConfig hubConfig) {
        return new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), hubConfig.getAdminManager());
    }
}
