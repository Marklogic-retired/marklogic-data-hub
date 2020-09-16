package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.mgmt.resource.security.ProtectedPathManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class DeployProtectedPathsWhenUpdatingIndexesTest extends AbstractHubCoreTest {

    private final static String TEST_PATH_EXPRESSION = "/path/doesntMatter/forThisTest";

    @AfterEach
    public void teardown() {
        deleteProtectedPaths();
    }

    @Test
    public void test() {
        runAsFlowDeveloper();
        givenAProtectedPathFile();
        dataHub.updateIndexes();
        thenTheProtectedPathIsDeployed();
    }

    private void givenAProtectedPathFile() {
        ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();
        node.put("path-expression", TEST_PATH_EXPRESSION);
        ObjectNode perm = node.putObject("permission");
        perm.put("role-name", "pii-reader");
        perm.put("capability", "read");
        ConfigDir configDir = new ConfigDir(new File(getHubProject().getProjectDir().toFile(), "src/main/ml-config"));
        configDir.getBaseDir().mkdirs();
        configDir.getSecurityDir().mkdirs();
        File pathsDir = configDir.getProtectedPathsDir();
        pathsDir.mkdirs();
        File f = new File(pathsDir, "01_" + HubConfig.PII_PROTECTED_PATHS_FILE);
        logger.info("Writing protected path to: " + f.getAbsolutePath());
        try {
            ObjectMapperFactory.getObjectMapper().writeValue(f, node);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void thenTheProtectedPathIsDeployed() {
        runAsAdmin();

        ProtectedPathManager mgr = new ProtectedPathManager(getHubClient().getManageClient());
        assertTrue(
            mgr.exists(TEST_PATH_EXPRESSION),
            "Updating indexes should also result in protected paths being deployed so that when a user marks " +
                "a property as being PII and then chooses to update indexes, the corresponding protected path " +
                "will be deployed");
    }

}
