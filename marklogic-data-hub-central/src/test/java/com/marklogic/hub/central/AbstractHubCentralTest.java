package com.marklogic.hub.central;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.deploy.commands.DeployHubDatabaseCommand;
import com.marklogic.hub.impl.EntityManagerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import com.marklogic.hub.test.AbstractHubTest;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.TestPropertySource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;

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
// For some reason, the junit-platform.properties file that was in this subproject is ignored in favor of
// the one in ./marklogic-data-hub. Parallel tests aren't supported yet on this subproject, so they're
// explicitly disabled via this annotation.
@Execution(ExecutionMode.SAME_THREAD)
public abstract class AbstractHubCentralTest extends AbstractHubTest {

    protected TestConstants testConstants;

    @Autowired
    HubCentral hubCentral;

    @Autowired
    HttpSessionHubClientProvider hubClientProvider;

    private String testProjectDirectory = "build/hub-central-test-project";
    private HubConfigImpl testHubConfig;
    private HubProject testHubProject;

    @BeforeEach
    void beforeEachTest() {
        long start = System.currentTimeMillis();

        testHubProject = new HubProjectImpl();
        testHubConfig = new HubConfigImpl(testHubProject);
        resetHubProject();
        testHubConfig.applyProperties(new Properties());

        // Run as the least-privileged HC user
        runAsHubCentralUser();

        logger.info("Initialized test, time: " + (System.currentTimeMillis() - start));
    }

    protected void runAsHubCentralUser() {
        runAsTestUserWithRoles("hub-central-user");
    }

    @Override
    protected void initializeTestProjectDirectory() {
        testHubProject.createProject(testProjectDirectory);
        testHubProject.init(new HashMap<>());
    }

    @Override
    protected HubClient getHubClient() {
        return hubClientProvider.getHubClient();
    }

    /**
     * This should not be used by HC tests! It is still needed by AbstractHubCoreTest, as plenty of core classes still
     * depend on HubConfig.
     *
     * @return
     */
    @Override
    protected HubConfigImpl getHubConfig() {
        return testHubConfig;
    }

    @Override
    protected File getTestProjectDirectory() {
        return new File(testProjectDirectory);
    }

    /**
     * In an HC test, we use HubCentral to initialize a HubConfigImpl instance - but that's only intended to be used
     * for test plumbing, and not by the features being tested.
     *
     * @param username
     * @param password
     * @return
     */
    @Override
    protected HubClient runAsUser(String username, String password) {
        // Need to create the project directory before applying properties
        testHubConfig.createProject(testProjectDirectory);
        testHubConfig.applyProperties(hubCentral.buildPropertySource(username, password));

        // Update the provider with a new HubClient
        hubClientProvider.setHubClientDelegate(testHubConfig.newHubClient());

        // And return this for the rest of the core test plumbing to use
        return getHubClient();
    }

    /**
     * Updates the test hub config
     *
     * @param hubConfig
     * @return
     */
    protected void setTestHubConfig(HubConfigImpl hubConfig) {
        // Initialize a new HubConfigImpl
        testHubConfig = hubConfig;
        testHubConfig.setHubProject(testHubProject);

        // Update the provider with a new HubClient
        hubClientProvider.setHubClientDelegate(testHubConfig.newHubClient());
    }

    protected void addStagingDoc(String resource, String uri, String... collections) {
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        metadata.getCollections().addAll(collections);
        metadata.getPermissions().add("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        FileHandle handle = new FileHandle(getFileFromClasspath(resource));
        getHubClient().getStagingClient().newDocumentManager().write(uri, metadata, handle);
    }

    protected File getFileFromClasspath(String resourceName) {
        try {
            return new ClassPathResource(resourceName).getFile();
        } catch (IOException e) {
            throw new RuntimeException("Unable to find file on classpath: " + resourceName, e);
        }
    }

    /**
     * While DHF core tests default to running as a developer, HC tests do not. But any time we want to install the
     * reference project, we need to do it as a developer. So this method handles that.
     *
     * @return
     */
    @Override
    protected ReferenceModelProject installReferenceModelProject() {
        runAsDataHubDeveloper();
        return super.installReferenceModelProject();
    }

    /**
     * While DHF core tests default to running as a developer, HC tests do not. But any time we want to install the
     * reference project, we need to do it as a developer. So this method handles that.
     *
     * @param loadQueryOptions
     * @return
     */
    @Override
    protected ReferenceModelProject installOnlyReferenceModelEntities(boolean loadQueryOptions) {
        runAsDataHubDeveloper();
        return super.installOnlyReferenceModelEntities(loadQueryOptions);
    }

    /**
     * Installs the provided project but will not load query options.
     *
     * @param folderInClasspath
     */
    protected void installProjectInFolder(String folderInClasspath) {
        installProjectInFolder(folderInClasspath, false);
    }

    /**
     * Deploys indexes related to entities.
     *
     */
    protected void deployEntityIndexes() {
        HubConfigImpl originalHubConfig = getHubConfig();
        EntityManager entityManager = new EntityManagerImpl(originalHubConfig);
        entityManager.saveDbIndexes();

        runAsAdmin();
        Path dir = getHubProject().getEntityDatabaseDir();
        List<String> filePaths = Arrays.asList(HubConfig.FINAL_ENTITY_DATABASE_FILE, HubConfig.STAGING_ENTITY_DATABASE_FILE);
        for (String filePath: filePaths) {
            File dbFile = Paths.get(dir.toString(), filePath).toFile();
            DeployHubDatabaseCommand dbCommand = new DeployHubDatabaseCommand(getHubConfig(), dbFile, dbFile.getName());
            dbCommand.setMergeEntityConfigFiles(true);
            dbCommand.setPostponeForestCreation(true);
            dbCommand.execute(newCommandContext());
        }

        // set HubConfig back after deploying indexes
        setTestHubConfig(originalHubConfig);
        // Deploy Query Options
        entityManager.deployQueryOptions();
    }
}
