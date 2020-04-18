package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand;
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.springframework.core.io.ClassPathResource;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Abstract base class for all Data Hub tests. Intended to provide a set of reusable methods for all tests.
 */
public abstract class AbstractHubTest extends LoggingObject {

    protected abstract HubConfigImpl getHubConfig();

    protected abstract File getTestProjectDirectory();

    protected abstract HubConfigImpl runAsUser(String username, String password);

    // Declaring this as many tests need one of these
    protected ObjectMapper objectMapper = new ObjectMapper();

    protected void resetHubProject() {
        XMLUnit.setIgnoreWhitespace(true);

        deleteTestProjectDirectory();
        resetDatabases();
        logger.info("Initializing test project in directory: " + getTestProjectDirectory());
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
        HubConfig hubConfig = getHubConfig();
        hubConfig.newStagingClient().newServerEval().xquery(xquery).evalAs(String.class);
        hubConfig.newFinalClient().newServerEval().xquery(xquery).evalAs(String.class);
        hubConfig.newJobDbClient().newServerEval().xquery(xquery).evalAs(String.class);
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

    /**
     * Load the files associated with the entity reference model.
     */
    protected ReferenceModelProject loadReferenceModelProject() {
        loadProjectFiles("entity-reference-model");
        return new ReferenceModelProject(getHubConfig());
    }

    /**
     * Intended to make it easy to specify a set of project files to load for a particular test. You likely will want to
     * call "resetProject" before calling this.
     *
     * @param folderInClasspath
     */
    protected void loadProjectFiles(String folderInClasspath) {
        boolean loadModules = false;
        HubProject hubProject = getHubConfig().getHubProject();
        try {
            File testProjectDir = new ClassPathResource(folderInClasspath).getFile();
            File entitiesDir = new File(testProjectDir, "entities");
            if (entitiesDir.exists()) {
                FileUtils.copyDirectory(entitiesDir, hubProject.getHubEntitiesDir().toFile());
            }

            File flowsDir = new File(testProjectDir, "flows");
            if (flowsDir.exists()) {
                FileUtils.copyDirectory(flowsDir, hubProject.getFlowsDir().toFile());
            }

            File stepDefinitionsDir = new File(testProjectDir, "step-definitions");
            if (stepDefinitionsDir.exists()) {
                FileUtils.copyDirectory(stepDefinitionsDir, hubProject.getStepDefinitionsDir().toFile());
            }

            File modulesDir = new File(testProjectDir, "modules");
            if (modulesDir.exists()) {
                FileUtils.copyDirectory(modulesDir, hubProject.getModulesDir().toFile());
                loadModules = true;
            }

        } catch (IOException e) {
            throw new RuntimeException("Unable to load project files: " + e.getMessage(), e);
        }

        if (loadModules) {
            installUserModulesAndArtifacts();
        } else {
            installUserArtifacts();
        }
    }

    protected void installUserModulesAndArtifacts() {
        installUserModulesAndArtifacts(getHubConfig(), true);
    }

    protected void installUserModulesAndArtifacts(HubConfig hubConfig, boolean forceLoad) {
        logger.debug("Installing user modules into MarkLogic");
        List<Command> commands = new ArrayList<>();

        LoadUserModulesCommand loadUserModulesCommand = new LoadUserModulesCommand(hubConfig);
        loadUserModulesCommand.setForceLoad(forceLoad);
        loadUserModulesCommand.setWatchingModules(true);
        commands.add(loadUserModulesCommand);

        commands.add(new GenerateFunctionMetadataCommand(hubConfig));

        LoadUserArtifactsCommand loadUserArtifactsCommand = new LoadUserArtifactsCommand(hubConfig);
        loadUserArtifactsCommand.setForceLoad(forceLoad);
        commands.add(loadUserArtifactsCommand);

        SimpleAppDeployer deployer = new SimpleAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());

        // Wait for post-commit triggers to finish
        waitForTasksToFinish();
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

        DatabaseClient stagingClient = getHubConfig().newStagingClient();

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
    }

    protected ObjectNode readJsonObject(String json) {
        try {
            return (ObjectNode) objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected ArrayNode readJsonArray(String json) {
        try {
            return (ArrayNode) objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
