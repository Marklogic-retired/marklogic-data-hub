package com.marklogic.hub.central;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.hub.central.models.HubConfigSession;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.test.AbstractHubTest;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.TestPropertySource;

import java.io.File;
import java.io.IOException;

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
public abstract class AbstractHubCentralTest extends AbstractHubTest {

    @Autowired
    protected HubConfigSession hubConfig;

    protected TestConstants testConstants;

    @Autowired
    HubCentral hubCentral;

    @BeforeEach
    void beforeEachTest() {
        long start = System.currentTimeMillis();
        resetHubProject();
        // By default, a test should run as a data-hub-developer
        runAsDataHubDeveloper();
        logger.info("Initialized test, time: " + (System.currentTimeMillis() - start));
    }

    @Override
    protected HubConfigImpl getHubConfig() {
        return hubConfig.getHubConfigImpl();
    }

    @Override
    protected File getTestProjectDirectory() {
        return new File(hubCentral.getProjectDirectory());
    }

    @Override
    protected HubConfigImpl runAsUser(String username, String password) {
        hubConfig.initialize(hubCentral.newHubConfig(username, password));
        return null;
    }

    protected void addStagingDoc(String resource, String uri, String... collections) {
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        metadata.getCollections().addAll(collections);
        metadata.getPermissions().add("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        FileHandle handle = new FileHandle(getFileFromClasspath(resource));
        hubConfig.newStagingClient().newDocumentManager().write(uri, metadata, handle);
    }

    protected File getFileFromClasspath(String resourceName) {
        try {
            return new ClassPathResource(resourceName).getFile();
        } catch (IOException e) {
            throw new RuntimeException("Unable to find file on classpath: " + resourceName, e);
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
        installProjectInFolder("test-projects/reference-project");
    }
}
