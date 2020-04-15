package com.marklogic.hub.central;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.central.models.HubConfigSession;
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.BeforeEach;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.TestPropertySource;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;

/**
 * Intended base class for any test that wishes to connect to MarkLogic. Tests that do not have any need to connect to
 * MarkLogic do not need to extend this and typically will have no reason to extend this.
 * <p>
 * To run any JUnit test in this project, you should first follow the instructions in this repository's CONTRIBUTING.md
 * file for installing a "test" Data Hub instance for developing and running tests.
 * <p>
 * The main purpose of this class is to prepare the test DH instance before a test is run. See the beforeEachTest
 * method for more information on this. The intent here is that a test is free to leave any data behind that it wants
 * in the staging/final/job databases, as that data will be deleted before the next test runs. This allows you to
 * inspect the results of a test, which is often very helpful for debugging.
 * <p>
 * In addition to preparing the test instance, this class provides a handful of utility fields and methods that are
 * commonly needed in tests, such as logging, selecting a user to run a test as, and reading JSON data. New methods and
 * fields should only be added if they are truly reusable across a wide swath of tests. If you have something that's
 * reusable for a handful of tests, consider extending this with a feature-specific base test class that defines those
 * reusable methods. Or toss the reusable methods into a class that a test can instantiate when it wants to reuse those
 * methods.
 * <p>
 * In short - try to keep this class fairly lean so that it's easy for developers to find methods to reuse that are
 * likely applicable to their testing needs.
 */
@TestPropertySource("classpath:application-test.properties")
@SpringBootTest(classes = {Application.class})
public abstract class AbstractHubCentralTest {

    final protected Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    protected HubConfigSession hubConfigSession;

    protected TestConstants testConstants;

    // Declaring this as many tests need one of these
    protected ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    HubCentral hubCentral;

    private String testProjectDirectory = "build/hub-central-test-project";
    private HubProject testHubProject;

    @BeforeEach
    void beforeEachTest() throws IOException {
        long start = System.currentTimeMillis();

        FileUtils.deleteDirectory(new File(testProjectDirectory));

        testHubProject = new HubProjectImpl();
        testHubProject.createProject(testProjectDirectory);
        testHubProject.init(new HashMap<>());

        // Admin is needed to clear out provenance data
        runAsAdmin();
        resetDatabases();

        // By default, a test should run as a data-hub-developer
        runAsDataHubDeveloper();
//        logger.info("Initializing test project in directory: " + testProjectDirectory);

        logger.info("Initialized test, time: " + (System.currentTimeMillis() - start));
    }

    protected HubConfig getHubConfig() {
        return hubConfigSession.getHubConfigImpl();
    }

    protected void resetDatabases() {
        String xquery = "cts:uris((), (), cts:not-query(cts:collection-query('hub-core-artifact'))) ! xdmp:document-delete(.)";
        getHubConfig().newStagingClient().newServerEval().xquery(xquery).evalAs(String.class);
        getHubConfig().newFinalClient().newServerEval().xquery(xquery).evalAs(String.class);
        getHubConfig().newJobDbClient().newServerEval().xquery(xquery).evalAs(String.class);
    }

    protected void runAsDataHubDeveloper() {
        runAsUser(testConstants.DEVELOPER_USERNAME, testConstants.DEVELOPER_PASSWORD);
    }

    protected void runAsEnvironmentManager() {
        runAsUser(testConstants.ENVIRONMENT_MANAGER_USERNAME, testConstants.ENVIRONMENT_MANAGER_PASSWORD);
    }

    protected void runAsAdmin() {
        runAsUser(testConstants.ADMIN_USERNAME, testConstants.ADMIN_PASSWORD);
    }

    protected void runAsUser(String username, String password) {
        hubConfigSession.initialize(hubCentral.newHubConfig(username, password));
    }

    protected void addStagingDoc(String resource, String uri, String... collections) {
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        metadata.getCollections().addAll(collections);
        metadata.getPermissions().add("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        FileHandle handle = new FileHandle(getFileFromClasspath(resource));
        getHubConfig().newStagingClient().newDocumentManager().write(uri, metadata, handle);
    }

    protected File getFileFromClasspath(String resourceName) {
        try {
            return new ClassPathResource(resourceName).getFile();
        } catch (IOException e) {
            throw new RuntimeException("Unable to find file on classpath: " + resourceName, e);
        }
    }

    protected ObjectNode readJsonObject(String json) {
        try {
            return (ObjectNode) objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    protected ArrayNode readJsonArray(String json) {
        try {
            return (ArrayNode) objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    protected ObjectNode newLoadDataConfig() {
        return readJsonObject("{ \"name\": \"validArtifact\", \"sourceFormat\": \"xml\", \"targetFormat\": \"json\"}");
    }

    /**
     * Note that this does not yet wait for the post-commit trigger for entity models to complete. If you have a test
     * that depends on that, copy the "waitForTasksToFinish" method from DH core.
     */
    protected void installReferenceProject() {
        installProject("reference-project");
    }

    /**
     * Install the project files in the given project folder, which is expected to be under
     * src/test/resources/test-projects. This is the preferred mechanism for loading DH artifacts for tests. Feel free
     * to add anything else you need to do this method.
     *
     * @param projectFolderName
     */
    protected void installProject(String projectFolderName) {
        try {
            File testProjectDir = new ClassPathResource("test-projects/" + projectFolderName).getFile();

            File entitiesDir = new File(testProjectDir, "entities");
            if (entitiesDir.exists()) {
                FileUtils.copyDirectory(entitiesDir, testHubProject.getHubEntitiesDir().toFile());
            }

            File flowsDir = new File(testProjectDir, "flows");
            if (flowsDir.exists()) {
                FileUtils.copyDirectory(flowsDir, testHubProject.getFlowsDir().toFile());
            }

            File stepDefinitionsDir = new File(testProjectDir, "step-definitions");
            if (stepDefinitionsDir.exists()) {
                FileUtils.copyDirectory(stepDefinitionsDir, testHubProject.getStepDefinitionsDir().toFile());
            }
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }

        HubConfigImpl realHubConfig = hubConfigSession.getHubConfigImpl();
        realHubConfig.setHubProject(testHubProject);
        try {
            new LoadUserArtifactsCommand(realHubConfig).execute(new CommandContext(realHubConfig.getAppConfig(), null, null));
        } finally {
            // We don't want anything in HC depending on a HubProject
            realHubConfig.setHubProject(null);
        }
    }
}
